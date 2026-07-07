/**
 * Character reference data.
 *
 * CHARACTERS mirrors the shape of json/character/*.json — extend this array
 * whenever a new character's JSON is added to the database. `id` matches the
 * source JSON filename (without extension), same convention as WEAPONS in
 * js/weaponData.js.
 *
 * This file only contains data + pure helper functions (no DOM access), same
 * separation as weaponData.js / artifactData.js. DOM/localStorage logic for
 * the "My Characters" page lives in js/myCharacters.js.
 */

// Talent level cap for a talent with no constellation bonus applied.
const TALENT_LEVEL_BASE_MAX = 12;

// Maps a constellation "level bonus" stat name to the talent key it boosts.
const TALENT_STAT_BONUS_MAP = {
    NORMAL_ATTACK_LEVEL_BONUS: 'normalAttack',
    SKILL_LEVEL_BONUS: 'elementalSkill',
    BURST_LEVEL_BONUS: 'elementalBurst'
};

/**
 * Scans a character's constellations for talent-level-boosting effects and
 * returns a map like { elementalSkill: { constellation: 3, value: 3, maxLevel: 15 } }.
 */
function getCharacterTalentBonusMap(character) {
    const map = {};
    (character.constellations || []).forEach((c) => {
        const eff = c.effect;
        if (eff && TALENT_STAT_BONUS_MAP[eff.stat]) {
            const talentKey = TALENT_STAT_BONUS_MAP[eff.stat];
            map[talentKey] = { constellation: c.id, value: eff.value, maxLevel: eff.maxLevel };
        }
    });
    return map;
}

/**
 * Returns the max selectable level for a given talent, given the character's
 * current constellation. Clamps to TALENT_LEVEL_BASE_MAX when no bonus
 * applies or the required constellation hasn't been reached yet.
 */
function getTalentMinLevel(character, talentKey, constellation) {
    const bonus = getCharacterTalentBonusMap(character)[talentKey];
    if (!bonus) return 1;
    return constellation >= bonus.constellation ? bonus.value + 1 : 1;
}

function getTalentMaxLevel(character, talentKey, constellation) {
    const bonus = getCharacterTalentBonusMap(character)[talentKey];
    if (!bonus) return TALENT_LEVEL_BASE_MAX;
    return constellation >= bonus.constellation ? bonus.maxLevel : (bonus.maxLevel - bonus.value);
}

/**
 * Finds the character's "ascension bonus" stat key inside statCurve.levels
 * (the one field besides ascension/hp/atk/def). Key names vary per character
 * (CRIT_Rate, CRIT_DMG, ER, ATK_PERCENT, etc.) so this is detected generically
 * rather than trusting the ascensionBonusStat label, which is sourced
 * separately and not always consistent with the actual data key.
 */
function getCharacterSpecialStatKey(character) {
    const lvl1 = character.statCurve.levels['1'];
    const knownKeys = ['ascension', 'hp', 'atk', 'def'];
    return Object.keys(lvl1).find((k) => !knownKeys.includes(k));
}

/**
 * Interpolates base HP/ATK/DEF/special-stat between the nearest defined
 * breakpoints in statCurve.levels for an arbitrary level 1-100.
 */
function getCharacterStatsAtLevel(character, level) {
    const levels = character.statCurve.levels;
    const keys = Object.keys(levels).map(Number).filter((l) => l <= 100).sort((a, b) => a - b);
    const lvl = Math.min(Math.max(parseInt(level, 10) || 1, 1), 100);

    if (lvl <= keys[0]) return levels[String(keys[0])];
    if (lvl >= keys[keys.length - 1]) return levels[String(keys[keys.length - 1])];

    let lower = keys[0];
    let upper = keys[keys.length - 1];
    for (let i = 0; i < keys.length - 1; i++) {
        if (lvl >= keys[i] && lvl <= keys[i + 1]) {
            lower = keys[i];
            upper = keys[i + 1];
            break;
        }
    }

    const lowerStats = levels[String(lower)];
    const upperStats = levels[String(upper)];
    const t = upper === lower ? 0 : (lvl - lower) / (upper - lower);

    const result = {};
    Object.keys(lowerStats).forEach((key) => {
        const a = lowerStats[key];
        const b = upperStats[key];
        result[key] = (typeof a === 'number' && typeof b === 'number') ? a + (b - a) * t : a;
    });
    return result;
}

