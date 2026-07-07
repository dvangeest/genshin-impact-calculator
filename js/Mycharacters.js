const CHARACTER_STORAGE_KEY = 'gi_calc_my_characters';
const WEAPON_STORAGE_KEY_REF = 'gi_calc_my_weapons';
const ARTIFACT_STORAGE_KEY_REF = 'gi_calc_my_artifacts';

let editingEntryId = null; // null = creating new, set = editing existing entry
let selectedCharacterId = null;
let currentDraft = null; // { weaponEntryId, artifacts: { flower, plume, sands, goblet, circlet } }
let currentArtifactSlot = null;

/* ---------- small helpers ---------- */

function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
}

function fmtFlat(n) {
    return `${Math.round(n)}`;
}

function fmtPercent(n) {
    return `${Math.round(n * 10) / 10}%`;
}

function getCharacterById(id) {
    return CHARACTERS.find((c) => c.id === id);
}

/* ---------- storage ---------- */

function loadMyCharacters() {
    try {
        const raw = localStorage.getItem(CHARACTER_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error('Failed to read saved characters:', err);
        return [];
    }
}

function saveMyCharacters(characters) {
    localStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(characters));
}

function loadSavedWeapons() {
    try {
        const raw = localStorage.getItem(WEAPON_STORAGE_KEY_REF);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error('Failed to read saved weapons:', err);
        return [];
    }
}

function loadSavedArtifacts() {
    try {
        const raw = localStorage.getItem(ARTIFACT_STORAGE_KEY_REF);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error('Failed to read saved artifacts:', err);
        return [];
    }
}

/* ---------- stat aggregation ---------- */

function applyWeaponStat(type, value, stats) {
    switch (type) {
        case 'ATK_FLAT': stats.flatATK += value; break;
        case 'ATK_PERCENT': case 'ATK%': stats.atkPercent += value; break;
        case 'ELEMENTAL_MASTERY': stats.elementalMastery += value; break;
        case 'ENERGY_RECHARGE': stats.energyRecharge += value; break;
        case 'CRIT_DMG': stats.critDmg += value; break;
        case 'CRIT_RATE': stats.critRate += value; break;
        default: break;
    }
}

function applyArtifactStat(label, value, stats) {
    switch (label) {
        case 'HP': stats.flatHP += value; break;
        case 'HP%': stats.hpPercent += value; break;
        case 'ATK': stats.flatATK += value; break;
        case 'ATK%': stats.atkPercent += value; break;
        case 'DEF': stats.flatDEF += value; break;
        case 'DEF%': stats.defPercent += value; break;
        case 'Elemental Mastery': stats.elementalMastery += value; break;
        case 'Energy Recharge%': case 'Energy Recharge': stats.energyRecharge += value; break;
        case 'CRIT Rate': case 'Crit Rate%': stats.critRate += value; break;
        case 'CRIT DMG': case 'Crit DMG%': stats.critDmg += value; break;
        default: break; // Physical DMG%, Elemental DMG%, Healing Bonus% aren't tracked as core stats
    }
}

function applySpecialStat(specialKey, value, stats) {
    switch (specialKey) {
        case 'CRIT_Rate': stats.critRate += value; break;
        case 'CRIT_DMG': stats.critDmg += value; break;
        case 'ER': stats.energyRecharge += value; break;
        case 'ATK_PERCENT': stats.atkPercent += value; break;
        default: break;
    }
}

/**
 * Aggregates base character stats (at a given level) with the selected
 * weapon's main/sub stat and the 5 selected artifacts' main/substats.
 * Artifact set bonuses beyond a simple note aren't numerically simulated,
 * since ARTIFACT_SETS (js/artifactData.js) doesn't carry full set-bonus
 * data — that lives only in the per-set json/artifact/*.json files.
 */
