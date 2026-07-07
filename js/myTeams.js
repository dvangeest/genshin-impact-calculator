const TEAM_STORAGE_KEY = 'gi_calc_my_teams';
const CHARACTER_STORAGE_KEY_REF = 'gi_calc_my_characters';

const TEAM_SLOT_COUNT = 4;

let currentTeamDraft = null; // { slots: [entryId|null, entryId|null, entryId|null, entryId|null] }
let editingTeamId = null;
let currentTeamSlotIndex = null;

/* ---------- storage ---------- */

function loadMyTeams() {
    try {
        const raw = localStorage.getItem(TEAM_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error('Failed to read saved teams:', err);
        return [];
    }
}

function saveMyTeams(teams) {
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(teams));
}

function loadSavedCharacterEntries() {
    try {
        const raw = localStorage.getItem(CHARACTER_STORAGE_KEY_REF);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error('Failed to read saved characters:', err);
        return [];
    }
}

function getCharacterDataById(id) {
    return CHARACTERS.find((c) => c.id === id);
}

/* ---------- Team Resonance ----------
 * Standard Genshin elemental resonance: activates with 2+ party members
 * sharing an element. Descriptions are summarized, not quoted from any wiki.
 *
 * NOTE: Moonsign and Hexerei bonuses aren't computed here. CHARACTERS
 * (js/characterData.js) currently only tags each entry with a single
 * `element` field — there's no archetype/moonsign/hexerei grouping in the
 * data (even though e.g. Nicole's passive references "Hexerei characters").
 * To wire those in later: add something like `archetypes: ['Hexerei']` to
 * the relevant CHARACTERS entries, then extend computeTeamResonance (or add
 * a sibling function) to count archetype occurrences the same way elements
 * are counted below. */

const ELEMENT_RESONANCE = {
    Pyro: { name: 'Fervent Flames', description: 'All party members gain ATK +25%.' },
    Hydro: { name: 'Soothing Water', description: 'All party members gain HP +25%.' },
    Electro: { name: 'High Voltage', description: 'Energy particle/orb generation is boosted for all party members, helping Energy Recharge.' },
    Anemo: { name: 'Impetuous Winds', description: 'Movement SPD +10%. Stamina consumption for sprinting, climbing, and swimming -15%. Elemental Skill CD -5%.' },
    Cryo: { name: 'Shattering Ice', description: 'CRIT Rate +15% against enemies affected by Cryo.' },
    Geo: { name: 'Enduring Rock', description: 'Shield strength +15%. Characters protected by a shield deal +15% DMG.' },
    Dendro: { name: 'Sprawling Green', description: 'All party members gain Elemental Mastery +30.' }
};

function computeTeamResonance(characterDataList) {
    const elementCounts = {};
    characterDataList.forEach((c) => {
        if (!c) return;
        elementCounts[c.element] = (elementCounts[c.element] || 0) + 1;
    });

    return Object.entries(elementCounts)
        .filter(([, count]) => count >= 2)
        .map(([element]) => ({ element, ...ELEMENT_RESONANCE[element] }))
        .filter((r) => r.name);
}

/* ---------- team create/configure modal ---------- */

function updateCreateTeamButtonState() {
    const btn = document.getElementById('create-team-btn');
    const filled = currentTeamDraft.slots.filter(Boolean).length;
    btn.disabled = filled < TEAM_SLOT_COUNT;
}

function renderTeamSlotGrid() {
    const grid = document.getElementById('team-slot-grid');
    const savedCharacters = loadSavedCharacterEntries();

    grid.innerHTML = currentTeamDraft.slots.map((entryId, index) => {
        const entry = entryId ? savedCharacters.find((c) => c.id === entryId) : null;
        const data = entry ? getCharacterDataById(entry.characterId) : null;

        if (!data) {
            return `
        <button type="button" class="team-slot-btn" data-slot-index="${index}">
          <div class="team-slot-icon">+</div>
          <span class="team-slot-empty-label">Empty Slot</span>
        </button>`;
        }

        return `
      <button type="button" class="team-slot-btn filled" data-slot-index="${index}">
        <div class="team-slot-icon">Icon</div>
        <span class="team-slot-name">${data.name}</span>
        <span class="team-slot-sub">${data.element} · ${WEAPON_TYPE_LABELS[data.weaponType] || data.weaponType}</span>
      </button>`;
    }).join('');

    grid.querySelectorAll('.team-slot-btn').forEach((btn) => {
        btn.addEventListener('click', () => openCharacterSelectForTeamModal(parseInt(btn.dataset.slotIndex, 10)));
    });

    updateCreateTeamButtonState();
}

