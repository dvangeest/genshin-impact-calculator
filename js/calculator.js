/**
 * Team Damage Calculator page logic.
 *
 * Reads existing saved data (My Characters / My Weapons / My Artifacts,
 * all in localStorage from the other tabs) but never mutates it. All new
 * state introduced by this page lives under its own storage keys so it
 * can't corrupt the other tabs' data.
 */

const CALC_STORAGE_KEY = 'gi_calc_calculator_state';
const CALC_PRESET_KEY = 'gi_calc_char_presets';

const ELEMENTS = ['Pyro', 'Hydro', 'Electro', 'Cryo', 'Anemo', 'Geo', 'Dendro', 'Physical'];
const ELEMENT_CLASS = {
    Pyro: 'bg-element-pyro', Hydro: 'bg-element-hydro', Electro: 'bg-element-electro',
    Cryo: 'bg-element-cryo', Anemo: 'bg-element-anemo', Geo: 'bg-element-geo',
    Dendro: 'bg-element-dendro', Physical: 'bg-white/20'
};
const ELEMENT_HEX = {
    Pyro: '#e0603c', Hydro: '#3ba0e8', Electro: '#a35bf0', Cryo: '#6fd6f2',
    Anemo: '#5fd9b8', Geo: '#f0c14b', Dendro: '#8fce46', Physical: '#c9c9c9'
};

const REACTION_OPTIONS = [
    { key: 'overloaded', label: 'Overloaded (Transformative)' },
    { key: 'superconduct', label: 'Superconduct (Transformative)' },
    { key: 'electroCharged', label: 'Electro-Charged (Transformative)' },
    { key: 'swirl', label: 'Swirl (Transformative)' },
    { key: 'burning', label: 'Burning (Transformative)' },
    { key: 'bloom', label: 'Bloom (Transformative)' },
    { key: 'stellarConduct', label: 'Stellar-Conduct (Transformative)' },
    { key: 'stellarSwirl', label: 'Stellar Swirl (Transformative)' }
];
const AMPLIFY_OPTIONS = [
    { key: '', label: 'No amplifying reaction' },
    { key: 'vaporize-forward', label: 'Vaporize (Hydro on Pyro, x2)' },
    { key: 'vaporize-reverse', label: 'Vaporize (Pyro on Hydro, x1.5)' },
    { key: 'melt-forward', label: 'Melt (Pyro on Cryo, x2)' },
    { key: 'melt-reverse', label: 'Melt (Cryo on Pyro, x1.5)' }
];

let state = null;
let dragCtx = null;

/* ---------- storage helpers (read-only for the other tabs' data) ---------- */

function safeParse(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
        console.error(`Failed to read ${key}:`, err);
        return fallback;
    }
}

function loadMyCharacterEntries() { return safeParse('gi_calc_my_characters', []); }
function loadMyWeaponEntries() { return safeParse('gi_calc_my_weapons', []); }
function loadMyArtifactEntries() { return safeParse('gi_calc_my_artifacts', []); }
function loadCharPresets() { return safeParse(CALC_PRESET_KEY, []); }
function saveCharPresets(list) { localStorage.setItem(CALC_PRESET_KEY, JSON.stringify(list)); }

function loadCalcState() {
    const saved = safeParse(CALC_STORAGE_KEY, null);
    if (saved) return saved;
    return {
        duration: 20,
        zoom: 40, // px per second
        team: [null, null, null, null], // character entry ids
        events: {}, // entryId -> [{id, category, key, label, mv, hits, time, amplify, reaction, isReaction, requiresConst, element}]
        enemy: { level: 90, defShredPct: 0, defIgnorePct: 0, res: { Pyro: 10, Hydro: 10, Electro: 10, Cryo: 10, Anemo: 10, Geo: 10, Dendro: 10, Physical: 10 } }
    };
}
function persist() { localStorage.setItem(CALC_STORAGE_KEY, JSON.stringify(state)); }

/* ---------- stat aggregation (mirrors Mycharacters.js, kept local to avoid DOM coupling) ---------- */

