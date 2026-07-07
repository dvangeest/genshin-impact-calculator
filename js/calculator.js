/**
 * Team Damage / Rotation Calculator page logic.
 *
 * Reads existing saved data (My Characters / My Weapons / My Artifacts) but
 * never mutates it. All new state introduced by this page lives under its
 * own storage keys.
 *
 * Damage formulas implemented here follow the community-verified formulas
 * documented on the Genshin Impact Wiki ("Damage", "Elemental Mastery", and
 * "Elemental Reaction/Level Scaling" pages):
 *   - Outgoing DMG   = ATK * MV * (1 + DMG Bonus%)
 *   - Avg (w/ CRIT)  = Outgoing DMG * (1 + CRIT Rate * CRIT DMG)
 *   - DEF multiplier = (casterLevel+100) / (casterLevel+100 + enemyDEF)
 *   - RES multiplier = 1 - RES/2                 if RES < 0
 *                     = 1 - RES                   if 0 <= RES < 75%
 *                     = 1 / (1 + 4*RES)           if RES >= 75%
 *   - Transformative reactions (Overloaded/Superconduct/Electro-Charged/
 *     Swirl/Burning/Bloom/Shattered/Burgeon/Hyperbloom): ignore DEF, can't
 *     CRIT, scale off the triggering character's level + EM only.
 *     DMG = LevelTable[reaction][level] * (1 + EMBonus + ReactionDMGBonus%) * RES mult
 *     EMBonus = 16*EM / (EM + 2000)
 *   - Amplifying reactions (Vaporize/Melt): multiply the triggering hit's
 *     damage by 1.5x or 2x, further boosted by EM.
 *     Multiplier = Base(1.5 or 2) * (1 + EMBonus + ReactionDMGBonus%)
 *     EMBonus = 2.78*EM / (EM + 1400)
 *   - Additive reactions (Aggravate/Spread): add flat bonus damage to the
 *     triggering hit, also EM-scaled.
 *     Bonus = LevelTable[reaction][level] * (1 + EMBonus + ReactionDMGBonus%)
 *     EMBonus = 5*EM / (EM + 1200)
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

/* ---------- reaction level-scaling tables ----------
 * Anchor values pulled at the same level breakpoints this codebase already
 * uses for character stat curves (1/20/40/50/60/70/80/90), sourced from the
 * "Base Damage For Characters" table on the Elemental Reaction/Level Scaling
 * wiki page. Values are linearly interpolated between breakpoints, mirroring
 * getCharacterStatsAtLevel()'s approach elsewhere in this codebase. */

const LEVEL_BREAKPOINTS = [1, 20, 40, 50, 60, 70, 80, 90];

const TRANSFORMATIVE_TABLE = {
    burning: [4.29, 20.15, 51.85, 80.90, 123.22, 191.41, 269.36, 361.71],
    swirl: [10.30, 48.35, 124.43, 194.16, 295.73, 459.38, 646.47, 868.11],
    superconduct: [25.75, 120.88, 311.07, 485.40, 739.33, 1148.46, 1616.17, 2170.28],
    electroCharged: [34.33, 161.17, 414.76, 647.20, 985.77, 1531.28, 2154.89, 2893.71],
    overloaded: [47.21, 221.61, 570.30, 889.90, 1355.43, 2105.51, 2962.97, 3978.85],
    shattered: [51.50, 241.75, 622.15, 970.80, 1478.65, 2296.92, 3232.33, 4340.56],
    bloom: [34.33, 161.17, 414.76, 647.20, 985.77, 1531.28, 2154.89, 2893.71],
    burgeon: [51.50, 241.75, 622.15, 970.80, 1478.65, 2296.92, 3232.33, 4340.56],
    hyperbloom: [51.50, 241.75, 622.15, 970.80, 1478.65, 2296.92, 3232.33, 4340.56]
};

const ADDITIVE_TABLE = {
    aggravate: [19.74, 92.67, 238.49, 372.14, 566.82, 880.49, 1239.06, 1663.88],
    spread: [21.46, 100.73, 259.23, 404.50, 616.11, 957.05, 1346.80, 1808.57]
};

