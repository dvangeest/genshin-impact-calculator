const WEAPON_STORAGE_KEY = 'gi_calc_my_weapons';

let selectedWeaponId = null;

function getWeaponById(id) {
    return WEAPONS.find((w) => w.id === id);
}

function loadMyWeapons() {
    try {
        const raw = localStorage.getItem(WEAPON_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error('Failed to read saved weapons:', err);
        return [];
    }
}

function saveMyWeapons(weapons) {
    localStorage.setItem(WEAPON_STORAGE_KEY, JSON.stringify(weapons));
}

/* ---------- formatting helpers ---------- */

function humanizeTrigger(trigger) {
    const map = {
        OnEquip: 'On Equip',
        OnReactionTrigger: 'On Reaction Trigger',
        OnNormalOrChargedAttackHit: 'On Normal or Charged Attack Hit',
        OnChargedAttackHit: 'On Charged Attack Hit',
        OnNormalAttackHit: 'On Normal Attack Hit',
        OnCritHit: 'On CRIT Hit'
    };
    return map[trigger] || trigger;
}

function humanizeStat(stat) {
    return WEAPON_STAT_LABELS[stat] || stat;
}

const PERCENT_STATS = ['ATK_PERCENT', 'REACTION_DMG_PERCENT', 'CRIT_RATE', 'NORMAL_ATK_SPEED_PERCENT', 'ELEMENTAL_DMG_PERCENT', 'ATK_MULTIPLIER_DMG'];

function formatStatValue(stat, value) {
    if (PERCENT_STATS.includes(stat)) return `${(value * 100).toFixed(0)}%`;
    return `${value}`;
}

function formatModifier(mod) {
    let text = `${humanizeStat(mod.stat)} +${formatStatValue(mod.stat, mod.value)}`;
    if (mod.reaction) {
        const reactions = Array.isArray(mod.reaction) ? mod.reaction.join(' / ') : mod.reaction;
        text += ` (${reactions})`;
    }
    if (mod.element) text += ` (${mod.element} Element)`;
    if (mod.areaOfEffect) text += ` (${mod.areaOfEffect})`;
    if (mod.target && mod.target !== 'Self') text += ` → ${mod.target}`;
    if (mod.duration) text += `, ${mod.duration}s`;
    if (mod.conditional) text += ` [${mod.conditional === 'OnStellarReactionOnly' ? 'Stellar reactions only' : mod.conditional}]`;
    if (mod.trigger && mod.trigger !== 'OnEquip') text += ` (${humanizeTrigger(mod.trigger)})`;
    return text;
}

function formatProc(proc) {
    const lines = [];
    const chance = proc.chance ? ` (${(proc.chance * 100).toFixed(0)}% chance)` : '';
    lines.push(`${humanizeTrigger(proc.trigger)}${chance}:`);

    if (proc.effect) {
        (Array.isArray(proc.effect) ? proc.effect : [proc.effect]).forEach((e) => lines.push('  ' + formatModifier(e)));
    }
    if (proc.modifiers) {
        proc.modifiers.forEach((m) => lines.push('  ' + formatModifier(m)));
    }

    const meta = [];
    if (proc.duration) meta.push(`Duration: ${proc.duration}s`);
    if (proc.cooldown) meta.push(`CD: ${proc.cooldown}s`);
    if (proc.internalCooldown) meta.push(`ICD: ${proc.internalCooldown}s`);
    if (proc.maxStacks) meta.push(`Max Stacks: ${proc.maxStacks}`);
    if (proc.buffName) meta.push(`Buff: "${proc.buffName}"`);
    if (proc.behavior) meta.push(proc.behavior);
    if (proc.canTriggerOffField) meta.push('Can trigger off-field');
    if (meta.length) lines.push('  (' + meta.join(', ') + ')');

    return lines;
}

function getRefinementDescription(weapon, refinement) {
    const idx = Math.min(Math.max(refinement, 1), 5) - 1;
    const ref = weapon.refinements[idx];
    if (!ref) return [];
    let lines = [];
    if (ref.modifiers) ref.modifiers.forEach((m) => lines.push(formatModifier(m)));
    if (ref.proc) lines = lines.concat(formatProc(ref.proc));
    return lines;
}

function getStatsForLevel(weapon, level) {
    const clamped = Math.min(Math.max(parseInt(level, 10) || 1, 1), 90);
    return weapon.stats[String(clamped)] || weapon.stats['1'];
}

function formatMainStat(weapon, level) {
    const stats = getStatsForLevel(weapon, level);
    const value = stats[weapon.mainStat.curve];
    return `${humanizeStat(weapon.mainStat.type)}: ${Math.round(value)}`;
}

function formatSubStat(weapon, level) {
    const stats = getStatsForLevel(weapon, level);
    const value = stats[weapon.subStat.curve];
    const suffix = weapon.subStat.curve.includes('%') ? '%' : '';
    return `${weapon.subStat.curve}: ${value}${suffix}`;
}

function weaponDisplayName(weapon) {
    return `${weapon.name} (${WEAPON_TYPE_LABELS[weapon.weaponType] || weapon.weaponType})`;
}

/* ---------- weapon select modal ---------- */

function renderWeaponSelectList(filterText) {
    const list = document.getElementById('weapon-select-list');
    const query = (filterText || '').trim().toLowerCase();
    const filtered = WEAPONS.filter((w) => w.name.toLowerCase().includes(query));

    if (filtered.length === 0) {
        list.innerHTML = '<p class="text-sm text-muted-foreground text-center py-6">No weapons match your search.</p>';
        return;
    }

    list.innerHTML = filtered.map((w) => `
    <div class="weapon-list-item" data-weapon-id="${w.id}">
      <div class="weapon-list-icon">Icon</div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm truncate">${w.name}</p>
        <p class="text-xs text-muted-foreground">${WEAPON_TYPE_LABELS[w.weaponType] || w.weaponType}</p>
      </div>
    </div>
  `).join('');

    list.querySelectorAll('.weapon-list-item').forEach((item) => {
        item.addEventListener('click', () => {
            selectedWeaponId = item.dataset.weaponId;
            closeWeaponSelectModal();
            openWeaponCreateModal();
        });
    });
}

function openWeaponSelectModal() {
    document.getElementById('weapon-search-input').value = '';
    renderWeaponSelectList('');
    document.getElementById('weapon-select-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeWeaponSelectModal() {
    document.getElementById('weapon-select-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

/* ---------- weapon create modal ---------- */

function updateWeaponPreview() {
    const weapon = getWeaponById(selectedWeaponId);
    if (!weapon) return;

    const level = document.getElementById('weapon-level-input').value;
    const refinement = getSelectedRefinement();

    document.getElementById('weapon-preview-main-stat').textContent = formatMainStat(weapon, level);
    document.getElementById('weapon-preview-sub-stat').textContent = formatSubStat(weapon, level);

    const passiveLines = getRefinementDescription(weapon, refinement);
    const passiveNameEl = document.getElementById('weapon-preview-passive-name');
    passiveNameEl.textContent = weapon.passiveName ? weapon.passiveName : '(No named passive)';

    const passiveBody = document.getElementById('weapon-preview-passive-body');
    passiveBody.innerHTML = passiveLines.length
        ? passiveLines.map((line) => `<p class="weapon-preview-line">${line}</p>`).join('')
        : '<p class="weapon-preview-line">No passive effect.</p>';
}

function getSelectedRefinement() {
    const active = document.querySelector('.refinement-btn.active');
    return active ? parseInt(active.dataset.refinement, 10) : 1;
}

function setSelectedRefinement(value) {
    document.querySelectorAll('.refinement-btn').forEach((btn) => {
        btn.classList.toggle('active', parseInt(btn.dataset.refinement, 10) === value);
    });
}

function openWeaponCreateModal() {
    const weapon = getWeaponById(selectedWeaponId);
    if (!weapon) return;

    document.getElementById('weapon-create-title').textContent = weaponDisplayName(weapon);
    document.getElementById('weapon-create-error').classList.add('hidden');
    document.getElementById('weapon-level-input').value = 90;
    setSelectedRefinement(1);
    updateWeaponPreview();

    document.getElementById('weapon-create-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeWeaponCreateModal() {
    document.getElementById('weapon-create-modal').classList.add('hidden');
    document.body.style.overflow = '';
    selectedWeaponId = null;
}

function handleCreateWeapon() {
    const weapon = getWeaponById(selectedWeaponId);
    const errorEl = document.getElementById('weapon-create-error');
    if (!weapon) {
        errorEl.textContent = 'No weapon selected.';
        errorEl.classList.remove('hidden');
        return;
    }

    const level = parseInt(document.getElementById('weapon-level-input').value, 10);
    const refinement = getSelectedRefinement();

    if (!Number.isFinite(level) || level < 1 || level > 90) {
        errorEl.textContent = 'Level must be between 1 and 90.';
        errorEl.classList.remove('hidden');
        return;
    }

    const entry = {
        id: `weapon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        weaponId: weapon.id,
        refinement,
        level,
        createdAt: Date.now()
    };

    const weapons = loadMyWeapons();
    weapons.unshift(entry);
    saveMyWeapons(weapons);

    closeWeaponCreateModal();
    renderMyWeapons();
}

function handleDeleteWeapon(id) {
    const weapons = loadMyWeapons().filter((w) => w.id !== id);
    saveMyWeapons(weapons);
    renderMyWeapons();
}

/* ---------- "My Weapons" grid ---------- */

function renderMyWeapons() {
    const grid = document.getElementById('my-weapons-grid');
    const emptyState = document.getElementById('my-weapons-empty-state');
    const entries = loadMyWeapons();

    if (entries.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    grid.innerHTML = entries.map((entry) => {
        const weapon = getWeaponById(entry.weaponId);
        if (!weapon) return '';
        const qualityClass = WEAPON_QUALITY_CLASS[weapon.qualityType] || '';
        const passiveLines = getRefinementDescription(weapon, entry.refinement);
        const passiveHtml = passiveLines.length
            ? passiveLines.map((line) => `<li class="text-xs text-muted-foreground">${line}</li>`).join('')
            : '<li class="text-xs text-muted-foreground/50 italic">No passive effect</li>';

        return `
      <div class="${qualityClass} rounded-xl border border-border bg-card p-4 flex flex-col gap-3 hover:border-white/20 transition-all">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-[10px] uppercase tracking-wider text-muted-foreground">${WEAPON_TYPE_LABELS[weapon.weaponType] || weapon.weaponType}</p>
            <p class="font-semibold text-sm leading-tight mt-0.5">${weapon.name}</p>
          </div>
          <div class="flex flex-col items-end gap-1 shrink-0">
            <span class="text-xs font-mono px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">R${entry.refinement}</span>
            <span class="text-xs font-mono px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">Lv.${entry.level}</span>
          </div>
        </div>
        <div class="pt-2 border-t border-border/50 space-y-0.5">
          <p class="text-sm font-medium text-primary">${formatMainStat(weapon, entry.level)}</p>
          <p class="text-xs text-muted-foreground">${formatSubStat(weapon, entry.level)}</p>
        </div>
        <ul class="space-y-1">${passiveHtml}</ul>
        <button
          class="mt-auto w-full py-1.5 rounded-md bg-secondary text-xs font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors delete-weapon-btn"
          data-id="${entry.id}">
          Remove
        </button>
      </div>
    `;
    }).join('');

    grid.querySelectorAll('.delete-weapon-btn').forEach((btn) => {
        btn.addEventListener('click', () => handleDeleteWeapon(btn.dataset.id));
    });
}

/* ---------- init ---------- */

document.addEventListener('DOMContentLoaded', () => {
    renderMyWeapons();

    document.getElementById('open-weapon-select-modal-btn').addEventListener('click', openWeaponSelectModal);
    document.getElementById('close-weapon-select-modal-btn').addEventListener('click', closeWeaponSelectModal);
    document.getElementById('weapon-select-overlay').addEventListener('click', closeWeaponSelectModal);
    document.getElementById('weapon-search-input').addEventListener('input', (e) => {
        renderWeaponSelectList(e.target.value);
    });

    document.getElementById('close-weapon-create-modal-btn').addEventListener('click', closeWeaponCreateModal);
    document.getElementById('weapon-create-overlay').addEventListener('click', closeWeaponCreateModal);
    document.getElementById('weapon-level-input').addEventListener('input', updateWeaponPreview);
    document.querySelectorAll('.refinement-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            setSelectedRefinement(parseInt(btn.dataset.refinement, 10));
            updateWeaponPreview();
        });
    });
    document.getElementById('create-weapon-btn').addEventListener('click', handleCreateWeapon);

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        closeWeaponSelectModal();
        closeWeaponCreateModal();
    });
});