function applyWeaponStatLocal(type, value, stats) {
    switch (type) {
        case 'ATK_FLAT': stats.flatATK += value; break;
        case 'ATK_PERCENT': case 'ATK%': stats.atkPercent += value; break;
        case 'ELEMENTAL_MASTERY': stats.em += value; break;
        case 'ENERGY_RECHARGE': stats.energyRecharge += value; break;
        case 'CRIT_DMG': stats.critDmg += value; break;
        case 'CRIT_RATE': stats.critRate += value; break;
        default: break;
    }
}
function applyArtifactStatLocal(label, value, stats) {
    switch (label) {
        case 'ATK': stats.flatATK += value; break;
        case 'ATK%': stats.atkPercent += value; break;
        case 'Elemental Mastery': stats.em += value; break;
        case 'Energy Recharge%': case 'Energy Recharge': stats.energyRecharge += value; break;
        case 'CRIT Rate': case 'Crit Rate%': stats.critRate += value; break;
        case 'CRIT DMG': case 'Crit DMG%': stats.critDmg += value; break;
        default: break;
    }
}

/**
 * Aggregates ATK / CRIT / EM / elemental DMG% bonus for a saved character
 * entry, folding in weapon main/substat + any of the weapon's OnEquip
 * refinement modifiers, and all 5 artifacts' main/substats. Elemental/
 * Physical DMG% main stats on the Goblet are assumed to match the
 * character's own element (this data model doesn't tag which element a
 * generic "Elemental DMG%" roll is for).
 */
function computeCalcStats(entry) {
    const character = CHARACTERS.find((c) => c.id === entry.characterId);
    const base = getCharacterStatsAtLevel(character, entry.level);
    const specialKey = getCharacterSpecialStatKey(character);
    const specialValue = base[specialKey] || 0;

    const stats = {
        flatATK: base.atk, atkPercent: 0, critRate: 5, critDmg: 50,
        energyRecharge: 100, em: 0, elementalDmgBonusPct: 0
    };
    if (specialKey === 'CRIT_Rate') stats.critRate += specialValue;
    if (specialKey === 'CRIT_DMG') stats.critDmg += specialValue;
    if (specialKey === 'ER') stats.energyRecharge += specialValue;
    if (specialKey === 'ATK_PERCENT') stats.atkPercent += specialValue;

    let weaponData = null;
    if (entry.weaponEntryId) {
        const weaponEntry = loadMyWeaponEntries().find((w) => w.id === entry.weaponEntryId);
        weaponData = weaponEntry ? WEAPONS.find((w) => w.id === weaponEntry.weaponId) : null;
        if (weaponEntry && weaponData) {
            const wLevel = Math.min(Math.max(weaponEntry.level, 1), 90);
            const wStats = weaponData.stats[String(wLevel)] || weaponData.stats['1'];
            applyWeaponStatLocal(weaponData.mainStat.type, wStats[weaponData.mainStat.curve], stats);
            applyWeaponStatLocal(weaponData.subStat.type, wStats[weaponData.subStat.curve], stats);
            const ref = (weaponData.refinements || []).find((r) => r.refinement === weaponEntry.refinement);
            (ref && ref.modifiers ? ref.modifiers : []).forEach((mod) => {
                if (mod.trigger && mod.trigger !== 'OnEquip') return;
                if (mod.stat === 'ELEMENTAL_DMG_PERCENT') stats.elementalDmgBonusPct += mod.value * 100;
                else applyWeaponStatLocal(mod.stat, mod.stat === 'ATK_PERCENT' ? mod.value * 100 : mod.value, stats);
            });
        }
    }

    const savedArtifacts = loadMyArtifactEntries();
    ARTIFACT_TYPES.forEach((t) => {
        const artId = entry.artifacts ? entry.artifacts[t.key] : null;
        if (!artId) return;
        const art = savedArtifacts.find((a) => a.id === artId);
        if (!art) return;
        if (art.mainStat.type === 'Elemental DMG%' || art.mainStat.type === 'Physical DMG%') {
            stats.elementalDmgBonusPct += art.mainStat.value;
        } else {
            applyArtifactStatLocal(art.mainStat.type, art.mainStat.value, stats);
        }
        (art.substats || []).forEach((s) => applyArtifactStatLocal(s.type, s.value, stats));
    });

    return {
        atk: stats.flatATK * (1 + stats.atkPercent / 100),
        critRate: stats.critRate,
        critDmg: stats.critDmg,
        em: stats.em,
        elementalDmgBonusPct: stats.elementalDmgBonusPct,
        energyRecharge: stats.energyRecharge,
        weaponData
    };
}