function interpolateLevelTable(table, level) {
    const lvl = Math.min(Math.max(level, 1), 90);
    if (lvl <= LEVEL_BREAKPOINTS[0]) return table[0];
    if (lvl >= LEVEL_BREAKPOINTS[LEVEL_BREAKPOINTS.length - 1]) return table[table.length - 1];
    for (let i = 0; i < LEVEL_BREAKPOINTS.length - 1; i++) {
        const lo = LEVEL_BREAKPOINTS[i];
        const hi = LEVEL_BREAKPOINTS[i + 1];
        if (lvl >= lo && lvl <= hi) {
            const t = (lvl - lo) / (hi - lo);
            return table[i] + (table[i + 1] - table[i]) * t;
        }
    }
    return table[table.length - 1];
}

/* Maps the reaction keys used by the UI/select options to the level tables above. */
const REACTION_KEY_MAP = {
    overloaded: { table: 'overloaded', type: 'transformative' },
    superconduct: { table: 'superconduct', type: 'transformative' },
    electroCharged: { table: 'electroCharged', type: 'transformative' },
    swirl: { table: 'swirl', type: 'transformative' },
    burning: { table: 'burning', type: 'transformative' },
    bloom: { table: 'bloom', type: 'transformative' },
    stellarConduct: { table: 'superconduct', type: 'transformative' }, // Stellar-Conduct uses the Superconduct-family scaling in this dataset
    stellarSwirl: { table: 'swirl', type: 'transformative' },
    aggravate: { table: 'aggravate', type: 'additive' },
    spread: { table: 'spread', type: 'additive' }
};

const REACTION_OPTIONS = [
    { key: 'overloaded', label: 'Overloaded (Transformative)' },
    { key: 'superconduct', label: 'Superconduct (Transformative)' },
    { key: 'electroCharged', label: 'Electro-Charged (Transformative)' },
    { key: 'swirl', label: 'Swirl (Transformative)' },
    { key: 'burning', label: 'Burning (Transformative)' },
    { key: 'bloom', label: 'Bloom (Transformative)' },
    { key: 'stellarConduct', label: 'Stellar-Conduct (Transformative)' },
    { key: 'stellarSwirl', label: 'Stellar Swirl (Transformative)' },
    { key: 'aggravate', label: 'Aggravate (Additive)' },
    { key: 'spread', label: 'Spread (Additive)' }
];
const AMPLIFY_OPTIONS = [
    { key: '', label: 'No amplifying reaction' },
    { key: 'vaporize-forward', label: 'Vaporize (Hydro on Pyro, x2)' },
    { key: 'vaporize-reverse', label: 'Vaporize (Pyro on Hydro, x1.5)' },
    { key: 'melt-forward', label: 'Melt (Pyro on Cryo, x2)' },
    { key: 'melt-reverse', label: 'Melt (Cryo on Pyro, x1.5)' }
];
const AMPLIFY_BASE_MULT = {
    'vaporize-forward': 2, 'vaporize-reverse': 1.5,
    'melt-forward': 2, 'melt-reverse': 1.5
};

let state = null;
let dragCtx = null;

function getCharacterById(id) {
    return CHARACTERS.find((c) => c.id === id);
}

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
    if (saved) {
        // Fill in any fields older saved state might be missing.
        if (!saved.duration) saved.duration = 20;
        if (!saved.zoom) saved.zoom = 40;
        return saved;
    }
    return {
        duration: 20,
        zoom: 40, // px per second
        team: [null, null, null, null], // character entry ids
        events: {}, // entryId -> [{id, category, key, label, mv, hits, time, amplify, reaction, isReaction, isAdditive, requiresConst, element}]
        enemy: { level: 90, defShredPct: 0, defIgnorePct: 0, res: { Pyro: 10, Hydro: 10, Electro: 10, Cryo: 10, Anemo: 10, Geo: 10, Dendro: 10, Physical: 10 } }
    };
}
function persist() { localStorage.setItem(CALC_STORAGE_KEY, JSON.stringify(state)); }

/* ---------- stat aggregation ---------- */

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
 * refinement modifiers, and all 5 artifacts' main/substats.
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

/* ---------- event catalogue: build + sort per character ----------
 * Flattens each character's normalAttack / elementalSkill / elementalBurst
 * `multipliers` object (same walk used previously in js/rotationCalculator.js)
 * into individual selectable events, then appends constellation-based
 * "other" events. Categories are always presented in this fixed order:
 * Normal/Charged/Plunge -> Skill -> Burst -> Passives/Constellations/Other. */

