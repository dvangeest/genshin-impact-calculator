/**
 * Rotation Calculator — team rotation / DPS-timeline builder.
 *
 * Flow:
 *   1. Pick 4 characters from "My Characters" (built on the Characters tab).
 *   2. A timeline + 4-character dock appears. Clicking a character opens a
 *      menu of character-specific events (Skill/Burst activation triggers
 *      + their damage multipliers) and general events (Swap Character).
 *   3. Multiplier events snapshot a computed damage number using the
 *      character's current ATK (base + weapon + artifacts) and talent
 *      level. Activation events are pure triggers — no damage number.
 *   4. Whole sequences can be saved/loaded as named presets (localStorage).
 *
 * Cooldown and energy cost are intentionally omitted everywhere per spec.
 */

const MY_CHARACTERS_KEY = 'gi_calc_my_characters';
const MY_WEAPONS_KEY = 'gi_calc_my_weapons';
const MY_ARTIFACTS_KEY = 'gi_calc_my_artifacts';
const ROTATION_PRESETS_KEY = 'gi_calc_rotation_presets';

const SLOT_COUNT = 4;

let savedCharacterEntries = [];
let selectedEntryIds = [];   // team-select step, order = slot order
let rotationTeam = null;     // array[4] of saved character entries once started
let timeline = [];           // array of event objects
let currentEventMenuSlot = null;

/* ---------- storage ---------- */

function loadJSON(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error(`Failed to read ${key}:`, err);
        return [];
    }
}

function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function loadSavedCharacterEntries() { return loadJSON(MY_CHARACTERS_KEY); }
function loadSavedWeapons() { return loadJSON(MY_WEAPONS_KEY); }
function loadSavedArtifacts() { return loadJSON(MY_ARTIFACTS_KEY); }
function loadPresets() { return loadJSON(ROTATION_PRESETS_KEY); }
function savePresets(presets) { saveJSON(ROTATION_PRESETS_KEY, presets); }

function getCharacterById(id) {
    return CHARACTERS.find((c) => c.id === id);
}

/* ---------- ATK aggregation (simplified — only what damage multipliers need) ---------- */

function computeCharacterATK(entry) {
    const character = getCharacterById(entry.characterId);
    if (!character) return 0;

    const base = getCharacterStatsAtLevel(character, entry.level);
    let flatATK = base.atk;
    let atkPercent = 0;

    const specialKey = getCharacterSpecialStatKey(character);
    if (specialKey === 'ATK_PERCENT') atkPercent += (base[specialKey] || 0);

    if (entry.weaponEntryId) {
        const wEntry = loadSavedWeapons().find((w) => w.id === entry.weaponEntryId);
        const wData = wEntry ? WEAPONS.find((w) => w.id === wEntry.weaponId) : null;
        if (wEntry && wData) {
            const wLevel = Math.min(Math.max(wEntry.level, 1), 90);
            const wStats = wData.stats[String(wLevel)] || wData.stats['1'];
            if (wData.mainStat.type === 'ATK_FLAT') flatATK += wStats[wData.mainStat.curve];
            if (wData.subStat.type === 'ATK_PERCENT') atkPercent += wStats[wData.subStat.curve];
        }
    }

    const savedArtifacts = loadSavedArtifacts();
    ARTIFACT_TYPES.forEach((t) => {
        const entryId = entry.artifacts ? entry.artifacts[t.key] : null;
        if (!entryId) return;
        const art = savedArtifacts.find((a) => a.id === entryId);
        if (!art) return;
        if (art.mainStat.type === 'ATK') flatATK += art.mainStat.value;
        if (art.mainStat.type === 'ATK%') atkPercent += art.mainStat.value;
        (art.substats || []).forEach((s) => {
            if (s.type === 'ATK') flatATK += s.value;
            if (s.type === 'ATK%') atkPercent += s.value;
        });
    });

    return flatATK * (1 + atkPercent / 100);
}

/* ---------- multiplier flattening ----------
 * Walks a talent's `multipliers` object and pulls out every per-level
 * numeric array (e.g. skillDMG, prismShotStellarConduct, healing.atkCoeff).
 * A scalar `hits` sibling (e.g. bombardmentDMG.perHit + hits: 3) is folded
 * into the matching array instead of becoming its own button. */