/* ---------- event catalogue helpers ---------- */

function availableEventsForEntry(entry) {
    const groups = getSortedCharacterEvents(entry.characterId);
    return groups.map((g) => ({
        ...g,
        items: g.items.filter((it) => !it.requiresConst || entry.constellation >= it.requiresConst)
    })).filter((g) => g.items.length > 0);
}

function findEventDef(characterId, category, key) {
    const data = CHARACTER_TALENT_EVENTS[characterId];
    if (!data || !data[category]) return null;
    return data[category].find((e) => e.key === key) || null;
}

/* ---------- damage computation ---------- */

const CATEGORY_TO_TALENT_KEY = {
    normal: 'normalAttack', charged: 'normalAttack', plunge: 'normalAttack',
    skill: 'elementalSkill', burst: 'elementalBurst',
    passive: null, constellation: null
};

function computeEventDamage(entry, ev, calcStats, character) {
    const enemy = state.enemy;
    if (ev.isReaction) {
        const el = ev.reaction === 'swirl' ? (ev.swirlElement || 'Anemo') : TRANSFORMATIVE_REACTION_ELEMENT[ev.reaction];
        const resPct = enemy.res[el] ?? 10;
        const dmg = computeTransformativeDamage(ev.reaction, entry.level, calcStats.em, 0, resPct);
        return { mv: null, hits: 1, dmg, perHit: dmg };
    }
    const def = findEventDef(entry.characterId, ev.category, ev.key);
    if (!def) return { mv: 0, hits: 1, dmg: 0, perHit: 0 };
    let mv;
    if (def.mv) {
        const talentKey = CATEGORY_TO_TALENT_KEY[ev.category];
        const talentLevel = (talentKey && entry.talentLevels && entry.talentLevels[talentKey]) || 10;
        mv = def.mv[Math.min(Math.max(talentLevel - 1, 0), def.mv.length - 1)];
    } else {
        mv = def.fixed || 0;
    }
    const hits = def.hits || 1;
    const perHitBase = computeHitDamage(mv, {
        atk: calcStats.atk, critRate: calcStats.critRate, critDmg: calcStats.critDmg,
        elementalDmgBonusPct: calcStats.elementalDmgBonusPct
    }, enemy, entry.level);
    let perHit = perHitBase;
    if (ev.amplify) perHit = applyAmplifyingReaction(perHitBase, ev.amplify, calcStats.em, 0);
    return { mv, hits, dmg: perHit * hits, perHit };
}

/* ---------- rendering ---------- */

function characterEntryOptions(excludeUsed) {
    const used = state.team.filter(Boolean);
    return loadMyCharacterEntries().filter((e) => !used.includes(e.id) || !excludeUsed).map((e) => {
        const c = getCharacterById(e.characterId);
        return { id: e.id, label: c ? `${c.name} (Lv.${e.level}, C${e.constellation})` : 'Unknown' };
    });
}

function renderTeamSlots() {
    const container = document.getElementById('calc-team-slots');
    const entries = loadMyCharacterEntries();
    if (entries.length === 0) {
        container.innerHTML = '<p class="text-sm text-muted-foreground">No saved characters yet — build some on the <a href="characters.html" class="text-primary hover:underline">Characters</a> tab first.</p>';
        return;
    }
    container.innerHTML = state.team.map((entryId, slotIndex) => {
        const options = ['<option value="">Empty slot</option>'].concat(
            entries.map((e) => {
                const c = getCharacterById(e.characterId);
                const sel = e.id === entryId ? 'selected' : '';
                return `<option value="${e.id}" ${sel}>${c ? c.name : 'Unknown'} (Lv.${e.level})</option>`;
            })
        );
        return `
      <div class="calc-team-slot">
        <label class="text-xs text-muted-foreground">Slot ${slotIndex + 1}</label>
        <select class="field-select w-full h-10 rounded-md border border-input bg-transparent px-2 text-sm calc-team-select" data-slot="${slotIndex}">
          ${options.join('')}
        </select>
      </div>`;
    }).join('');

    container.querySelectorAll('.calc-team-select').forEach((sel) => {
        sel.addEventListener('change', () => {
            const slot = parseInt(sel.dataset.slot, 10);
            state.team[slot] = sel.value || null;
            persist();
            renderAll();
        });
    });
}

