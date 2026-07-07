/**
 * Character reference data.
 *
 * CHARACTERS mirrors the shape of json/character/*.json — extend this array
 * whenever a new character's JSON is added to the database. `id` matches the
 * source JSON filename (without extension), same convention as WEAPONS in
 * js/weaponData.js.
 *
 * elementalSkill / elementalBurst carry a `multipliers` object pulled
 * straight from json/character/*.json. Cooldown and energy cost are
 * intentionally omitted (not needed by the rotation calculator).
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
            elementalSkill: {
                name: 'Formule Phenomenale: Differential Analysis',
                multipliers: {
                    prismShotDMG: [0.324, 0.3483, 0.3726, 0.405, 0.4293, 0.4536, 0.486, 0.5184, 0.5508, 0.5832, 0.6156, 0.648, 0.6885, 0.729, 0.7695],
                    prismShotStellarConduct: [0.216, 0.2322, 0.2484, 0.27, 0.2862, 0.3024, 0.324, 0.3456, 0.3672, 0.3888, 0.4104, 0.432, 0.459, 0.486, 0.513],
                    prismShotStellarSwirl: [0.324, 0.3483, 0.3726, 0.405, 0.4293, 0.4536, 0.486, 0.5184, 0.5508, 0.5832, 0.6156, 0.648, 0.6885, 0.729, 0.7695]
                }
            },
            elementalBurst: {
                name: 'Formule Phenomenale: Q.E.D.',
                multipliers: {
                    bombardmentDMG: { perHit: [0.8822, 0.9483, 1.0145, 1.1027, 1.1689, 1.2350, 1.3232, 1.4115, 1.4997, 1.5879, 1.6761, 1.7643, 1.8746, 1.9849, 2.0951], hits: 3 },
                    convectiveInhibitionRay: [3.308, 3.5561, 3.8042, 4.135, 4.3831, 4.6312, 4.962, 5.2928, 5.6236, 5.9544, 6.2852, 6.616, 7.0295, 7.443, 7.8565],
                    convectiveInhibitionRayStellarConduct: [2.2053, 2.3707, 2.5361, 2.7567, 2.9221, 3.0875, 3.308, 3.5285, 3.7491, 3.9696, 4.1901, 4.4107, 4.6863, 4.962, 5.2377],
                    convectiveInhibitionRayStellarSwirl: [3.308, 3.5561, 3.8042, 4.135, 4.3831, 4.6312, 4.962, 5.2928, 5.6236, 5.9544, 6.2852, 6.616, 7.0295, 7.443, 7.8565]
                }
            }
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
            elementalSkill: {
                name: 'Yakan Evocation: Sesshou Sakura',
                multipliers: {
                    sakuraLv1: [0.6067, 0.6522, 0.6977, 0.7584, 0.8039, 0.8494, 0.9101, 0.9708, 1.0314, 1.0921, 1.1528, 1.2134, 1.2893, 1.3651, 1.4410],
                    sakuraLv2: [0.7584, 0.8153, 0.8722, 0.9480, 1.0049, 1.0618, 1.1376, 1.2134, 1.2893, 1.3651, 1.4410, 1.5168, 1.6116, 1.7064, 1.8012],
                    sakuraLv3: [0.9480, 1.0191, 1.0902, 1.1850, 1.2561, 1.3272, 1.4220, 1.5168, 1.6116, 1.7064, 1.8012, 1.8960, 2.0145, 2.1330, 2.2515],
                    sakuraLv4: [1.1850, 1.2739, 1.3628, 1.4813, 1.5701, 1.6590, 1.7775, 1.8960, 2.0145, 2.1330, 2.2515, 2.3700, 2.5181, 2.6662, 2.8144]
                }
            },
            elementalBurst: {
                name: 'Great Secret Art: Tenko Kenshin',
                multipliers: {
                    skillDMG: [2.60, 2.795, 2.99, 3.25, 3.445, 3.64, 3.90, 4.16, 4.42, 4.68, 4.94, 5.20, 5.525, 5.85, 6.175],
                    tenkoThunderboltDMG: [3.3382, 3.5885, 3.8389, 4.1727, 4.4231, 4.6734, 5.0072, 5.3411, 5.6749, 6.0087, 6.3425, 6.6763, 7.0936, 7.5109, 7.9281]
                }
            }
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
            elementalSkill: {
                name: 'Revelation: Uncreated Light',
                multipliers: {
                    skillDMG: [1.384, 1.4878, 1.5916, 1.73, 1.8338, 1.9376, 2.076, 2.2144, 2.3528, 2.4912, 2.6296, 2.768, 2.941, 3.114, 3.287],
                    shieldAbsorption: {
                        atkCoeff: [2.2118, 2.3777, 2.5436, 2.7648, 2.9307, 3.0966, 3.3178, 3.5389, 3.7601, 3.9813, 4.2025, 4.4237, 4.7002, 4.9766, 5.2531],
                        flat: [1387, 1525, 1676, 1837, 2011, 2196, 2392, 2600, 2820, 3051, 3294, 3548, 3814, 4091, 4380]
                    },
                    graceOfKenosisATKBonusRatio: [0.0825, 0.09, 0.0975, 0.105, 0.1125, 0.12, 0.1275, 0.135, 0.1425, 0.15, 0.159, 0.168, 0.177, 0.186, 0.195],
                    graceOfKenosisMaxATKBonus: [330, 360, 390, 420, 450, 480, 510, 540, 570, 600, 636, 672, 708, 744, 780]
                }
            },
            elementalBurst: {
                name: 'Revelation: Ladder of Divine Ascent',
                multipliers: {
                    skillDMG: [3.168, 3.4056, 3.6432, 3.96, 4.1976, 4.4352, 4.752, 5.0688, 5.3856, 5.7024, 6.0192, 6.336, 6.732, 7.128, 7.524],
                    arcaneProjectionDMG: { basis: 'CorrespondingCharacterATK', values: [0.99, 1.08, 1.17, 1.26, 1.35, 1.44, 1.53, 1.62, 1.71, 1.80, 1.908, 2.016, 2.124, 2.232, 2.34] },
                    arcaneProjectionAttackCount: 4
                }
            }
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
            elementalSkill: {
                name: 'Thunderbolt Ambush',
                multipliers: {
                    pressDMG: [2.8672, 3.0822, 3.2973, 3.5840, 3.7990, 4.0141, 4.3008, 4.5875, 4.8742, 5.1610, 5.4477, 5.7344, 6.0928, 6.4512, 6.8096],
                    holdDMG: [3.5840, 3.8528, 4.1216, 4.4800, 4.7488, 5.0176, 5.3760, 5.7344, 6.0928, 6.4512, 6.8096, 7.1680, 7.6160, 8.0640, 8.5120],
                    huntersPrecisionATKBonus: [0.1375, 0.1500, 0.1625, 0.1750, 0.1875, 0.2000, 0.2125, 0.2250, 0.2375, 0.2500, 0.2650, 0.2800, 0.2950, 0.3100, 0.3250]
                }
            },
            elementalBurst: {
                name: "Hunter's Advance",
                multipliers: {
                    fulguriteFieldDMG: [0.7496, 0.8058, 0.8620, 0.9370, 0.9932, 1.0494, 1.1244, 1.1994, 1.2743, 1.3493, 1.4242, 1.4992, 1.5929, 1.6866, 1.7803],
                    tugarinDMG: [0.5022, 0.5399, 0.5776, 0.6278, 0.6655, 0.7031, 0.7533, 0.8036, 0.8538, 0.9040, 0.9542, 1.0045, 1.0672, 1.1300, 1.1928]
                }
            }
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
            elementalSkill: {
                name: 'Slow Dance: Phantom Night Trance',
                multipliers: {
                    skillDMG: [1.0808, 1.1619, 1.2429, 1.3510, 1.4321, 1.5131, 1.6212, 1.7293, 1.8374, 1.9454, 2.0535, 2.1616, 2.2967, 2.4318, 2.5669],
                    daybreakFinaleDoT: [0.9584, 1.0303, 1.1022, 1.1980, 1.2699, 1.3418, 1.4376, 1.5334, 1.6293, 1.7251, 1.8210, 1.9168, 2.0366, 2.1564, 2.2762],
                    daybreakFinaleStellarConduct: [2.0318, 2.1841, 2.3365, 2.5397, 2.6921, 2.8445, 3.0476, 3.2508, 3.4540, 3.6572, 3.8603, 4.0635, 4.3175, 4.5715, 4.8254],
                    daybreakFinaleStellarSwirl: [3.0477, 3.2763, 3.5048, 3.8096, 4.0382, 4.2668, 4.5715, 4.8763, 5.1811, 5.4858, 5.7906, 6.0954, 6.4763, 6.8573, 7.2382],
                    plumeDance: [0.4304, 0.4627, 0.4950, 0.5380, 0.5703, 0.6026, 0.6456, 0.6886, 0.7317, 0.7747, 0.8178, 0.8608, 0.9146, 0.9684, 1.0222],
                    wingDance: [0.5146, 0.5532, 0.5918, 0.6433, 0.6819, 0.7205, 0.7720, 0.8234, 0.8749, 0.9264, 0.9778, 1.0293, 1.0936, 1.1579, 1.2223]
                }
            },
            elementalBurst: {
                name: 'Fast Dance: A Dream of Sable Feathers',
                multipliers: {
                    slashDMG: { perHit: [1.1018, 1.1844, 1.2670, 1.3772, 1.4598, 1.5425, 1.6526, 1.7628, 1.8730, 1.9832, 2.0933, 2.2035, 2.3412, 2.4790, 2.6167], hits: 3 },
                    finalSlashDMG: [1.7027, 1.8304, 1.9581, 2.1284, 2.2561, 2.3838, 2.5541, 2.7244, 2.8946, 3.0649, 3.2352, 3.4054, 3.6183, 3.8311, 4.0440],
                    snowSwanDreamStellarBonus: [0.14, 0.18, 0.22, 0.26, 0.30, 0.34, 0.38, 0.42, 0.46, 0.50, 0.54, 0.58, 0.62, 0.66, 0.70]
                }
            }
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
            elementalSkill: {
                name: 'Low-Temperature Cooking',
                multipliers: {
                    skillDMG: [0.504, 0.5418, 0.5796, 0.63, 0.6678, 0.7056, 0.756, 0.8064, 0.8568, 0.9072, 0.9576, 1.008, 1.071, 1.134, 1.197],
                    frostyParfaitDMG: [1.20, 1.29, 1.38, 1.50, 1.59, 1.68, 1.80, 1.92, 2.04, 2.16, 2.28, 2.40, 2.55, 2.70, 2.85],
                    surgingBladeDMG: [0.336, 0.3612, 0.3864, 0.42, 0.4452, 0.4704, 0.504, 0.5376, 0.5712, 0.6048, 0.6384, 0.672, 0.714, 0.756, 0.798]
                }
            },
            elementalBurst: {
                name: 'Scoring Cuts',
                multipliers: {
                    skillDMG: [5.928, 6.3726, 6.8172, 7.41, 7.8546, 8.2992, 8.892, 9.4848, 10.0776, 10.6704, 11.2632, 11.856, 12.597, 13.338, 14.079],
                    healing: {
                        atkCoeff: [1.7203, 1.8493, 1.9784, 2.1504, 2.2794, 2.4084, 2.5805, 2.7525, 2.9245, 3.0966, 3.2686, 3.4406, 3.6557, 3.8707, 4.0858],
                        flat: [1079, 1186, 1303, 1429, 1564, 1708, 1861, 2022, 2193, 2373, 2562, 2759, 2966, 3182, 3407]
                    }
                }
            }
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