function collectMultiplierEntries(multipliers, sourceTalent) {
    const out = [];
    function walk(obj, path, hits) {
        Object.entries(obj || {}).forEach(([key, value]) => {
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
    ).join(' \u2192 ');
}

function subCategoryForNormalKey(key) {
    const lower = key.toLowerCase();
    if (lower.includes('charged')) return 'Charged Attack';
    if (lower.includes('plunge')) return 'Plunging Attack';
    return 'Normal Attack';
}

/**
 * Builds the full sorted event catalogue for a character: an array of
 * groups in display order, each with a category id, a label, and its items.
 */
function getSortedCharacterEvents(characterId) {
    const character = CHARACTERS.find((c) => c.id === characterId);
    if (!character) return [];

    const groups = [];

    const normalMults = collectMultiplierEntries(character.talents.normalAttack && character.talents.normalAttack.multipliers, 'normalAttack');
    if (normalMults.length) {
        groups.push({
            category: 'normal',
            label: 'Normal / Charged / Plunging Attack',
            items: normalMults.map((m) => ({
                key: m.key, label: `${subCategoryForNormalKey(m.key)}: ${humanizeMultiplierKey(m.key)}`,
                mv: m.values, hits: m.hits, sourceTalent: 'normalAttack'
            }))
        });
    } else {
        // No per-level multiplier data available for this character's basic attacks;
        // still expose it as an activation-only event so it can be placed on the timeline.
        groups.push({
            category: 'normal',
            label: 'Normal / Charged / Plunging Attack',
            items: [{ key: 'basicAttack', label: `${character.talents.normalAttack.name} (Activation)`, mv: null, hits: 1, sourceTalent: 'normalAttack' }]
        });
    }

    const skillMults = collectMultiplierEntries(character.talents.elementalSkill.multipliers, 'elementalSkill');
    groups.push({
        category: 'skill',
        label: `Elemental Skill \u2014 ${character.talents.elementalSkill.name}`,
        items: skillMults.length
            ? skillMults.map((m) => ({ key: m.key, label: humanizeMultiplierKey(m.key), mv: m.values, hits: m.hits, sourceTalent: 'elementalSkill' }))
            : [{ key: 'skillActivation', label: `${character.talents.elementalSkill.name} (Activation)`, mv: null, hits: 1, sourceTalent: 'elementalSkill' }]
    });

    const burstMults = collectMultiplierEntries(character.talents.elementalBurst.multipliers, 'elementalBurst');
    groups.push({
        category: 'burst',
        label: `Elemental Burst \u2014 ${character.talents.elementalBurst.name}`,
        items: burstMults.length
            ? burstMults.map((m) => ({ key: m.key, label: humanizeMultiplierKey(m.key), mv: m.values, hits: m.hits, sourceTalent: 'elementalBurst' }))
            : [{ key: 'burstActivation', label: `${character.talents.elementalBurst.name} (Activation)`, mv: null, hits: 1, sourceTalent: 'elementalBurst' }]
    });

    const otherItems = (character.constellations || [])
        .filter((c) => c.trigger || (c.effect && (c.effect.stat || c.effect.value)))
        .map((c) => ({
            key: `const${c.id}`, label: `C${c.id}: ${c.name}`, mv: null, hits: 1,
            sourceTalent: null, requiresConst: c.id
        }));
    if (otherItems.length) {
        groups.push({ category: 'other', label: 'Passives / Constellations / Other', items: otherItems });
    }

    return groups;
}

const CHARACTER_TALENT_EVENT_CACHE = {};
function getCharacterTalentEvents(characterId) {
    if (!CHARACTER_TALENT_EVENT_CACHE[characterId]) {
        CHARACTER_TALENT_EVENT_CACHE[characterId] = getSortedCharacterEvents(characterId);
    }
    return CHARACTER_TALENT_EVENT_CACHE[characterId];
}

function findEventDef(characterId, category, key) {
    const groups = getCharacterTalentEvents(characterId);
    const group = groups.find((g) => g.category === category);
    if (!group) return null;
    return group.items.find((it) => it.key === key) || null;
}

function availableEventsForEntry(entry) {
    const groups = getCharacterTalentEvents(entry.characterId);
    return groups.map((g) => ({
        ...g,
        items: g.items.filter((it) => !it.requiresConst || entry.constellation >= it.requiresConst)
    })).filter((g) => g.items.length > 0);
}

/* ---------- damage formulas ---------- */

function critExpectedMultiplier(critRatePct, critDmgPct) {
    const cr = Math.min(Math.max(critRatePct, 0), 100) / 100;
    return 1 + cr * (critDmgPct / 100);
}

function defenseMultiplier(casterLevel, enemyLevel, defShredPct, defIgnorePct) {
    const enemyDef = (enemyLevel + 100) * (1 - defShredPct / 100) * (1 - defIgnorePct / 100);
    return (casterLevel + 100) / ((casterLevel + 100) + Math.max(enemyDef, 0));
}

function resistanceMultiplier(resPct) {
    const res = resPct / 100;
    if (res < 0) return 1 - res / 2;
    if (res < 0.75) return 1 - res;
    return 1 / (1 + 4 * res);
}

function transformativeEMBonus(em) { return 16 * em / (em + 2000); }
function amplifyEMBonus(em) { return 2.78 * em / (em + 1400); }
function additiveEMBonus(em) { return 5 * em / (em + 1200); }

function computeReactionDamage(reactionKey, level, em, reactionBonusPct, resPct) {
    const map = REACTION_KEY_MAP[reactionKey];
    if (!map) return 0;
    const base = interpolateLevelTable(
        map.type === 'transformative' ? TRANSFORMATIVE_TABLE[map.table] : ADDITIVE_TABLE[map.table],
        level
    );
    const emBonus = map.type === 'transformative' ? transformativeEMBonus(em) : additiveEMBonus(em);
    const dmg = base * (1 + emBonus + (reactionBonusPct || 0) / 100);
    // Transformative reactions ignore DEF but are reduced by RES; additive
    // reaction bonus damage is folded into a normal hit, which is itself
    // subject to RES via the standard incoming-damage formula.
    return dmg * resistanceMultiplier(resPct);
}

/**
 * Computes damage for one timeline event, given the owning character entry,
 * the event definition, the character's aggregated stats, and the shared
 * enemy state. Motion Value (`mv`) is returned alongside `dmg` so the UI can
 * show both, and both update live with buffs/enemy/EM/level changes.
 */
function computeEventDamage(entry, ev, calcStats, character) {
    const enemy = state.enemy;

    if (ev.isReaction) {
        const el = ev.reaction === 'swirl' || ev.reaction === 'stellarSwirl'
            ? (ev.swirlElement || 'Anemo')
            : (TRANSFORMATIVE_REACTION_ELEMENT[ev.reaction] || 'Anemo');
        const resPct = enemy.res[el] ?? 10;
        const dmg = computeReactionDamage(ev.reaction, entry.level, calcStats.em, ev.reactionBonusPct || 0, resPct);
        return { mv: null, hits: 1, dmg, perHit: dmg };
    }

    const def = findEventDef(entry.characterId, ev.category, ev.key);
    if (!def || !def.mv) return { mv: null, hits: 1, dmg: 0, perHit: 0 };

    const talentKey = def.sourceTalent;
    const talentLevel = (talentKey && entry.talentLevels && entry.talentLevels[talentKey]) || 1;
    const mv = def.mv[Math.min(Math.max(talentLevel - 1, 0), def.mv.length - 1)];
    const hits = def.hits || 1;

    const critMult = critExpectedMultiplier(calcStats.critRate, calcStats.critDmg);
    const defMult = defenseMultiplier(entry.level, enemy.level, enemy.defShredPct, enemy.defIgnorePct);

    const dmgBonusMult = 1 + (calcStats.elementalDmgBonusPct || 0) / 100;
    let perHitBase = calcStats.atk * mv * dmgBonusMult;

    // Amplifying reaction (Vaporize/Melt): multiplies this hit's base damage.
    if (ev.amplify && AMPLIFY_BASE_MULT[ev.amplify]) {
        const amp = AMPLIFY_BASE_MULT[ev.amplify] * (1 + amplifyEMBonus(calcStats.em) + (ev.reactionBonusPct || 0) / 100);
        perHitBase *= amp;
    }

    const el = character.element || 'Physical';
    const resPct = enemy.res[el] ?? 10;
    const perHit = perHitBase * critMult * defMult * resistanceMultiplier(resPct);

    return { mv, hits, dmg: perHit * hits, perHit };
}

const TRANSFORMATIVE_REACTION_ELEMENT = {
    overloaded: 'Pyro', superconduct: 'Cryo', electroCharged: 'Electro',
    burning: 'Pyro', bloom: 'Dendro', stellarConduct: 'Cryo'
};

/* ---------- rendering ---------- */

function characterEntryOptions(excludeUsed) {
    const used = state.team.filter(Boolean);
    return loadMyCharacterEntries().filter((e) => !used.includes(e.id) || !excludeUsed).map((e) => {
        const c = getCharacterById(e.characterId);
        return { id: e.id, label: c ? `${c.name} (Lv.${e.level}, C${e.constellation})` : 'Unknown' };
    });
}

function characterIconHtml(character, sizeClass) {
    const initial = character ? character.name.slice(0, 1) : '?';
    const elClass = character ? (ELEMENT_CLASS[character.element] || 'bg-secondary') : 'bg-secondary';
    return `<div class="calc-char-icon ${sizeClass || ''} ${elClass}">${initial}</div>`;
}

function renderTeamSlots() {
    const container = document.getElementById('calc-team-slots');
    const entries = loadMyCharacterEntries();
    if (entries.length === 0) {
        container.innerHTML = '<p class="text-sm text-muted-foreground">No saved characters yet \u2014 build some on the <a href="characters.html" class="text-primary hover:underline">Characters</a> tab first.</p>';
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
    html += '<optgroup label="Reactions (no ATK/MV \u2014 scales with EM & Lv.)">';
    REACTION_OPTIONS.forEach((r) => { html += `<option value="reaction::${r.key}">${r.label}</option>`; });
    html += '</optgroup>';
    return html;
}

/**
 * Lays out events into overlapping-safe rows: an event only shares a row
 * with events that don't overlap it in time, so simultaneous / overlapping
 * events on the same character stack visually instead of colliding.
 */
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
            const mvLabel = mv === null ? (ev.isReaction ? 'EM-scaled' : '\u2014') : `MV ${(mv * 100).toFixed(1)}%${hits > 1 ? ` \u00d7${hits}` : ''}`;
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
          ${characterIconHtml(character, '')}
          <div class="min-w-0">
            <p class="text-sm font-semibold truncate">${character.name}</p>
            <p class="text-[11px] text-muted-foreground">${character.element} \u00b7 Lv.${entry.level} \u00b7 C${entry.constellation} \u00b7 ATK ${Math.round(calcStats.atk)} \u00b7 EM ${Math.round(calcStats.em)}</p>
          </div>
          <div class="calc-lane-controls">
            <select class="field-select h-8 rounded-md border border-input bg-transparent px-2 text-xs calc-add-event-select" data-entry="${entry.id}">
              ${eventOptionsHtml(entry)}
            </select>
            <input type="number" min="0" max="${duration}" step="0.1" value="0" class="field-input h-8 w-16 rounded-md border border-input bg-transparent px-2 text-xs calc-add-event-time" data-entry="${entry.id}">
            <button class="calc-btn-small calc-add-event-btn" data-entry="${entry.id}">Add</button>
            <button class="calc-btn-small calc-save-preset-btn" data-entry="${entry.id}">Save Preset</button>
            <select class="field-select h-8 rounded-md border border-input bg-transparent px-2 text-xs calc-load-preset-select" data-entry="${entry.id}">
              <option value="">Load preset\u2026</option>
              ${presets.map((p) => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="calc-lane-track" style="width:${widthPx}px; height:${laneHeight}px;" data-entry="${entry.id}">
          ${blocksHtml}
        </div>
      </div>`;
    }).join('');

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
    // Events are allowed to overlap/coincide in time; only clamp to the
    // visible timeline duration.
    const clampedTime = Math.min(Math.max(time, 0), state.duration);

    if (!state.events[entryId]) state.events[entryId] = [];
    const id = `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    if (category === 'reaction') {
        const opt = REACTION_OPTIONS.find((r) => r.key === key);
        state.events[entryId].push({ id, isReaction: true, reaction: key, label: opt.label, time: clampedTime, amplify: '', reactionBonusPct: 0 });
    } else {
        const def = findEventDef(entry.characterId, category, key);
        if (!def) return;
        state.events[entryId].push({ id, category, key, label: def.label, time: clampedTime, amplify: '', reactionBonusPct: 0 });
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

/* ---------- drag-to-reposition on the zoomable timeline (allows overlap) ---------- */

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
        if (ev2) ev2.time = Math.round(newTime * 10) / 10; // overlap is fine, no collision check
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

/* ---------- per-character presets (independent of any team preset) ---------- */

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

/* ---------- DPS / DPR totals + charts ---------- */

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

    // Pie (SVG donut), color-coded per character's element.
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

    // Bar chart, same element color coding.
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

    // Legend / table: icon + name + %, DPS, DPR.
    legendEl.innerHTML = totals.map((t) => `
    <div class="calc-legend-row">
      ${characterIconHtml(t.character, 'calc-char-icon-sm')}
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