function renderEnemyPanel() {
    document.getElementById('enemy-level-input').value = state.enemy.level;
    document.getElementById('enemy-def-shred-input').value = state.enemy.defShredPct;
    document.getElementById('enemy-def-ignore-input').value = state.enemy.defIgnorePct;
    const resContainer = document.getElementById('enemy-res-grid');
    resContainer.innerHTML = ELEMENTS.map((el) => `
    <div class="enemy-res-item">
      <label class="text-[11px] text-muted-foreground">${el} RES%</label>
      <input type="number" step="1" class="field-input h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs enemy-res-input" data-el="${el}" value="${state.enemy.res[el]}">
    </div>`).join('');
    resContainer.querySelectorAll('.enemy-res-input').forEach((inp) => {
        inp.addEventListener('input', () => {
            state.enemy.res[inp.dataset.el] = parseFloat(inp.value) || 0;
            persist(); renderTimeline(); renderCharts();
        });
    });
}

function eventOptionsHtml(entry) {
    const groups = availableEventsForEntry(entry);
    let html = '';
    groups.forEach((g) => {
        html += `<optgroup label="${g.label}">`;
        g.items.forEach((it) => {
            html += `<option value="${g.category}::${it.key}">${it.label}</option>`;
        });
        html += '</optgroup>';
    });
    html += '<optgroup label="Reactions (no ATK/MV — scales with EM &amp; Lv.)">';
    REACTION_OPTIONS.forEach((r) => { html += `<option value="reaction::${r.key}">${r.label}</option>`; });
    html += '</optgroup>';
    return html;
}

function computeRowLayout(events, blockSeconds) {
    const sorted = [...events].sort((a, b) => a.time - b.time);
    const rowEnds = [];
    const rows = {};
    sorted.forEach((ev) => {
        let row = rowEnds.findIndex((end) => end <= ev.time);
        if (row === -1) { row = rowEnds.length; rowEnds.push(0); }
        rowEnds[row] = ev.time + blockSeconds;
        rows[ev.id] = row;
    });
    return { rows, rowCount: Math.max(1, rowEnds.length) };
}