function computeAggregatedStats(character, level, weaponEntryId, artifactSelections) {
    const base = getCharacterStatsAtLevel(character, level);
    const specialKey = getCharacterSpecialStatKey(character);
    const specialValue = base[specialKey] || 0;

    const stats = {
        flatHP: base.hp, flatATK: base.atk, flatDEF: base.def,
        hpPercent: 0, atkPercent: 0, defPercent: 0,
        critRate: 5, critDmg: 50, energyRecharge: 100, elementalMastery: 0
    };
    applySpecialStat(specialKey, specialValue, stats);

    const bonusNotes = [];

    // Weapon
    if (weaponEntryId) {
        const weaponEntry = loadSavedWeapons().find((w) => w.id === weaponEntryId);
        const weaponData = weaponEntry ? WEAPONS.find((w) => w.id === weaponEntry.weaponId) : null;
        if (weaponEntry && weaponData) {
            const wLevel = clamp(weaponEntry.level, 1, 90);
            const wStats = weaponData.stats[String(wLevel)] || weaponData.stats['1'];
            applyWeaponStat(weaponData.mainStat.type, wStats[weaponData.mainStat.curve], stats);
            applyWeaponStat(weaponData.subStat.type, wStats[weaponData.subStat.curve], stats);
            bonusNotes.push(`${weaponData.name} R${weaponEntry.refinement} equipped (passive effects not added to totals).`);
        }
    }

    // Artifacts
    const savedArtifacts = loadSavedArtifacts();
    const setCounts = {};
    ARTIFACT_TYPES.forEach((t) => {
        const entryId = artifactSelections ? artifactSelections[t.key] : null;
        if (!entryId) return;
        const art = savedArtifacts.find((a) => a.id === entryId);
        if (!art) return;
        setCounts[art.setId] = (setCounts[art.setId] || 0) + 1;
        applyArtifactStat(art.mainStat.type, art.mainStat.value, stats);
        (art.substats || []).forEach((s) => applyArtifactStat(s.type, s.value, stats));
    });
    Object.entries(setCounts).forEach(([setId, count]) => {
        const set = getArtifactSetById(setId);
        if (!set) return;
        if (count >= 2) bonusNotes.push(`${set.name} 2pc bonus active.`);
        if (count >= 4) bonusNotes.push(`${set.name} 4pc bonus active.`);
    });

    return {
        hp: stats.flatHP * (1 + stats.hpPercent / 100),
        atk: stats.flatATK * (1 + stats.atkPercent / 100),
        def: stats.flatDEF * (1 + stats.defPercent / 100),
        critRate: stats.critRate,
        critDmg: stats.critDmg,
        energyRecharge: stats.energyRecharge,
        elementalMastery: stats.elementalMastery,
        bonusNotes
    };
}

/* ---------- character select modal ---------- */

function renderCharacterSelectList(filterText) {
    const list = document.getElementById('character-select-list');
    const query = (filterText || '').trim().toLowerCase();
    const filtered = CHARACTERS.filter((c) => c.name.toLowerCase().includes(query));

    if (filtered.length === 0) {
        list.innerHTML = '<p class="text-sm text-muted-foreground text-center py-6">No characters match your search.</p>';
        return;
    }

    list.innerHTML = filtered.map((c) => `
    <div class="weapon-list-item" data-character-id="${c.id}">
      <div class="weapon-list-icon">Icon</div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm truncate">${c.name}${c.upcoming ? ' <span class="text-[10px] text-yellow-500/80 uppercase tracking-wide">Upcoming</span>' : ''}</p>
        <p class="text-xs text-muted-foreground">${c.element} · ${WEAPON_TYPE_LABELS[c.weaponType] || c.weaponType}</p>
      </div>
    </div>
  `).join('');

    list.querySelectorAll('.weapon-list-item').forEach((item) => {
        item.addEventListener('click', () => {
            closeCharacterSelectModal();
            openCharacterCreateModal(item.dataset.characterId);
        });
    });
}