function collectMultiplierEntries(multipliers, sourceTalent) {
    const out = [];
    function walk(obj, path, hits) {
        Object.entries(obj).forEach(([key, value]) => {
            if (Array.isArray(value) && typeof value[0] === 'number') {
                out.push({ key: path.concat(key).join('.'), values: value, hits: hits || 1, sourceTalent });
            } else if (value && typeof value === 'object' && !Array.isArray(value)) {
                const nestedHits = typeof value.hits === 'number' ? value.hits : (hits || 1);
                walk(value, path.concat(key), nestedHits);
            }
        });
    }
    walk(multipliers || {}, [], 1);
    return out;
}

function humanizeMultiplierKey(key) {
    return key.split('.').map((part) => part
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/^./, (s) => s.toUpperCase())
    ).join(' → ');
}

/** Heuristic classification — labels a preview sensibly without hand-tagging
 * every multiplier in every character's JSON. `flat` = raw number (shield/heal
 * flat amount), `buff` = a stat bonus rather than damage, everything else
 * scales off the character's ATK. */
function classifyMultiplier(key) {
    const lower = key.toLowerCase();
    const lastSeg = key.split('.').pop().toLowerCase();
    if (lastSeg.includes('flat')) return 'flat';
    if (lower.includes('heal')) return 'heal';
    if (lower.includes('shield')) return 'shield';
    if (lastSeg.includes('atkbonus')) return 'buff';
    return 'damage';
}

function computeMultiplierPreview(entry, multEntry, talentLevel) {
    const kind = classifyMultiplier(multEntry.key);
    const idx = Math.min(Math.max(talentLevel, 1), multEntry.values.length) - 1;
    const rawValue = multEntry.values[idx];
    const atk = computeCharacterATK(entry);

    if (kind === 'flat') {
        return { kind, atk, rawValue, hits: multEntry.hits, total: rawValue * multEntry.hits };
    }
    if (kind === 'buff') {
        const isRatio = rawValue < 5; // ratios are <1, flat ATK bonuses are usually >=100
        return { kind, atk, rawValue, hits: 1, total: isRatio ? rawValue * 100 : rawValue, isRatio };
    }
    return { kind, atk, rawValue, hits: multEntry.hits, total: atk * rawValue * multEntry.hits };
}

function formatPreview(preview) {
    switch (preview.kind) {
        case 'flat': return `${Math.round(preview.total).toLocaleString()} (flat)`;
        case 'buff': return preview.isRatio ? `+${preview.total.toFixed(1)}%` : `+${Math.round(preview.total)} ATK`;
        case 'heal': return `Heals ~${Math.round(preview.total).toLocaleString()}`;
        case 'shield': return `Shields ~${Math.round(preview.total).toLocaleString()}`;
        default: return `${Math.round(preview.total).toLocaleString()} DMG`;
    }
}

/* ---------- team select ---------- */