function renderTimeline() {
    const zoom = state.zoom;
    const duration = state.duration;
    const widthPx = duration * zoom;

    // Shared ruler
    const ruler = document.getElementById('calc-ruler');
    ruler.style.width = `${widthPx}px`;
    let rulerHtml = '';
    for (let s = 0; s <= duration; s++) {
        rulerHtml += `<div class="calc-ruler-tick" style="left:${s * zoom}px">${s}s</div>`;
    }
    ruler.innerHTML = rulerHtml;

    const lanesContainer = document.getElementById('calc-lanes');
    const activeEntries = state.team.filter(Boolean).map((id) => loadMyCharacterEntries().find((e) => e.id === id)).filter(Boolean);

    if (activeEntries.length === 0) {
        lanesContainer.innerHTML = '<p class="text-sm text-muted-foreground p-4">Pick up to 4 characters above to start building a timeline.</p>';
        return;
    }

    lanesContainer.innerHTML = activeEntries.map((entry) => {
        const character = getCharacterById(entry.characterId);
        const calcStats = computeCalcStats(entry);
        const events = state.events[entry.id] || [];
        const { rows, rowCount } = computeRowLayout(events, 1.1);
        const laneHeight = rowCount * 34 + 12;
        const presets = loadCharPresets().filter((p) => p.characterId === entry.characterId);

        const blocksHtml = events.map((ev) => {
            const { mv, hits, dmg } = computeEventDamage(entry, ev, calcStats, character);
            const left = ev.time * zoom;
            const top = rows[ev.id] * 34;
            const mvLabel = mv === null ? 'Reaction' : `MV ${(mv * 100).toFixed(1)}%${hits > 1 ? ` ×${hits}` : ''}`;
            return `
        <div class="calc-event-block" style="left:${left}px; top:${top}px;" data-entry="${entry.id}" data-event="${ev.id}" title="${ev.label}">
          <span class="calc-event-label">${ev.label}</span>
          <span class="calc-event-mv">${mvLabel}</span>
          <span class="calc-event-dmg">${Math.round(dmg).toLocaleString()} dmg</span>
          <button class="calc-event-remove" data-entry="${entry.id}" data-event="${ev.id}" title="Remove event">&times;</button>
        </div>`;
        }).join('');

        return `
      <div class="calc-lane-wrap">
        <div class="calc-lane-header">
          <div class="calc-char-icon ${ELEMENT_CLASS[character.element] || ''}">${character.name.slice(0, 1)}</div>
          <div class="min-w-0">
            <p class="text-sm font-semibold truncate">${character.name}</p>
            <p class="text-[11px] text-muted-foreground">${character.element} · Lv.${entry.level} · C${entry.constellation} · ATK ${Math.round(calcStats.atk)} · EM ${Math.round(calcStats.em)}</p>
          </div>
          <div class="calc-lane-controls">
            <select class="field-select h-8 rounded-md border border-input bg-transparent px-2 text-xs calc-add-event-select" data-entry="${entry.id}">
              ${eventOptionsHtml(entry)}
            </select>
            <input type="number" min="0" max="${duration}" step="0.1" value="0" class="field-input h-8 w-16 rounded-md border border-input bg-transparent px-2 text-xs calc-add-event-time" data-entry="${entry.id}">
            <button class="calc-btn-small calc-add-event-btn" data-entry="${entry.id}">Add</button>
            <button class="calc-btn-small calc-save-preset-btn" data-entry="${entry.id}">Save Preset</button>
            <select class="field-select h-8 rounded-md border border-input bg-transparent px-2 text-xs calc-load-preset-select" data-entry="${entry.id}">
              <option value="">Load preset…</option>
              ${presets.map((p) => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="calc-lane-track" style="width:${widthPx}px; height:${laneHeight}px;" data-entry="${entry.id}">
          ${blocksHtml}
        </div>
      </div>`;
    }).join('');

    // wire up controls
    lanesContainer.querySelectorAll('.calc-add-event-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const entryId = btn.dataset.entry;
            const select = lanesContainer.querySelector(`.calc-add-event-select[data-entry="${entryId}"]`);
            const timeInput = lanesContainer.querySelector(`.calc-add-event-time[data-entry="${entryId}"]`);
            addEventToCharacter(entryId, select.value, parseFloat(timeInput.value) || 0);
        });
    });
    lanesContainer.querySelectorAll('.calc-event-remove').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeEvent(btn.dataset.entry, btn.dataset.event);
        });
    });
    lanesContainer.querySelectorAll('.calc-save-preset-btn').forEach((btn) => {
        btn.addEventListener('click', () => savePresetForCharacter(btn.dataset.entry));
    });
    lanesContainer.querySelectorAll('.calc-load-preset-select').forEach((sel) => {
        sel.addEventListener('change', () => {
            if (!sel.value) return;
            loadPresetForCharacter(sel.dataset.entry, sel.value);
            sel.selectedIndex = 0;
        });
    });
    lanesContainer.querySelectorAll('.calc-event-block').forEach((block) => {
        block.addEventListener('mousedown', (e) => startDrag(e, block));
    });
}

/* ---------- event mutation ---------- */