function openCharacterSelectModal() {
    document.getElementById('character-search-input').value = '';
    renderCharacterSelectList('');
    document.getElementById('character-select-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeCharacterSelectModal() {
    document.getElementById('character-select-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

/* ---------- character create/configure modal ---------- */

function readTalentLevelsFromForm() {
    const levels = {};
    document.querySelectorAll('#talent-level-fields .talent-level-input').forEach((input) => {
        levels[input.dataset.talentKey] = parseInt(input.value, 10) || 1;
    });
    return levels;
}

function renderTalentFields(character, constellation, existingLevels) {
    const container = document.getElementById('talent-level-fields');
    const keys = Object.keys(character.talents);

    container.innerHTML = keys.map((key) => {
        const min = getTalentMinLevel(character, key, constellation);
        const max = getTalentMaxLevel(character, key, constellation);
        const current = clamp((existingLevels && existingLevels[key]) || min, min, max);
        return `
      <div class="talent-level-row" data-talent-key="${key}">
        <span class="talent-level-name">${character.talents[key].name}</span>
        <input type="number" min="${min}" max="${max}" value="${current}"
          class="talent-level-input field-input h-9 rounded-md border border-input bg-transparent px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          data-talent-key="${key}">
      </div>`;
    }).join('');

    container.querySelectorAll('.talent-level-input').forEach((input) => {
        input.addEventListener('input', () => {
            const max = parseInt(input.max, 10);
            const min = parseInt(input.min, 10) || 1;
            let val = parseInt(input.value, 10);
            if (!Number.isFinite(val)) val = min;
            input.value = clamp(val, min, max);
        });
    });
}

function getConstellationValue() {
    const raw = parseInt(document.getElementById('character-constellation-input').value, 10);
    return clamp(Number.isFinite(raw) ? raw : 0, 0, 6);
}

function handleConstellationChange() {
    const constellation = getConstellationValue();
    document.getElementById('character-constellation-input').value = constellation;
    const character = getCharacterById(selectedCharacterId);
    if (!character) return;
    const existing = readTalentLevelsFromForm();
    renderTalentFields(character, constellation, existing);
    updateCharacterPreview();
}

function renderCharacterStatGrid(stats) {
    const grid = document.getElementById('character-stat-grid');
    const items = [
        ['HP', fmtFlat(stats.hp)],
        ['ATK', fmtFlat(stats.atk)],
        ['DEF', fmtFlat(stats.def)],
        ['CRIT Rate', fmtPercent(stats.critRate)],
        ['CRIT DMG', fmtPercent(stats.critDmg)],
        ['Energy Recharge', fmtPercent(stats.energyRecharge)],
        ['Elemental Mastery', fmtFlat(stats.elementalMastery)]
    ];
    grid.innerHTML = items.map(([label, val]) => `
    <div class="character-stat-item">
      <p class="character-stat-label">${label}</p>
      <p class="character-stat-value">${val}</p>
    </div>
  `).join('');

    const notesEl = document.getElementById('character-bonus-notes');
    notesEl.innerHTML = stats.bonusNotes.length
        ? stats.bonusNotes.map((n) => `<p class="text-xs text-muted-foreground">• ${n}</p>`).join('')
        : '<p class="text-xs text-muted-foreground/50 italic">No weapon or artifacts equipped yet.</p>';
}

function updateCharacterPreview() {
    const character = getCharacterById(selectedCharacterId);
    if (!character) return;
    const level = parseInt(document.getElementById('character-level-input').value, 10) || 1;
    const stats = computeAggregatedStats(character, level, currentDraft.weaponEntryId, currentDraft.artifacts);
    renderCharacterStatGrid(stats);
}

function handleCharacterLevelInput() {
    const input = document.getElementById('character-level-input');
    let val = parseInt(input.value, 10);
    if (!Number.isFinite(val)) val = 1;
    input.value = clamp(val, 1, 100);
    updateCharacterPreview();
}

function updateSelectedWeaponLabel() {
    const label = document.getElementById('selected-weapon-label');
    if (!currentDraft.weaponEntryId) {
        label.textContent = 'None selected';
        return;
    }
    const weaponEntry = loadSavedWeapons().find((w) => w.id === currentDraft.weaponEntryId);
    const weaponData = weaponEntry ? WEAPONS.find((w) => w.id === weaponEntry.weaponId) : null;
    label.textContent = weaponData ? `${weaponData.name} (R${weaponEntry.refinement}, Lv.${weaponEntry.level})` : 'None selected';
}

function renderArtifactSlotButtons() {
    const container = document.getElementById('artifact-slot-buttons');
    const saved = loadSavedArtifacts();

    container.innerHTML = ARTIFACT_TYPES.map((t) => {
        const entryId = currentDraft.artifacts[t.key];
        const entry = entryId ? saved.find((a) => a.id === entryId) : null;
        const set = entry ? getArtifactSetById(entry.setId) : null;
        return `
      <button type="button" class="artifact-slot-btn" data-slot="${t.key}">
        <span class="artifact-slot-label">${t.label}</span>
        <span class="artifact-slot-value">${entry ? `${set ? set.name : 'Unknown Set'} (+${entry.level})` : 'None selected'}</span>
      </button>`;
    }).join('');

    container.querySelectorAll('.artifact-slot-btn').forEach((btn) => {
        btn.addEventListener('click', () => openArtifactSelectForCharacterModal(btn.dataset.slot));
    });
}

function openCharacterCreateModal(characterId) {
    selectedCharacterId = characterId;
    editingEntryId = null; // ← added
    currentDraft = { weaponEntryId: null, artifacts: { flower: null, plume: null, sands: null, goblet: null, circlet: null } };

    const character = getCharacterById(characterId);
    document.getElementById('character-create-title').textContent =
        `${character.name} (${character.element} · ${WEAPON_TYPE_LABELS[character.weaponType] || character.weaponType})`;
    document.getElementById('character-create-error').classList.add('hidden');
    document.getElementById('character-level-input').value = 1;
    document.getElementById('character-constellation-input').value = 0;

    renderTalentFields(character, 0, null);
    updateSelectedWeaponLabel();
    renderArtifactSlotButtons();
    updateCharacterPreview();
    document.getElementById('create-character-btn').textContent = 'Create'; // ← added

    document.getElementById('character-create-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function openCharacterEditModal(entryId) {
    const entry = loadMyCharacters().find((c) => c.id === entryId);
    if (!entry) return;

    const character = getCharacterById(entry.characterId);
    if (!character) return;

    selectedCharacterId = entry.characterId;
    editingEntryId = entry.id;
    currentDraft = {
        weaponEntryId: entry.weaponEntryId || null,
        artifacts: { flower: null, plume: null, sands: null, goblet: null, circlet: null, ...entry.artifacts }
    };

    document.getElementById('character-create-title').textContent =
        `Edit ${character.name} (${character.element} · ${WEAPON_TYPE_LABELS[character.weaponType] || character.weaponType})`;
    document.getElementById('character-create-error').classList.add('hidden');
    document.getElementById('character-level-input').value = entry.level;
    document.getElementById('character-constellation-input').value = entry.constellation;

    renderTalentFields(character, entry.constellation, entry.talentLevels);
    updateSelectedWeaponLabel();
    renderArtifactSlotButtons();
    updateCharacterPreview();
    document.getElementById('create-character-btn').textContent = 'Save Changes';

    document.getElementById('character-create-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeCharacterCreateModal() {
    document.getElementById('character-create-modal').classList.add('hidden');
    document.body.style.overflow = '';
    selectedCharacterId = null;
    currentDraft = null;
    editingEntryId = null; // ← added
}

function handleCreateCharacter() {
    const character = getCharacterById(selectedCharacterId);
    const errorEl = document.getElementById('character-create-error');

    if (!character) {
        errorEl.textContent = 'No character selected.';
        errorEl.classList.remove('hidden');
        return;
    }

    const level = parseInt(document.getElementById('character-level-input').value, 10);
    const constellation = getConstellationValue();

    if (!Number.isFinite(level) || level < 1 || level > 100) {
        errorEl.textContent = 'Level must be between 1 and 100.';
        errorEl.classList.remove('hidden');
        return;
    }

    const characters = loadMyCharacters();

    if (editingEntryId) {
        const idx = characters.findIndex((c) => c.id === editingEntryId);
        if (idx === -1) {
            errorEl.textContent = 'Could not find the character entry to update.';
            errorEl.classList.remove('hidden');
            return;
        }
        characters[idx] = {
            ...characters[idx],
            level,
            constellation,
            talentLevels: readTalentLevelsFromForm(),
            weaponEntryId: currentDraft.weaponEntryId,
            artifacts: { ...currentDraft.artifacts }
        };
    } else {
        characters.unshift({
            id: `char_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            characterId: character.id,
            level,
            constellation,
            talentLevels: readTalentLevelsFromForm(),
            weaponEntryId: currentDraft.weaponEntryId,
            artifacts: { ...currentDraft.artifacts },
            createdAt: Date.now()
        });
    }

    saveMyCharacters(characters);
    closeCharacterCreateModal();
    renderMyCharacters();
}

/* ---------- weapon select (for character) modal ---------- */

function renderWeaponSelectForCharacterList() {
    const character = getCharacterById(selectedCharacterId);
    const list = document.getElementById('weapon-select-for-character-list');
    const matching = loadSavedWeapons().filter((w) => {
        const data = WEAPONS.find((x) => x.id === w.weaponId);
        return data && data.weaponType === character.weaponType;
    });

    if (matching.length === 0) {
        list.innerHTML = '<p class="text-sm text-muted-foreground text-center py-6">No matching weapons saved yet. Add one on the Weapons tab.</p>';
        return;
    }

    list.innerHTML = matching.map((w) => {
        const data = WEAPONS.find((x) => x.id === w.weaponId);
        return `
      <div class="weapon-list-item" data-entry-id="${w.id}">
        <div class="weapon-list-icon">Icon</div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-sm truncate">${data.name}</p>
          <p class="text-xs text-muted-foreground">R${w.refinement} · Lv.${w.level}</p>
        </div>
      </div>`;
    }).join('');

    list.querySelectorAll('.weapon-list-item').forEach((item) => {
        item.addEventListener('click', () => {
            currentDraft.weaponEntryId = item.dataset.entryId;
            closeWeaponSelectForCharacterModal();
            updateSelectedWeaponLabel();
            updateCharacterPreview();
        });
    });
}

function openWeaponSelectForCharacterModal() {
    renderWeaponSelectForCharacterList();
    document.getElementById('weapon-select-for-character-modal').classList.remove('hidden');
}

function closeWeaponSelectForCharacterModal() {
    document.getElementById('weapon-select-for-character-modal').classList.add('hidden');
}

/* ---------- artifact select (for character) modal ---------- */

function renderArtifactSelectForCharacterList() {
    const list = document.getElementById('artifact-select-for-character-list');
    const matching = loadSavedArtifacts().filter((a) => a.type === currentArtifactSlot);

    if (matching.length === 0) {
        list.innerHTML = '<p class="text-sm text-muted-foreground text-center py-6">No matching artifacts saved yet. Add one on the Artifacts tab.</p>';
        return;
    }

    list.innerHTML = matching.map((a) => {
        const set = getArtifactSetById(a.setId);
        return `
      <div class="weapon-list-item" data-entry-id="${a.id}">
        <div class="weapon-list-icon">Icon</div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-sm truncate">${set ? set.name : 'Unknown Set'}</p>
          <p class="text-xs text-muted-foreground">+${a.level} · ${a.mainStat.type} +${a.mainStat.value}</p>
        </div>
      </div>`;
    }).join('');

    list.querySelectorAll('.weapon-list-item').forEach((item) => {
        item.addEventListener('click', () => {
            currentDraft.artifacts[currentArtifactSlot] = item.dataset.entryId;
            closeArtifactSelectForCharacterModal();
            renderArtifactSlotButtons();
            updateCharacterPreview();
        });
    });
}

function openArtifactSelectForCharacterModal(slotKey) {
    currentArtifactSlot = slotKey;
    const label = ARTIFACT_TYPES.find((t) => t.key === slotKey);
    document.getElementById('artifact-select-for-character-title').textContent = `Select ${label ? label.label : slotKey}`;
    renderArtifactSelectForCharacterList();
    document.getElementById('artifact-select-for-character-modal').classList.remove('hidden');
}

function closeArtifactSelectForCharacterModal() {
    document.getElementById('artifact-select-for-character-modal').classList.add('hidden');
    currentArtifactSlot = null;
}

/* ---------- "My Characters" grid ---------- */

function handleDeleteCharacter(id) {
    const characters = loadMyCharacters().filter((c) => c.id !== id);
    saveMyCharacters(characters);
    renderMyCharacters();
}

function renderMyCharacters() {
    const grid = document.getElementById('my-characters-grid');
    const emptyState = document.getElementById('my-characters-empty-state');
    const entries = loadMyCharacters();

    if (entries.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    const savedWeapons = loadSavedWeapons();

    grid.innerHTML = entries.map((entry) => {
        const character = getCharacterById(entry.characterId);
        if (!character) return '';
        const qualityClass = WEAPON_QUALITY_CLASS[character.rarity] || '';
        const stats = computeAggregatedStats(character, entry.level, entry.weaponEntryId, entry.artifacts);
        const weaponEntry = entry.weaponEntryId ? savedWeapons.find((w) => w.id === entry.weaponEntryId) : null;
        const weaponData = weaponEntry ? WEAPONS.find((w) => w.id === weaponEntry.weaponId) : null;

        const talentSummary = Object.keys(character.talents)
            .map((k) => `Lv.${(entry.talentLevels && entry.talentLevels[k]) || 1}`)
            .join(' / ');

        return `
      <div class="${qualityClass} rounded-xl border border-border bg-card p-4 flex flex-col gap-3 hover:border-white/20 transition-all">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-[10px] uppercase tracking-wider text-muted-foreground">${character.element} · ${WEAPON_TYPE_LABELS[character.weaponType] || character.weaponType}</p>
            <p class="font-semibold text-sm leading-tight mt-0.5">${character.name}</p>
          </div>
          <div class="flex flex-col items-end gap-1 shrink-0">
            <span class="text-xs font-mono px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">C${entry.constellation}</span>
            <span class="text-xs font-mono px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">Lv.${entry.level}</span>
          </div>
        </div>
        <div class="pt-2 border-t border-border/50 space-y-0.5">
          <p class="text-sm font-medium text-primary">HP ${fmtFlat(stats.hp)} · ATK ${fmtFlat(stats.atk)} · DEF ${fmtFlat(stats.def)}</p>
          <p class="text-xs text-muted-foreground">CRIT ${fmtPercent(stats.critRate)} / ${fmtPercent(stats.critDmg)} · ER ${fmtPercent(stats.energyRecharge)} · EM ${fmtFlat(stats.elementalMastery)}</p>
        </div>
        <p class="text-xs text-muted-foreground truncate">${weaponData ? weaponData.name : 'No weapon equipped'}</p>
        <p class="text-xs text-muted-foreground/80">Talents: ${talentSummary}</p>
        <div class="mt-auto flex gap-2">
          <button
            class="flex-1 py-1.5 rounded-md bg-secondary text-xs font-medium hover:bg-secondary/80 transition-colors edit-character-btn"
            data-id="${entry.id}">
            Edit
          </button>
          <button
            class="flex-1 py-1.5 rounded-md bg-secondary text-xs font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors delete-character-btn"
            data-id="${entry.id}">
            Remove
          </button>
        </div>
      </div>
    `;
    }).join('');

    grid.querySelectorAll('.edit-character-btn').forEach((btn) => {
        btn.addEventListener('click', () => openCharacterEditModal(btn.dataset.id));
    });
    grid.querySelectorAll('.delete-character-btn').forEach((btn) => {
        btn.addEventListener('click', () => handleDeleteCharacter(btn.dataset.id));
    });
}

/* ---------- init ---------- */

document.addEventListener('DOMContentLoaded', () => {
    renderMyCharacters();

    document.getElementById('open-character-select-modal-btn').addEventListener('click', openCharacterSelectModal);
    document.getElementById('close-character-select-modal-btn').addEventListener('click', closeCharacterSelectModal);
    document.getElementById('character-select-overlay').addEventListener('click', closeCharacterSelectModal);
    document.getElementById('character-search-input').addEventListener('input', (e) => {
        renderCharacterSelectList(e.target.value);
    });

    document.getElementById('close-character-create-modal-btn').addEventListener('click', closeCharacterCreateModal);
    document.getElementById('character-create-overlay').addEventListener('click', closeCharacterCreateModal);
    document.getElementById('character-level-input').addEventListener('input', handleCharacterLevelInput);
    document.getElementById('character-constellation-input').addEventListener('input', handleConstellationChange);
    document.getElementById('open-weapon-select-for-character-btn').addEventListener('click', openWeaponSelectForCharacterModal);
    document.getElementById('create-character-btn').addEventListener('click', handleCreateCharacter);

    document.getElementById('close-weapon-select-for-character-modal-btn').addEventListener('click', closeWeaponSelectForCharacterModal);
    document.getElementById('weapon-select-for-character-overlay').addEventListener('click', closeWeaponSelectForCharacterModal);

    document.getElementById('close-artifact-select-for-character-modal-btn').addEventListener('click', closeArtifactSelectForCharacterModal);
    document.getElementById('artifact-select-for-character-overlay').addEventListener('click', closeArtifactSelectForCharacterModal);

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        closeArtifactSelectForCharacterModal();
        closeWeaponSelectForCharacterModal();
        closeCharacterCreateModal();
        closeCharacterSelectModal();
    });
});