const CHARACTERS = [
    {
        id: '10000133',
        name: 'Sandrone',
        rarity: 'QUALITY_ORANGE',
        weaponType: 'WEAPON_CLAYMORE',
        element: 'Cryo',
        ascensionBonusStat: 'CRIT DMG%',
        icon: 'UI_Gacha_AvatarIcon_MarionetteNew',
        statCurve: {
            levels: {
                "1": { ascension: 0, hp: 1030, atk: 27, def: 59, CRIT_Rate: 0 },
                "20": { ascension: 0, hp: 2671, atk: 69, def: 152, CRIT_Rate: 0 },
                "40": { ascension: 1, hp: 5317, atk: 138, def: 302, CRIT_Rate: 0 },
                "50": { ascension: 2, hp: 6839, atk: 177, def: 389, CRIT_Rate: 4.8 },
                "60": { ascension: 3, hp: 8579, atk: 222, def: 488, CRIT_Rate: 9.6 },
                "70": { ascension: 4, hp: 10119, atk: 262, def: 576, CRIT_Rate: 9.6 },
                "80": { ascension: 5, hp: 11669, atk: 302, def: 664, CRIT_Rate: 14.4 },
                "90": { ascension: 6, hp: 13226, atk: 342, def: 752, CRIT_Rate: 19.2 }
            }
        },
        talents: {
            normalAttack: { name: 'Formule Phenomenale: Self-Evident Proposition' },
            elementalSkill: { name: 'Formule Phenomenale: Differential Analysis' },
            elementalBurst: { name: 'Formule Phenomenale: Q.E.D.' }
        },
        constellations: [
            { id: 1, name: 'Morrow After the Golden Dusk', effect: { decodingPowerGainRate: -0.50, partyStellarConductAndSwirlDmgBonus: 0.30 } },
            { id: 2, name: 'An Heiress Gazed Into the Looking-Glass', effect: { condensedBeamCritDmgBonus: 0.40 } },
            { id: 3, name: 'Refuse the Wake of Dusk...', effect: { stat: 'NORMAL_ATTACK_LEVEL_BONUS', value: 3, maxLevel: 15 } },
            { id: 4, name: "In Knowledge Lies the World's True Ground", effect: { extraCannon: { stellarConduct: 1.25, stellarSwirl: 1.875, basis: 'ATK' } } },
            { id: 5, name: 'Of All Beside, She Takes No Part', effect: { stat: 'BURST_LEVEL_BONUS', value: 3, maxLevel: 15 } },
            { id: 6, name: 'Narcissus Wakes...', effect: { selfStellarConductElevation: 0.20 } }
        ]
    },
    {
        id: '10000058',
        name: 'Yae Miko',
        rarity: 'QUALITY_ORANGE',
        weaponType: 'WEAPON_CATALYST',
        element: 'Electro',
        ascensionBonusStat: 'CRIT Rate%',
        icon: 'UI_Gacha_AvatarIcon_Yae',
        statCurve: {
            levels: {
                "1": { ascension: 0, hp: 807, atk: 26, def: 44, CRIT_Rate: 0 },
                "20": { ascension: 0, hp: 2095, atk: 69, def: 115, CRIT_Rate: 0 },
                "40": { ascension: 1, hp: 4170, atk: 137, def: 229, CRIT_Rate: 0 },
                "50": { ascension: 2, hp: 5364, atk: 176, def: 294, CRIT_Rate: 4.8 },
                "60": { ascension: 3, hp: 6729, atk: 220, def: 369, CRIT_Rate: 9.6 },
                "70": { ascension: 4, hp: 7936, atk: 260, def: 435, CRIT_Rate: 9.6 },
                "80": { ascension: 5, hp: 9151, atk: 300, def: 502, CRIT_Rate: 14.4 },
                "90": { ascension: 6, hp: 10372, atk: 340, def: 569, CRIT_Rate: 19.2 }
            }
        },
        talents: {
            normalAttack: { name: 'Spiritfox Sin-Eater' },
            elementalSkill: { name: 'Yakan Evocation: Sesshou Sakura' },
            elementalBurst: { name: 'Great Secret Art: Tenko Kenshin' }
        },
        constellations: [
            { id: 1, name: 'Yakan Offering', effect: { onReactionTrigger: { value: 0.50 } } },
            { id: 2, name: "Fox's Mooncall", effect: { sakuraStartLevel: 2, sakuraMaxLevel: 4 } },
            { id: 3, name: 'The Seven Glamours', effect: { stat: 'SKILL_LEVEL_BONUS', value: 3, maxLevel: 15 } },
            { id: 4, name: 'Sakura Channeling', effect: { stat: 'ELECTRO_DMG_PERCENT', value: 0.20, duration: 5 } },
            { id: 5, name: 'Mischievous Teasing', effect: { stat: 'BURST_LEVEL_BONUS', value: 3, maxLevel: 15 } },
            { id: 6, name: 'Forbidden Art: Daisesshou', effect: { sakuraDefIgnore: 0.60 } }
        ]
    },
    {
        id: '10000131',
        name: 'Nicole',
        rarity: 'QUALITY_ORANGE',
        weaponType: 'WEAPON_CATALYST',
        element: 'Pyro',
        ascensionBonusStat: 'ATK%',
        icon: 'UI_Gacha_AvatarIcon_Nicole',
        statCurve: {
            levels: {
                "1": { ascension: 0, hp: 810, atk: 27, def: 44, ATK_PERCENT: 0 },
                "20": { ascension: 0, hp: 2102, atk: 69, def: 114, ATK_PERCENT: 0 },
                "40": { ascension: 1, hp: 4185, atk: 138, def: 226, ATK_PERCENT: 0 },
                "50": { ascension: 2, hp: 5383, atk: 177, def: 291, ATK_PERCENT: 7.2 },
                "60": { ascension: 3, hp: 6752, atk: 222, def: 365, ATK_PERCENT: 14.4 },
                "70": { ascension: 4, hp: 7964, atk: 262, def: 430, ATK_PERCENT: 14.4 },
                "80": { ascension: 5, hp: 9184, atk: 302, def: 496, ATK_PERCENT: 21.6 },
                "90": { ascension: 6, hp: 10409, atk: 342, def: 563, ATK_PERCENT: 28.8 }
            }
        },
        talents: {
            normalAttack: { name: 'Allegoria' },
            elementalSkill: { name: 'Revelation: Uncreated Light' },
            elementalBurst: { name: 'Revelation: Ladder of Divine Ascent' }
        },
        constellations: [
            { id: 1, name: 'Do Not Be Afraid, Child Who Is Loved', effect: { value: 6.00, basis: 'ATK' } },
            { id: 2, name: 'I Will Guide You...', effect: { graceOfKenosisExtraATKBonus: 300 } },
            { id: 3, name: 'A Lamp by Your Side...', effect: { stat: 'SKILL_LEVEL_BONUS', value: 3, maxLevel: 15 } },
            { id: 4, name: 'Whether Left or Right...', effect: { stat: 'ALL_ATTACK_TYPES_DMG', value: 0.70, basis: 'ATK' } },
            { id: 5, name: 'You Will Hear My Voice...', effect: { stat: 'BURST_LEVEL_BONUS', value: 3, maxLevel: 15 } },
            { id: 6, name: 'This Is the Path...', effect: { defIgnore: 0.40 } }
        ]
    },
    {
        id: '10000148',
        name: 'Alyosha',
        rarity: 'QUALITY_PURPLE',
        weaponType: 'WEAPON_POLE',
        element: 'Electro',
        ascensionBonusStat: 'Elemental Mastery',
        icon: 'UI_Gacha_AvatarIcon_Alyosha',
        statCurve: {
            levels: {
                "1": { ascension: 0, hp: 1003, atk: 22, def: 59, ER: 0 },
                "20": { ascension: 0, hp: 2577, atk: 57, def: 151, ER: 0 },
                "40": { ascension: 1, hp: 4982, atk: 111, def: 293, ER: 0 },
                "50": { ascension: 2, hp: 6343, atk: 141, def: 373, ER: 6.7 },
                "60": { ascension: 3, hp: 7881, atk: 175, def: 463, ER: 13.3 },
                "70": { ascension: 4, hp: 9241, atk: 205, def: 543, ER: 13.3 },
                "80": { ascension: 5, hp: 10602, atk: 235, def: 623, ER: 20 },
                "90": { ascension: 6, hp: 11962, atk: 265, def: 703, ER: 26.7 }
            }
        },
        talents: {
            normalAttack: { name: 'Skirmishing Spear' },
            elementalSkill: { name: 'Thunderbolt Ambush' },
            elementalBurst: { name: "Hunter's Advance" }
        },
        constellations: [
            { id: 1, name: 'Frostvale Thunderclap', effect: { stat: 'ENERGY_RESTORE', value: 15 } },
            { id: 2, name: 'Howl From Afar', effect: { stat: 'BURST_DURATION_BONUS', value: 6 } },
            { id: 3, name: 'Kindred Call', effect: { stat: 'SKILL_LEVEL_BONUS', value: 3, maxLevel: 15 } },
            { id: 4, name: 'Spoils of the Hunt', effect: { stat: 'HEALING', value: 0.60, basis: 'ATK' } },
            { id: 5, name: 'When the Birdsong Falls Silent', effect: { stat: 'BURST_LEVEL_BONUS', value: 3, maxLevel: 15 } },
            { id: 6, name: 'Standard Reclaimed', effect: { stacking: true, maxStacks: 2 } }
        ]
    },
    {
        id: '10000150',
        name: 'Odette',
        rarity: 'QUALITY_ORANGE',
        weaponType: 'WEAPON_SWORD_ONE_HAND',
        element: 'Cryo',
        ascensionBonusStat: 'CRIT DMG%',
        icon: 'UI_Gacha_AvatarIcon_Odette',
        upcoming: true,
        statCurve: {
            levels: {
                "1": { ascension: 0, hp: 1011, atk: 26, def: 61, CRIT_DMG: 0 },
                "20": { ascension: 0, hp: 2621, atk: 68, def: 159, CRIT_DMG: 0 },
                "40": { ascension: 1, hp: 5219, atk: 135, def: 316, CRIT_DMG: 0 },
                "50": { ascension: 2, hp: 6712, atk: 173, def: 407, CRIT_DMG: 9.6 },
                "60": { ascension: 3, hp: 8421, atk: 217, def: 511, CRIT_DMG: 19.2 },
                "70": { ascension: 4, hp: 9932, atk: 256, def: 602, CRIT_DMG: 19.2 },
                "80": { ascension: 5, hp: 11453, atk: 295, def: 694, CRIT_DMG: 28.8 },
                "90": { ascension: 6, hp: 12981, atk: 335, def: 787, CRIT_DMG: 38.4 }
            }
        },
        talents: {
            normalAttack: { name: 'Snow Swan Variation' },
            elementalSkill: { name: 'Slow Dance: Phantom Night Trance' },
            elementalBurst: { name: 'Fast Dance: A Dream of Sable Feathers' }
        },
        constellations: [
            { id: 1, name: 'On This Danceless Morn...', effect: { stat: 'AOE_DMG', basis: 'ATK', stellarConduct: 2.00, stellarSwirl: 3.00 } },
            { id: 2, name: 'I Must See the Snow Swan\'s Dream...', effect: { perMarvelousSplendorStack: { stat: 'ATK_PERCENT', value: 0.07 } } },
            { id: 3, name: 'I Must Pursue the Howling Wind...', effect: { stat: 'SKILL_LEVEL_BONUS', value: 3, maxLevel: 15 } },
            { id: 4, name: 'Upwards I Go...', effect: { snowSwanDreamShareRatio: 0.50 } },
            { id: 5, name: 'Behold, for I Have Bid Farewell...', effect: { stat: 'BURST_LEVEL_BONUS', value: 3, maxLevel: 15 } },
            { id: 6, name: 'Reach Out Your Hand...', effect: { stellarGlimmerDmgElevation: 0.25 } }
        ]
    },
    {
        id: '10000112',
        name: 'Escoffier',
        rarity: 'QUALITY_ORANGE',
        weaponType: 'WEAPON_POLE',
        element: 'Cryo',
        ascensionBonusStat: 'ATK%',
        icon: 'UI_Gacha_AvatarIcon_Escoffier',
        statCurve: {
            levels: {
                "1": { ascension: 0, hp: 1039, atk: 27, def: 57, CRIT_Rate: 0 },
                "20": { ascension: 0, hp: 2695, atk: 70, def: 148, CRIT_Rate: 0 },
                "40": { ascension: 1, hp: 5366, atk: 139, def: 294, CRIT_Rate: 0 },
                "50": { ascension: 2, hp: 6902, atk: 179, def: 378, CRIT_Rate: 4.8 },
                "60": { ascension: 3, hp: 8659, atk: 225, def: 475, CRIT_Rate: 9.6 },
                "70": { ascension: 4, hp: 10213, atk: 265, def: 560, CRIT_Rate: 9.6 },
                "80": { ascension: 5, hp: 11777, atk: 306, def: 646, CRIT_Rate: 14.4 },
                "90": { ascension: 6, hp: 13348, atk: 347, def: 732, CRIT_Rate: 19.2 }
            }
        },
        talents: {
            normalAttack: { name: 'Kitchen Skills' },
            elementalSkill: { name: 'Low-Temperature Cooking' },
            elementalBurst: { name: 'Scoring Cuts' }
        },
        constellations: [
            { id: 1, name: 'Pre-Dinner Dance...', effect: { stat: 'CRYO_CRIT_DMG', value: 0.60, duration: 15 } },
            { id: 2, name: 'Fresh, Fragrant Stew Is an Art', effect: { stacks: 5, stackName: 'Cold Dish' } },
            { id: 3, name: 'The Bakery Magic of Caramel Browning', effect: { stat: 'SKILL_LEVEL_BONUS', value: 3, maxLevel: 15 } },
            { id: 4, name: 'Secret Rosemary Recipe', effect: { rehabDietDurationBonus: 6 } },
            { id: 5, name: 'Symphony of a Thousand Sauces', effect: { stat: 'BURST_LEVEL_BONUS', value: 3, maxLevel: 15 } },
            { id: 6, name: 'Tea Parties Bursting With Color', effect: { stat: 'AOE_DMG', value: 5.00, basis: 'ATK', dmgType: 'Cryo' } }
        ]
    }
];