function addEventToCharacter(entryId, optionValue, time) {
    if (!optionValue) return;
    const [category, key] = optionValue.split('::');
    const entry = loadMyCharacterEntries().find((e) => e.id === entryId);
    if (!entry) return;
    const clampedTime = Math.min(Math.max(time, 0), state.duration);

    if (!state.events[entryId]) state.events[entryId] = [];
    const id = `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    if (category === 'reaction') {
        const opt = REACTION_OPTIONS.find((r) => r.key === key);
        state.events[entryId].push({ id, isReaction: true, reaction: key, label: opt.label, time: clampedTime, amplify: '' });
    } else {
        const def = findEventDef(entry.characterId, category, key);
        if (!def) return;
        state.events[entryId].push({ id, category, key, label: def.label, time: clampedTime, amplify: '' });
    }
    persist();
    renderTimeline();
    renderCharts();
}

function removeEvent(entryId, eventId) {
    if (!state.events[entryId]) return;
    state.events[entryId] = state.events[entryId].filter((e) => e.id !== eventId);
    persist();
    renderTimeline();
    renderCharts();
}

/* ---------- drag-to-reposition on the zoomable timeline ---------- */

function startDrag(e, blockEl) {
    e.preventDefault();
    const entryId = blockEl.dataset.entry;
    const eventId = blockEl.dataset.event;
    const startX = e.clientX;
    const startLeft = parseFloat(blockEl.style.left) || 0;
    dragCtx = { entryId, eventId, startX, startLeft };

    function onMove(ev) {
        if (!dragCtx) return;
        const dx = ev.clientX - dragCtx.startX;
        const newLeftPx = Math.max(0, dragCtx.startLeft + dx);
        const newTime = Math.min(state.duration, newLeftPx / state.zoom);
        const list = state.events[dragCtx.entryId] || [];
        const ev2 = list.find((x) => x.id === dragCtx.eventId);
        if (ev2) ev2.time = Math.round(newTime * 10) / 10;
        renderTimeline();
    }
    function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        dragCtx = null;
        persist();
        renderCharts();
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
}

/* ---------- per-character presets ---------- */

function savePresetForCharacter(entryId) {
    const entry = loadMyCharacterEntries().find((e) => e.id === entryId);
    if (!entry) return;
    const character = getCharacterById(entry.characterId);
    const name = window.prompt(`Save this event sequence as a preset for ${character ? character.name : 'this character'}:`, `${character ? character.name : 'Character'} preset`);
    if (!name) return;
    const presets = loadCharPresets();
    presets.unshift({
        id: `preset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        characterId: entry.characterId,
        name,
        events: JSON.parse(JSON.stringify(state.events[entryId] || [])),
        createdAt: Date.now()
    });
    saveCharPresets(presets);
    renderTimeline();
}

function loadPresetForCharacter(entryId, presetId) {
    const preset = loadCharPresets().find((p) => p.id === presetId);
    if (!preset) return;
    state.events[entryId] = JSON.parse(JSON.stringify(preset.events)).map((ev) => ({
        ...ev, id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    }));
    persist();
    renderTimeline();
    renderCharts();
}

/* ---------- DPS / DPR charts ---------- */

function computeTeamTotals() {
    const activeEntries = state.team.filter(Boolean).map((id) => loadMyCharacterEntries().find((e) => e.id === id)).filter(Boolean);
    const totals = activeEntries.map((entry) => {
        const character = getCharacterById(entry.characterId);
        const calcStats = computeCalcStats(entry);
        const events = state.events[entry.id] || [];
        const dpr = events.reduce((sum, ev) => sum + computeEventDamage(entry, ev, calcStats, character).dmg, 0);
        return { entry, character, dpr, dps: dpr / state.duration };
    });
    const teamTotal = totals.reduce((s, t) => s + t.dpr, 0) || 1;
    totals.forEach((t) => { t.pct = (t.dpr / teamTotal) * 100; });
    return totals;
}