function renderResonancePanel() {
    const panel = document.getElementById('team-resonance-panel');
    const savedCharacters = loadSavedCharacterEntries();
    const dataList = currentTeamDraft.slots.map((entryId) => {
        if (!entryId) return null;
        const entry = savedCharacters.find((c) => c.id === entryId);
        return entry ? getCharacterDataById(entry.characterId) : null;
    });

    const resonances = computeTeamResonance(dataList);

    panel.innerHTML = resonances.length
        ? resonances.map((r) => `
      <div class="team-resonance-card">
        <p class="team-resonance-name">${r.element} Resonance — ${r.name}</p>
        <p class="team-resonance-desc">${r.description}</p>
      </div>`).join('')
        : '<p class="team-resonance-empty">Fill slots with 2+ characters sharing an element to activate a Team Resonance.</p>';
}

function openTeamCreateModal() {
    editingTeamId = null;
    currentTeamDraft = { slots: [null, null, null, null] };

    document.getElementById('team-create-title').textContent = 'Build Team';
    document.getElementById('team-create-error').classList.add('hidden');
    document.getElementById('create-team-btn').textContent = 'Create Team';

    renderTeamSlotGrid();
    renderResonancePanel();

    document.getElementById('team-create-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function openTeamEditModal(teamId) {
    const team = loadMyTeams().find((t) => t.id === teamId);
    if (!team) return;

    editingTeamId = team.id;
    currentTeamDraft = { slots: [...team.slots] };

    document.getElementById('team-create-title').textContent = 'Edit Team';
    document.getElementById('team-create-error').classList.add('hidden');
    document.getElementById('create-team-btn').textContent = 'Save Changes';

    renderTeamSlotGrid();
    renderResonancePanel();

    document.getElementById('team-create-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeTeamCreateModal() {
    document.getElementById('team-create-modal').classList.add('hidden');
    document.body.style.overflow = '';
    currentTeamDraft = null;
    editingTeamId = null;
}

function handleCreateTeam() {
    const errorEl = document.getElementById('team-create-error');
    const filled = currentTeamDraft.slots.filter(Boolean);

    if (filled.length < TEAM_SLOT_COUNT) {
        errorEl.textContent = 'Select 4 characters to complete your team.';
        errorEl.classList.remove('hidden');
        return;
    }

    const teams = loadMyTeams();

    if (editingTeamId) {
        const idx = teams.findIndex((t) => t.id === editingTeamId);
        if (idx === -1) {
            errorEl.textContent = 'Could not find the team entry to update.';
            errorEl.classList.remove('hidden');
            return;
        }
        teams[idx] = { ...teams[idx], slots: [...currentTeamDraft.slots] };
    } else {
        teams.unshift({
            id: `team_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            slots: [...currentTeamDraft.slots],
            createdAt: Date.now()
        });
    }

    saveMyTeams(teams);
    closeTeamCreateModal();
    renderMyTeams();
}

function handleDeleteTeam(id) {
    const teams = loadMyTeams().filter((t) => t.id !== id);
    saveMyTeams(teams);
    renderMyTeams();
}

/* ---------- character select (for team) modal ---------- */

function openCharacterSelectForTeamModal(slotIndex) {
    currentTeamSlotIndex = slotIndex;
    renderCharacterSelectForTeamList();
    document.getElementById('character-select-for-team-modal').classList.remove('hidden');
}

function closeCharacterSelectForTeamModal() {
    document.getElementById('character-select-for-team-modal').classList.add('hidden');
    currentTeamSlotIndex = null;
}

function renderCharacterSelectForTeamList() {
    const list = document.getElementById('character-select-for-team-list');
    const savedCharacters = loadSavedCharacterEntries();

    // Don't let the same saved character fill two slots in this draft.
    const usedElsewhere = currentTeamDraft.slots.filter((id, idx) => id && idx !== currentTeamSlotIndex);
    const available = savedCharacters.filter((entry) => !usedElsewhere.includes(entry.id));

    if (available.length === 0) {
        list.innerHTML = '<p class="text-sm text-muted-foreground text-center py-6">No available characters. Build one on the Characters tab first.</p>';
        return;
    }

    list.innerHTML = available.map((entry) => {
        const data = getCharacterDataById(entry.characterId);
        if (!data) return '';
        return `
      <div class="weapon-list-item" data-entry-id="${entry.id}">
        <div class="weapon-list-icon">Icon</div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-sm truncate">${data.name}</p>
          <p class="text-xs text-muted-foreground">${data.element} · ${WEAPON_TYPE_LABELS[data.weaponType] || data.weaponType} · Lv.${entry.level} · C${entry.constellation}</p>
        </div>
      </div>`;
    }).join('');

    list.querySelectorAll('.weapon-list-item').forEach((item) => {
        item.addEventListener('click', () => {
            currentTeamDraft.slots[currentTeamSlotIndex] = item.dataset.entryId;
            closeCharacterSelectForTeamModal();
            renderTeamSlotGrid();
            renderResonancePanel();
        });
    });
}

/* ---------- "My Teams" grid ---------- */

function renderMyTeams() {
    const grid = document.getElementById('my-teams-grid');
    const emptyState = document.getElementById('my-teams-empty-state');
    const teams = loadMyTeams();

    if (teams.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    const savedCharacters = loadSavedCharacterEntries();

    grid.innerHTML = teams.map((team) => {
        const dataList = team.slots.map((entryId) => {
            if (!entryId) return null;
            const entry = savedCharacters.find((c) => c.id === entryId);
            return entry ? getCharacterDataById(entry.characterId) : null;
        });

        const membersHtml = dataList.map((data) => `
      <div class="team-card-member">
        <div class="team-card-member-icon">${data ? 'Icon' : '?'}</div>
        <span class="team-card-member-name">${data ? data.name : 'Missing'}</span>
      </div>`).join('');

        const resonances = computeTeamResonance(dataList);
        const resonanceHtml = resonances.length
            ? resonances.map((r) => `<li class="text-xs text-muted-foreground">${r.element} Resonance — ${r.name}</li>`).join('')
            : '<li class="text-xs text-muted-foreground/50 italic">No active Team Resonance</li>';

        return `
      <div class="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 hover:border-white/20 transition-all">
        <div class="team-card-members">${membersHtml}</div>
        <div class="pt-2 border-t border-border/50">
          <p class="text-xs uppercase tracking-wider text-muted-foreground mb-1">Team Resonance</p>
          <ul class="space-y-1">${resonanceHtml}</ul>
        </div>
        <div class="mt-auto flex gap-2">
          <button
            class="flex-1 py-1.5 rounded-md bg-secondary text-xs font-medium hover:bg-secondary/80 transition-colors edit-team-btn"
            data-id="${team.id}">
            Edit
          </button>
          <button
            class="flex-1 py-1.5 rounded-md bg-secondary text-xs font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors delete-team-btn"
            data-id="${team.id}">
            Remove
          </button>
        </div>
      </div>`;
    }).join('');

    grid.querySelectorAll('.edit-team-btn').forEach((btn) => {
        btn.addEventListener('click', () => openTeamEditModal(btn.dataset.id));
    });
    grid.querySelectorAll('.delete-team-btn').forEach((btn) => {
        btn.addEventListener('click', () => handleDeleteTeam(btn.dataset.id));
    });
}

/* ---------- init ---------- */

document.addEventListener('DOMContentLoaded', () => {
    renderMyTeams();

    document.getElementById('open-team-create-modal-btn').addEventListener('click', openTeamCreateModal);
    document.getElementById('close-team-create-modal-btn').addEventListener('click', closeTeamCreateModal);
    document.getElementById('team-create-overlay').addEventListener('click', closeTeamCreateModal);
    document.getElementById('create-team-btn').addEventListener('click', handleCreateTeam);

    document.getElementById('close-character-select-for-team-modal-btn').addEventListener('click', closeCharacterSelectForTeamModal);
    document.getElementById('character-select-for-team-overlay').addEventListener('click', closeCharacterSelectForTeamModal);

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        closeCharacterSelectForTeamModal();
        closeTeamCreateModal();
    });
});