function renderTeamSelectGrid() {
    const grid = document.getElementById('team-select-grid');
    const emptyState = document.getElementById('team-select-empty');

    if (savedCharacterEntries.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    grid.innerHTML = savedCharacterEntries.map((entry) => {
        const character = getCharacterById(entry.characterId);
        if (!character) return '';
        const selected = selectedEntryIds.includes(entry.id);
        const order = selectedEntryIds.indexOf(entry.id);
        return `
      <button type="button" class="rotation-team-card ${selected ? 'selected' : ''}" data-entry-id="${entry.id}">
        ${selected ? `<span class="rotation-team-card-badge">${order + 1}</span>` : ''}
        <div class="rotation-team-card-icon">Icon</div>
        <p class="rotation-team-card-name">${character.name}</p>
        <p class="rotation-team-card-sub">${character.element} · Lv.${entry.level} · C${entry.constellation}</p>
      </button>`;
    }).join('');

    grid.querySelectorAll('.rotation-team-card').forEach((btn) => {
        btn.addEventListener('click', () => toggleTeamSelection(btn.dataset.entryId));
    });

    updateStartRotationButton();
}

function toggleTeamSelection(entryId) {
    const idx = selectedEntryIds.indexOf(entryId);
    if (idx !== -1) {
        selectedEntryIds.splice(idx, 1);
    } else {
        if (selectedEntryIds.length >= SLOT_COUNT) return;
        selectedEntryIds.push(entryId);
    }
    renderTeamSelectGrid();
}

function updateStartRotationButton() {
    const btn = document.getElementById('start-rotation-btn');
    btn.disabled = selectedEntryIds.length !== SLOT_COUNT;
    btn.textContent = `Start Rotation (${selectedEntryIds.length}/${SLOT_COUNT})`;
}

function startRotation() {
    if (selectedEntryIds.length !== SLOT_COUNT) return;
    rotationTeam = selectedEntryIds.map((id) => savedCharacterEntries.find((e) => e.id === id));
    timeline = [];
    document.getElementById('team-select-section').classList.add('hidden');
    document.getElementById('rotation-section').classList.remove('hidden');
    document.getElementById('character-dock-bar').classList.remove('hidden');
    renderDock();
    renderTimeline();
    renderPresetSelect();
}

function changeTeam() {
    rotationTeam = null;
    timeline = [];
    document.getElementById('rotation-section').classList.add('hidden');
    document.getElementById('character-dock-bar').classList.add('hidden');
    document.getElementById('team-select-section').classList.remove('hidden');
    renderTeamSelectGrid();
}

/* ---------- dock ---------- */

function renderDock() {
    const dock = document.getElementById('character-dock');
    dock.innerHTML = rotationTeam.map((entry, index) => {
        const character = getCharacterById(entry.characterId);
        const elementClass = `bg-element-${(character.element || '').toLowerCase()}`;
        return `
      <button type="button" class="dock-character-btn" data-slot-index="${index}">
        <div class="dock-character-icon ${elementClass}">${character.name.charAt(0)}</div>
        <span class="dock-character-name">${character.name}</span>
      </button>`;
    }).join('');

    dock.querySelectorAll('.dock-character-btn').forEach((btn) => {
        btn.addEventListener('click', () => openEventMenu(parseInt(btn.dataset.slotIndex, 10)));
    });
}

/* ---------- event menu ---------- */

function openEventMenu(slotIndex) {
    currentEventMenuSlot = slotIndex;
    const entry = rotationTeam[slotIndex];
    const character = getCharacterById(entry.characterId);

    document.getElementById('event-menu-title').textContent = `${character.name} — Add Event`;

    const skillMultipliers = collectMultiplierEntries(character.talents.elementalSkill.multipliers, 'elementalSkill');
    const burstMultipliers = collectMultiplierEntries(character.talents.elementalBurst.multipliers, 'elementalBurst');

    function renderMultiplierButton(m) {
        const talentLevel = (entry.talentLevels && entry.talentLevels[m.sourceTalent]) || 1;
        const preview = computeMultiplierPreview(entry, m, talentLevel);
        return `
      <button type="button" class="event-menu-item" data-action="multiplier" data-mult-key="${m.key}" data-source="${m.sourceTalent}">
        <span class="event-menu-item-label">${humanizeMultiplierKey(m.key)}</span>
        <span class="event-menu-item-value">${formatPreview(preview)}</span>
      </button>`;
    }

    const body = document.getElementById('event-menu-body');
    body.innerHTML = `
    <div>
      <p class="event-menu-section-title">Character Events</p>
      <div class="event-menu-list">
        <button type="button" class="event-menu-item" data-action="skill">
          <span class="event-menu-item-label">⚡ ${character.talents.elementalSkill.name} (Activation)</span>
        </button>
        <button type="button" class="event-menu-item" data-action="burst">
          <span class="event-menu-item-label">💥 ${character.talents.elementalBurst.name} (Activation)</span>
        </button>
      </div>
    </div>
    ${skillMultipliers.length ? `
    <div>
      <p class="event-menu-section-title">Skill Multipliers</p>
      <div class="event-menu-list">${skillMultipliers.map(renderMultiplierButton).join('')}</div>
    </div>` : ''}
    ${burstMultipliers.length ? `
    <div>
      <p class="event-menu-section-title">Burst Multipliers</p>
      <div class="event-menu-list">${burstMultipliers.map(renderMultiplierButton).join('')}</div>
    </div>` : ''}
    <div>
      <p class="event-menu-section-title">General Events</p>
      <div class="event-menu-list">
        <button type="button" class="event-menu-item" data-action="swap">
          <span class="event-menu-item-label">🔄 Swap Character (Make Active)</span>
        </button>
      </div>
    </div>
  `;

    body.querySelectorAll('.event-menu-item').forEach((btn) => {
        btn.addEventListener('click', () => handleEventMenuAction(btn));
    });

    document.getElementById('event-menu-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeEventMenu() {
    document.getElementById('event-menu-modal').classList.add('hidden');
    document.body.style.overflow = '';
    currentEventMenuSlot = null;
}

function handleEventMenuAction(btn) {
    const slotIndex = currentEventMenuSlot;
    const entry = rotationTeam[slotIndex];
    const character = getCharacterById(entry.characterId);
    const action = btn.dataset.action;

    if (action === 'skill') {
        addEvent({ type: 'skill', slotIndex, characterId: character.id, label: `${character.talents.elementalSkill.name} (Activation)` });
    } else if (action === 'burst') {
        addEvent({ type: 'burst', slotIndex, characterId: character.id, label: `${character.talents.elementalBurst.name} (Activation)` });
    } else if (action === 'swap') {
        addEvent({ type: 'swap', slotIndex, characterId: character.id, label: `Swap to ${character.name}` });
    } else if (action === 'multiplier') {
        const sourceTalent = btn.dataset.source;
        const multiplierKey = btn.dataset.multKey;
        const multipliers = collectMultiplierEntries(character.talents[sourceTalent].multipliers, sourceTalent);
        const m = multipliers.find((x) => x.key === multiplierKey);
        if (!m) return;
        const talentLevel = (entry.talentLevels && entry.talentLevels[sourceTalent]) || 1;
        const preview = computeMultiplierPreview(entry, m, talentLevel);
        addEvent({
            type: 'multiplier',
            slotIndex,
            characterId: character.id,
            label: humanizeMultiplierKey(multiplierKey),
            multiplierKey,
            sourceTalent,
            kind: preview.kind,
            talentLevel,
            computedValue: preview.total,
            previewText: formatPreview(preview)
        });
    }

    closeEventMenu();
}

/* ---------- timeline ---------- */

function addEvent(event) {
    timeline.push({ id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ...event });
    renderTimeline();
}

function removeEvent(id) {
    timeline = timeline.filter((e) => e.id !== id);
    renderTimeline();
}

function clearTimeline() {
    timeline = [];
    renderTimeline();
}

const EVENT_TYPE_ICON = { skill: '⚡', burst: '💥', swap: '🔄', multiplier: '🎯' };

function renderTimeline() {
    const track = document.getElementById('timeline-track');
    const emptyState = document.getElementById('timeline-empty');

    if (timeline.length === 0) {
        track.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        track.innerHTML = timeline.map((event, index) => {
            const character = getCharacterById(event.characterId);
            const elementClass = `bg-element-${(character.element || '').toLowerCase()}`;
            return `
        <div class="timeline-event-chip" data-id="${event.id}">
          <span class="timeline-event-index">${index + 1}</span>
          <span class="timeline-event-dot ${elementClass}"></span>
          <div class="timeline-event-body">
            <p class="timeline-event-label">${EVENT_TYPE_ICON[event.type] || ''} ${event.label}</p>
            ${event.type === 'multiplier' ? `<p class="timeline-event-value">${event.previewText} · Lv.${event.talentLevel}</p>` : ''}
          </div>
          <button type="button" class="timeline-event-remove" data-id="${event.id}">&times;</button>
        </div>`;
        }).join('');

        track.querySelectorAll('.timeline-event-remove').forEach((btn) => {
            btn.addEventListener('click', () => removeEvent(btn.dataset.id));
        });
    }

    renderTotals();
}

function renderTotals() {
    const panel = document.getElementById('rotation-totals');
    const perSlot = rotationTeam.map(() => 0);
    let grandTotal = 0;

    timeline.forEach((event) => {
        if (event.type === 'multiplier' && event.kind === 'damage') {
            perSlot[event.slotIndex] += event.computedValue;
            grandTotal += event.computedValue;
        }
    });

    panel.innerHTML = `
    <div class="rotation-totals-grid">
      ${rotationTeam.map((entry, i) => {
        const character = getCharacterById(entry.characterId);
        return `
        <div class="rotation-totals-card">
          <p class="rotation-totals-name">${character.name}</p>
          <p class="rotation-totals-value">${Math.round(perSlot[i]).toLocaleString()}</p>
        </div>`;
    }).join('')}
    </div>
    <p class="rotation-totals-grand">Total Team Damage: <span>${Math.round(grandTotal).toLocaleString()}</span></p>
  `;
}

/* ---------- presets ---------- */

function renderPresetSelect() {
    const select = document.getElementById('preset-select');
    const presets = loadPresets();
    if (presets.length === 0) {
        select.innerHTML = '<option value="">No saved presets</option>';
        return;
    }
    select.innerHTML = presets.map((p) => `<option value="${p.id}">${p.name}</option>`).join('');
}

function openPresetSaveModal() {
    if (!rotationTeam) return;
    if (timeline.length === 0) {
        alert('Add at least one event to the timeline before saving a preset.');
        return;
    }
    document.getElementById('preset-name-input').value = '';
    document.getElementById('preset-save-error').classList.add('hidden');
    document.getElementById('preset-save-modal').classList.remove('hidden');
}

function closePresetSaveModal() {
    document.getElementById('preset-save-modal').classList.add('hidden');
}

function handleConfirmSavePreset() {
    const name = document.getElementById('preset-name-input').value.trim();
    const errorEl = document.getElementById('preset-save-error');
    if (!name) {
        errorEl.textContent = 'Please enter a preset name.';
        errorEl.classList.remove('hidden');
        return;
    }

    const presets = loadPresets();
    presets.unshift({
        id: `preset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name,
        teamCharacterIds: rotationTeam.map((e) => e.characterId),
        events: JSON.parse(JSON.stringify(timeline)),
        createdAt: Date.now()
    });
    savePresets(presets);
    closePresetSaveModal();
    renderPresetSelect();
}

function handleLoadPreset() {
    const select = document.getElementById('preset-select');
    const presetId = select.value;
    if (!presetId || !rotationTeam) return;

    const preset = loadPresets().find((p) => p.id === presetId);
    if (!preset) return;

    const currentTeamIds = rotationTeam.map((e) => e.characterId);
    const matches = preset.teamCharacterIds.length === currentTeamIds.length &&
        preset.teamCharacterIds.every((id, i) => id === currentTeamIds[i]);

    if (!matches) {
        const proceed = confirm('This preset was built for a different team lineup. Load it anyway, matching by slot position?');
        if (!proceed) return;
    }

    timeline = JSON.parse(JSON.stringify(preset.events)).map((e) => ({
        ...e,
        id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        characterId: rotationTeam[e.slotIndex] ? rotationTeam[e.slotIndex].characterId : e.characterId
    }));
    renderTimeline();
}

function handleDeletePreset() {
    const select = document.getElementById('preset-select');
    const presetId = select.value;
    if (!presetId) return;
    if (!confirm('Delete this preset? This cannot be undone.')) return;
    const presets = loadPresets().filter((p) => p.id !== presetId);
    savePresets(presets);
    renderPresetSelect();
}

/* ---------- init ---------- */

document.addEventListener('DOMContentLoaded', () => {
    savedCharacterEntries = loadSavedCharacterEntries();
    renderTeamSelectGrid();

    document.getElementById('start-rotation-btn').addEventListener('click', startRotation);
    document.getElementById('change-team-btn').addEventListener('click', changeTeam);
    document.getElementById('clear-timeline-btn').addEventListener('click', clearTimeline);

    document.getElementById('close-event-menu-btn').addEventListener('click', closeEventMenu);
    document.getElementById('event-menu-overlay').addEventListener('click', closeEventMenu);

    document.getElementById('save-preset-btn').addEventListener('click', openPresetSaveModal);
    document.getElementById('confirm-save-preset-btn').addEventListener('click', handleConfirmSavePreset);
    document.getElementById('cancel-save-preset-btn').addEventListener('click', closePresetSaveModal);
    document.getElementById('preset-save-overlay').addEventListener('click', closePresetSaveModal);
    document.getElementById('load-preset-btn').addEventListener('click', handleLoadPreset);
    document.getElementById('delete-preset-btn').addEventListener('click', handleDeletePreset);

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        closeEventMenu();
        closePresetSaveModal();
    });
});