function renderCharts() {
    const totals = computeTeamTotals();
    const pieEl = document.getElementById('calc-pie-chart');
    const barEl = document.getElementById('calc-bar-chart');
    const legendEl = document.getElementById('calc-chart-legend');

    if (totals.length === 0 || totals.every((t) => t.dpr === 0)) {
        pieEl.innerHTML = '<circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--border))" stroke-width="2"></circle>';
        barEl.innerHTML = '';
        legendEl.innerHTML = '<p class="text-sm text-muted-foreground">Add events to the timeline to see DPS/DPR contribution.</p>';
        return;
    }

    // Pie (SVG donut)
    const cx = 100, cy = 100, r = 90, innerR = 50;
    let angle = -90;
    let pieHtml = '';
    totals.forEach((t) => {
        const sweep = (t.pct / 100) * 360;
        const x1 = cx + r * Math.cos(Math.PI * angle / 180);
        const y1 = cy + r * Math.sin(Math.PI * angle / 180);
        const endAngle = angle + sweep;
        const x2 = cx + r * Math.cos(Math.PI * endAngle / 180);
        const y2 = cy + r * Math.sin(Math.PI * endAngle / 180);
        const largeArc = sweep > 180 ? 1 : 0;
        const color = ELEMENT_HEX[t.character.element] || '#888';
        pieHtml += `<path d="M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="${color}" stroke="hsl(var(--card))" stroke-width="2"></path>`;
        angle = endAngle;
    });
    pieHtml += `<circle cx="${cx}" cy="${cy}" r="${innerR}" fill="hsl(var(--card))"></circle>`;
    pieEl.innerHTML = pieHtml;

    // Bar chart
    const maxDps = Math.max(...totals.map((t) => t.dps), 1);
    const barW = 620, barGap = 14, barH = 26, chartTop = 10;
    let barHtml = '';
    totals.forEach((t, i) => {
        const y = chartTop + i * (barH + barGap);
        const w = Math.max(2, (t.dps / maxDps) * (barW - 160));
        const color = ELEMENT_HEX[t.character.element] || '#888';
        barHtml += `
      <g>
        <text x="0" y="${y + barH / 2 + 4}" fill="hsl(var(--foreground))" font-size="12">${t.character.name}</text>
        <rect x="130" y="${y}" width="${w.toFixed(1)}" height="${barH}" rx="4" fill="${color}"></rect>
        <text x="${130 + w + 8}" y="${y + barH / 2 + 4}" fill="hsl(var(--muted-foreground))" font-size="11">${Math.round(t.dps).toLocaleString()} DPS</text>
      </g>`;
    });
    barEl.setAttribute('viewBox', `0 0 ${barW} ${chartTop + totals.length * (barH + barGap)}`);
    barEl.innerHTML = barHtml;

    // Legend / table
    legendEl.innerHTML = totals.map((t) => `
    <div class="calc-legend-row">
      <div class="calc-char-icon calc-char-icon-sm ${ELEMENT_CLASS[t.character.element] || ''}">${t.character.name.slice(0, 1)}</div>
      <span class="calc-legend-name">${t.character.name}</span>
      <span class="calc-legend-stat">${t.pct.toFixed(1)}%</span>
      <span class="calc-legend-stat">DPS ${Math.round(t.dps).toLocaleString()}</span>
      <span class="calc-legend-stat">DPR ${Math.round(t.dpr).toLocaleString()}</span>
    </div>`).join('');
}

/* ---------- top-level controls ---------- */

function renderTimelineControls() {
    document.getElementById('calc-duration-input').value = state.duration;
    document.getElementById('calc-zoom-input').value = state.zoom;
}

function renderAll() {
    renderTeamSlots();
    renderEnemyPanel();
    renderTimelineControls();
    renderTimeline();
    renderCharts();
}

document.addEventListener('DOMContentLoaded', () => {
    state = loadCalcState();
    renderAll();

    document.getElementById('calc-duration-input').addEventListener('input', (e) => {
        const val = Math.min(Math.max(parseFloat(e.target.value) || 1, 1), 300);
        state.duration = val;
        persist();
        renderTimeline();
        renderCharts();
    });
    document.getElementById('calc-zoom-input').addEventListener('input', (e) => {
        state.zoom = parseInt(e.target.value, 10) || 40;
        persist();
        renderTimeline();
    });
    document.getElementById('enemy-level-input').addEventListener('input', (e) => {
        state.enemy.level = parseInt(e.target.value, 10) || 90;
        persist(); renderTimeline(); renderCharts();
    });
    document.getElementById('enemy-def-shred-input').addEventListener('input', (e) => {
        state.enemy.defShredPct = parseFloat(e.target.value) || 0;
        persist(); renderTimeline(); renderCharts();
    });
    document.getElementById('enemy-def-ignore-input').addEventListener('input', (e) => {
        state.enemy.defIgnorePct = parseFloat(e.target.value) || 0;
        persist(); renderTimeline(); renderCharts();
    });
});