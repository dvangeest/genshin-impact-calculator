/**
 * Weapon reference data.
 *
 * WEAPONS mirrors the shape of json/weapon/*.json — extend this array
 * whenever a new weapon's JSON is added to the database. `id` matches the
 * source JSON filename (without extension) so it stays a stable, unique key
 * even when two weapons share a display name (e.g. the two "Forgeable
 * Weapon" starter items).
 */

const WEAPON_TYPE_LABELS = {
    WEAPON_SWORD_ONE_HAND: 'Sword',
    WEAPON_CLAYMORE: 'Claymore',
    WEAPON_POLE: 'Polearm',
    WEAPON_CATALYST: 'Catalyst',
    WEAPON_BOW: 'Bow'
};

const WEAPON_QUALITY_CLASS = {
    QUALITY_ORANGE: 'quality-orange',
    QUALITY_PURPLE: 'quality-purple',
    QUALITY_BLUE: 'quality-blue'
};

const WEAPON_STAT_LABELS = {
    ATK_FLAT: 'ATK',
    'ATK%': 'ATK%',
    ATK_PERCENT: 'ATK%',
    ELEMENTAL_MASTERY: 'Elemental Mastery',
    ENERGY_RECHARGE: 'Energy Recharge%',
    CRIT_DMG: 'CRIT DMG%',
    CRIT_RATE: 'CRIT Rate%'
};

const WEAPONS = [
    {
        id: '11436',
        name: 'Emberwell',
        weaponType: 'WEAPON_SWORD_ONE_HAND',
        qualityType: 'QUALITY_PURPLE',
        weaponIcon: 'UI_EquipIcon_Sword_GlintstoneSword',
        weaponDesc: "A longsword crafted with a gemstone blade; it is said to have been forged for the path of justice, and when unsheathed, it glimmers with an aura of blue Pyro flames.",
        mainStat: { type: 'ATK_FLAT', curve: 'atk' },
        subStat: { type: 'ELEMENTAL_MASTERY', curve: 'Elemental Mastery' },
        passiveName: '',
        refinements: [
            {
                refinement: 1, proc: {
                    trigger: 'OnReactionTrigger', canTriggerOffField: true, modifiers: [
                        { stat: 'ATK_PERCENT', value: 0.16, target: 'Self', duration: 12 },
                        { stat: 'REACTION_DMG_PERCENT', reaction: ['StellarConduct', 'StellarSwirl'], value: 0.16, duration: 12, conditional: 'OnStellarReactionOnly' }
                    ]
                }
            },
            {
                refinement: 2, proc: {
                    trigger: 'OnReactionTrigger', canTriggerOffField: true, modifiers: [
                        { stat: 'ATK_PERCENT', value: 0.20, target: 'Self', duration: 12 },
                        { stat: 'REACTION_DMG_PERCENT', reaction: ['StellarConduct', 'StellarSwirl'], value: 0.20, duration: 12, conditional: 'OnStellarReactionOnly' }
                    ]
                }
            },
            {
                refinement: 3, proc: {
                    trigger: 'OnReactionTrigger', canTriggerOffField: true, modifiers: [
                        { stat: 'ATK_PERCENT', value: 0.24, target: 'Self', duration: 12 },
                        { stat: 'REACTION_DMG_PERCENT', reaction: ['StellarConduct', 'StellarSwirl'], value: 0.24, duration: 12, conditional: 'OnStellarReactionOnly' }
                    ]
                }
            },
            {
                refinement: 4, proc: {
                    trigger: 'OnReactionTrigger', canTriggerOffField: true, modifiers: [
                        { stat: 'ATK_PERCENT', value: 0.28, target: 'Self', duration: 12 },
                        { stat: 'REACTION_DMG_PERCENT', reaction: ['StellarConduct', 'StellarSwirl'], value: 0.28, duration: 12, conditional: 'OnStellarReactionOnly' }
                    ]
                }
            },
            {
                refinement: 5, proc: {
                    trigger: 'OnReactionTrigger', canTriggerOffField: true, modifiers: [
                        { stat: 'ATK_PERCENT', value: 0.32, target: 'Self', duration: 12 },
                        { stat: 'REACTION_DMG_PERCENT', reaction: ['StellarConduct', 'StellarSwirl'], value: 0.32, duration: 12, conditional: 'OnStellarReactionOnly' }
                    ]
                }
            }
        ],
        stats: {
            "1": { "Elemental Mastery": 36, atk: 42 }, "2": { "Elemental Mastery": 36, atk: 46 }, "3": { "Elemental Mastery": 36, atk: 49 }, "4": { "Elemental Mastery": 36, atk: 53 },
            "5": { "Elemental Mastery": 42, atk: 56 }, "6": { "Elemental Mastery": 42, atk: 60 }, "7": { "Elemental Mastery": 42, atk: 63 }, "8": { "Elemental Mastery": 42, atk: 67 }, "9": { "Elemental Mastery": 42, atk: 70 },
            "10": { "Elemental Mastery": 49, atk: 74 }, "11": { "Elemental Mastery": 49, atk: 77 }, "12": { "Elemental Mastery": 49, atk: 81 }, "13": { "Elemental Mastery": 49, atk: 84 }, "14": { "Elemental Mastery": 49, atk: 88 },
            "15": { "Elemental Mastery": 56, atk: 91 }, "16": { "Elemental Mastery": 56, atk: 95 }, "17": { "Elemental Mastery": 56, atk: 98 }, "18": { "Elemental Mastery": 56, atk: 102 }, "19": { "Elemental Mastery": 56, atk: 105 },
            "20": { "Elemental Mastery": 64, atk: 109 }, "21": { "Elemental Mastery": 64, atk: 138 }, "22": { "Elemental Mastery": 64, atk: 142 }, "23": { "Elemental Mastery": 64, atk: 145 }, "24": { "Elemental Mastery": 64, atk: 149 },
            "25": { "Elemental Mastery": 71, atk: 152 }, "26": { "Elemental Mastery": 71, atk: 156 }, "27": { "Elemental Mastery": 71, atk: 159 }, "28": { "Elemental Mastery": 71, atk: 163 }, "29": { "Elemental Mastery": 71, atk: 166 },
            "30": { "Elemental Mastery": 78, atk: 170 }, "31": { "Elemental Mastery": 78, atk: 173 }, "32": { "Elemental Mastery": 78, atk: 177 }, "33": { "Elemental Mastery": 78, atk: 180 }, "34": { "Elemental Mastery": 78, atk: 184 },
            "35": { "Elemental Mastery": 85, atk: 187 }, "36": { "Elemental Mastery": 85, atk: 191 }, "37": { "Elemental Mastery": 85, atk: 194 }, "38": { "Elemental Mastery": 85, atk: 198 }, "39": { "Elemental Mastery": 85, atk: 201 },
            "40": { "Elemental Mastery": 93, atk: 205 }, "41": { "Elemental Mastery": 93, atk: 234 }, "42": { "Elemental Mastery": 93, atk: 238 }, "43": { "Elemental Mastery": 93, atk: 241 }, "44": { "Elemental Mastery": 93, atk: 245 },
            "45": { "Elemental Mastery": 100, atk: 248 }, "46": { "Elemental Mastery": 100, atk: 252 }, "47": { "Elemental Mastery": 100, atk: 255 }, "48": { "Elemental Mastery": 100, atk: 259 }, "49": { "Elemental Mastery": 100, atk: 262 },
            "50": { "Elemental Mastery": 107, atk: 266 }, "51": { "Elemental Mastery": 107, atk: 295 }, "52": { "Elemental Mastery": 107, atk: 299 }, "53": { "Elemental Mastery": 107, atk: 302 }, "54": { "Elemental Mastery": 107, atk: 306 },
            "55": { "Elemental Mastery": 115, atk: 309 }, "56": { "Elemental Mastery": 115, atk: 313 }, "57": { "Elemental Mastery": 115, atk: 316 }, "58": { "Elemental Mastery": 115, atk: 320 }, "59": { "Elemental Mastery": 115, atk: 323 },
            "60": { "Elemental Mastery": 122, atk: 327 }, "61": { "Elemental Mastery": 122, atk: 356 }, "62": { "Elemental Mastery": 122, atk: 360 }, "63": { "Elemental Mastery": 122, atk: 363 }, "64": { "Elemental Mastery": 122, atk: 367 },
            "65": { "Elemental Mastery": 129, atk: 370 }, "66": { "Elemental Mastery": 129, atk: 374 }, "67": { "Elemental Mastery": 129, atk: 377 }, "68": { "Elemental Mastery": 129, atk: 381 }, "69": { "Elemental Mastery": 129, atk: 384 },
            "70": { "Elemental Mastery": 136, atk: 388 }, "71": { "Elemental Mastery": 136, atk: 417 }, "72": { "Elemental Mastery": 136, atk: 421 }, "73": { "Elemental Mastery": 136, atk: 424 }, "74": { "Elemental Mastery": 136, atk: 428 },
            "75": { "Elemental Mastery": 144, atk: 431 }, "76": { "Elemental Mastery": 144, atk: 435 }, "77": { "Elemental Mastery": 144, atk: 438 }, "78": { "Elemental Mastery": 144, atk: 442 }, "79": { "Elemental Mastery": 144, atk: 445 },
            "80": { "Elemental Mastery": 151, atk: 449 }, "81": { "Elemental Mastery": 151, atk: 478 }, "82": { "Elemental Mastery": 151, atk: 482 }, "83": { "Elemental Mastery": 151, atk: 485 }, "84": { "Elemental Mastery": 151, atk: 489 },
            "85": { "Elemental Mastery": 158, atk: 492 }, "86": { "Elemental Mastery": 158, atk: 496 }, "87": { "Elemental Mastery": 158, atk: 499 }, "88": { "Elemental Mastery": 158, atk: 503 }, "89": { "Elemental Mastery": 158, atk: 506 },
            "90": { "Elemental Mastery": 165, atk: 510 }
        }
    },
    {
        id: '14436',
        name: 'Echoes of the Heart',
        weaponType: 'WEAPON_CATALYST',
        qualityType: 'QUALITY_PURPLE',
        weaponIcon: 'UI_EquipIcon_Catalyst_GlintstoneCatalyst',
        weaponDesc: "The Catalyst used to solidify sounds seems to still seal away a vow of loyalty and a forgotten heart.",
        mainStat: { type: 'ATK_FLAT', curve: 'atk' },
        subStat: { type: 'ATK_PERCENT', curve: 'ATK%' },
        passiveName: '',
        refinements: [
            {
                refinement: 1, proc: {
                    trigger: 'OnReactionTrigger', canTriggerOffField: true, modifiers: [
                        { stat: 'ELEMENTAL_MASTERY', value: 60, target: 'Self', duration: 12 },
                        { stat: 'REACTION_DMG_PERCENT', reaction: ['StellarConduct', 'StellarSwirl'], value: 0.16, duration: 12, conditional: 'OnStellarReactionOnly' }
                    ]
                }
            },
            {
                refinement: 2, proc: {
                    trigger: 'OnReactionTrigger', canTriggerOffField: true, modifiers: [
                        { stat: 'ELEMENTAL_MASTERY', value: 75, target: 'Self', duration: 12 },
                        { stat: 'REACTION_DMG_PERCENT', reaction: ['StellarConduct', 'StellarSwirl'], value: 0.20, duration: 12, conditional: 'OnStellarReactionOnly' }
                    ]
                }
            },
            {
                refinement: 3, proc: {
                    trigger: 'OnReactionTrigger', canTriggerOffField: true, modifiers: [
                        { stat: 'ELEMENTAL_MASTERY', value: 90, target: 'Self', duration: 12 },
                        { stat: 'REACTION_DMG_PERCENT', reaction: ['StellarConduct', 'StellarSwirl'], value: 0.24, duration: 12, conditional: 'OnStellarReactionOnly' }
                    ]
                }
            },
            {
                refinement: 4, proc: {
                    trigger: 'OnReactionTrigger', canTriggerOffField: true, modifiers: [
                        { stat: 'ELEMENTAL_MASTERY', value: 105, target: 'Self', duration: 12 },
                        { stat: 'REACTION_DMG_PERCENT', reaction: ['StellarConduct', 'StellarSwirl'], value: 0.28, duration: 12, conditional: 'OnStellarReactionOnly' }
                    ]
                }
            },
            {
                refinement: 5, proc: {
                    trigger: 'OnReactionTrigger', canTriggerOffField: true, modifiers: [
                        { stat: 'ELEMENTAL_MASTERY', value: 120, target: 'Self', duration: 12 },
                        { stat: 'REACTION_DMG_PERCENT', reaction: ['StellarConduct', 'StellarSwirl'], value: 0.32, duration: 12, conditional: 'OnStellarReactionOnly' }
                    ]
                }
            }
        ],
        stats: {
            "1": { "ATK%": 6.0, atk: 44 }, "2": { "ATK%": 6.0, atk: 48 }, "3": { "ATK%": 6.0, atk: 51 }, "4": { "ATK%": 6.0, atk: 55 },
            "5": { "ATK%": 7.0, atk: 59 }, "6": { "ATK%": 7.0, atk: 63 }, "7": { "ATK%": 7.0, atk: 67 }, "8": { "ATK%": 7.0, atk: 71 }, "9": { "ATK%": 7.0, atk: 75 },
            "10": { "ATK%": 8.2, atk: 79 }, "11": { "ATK%": 8.2, atk: 83 }, "12": { "ATK%": 8.2, atk: 87 }, "13": { "ATK%": 8.2, atk: 91 }, "14": { "ATK%": 8.2, atk: 95 },
            "15": { "ATK%": 9.4, atk: 99 }, "16": { "ATK%": 9.4, atk: 103 }, "17": { "ATK%": 9.4, atk: 107 }, "18": { "ATK%": 9.4, atk: 111 }, "19": { "ATK%": 9.4, atk: 115 },
            "20": { "ATK%": 10.6, atk: 119 }, "21": { "ATK%": 10.6, atk: 148 }, "22": { "ATK%": 10.6, atk: 153 }, "23": { "ATK%": 10.6, atk: 157 }, "24": { "ATK%": 10.6, atk: 161 },
            "25": { "ATK%": 11.8, atk: 165 }, "26": { "ATK%": 11.8, atk: 169 }, "27": { "ATK%": 11.8, atk: 173 }, "28": { "ATK%": 11.8, atk: 177 }, "29": { "ATK%": 11.8, atk: 181 },
            "30": { "ATK%": 13.0, atk: 185 }, "31": { "ATK%": 13.0, atk: 189 }, "32": { "ATK%": 13.0, atk: 193 }, "33": { "ATK%": 13.0, atk: 197 }, "34": { "ATK%": 13.0, atk: 201 },
            "35": { "ATK%": 14.2, atk: 205 }, "36": { "ATK%": 14.2, atk: 210 }, "37": { "ATK%": 14.2, atk: 214 }, "38": { "ATK%": 14.2, atk: 218 }, "39": { "ATK%": 14.2, atk: 222 },
            "40": { "ATK%": 15.4, atk: 226 }, "41": { "ATK%": 15.4, atk: 256 }, "42": { "ATK%": 15.4, atk: 260 }, "43": { "ATK%": 15.4, atk: 264 }, "44": { "ATK%": 15.4, atk: 268 },
            "45": { "ATK%": 16.7, atk: 273 }, "46": { "ATK%": 16.7, atk: 277 }, "47": { "ATK%": 16.7, atk: 281 }, "48": { "ATK%": 16.7, atk: 285 }, "49": { "ATK%": 16.7, atk: 289 },
            "50": { "ATK%": 17.9, atk: 293 }, "51": { "ATK%": 17.9, atk: 323 }, "52": { "ATK%": 17.9, atk: 328 }, "53": { "ATK%": 17.9, atk: 332 }, "54": { "ATK%": 17.9, atk: 336 },
            "55": { "ATK%": 19.1, atk: 340 }, "56": { "ATK%": 19.1, atk: 344 }, "57": { "ATK%": 19.1, atk: 348 }, "58": { "ATK%": 19.1, atk: 353 }, "59": { "ATK%": 19.1, atk: 357 },
            "60": { "ATK%": 20.3, atk: 361 }, "61": { "ATK%": 20.3, atk: 391 }, "62": { "ATK%": 20.3, atk: 395 }, "63": { "ATK%": 20.3, atk: 399 }, "64": { "ATK%": 20.3, atk: 404 },
            "65": { "ATK%": 21.5, atk: 408 }, "66": { "ATK%": 21.5, atk: 412 }, "67": { "ATK%": 21.5, atk: 416 }, "68": { "ATK%": 21.5, atk: 420 }, "69": { "ATK%": 21.5, atk: 424 },
            "70": { "ATK%": 22.7, atk: 429 }, "71": { "ATK%": 22.7, atk: 459 }, "72": { "ATK%": 22.7, atk: 463 }, "73": { "ATK%": 22.7, atk: 467 }, "74": { "ATK%": 22.7, atk: 471 },
            "75": { "ATK%": 23.9, atk: 476 }, "76": { "ATK%": 23.9, atk: 480 }, "77": { "ATK%": 23.9, atk: 484 }, "78": { "ATK%": 23.9, atk: 488 }, "79": { "ATK%": 23.9, atk: 493 },
            "80": { "ATK%": 25.1, atk: 497 }, "81": { "ATK%": 25.1, atk: 527 }, "82": { "ATK%": 25.1, atk: 531 }, "83": { "ATK%": 25.1, atk: 535 }, "84": { "ATK%": 25.1, atk: 539 },
            "85": { "ATK%": 26.4, atk: 544 }, "86": { "ATK%": 26.4, atk: 548 }, "87": { "ATK%": 26.4, atk: 552 }, "88": { "ATK%": 26.4, atk: 556 }, "89": { "ATK%": 26.4, atk: 561 },
            "90": { "ATK%": 27.6, atk: 565 }
        }
    },
    {
        id: '13502',
        name: 'Skyward Spine',
        weaponType: 'WEAPON_POLE',
        qualityType: 'QUALITY_ORANGE',
        weaponIcon: 'UI_EquipIcon_Pole_Dvalin',
        weaponDesc: "A polearm that symbolizes Dvalin's firm resolve. The upright shaft of this weapon points towards the heavens, clad in the might of sky and wind.",
        mainStat: { type: 'ATK_FLAT', curve: 'atk' },
        subStat: { type: 'ENERGY_RECHARGE', curve: 'Energy Recharge%' },
        passiveName: 'Black Wing',
        refinements: [
            {
                refinement: 1, modifiers: [
                    { stat: 'CRIT_RATE', value: 0.08, trigger: 'OnEquip' },
                    { stat: 'NORMAL_ATK_SPEED_PERCENT', value: 0.12, trigger: 'OnEquip' }
                ], proc: { trigger: 'OnNormalOrChargedAttackHit', chance: 0.50, effect: { stat: 'ATK_MULTIPLIER_DMG', value: 0.40, areaOfEffect: 'SmallAoE' }, cooldown: 2 }
            },
            {
                refinement: 2, modifiers: [
                    { stat: 'CRIT_RATE', value: 0.10, trigger: 'OnEquip' },
                    { stat: 'NORMAL_ATK_SPEED_PERCENT', value: 0.12, trigger: 'OnEquip' }
                ], proc: { trigger: 'OnNormalOrChargedAttackHit', chance: 0.50, effect: { stat: 'ATK_MULTIPLIER_DMG', value: 0.55, areaOfEffect: 'SmallAoE' }, cooldown: 2 }
            },
            {
                refinement: 3, modifiers: [
                    { stat: 'CRIT_RATE', value: 0.12, trigger: 'OnEquip' },
                    { stat: 'NORMAL_ATK_SPEED_PERCENT', value: 0.12, trigger: 'OnEquip' }
                ], proc: { trigger: 'OnNormalOrChargedAttackHit', chance: 0.50, effect: { stat: 'ATK_MULTIPLIER_DMG', value: 0.70, areaOfEffect: 'SmallAoE' }, cooldown: 2 }
            },
            {
                refinement: 4, modifiers: [
                    { stat: 'CRIT_RATE', value: 0.14, trigger: 'OnEquip' },
                    { stat: 'NORMAL_ATK_SPEED_PERCENT', value: 0.12, trigger: 'OnEquip' }
                ], proc: { trigger: 'OnNormalOrChargedAttackHit', chance: 0.50, effect: { stat: 'ATK_MULTIPLIER_DMG', value: 0.85, areaOfEffect: 'SmallAoE' }, cooldown: 2 }
            },
            {
                refinement: 5, modifiers: [
                    { stat: 'CRIT_RATE', value: 0.16, trigger: 'OnEquip' },
                    { stat: 'NORMAL_ATK_SPEED_PERCENT', value: 0.12, trigger: 'OnEquip' }
                ], proc: { trigger: 'OnNormalOrChargedAttackHit', chance: 0.50, effect: { stat: 'ATK_MULTIPLIER_DMG', value: 1.00, areaOfEffect: 'SmallAoE' }, cooldown: 2 }
            }
        ],
        stats: {
            "1": { "Energy Recharge%": 8.0, atk: 48 }, "2": { "Energy Recharge%": 8.0, atk: 52 }, "3": { "Energy Recharge%": 8.0, atk: 56 }, "4": { "Energy Recharge%": 8.0, atk: 61 },
            "5": { "Energy Recharge%": 9.3, atk: 65 }, "6": { "Energy Recharge%": 9.3, atk: 69 }, "7": { "Energy Recharge%": 9.3, atk: 74 }, "8": { "Energy Recharge%": 9.3, atk: 78 }, "9": { "Energy Recharge%": 9.3, atk: 83 },
            "10": { "Energy Recharge%": 10.9, atk: 87 }, "11": { "Energy Recharge%": 10.9, atk: 92 }, "12": { "Energy Recharge%": 10.9, atk: 96 }, "13": { "Energy Recharge%": 10.9, atk: 101 }, "14": { "Energy Recharge%": 10.9, atk: 106 },
            "15": { "Energy Recharge%": 12.5, atk: 110 }, "16": { "Energy Recharge%": 12.5, atk: 115 }, "17": { "Energy Recharge%": 12.5, atk: 119 }, "18": { "Energy Recharge%": 12.5, atk: 124 }, "19": { "Energy Recharge%": 12.5, atk: 129 },
            "20": { "Energy Recharge%": 14.1, atk: 133 }, "21": { "Energy Recharge%": 14.1, atk: 169 }, "22": { "Energy Recharge%": 14.1, atk: 174 }, "23": { "Energy Recharge%": 14.1, atk: 179 }, "24": { "Energy Recharge%": 14.1, atk: 183 },
            "25": { "Energy Recharge%": 15.8, atk: 188 }, "26": { "Energy Recharge%": 15.8, atk: 193 }, "27": { "Energy Recharge%": 15.8, atk: 197 }, "28": { "Energy Recharge%": 15.8, atk: 202 }, "29": { "Energy Recharge%": 15.8, atk: 207 },
            "30": { "Energy Recharge%": 17.4, atk: 212 }, "31": { "Energy Recharge%": 17.4, atk: 217 }, "32": { "Energy Recharge%": 17.4, atk: 221 }, "33": { "Energy Recharge%": 17.4, atk: 226 }, "34": { "Energy Recharge%": 17.4, atk: 231 },
            "35": { "Energy Recharge%": 19.0, atk: 236 }, "36": { "Energy Recharge%": 19.0, atk: 241 }, "37": { "Energy Recharge%": 19.0, atk: 246 }, "38": { "Energy Recharge%": 19.0, atk: 251 }, "39": { "Energy Recharge%": 19.0, atk: 256 },
            "40": { "Energy Recharge%": 20.6, atk: 261 }, "41": { "Energy Recharge%": 20.6, atk: 297 }, "42": { "Energy Recharge%": 20.6, atk: 302 }, "43": { "Energy Recharge%": 20.6, atk: 306 }, "44": { "Energy Recharge%": 20.6, atk: 311 },
            "45": { "Energy Recharge%": 22.2, atk: 316 }, "46": { "Energy Recharge%": 22.2, atk: 321 }, "47": { "Energy Recharge%": 22.2, atk: 326 }, "48": { "Energy Recharge%": 22.2, atk: 331 }, "49": { "Energy Recharge%": 22.2, atk: 336 },
            "50": { "Energy Recharge%": 23.8, atk: 341 }, "51": { "Energy Recharge%": 23.8, atk: 378 }, "52": { "Energy Recharge%": 23.8, atk: 383 }, "53": { "Energy Recharge%": 23.8, atk: 388 }, "54": { "Energy Recharge%": 23.8, atk: 393 },
            "55": { "Energy Recharge%": 25.4, atk: 398 }, "56": { "Energy Recharge%": 25.4, atk: 403 }, "57": { "Energy Recharge%": 25.4, atk: 408 }, "58": { "Energy Recharge%": 25.4, atk: 413 }, "59": { "Energy Recharge%": 25.4, atk: 418 },
            "60": { "Energy Recharge%": 27.1, atk: 423 }, "61": { "Energy Recharge%": 27.1, atk: 460 }, "62": { "Energy Recharge%": 27.1, atk: 465 }, "63": { "Energy Recharge%": 27.1, atk: 470 }, "64": { "Energy Recharge%": 27.1, atk: 475 },
            "65": { "Energy Recharge%": 28.7, atk: 480 }, "66": { "Energy Recharge%": 28.7, atk: 485 }, "67": { "Energy Recharge%": 28.7, atk: 491 }, "68": { "Energy Recharge%": 28.7, atk: 496 }, "69": { "Energy Recharge%": 28.7, atk: 501 },
            "70": { "Energy Recharge%": 30.3, atk: 506 }, "71": { "Energy Recharge%": 30.3, atk: 543 }, "72": { "Energy Recharge%": 30.3, atk: 548 }, "73": { "Energy Recharge%": 30.3, atk: 553 }, "74": { "Energy Recharge%": 30.3, atk: 558 },
            "75": { "Energy Recharge%": 31.9, atk: 563 }, "76": { "Energy Recharge%": 31.9, atk: 569 }, "77": { "Energy Recharge%": 31.9, atk: 574 }, "78": { "Energy Recharge%": 31.9, atk: 579 }, "79": { "Energy Recharge%": 31.9, atk: 585 },
            "80": { "Energy Recharge%": 33.5, atk: 590 }, "81": { "Energy Recharge%": 33.5, atk: 626 }, "82": { "Energy Recharge%": 33.5, atk: 632 }, "83": { "Energy Recharge%": 33.5, atk: 637 }, "84": { "Energy Recharge%": 33.5, atk: 642 },
            "85": { "Energy Recharge%": 35.1, atk: 648 }, "86": { "Energy Recharge%": 35.1, atk: 653 }, "87": { "Energy Recharge%": 35.1, atk: 658 }, "88": { "Energy Recharge%": 35.1, atk: 664 }, "89": { "Energy Recharge%": 35.1, atk: 669 },
            "90": { "Energy Recharge%": 36.8, atk: 674 }
        }
    },
    {
        id: '12516',
        name: 'A Teaspoon of Transcendence',
        weaponType: 'WEAPON_CLAYMORE',
        qualityType: 'QUALITY_ORANGE',
        weaponIcon: 'UI_EquipIcon_Claymore_CrystallineSword',
        weaponDesc: "An object of fantasy with countless definitions amidst an endless sea of stories.",
        mainStat: { type: 'ATK_FLAT', curve: 'atk' },
        subStat: { type: 'CRIT_DMG', curve: 'CRIT DMG%' },
        passiveName: "White Fairy's Queening",
        refinements: [
            { refinement: 1, modifiers: [{ stat: 'ATK_PERCENT', value: 0.28, trigger: 'OnEquip' }], proc: { trigger: 'OnChargedAttackHit', effect: { stat: 'REACTION_DMG_PERCENT', reaction: ['StellarConduct', 'StellarSwirl'], value: 0.16 }, duration: 5, internalCooldown: 0.2, maxStacks: 3, buffName: 'Transcendence' } },
            { refinement: 2, modifiers: [{ stat: 'ATK_PERCENT', value: 0.35, trigger: 'OnEquip' }], proc: { trigger: 'OnChargedAttackHit', effect: { stat: 'REACTION_DMG_PERCENT', reaction: ['StellarConduct', 'StellarSwirl'], value: 0.20 }, duration: 5, internalCooldown: 0.2, maxStacks: 3, buffName: 'Transcendence' } },
            { refinement: 3, modifiers: [{ stat: 'ATK_PERCENT', value: 0.42, trigger: 'OnEquip' }], proc: { trigger: 'OnChargedAttackHit', effect: { stat: 'REACTION_DMG_PERCENT', reaction: ['StellarConduct', 'StellarSwirl'], value: 0.24 }, duration: 5, internalCooldown: 0.2, maxStacks: 3, buffName: 'Transcendence' } },
            { refinement: 4, modifiers: [{ stat: 'ATK_PERCENT', value: 0.49, trigger: 'OnEquip' }], proc: { trigger: 'OnChargedAttackHit', effect: { stat: 'REACTION_DMG_PERCENT', reaction: ['StellarConduct', 'StellarSwirl'], value: 0.28 }, duration: 5, internalCooldown: 0.2, maxStacks: 3, buffName: 'Transcendence' } },
            { refinement: 5, modifiers: [{ stat: 'ATK_PERCENT', value: 0.56, trigger: 'OnEquip' }], proc: { trigger: 'OnChargedAttackHit', effect: { stat: 'REACTION_DMG_PERCENT', reaction: ['StellarConduct', 'StellarSwirl'], value: 0.32 }, duration: 5, internalCooldown: 0.2, maxStacks: 3, buffName: 'Transcendence' } }
        ],
        stats: {
            "1": { "CRIT DMG%": 9.6, atk: 48 }, "2": { "CRIT DMG%": 9.6, atk: 52 }, "3": { "CRIT DMG%": 9.6, atk: 56 }, "4": { "CRIT DMG%": 9.6, atk: 61 },
            "5": { "CRIT DMG%": 11.2, atk: 65 }, "6": { "CRIT DMG%": 11.2, atk: 69 }, "7": { "CRIT DMG%": 11.2, atk: 74 }, "8": { "CRIT DMG%": 11.2, atk: 78 }, "9": { "CRIT DMG%": 11.2, atk: 83 },
            "10": { "CRIT DMG%": 13.1, atk: 87 }, "11": { "CRIT DMG%": 13.1, atk: 92 }, "12": { "CRIT DMG%": 13.1, atk: 96 }, "13": { "CRIT DMG%": 13.1, atk: 101 }, "14": { "CRIT DMG%": 13.1, atk: 106 },
            "15": { "CRIT DMG%": 15.0, atk: 110 }, "16": { "CRIT DMG%": 15.0, atk: 115 }, "17": { "CRIT DMG%": 15.0, atk: 119 }, "18": { "CRIT DMG%": 15.0, atk: 124 }, "19": { "CRIT DMG%": 15.0, atk: 129 },
            "20": { "CRIT DMG%": 17.0, atk: 133 }, "21": { "CRIT DMG%": 17.0, atk: 169 }, "22": { "CRIT DMG%": 17.0, atk: 174 }, "23": { "CRIT DMG%": 17.0, atk: 179 }, "24": { "CRIT DMG%": 17.0, atk: 183 },
            "25": { "CRIT DMG%": 18.9, atk: 188 }, "26": { "CRIT DMG%": 18.9, atk: 193 }, "27": { "CRIT DMG%": 18.9, atk: 197 }, "28": { "CRIT DMG%": 18.9, atk: 202 }, "29": { "CRIT DMG%": 18.9, atk: 207 },
            "30": { "CRIT DMG%": 20.8, atk: 212 }, "31": { "CRIT DMG%": 20.8, atk: 217 }, "32": { "CRIT DMG%": 20.8, atk: 221 }, "33": { "CRIT DMG%": 20.8, atk: 226 }, "34": { "CRIT DMG%": 20.8, atk: 231 },
            "35": { "CRIT DMG%": 22.8, atk: 236 }, "36": { "CRIT DMG%": 22.8, atk: 241 }, "37": { "CRIT DMG%": 22.8, atk: 246 }, "38": { "CRIT DMG%": 22.8, atk: 251 }, "39": { "CRIT DMG%": 22.8, atk: 256 },
            "40": { "CRIT DMG%": 24.7, atk: 261 }, "41": { "CRIT DMG%": 24.7, atk: 297 }, "42": { "CRIT DMG%": 24.7, atk: 302 }, "43": { "CRIT DMG%": 24.7, atk: 306 }, "44": { "CRIT DMG%": 24.7, atk: 311 },
            "45": { "CRIT DMG%": 26.7, atk: 316 }, "46": { "CRIT DMG%": 26.7, atk: 321 }, "47": { "CRIT DMG%": 26.7, atk: 326 }, "48": { "CRIT DMG%": 26.7, atk: 331 }, "49": { "CRIT DMG%": 26.7, atk: 336 },
            "50": { "CRIT DMG%": 28.6, atk: 341 }, "51": { "CRIT DMG%": 28.6, atk: 378 }, "52": { "CRIT DMG%": 28.6, atk: 383 }, "53": { "CRIT DMG%": 28.6, atk: 388 }, "54": { "CRIT DMG%": 28.6, atk: 393 },
            "55": { "CRIT DMG%": 30.5, atk: 398 }, "56": { "CRIT DMG%": 30.5, atk: 403 }, "57": { "CRIT DMG%": 30.5, atk: 408 }, "58": { "CRIT DMG%": 30.5, atk: 413 }, "59": { "CRIT DMG%": 30.5, atk: 418 },
            "60": { "CRIT DMG%": 32.5, atk: 423 }, "61": { "CRIT DMG%": 32.5, atk: 460 }, "62": { "CRIT DMG%": 32.5, atk: 465 }, "63": { "CRIT DMG%": 32.5, atk: 470 }, "64": { "CRIT DMG%": 32.5, atk: 475 },
            "65": { "CRIT DMG%": 34.4, atk: 480 }, "66": { "CRIT DMG%": 34.4, atk: 485 }, "67": { "CRIT DMG%": 34.4, atk: 491 }, "68": { "CRIT DMG%": 34.4, atk: 496 }, "69": { "CRIT DMG%": 34.4, atk: 501 },
            "70": { "CRIT DMG%": 36.3, atk: 506 }, "71": { "CRIT DMG%": 36.3, atk: 543 }, "72": { "CRIT DMG%": 36.3, atk: 548 }, "73": { "CRIT DMG%": 36.3, atk: 553 }, "74": { "CRIT DMG%": 36.3, atk: 558 },
            "75": { "CRIT DMG%": 38.3, atk: 563 }, "76": { "CRIT DMG%": 38.3, atk: 569 }, "77": { "CRIT DMG%": 38.3, atk: 574 }, "78": { "CRIT DMG%": 38.3, atk: 579 }, "79": { "CRIT DMG%": 38.3, atk: 585 },
            "80": { "CRIT DMG%": 40.2, atk: 590 }, "81": { "CRIT DMG%": 40.2, atk: 626 }, "82": { "CRIT DMG%": 40.2, atk: 632 }, "83": { "CRIT DMG%": 40.2, atk: 637 }, "84": { "CRIT DMG%": 40.2, atk: 642 },
            "85": { "CRIT DMG%": 42.2, atk: 648 }, "86": { "CRIT DMG%": 42.2, atk: 653 }, "87": { "CRIT DMG%": 42.2, atk: 658 }, "88": { "CRIT DMG%": 42.2, atk: 664 }, "89": { "CRIT DMG%": 42.2, atk: 669 },
            "90": { "CRIT DMG%": 44.1, atk: 674 }
        }
    },
    {
        id: '14501',
        name: 'Skyward Atlas',
        weaponType: 'WEAPON_CATALYST',
        qualityType: 'QUALITY_ORANGE',
        weaponIcon: 'UI_EquipIcon_Catalyst_Dvalin',
        weaponDesc: "A cloud atlas symbolizing Dvalin and his former master, the Anemo Archon.",
        mainStat: { type: 'ATK_FLAT', curve: 'atk' },
        subStat: { type: 'ATK_PERCENT', curve: 'ATK%' },
        passiveName: 'Wandering Clouds',
        refinements: [
            { refinement: 1, modifiers: [{ stat: 'ELEMENTAL_DMG_PERCENT', element: 'Any', value: 0.12, trigger: 'OnEquip' }], proc: { trigger: 'OnNormalAttackHit', chance: 0.50, effect: { stat: 'ATK_MULTIPLIER_DMG', value: 1.60 }, duration: 15, cooldown: 30, behavior: 'SeeksNearbyOpponents' } },
            { refinement: 2, modifiers: [{ stat: 'ELEMENTAL_DMG_PERCENT', element: 'Any', value: 0.15, trigger: 'OnEquip' }], proc: { trigger: 'OnNormalAttackHit', chance: 0.50, effect: { stat: 'ATK_MULTIPLIER_DMG', value: 2.00 }, duration: 15, cooldown: 30, behavior: 'SeeksNearbyOpponents' } },
            { refinement: 3, modifiers: [{ stat: 'ELEMENTAL_DMG_PERCENT', element: 'Any', value: 0.18, trigger: 'OnEquip' }], proc: { trigger: 'OnNormalAttackHit', chance: 0.50, effect: { stat: 'ATK_MULTIPLIER_DMG', value: 2.40 }, duration: 15, cooldown: 30, behavior: 'SeeksNearbyOpponents' } },
            { refinement: 4, modifiers: [{ stat: 'ELEMENTAL_DMG_PERCENT', element: 'Any', value: 0.21, trigger: 'OnEquip' }], proc: { trigger: 'OnNormalAttackHit', chance: 0.50, effect: { stat: 'ATK_MULTIPLIER_DMG', value: 2.80 }, duration: 15, cooldown: 30, behavior: 'SeeksNearbyOpponents' } },
            { refinement: 5, modifiers: [{ stat: 'ELEMENTAL_DMG_PERCENT', element: 'Any', value: 0.24, trigger: 'OnEquip' }], proc: { trigger: 'OnNormalAttackHit', chance: 0.50, effect: { stat: 'ATK_MULTIPLIER_DMG', value: 3.20 }, duration: 15, cooldown: 30, behavior: 'SeeksNearbyOpponents' } }
        ],
        stats: {
            "1": { "ATK%": 7.2, atk: 48 }, "2": { "ATK%": 7.2, atk: 52 }, "3": { "ATK%": 7.2, atk: 56 }, "4": { "ATK%": 7.2, atk: 61 },
            "5": { "ATK%": 8.4, atk: 65 }, "6": { "ATK%": 8.4, atk: 69 }, "7": { "ATK%": 8.4, atk: 74 }, "8": { "ATK%": 8.4, atk: 78 }, "9": { "ATK%": 8.4, atk: 83 },
            "10": { "ATK%": 9.8, atk: 87 }, "11": { "ATK%": 9.8, atk: 92 }, "12": { "ATK%": 9.8, atk: 96 }, "13": { "ATK%": 9.8, atk: 101 }, "14": { "ATK%": 9.8, atk: 106 },
            "15": { "ATK%": 11.3, atk: 110 }, "16": { "ATK%": 11.3, atk: 115 }, "17": { "ATK%": 11.3, atk: 119 }, "18": { "ATK%": 11.3, atk: 124 }, "19": { "ATK%": 11.3, atk: 129 },
            "20": { "ATK%": 12.7, atk: 133 }, "21": { "ATK%": 12.7, atk: 169 }, "22": { "ATK%": 12.7, atk: 174 }, "23": { "ATK%": 12.7, atk: 179 }, "24": { "ATK%": 12.7, atk: 183 },
            "25": { "ATK%": 14.2, atk: 188 }, "26": { "ATK%": 14.2, atk: 193 }, "27": { "ATK%": 14.2, atk: 197 }, "28": { "ATK%": 14.2, atk: 202 }, "29": { "ATK%": 14.2, atk: 207 },
            "30": { "ATK%": 15.6, atk: 212 }, "31": { "ATK%": 15.6, atk: 217 }, "32": { "ATK%": 15.6, atk: 221 }, "33": { "ATK%": 15.6, atk: 226 }, "34": { "ATK%": 15.6, atk: 231 },
            "35": { "ATK%": 17.1, atk: 236 }, "36": { "ATK%": 17.1, atk: 241 }, "37": { "ATK%": 17.1, atk: 246 }, "38": { "ATK%": 17.1, atk: 251 }, "39": { "ATK%": 17.1, atk: 256 },
            "40": { "ATK%": 18.5, atk: 261 }, "41": { "ATK%": 18.5, atk: 297 }, "42": { "ATK%": 18.5, atk: 302 }, "43": { "ATK%": 18.5, atk: 306 }, "44": { "ATK%": 18.5, atk: 311 },
            "45": { "ATK%": 20.0, atk: 316 }, "46": { "ATK%": 20.0, atk: 321 }, "47": { "ATK%": 20.0, atk: 326 }, "48": { "ATK%": 20.0, atk: 331 }, "49": { "ATK%": 20.0, atk: 336 },
            "50": { "ATK%": 21.4, atk: 341 }, "51": { "ATK%": 21.4, atk: 378 }, "52": { "ATK%": 21.4, atk: 383 }, "53": { "ATK%": 21.4, atk: 388 }, "54": { "ATK%": 21.4, atk: 393 },
            "55": { "ATK%": 22.9, atk: 398 }, "56": { "ATK%": 22.9, atk: 403 }, "57": { "ATK%": 22.9, atk: 408 }, "58": { "ATK%": 22.9, atk: 413 }, "59": { "ATK%": 22.9, atk: 418 },
            "60": { "ATK%": 24.4, atk: 423 }, "61": { "ATK%": 24.4, atk: 460 }, "62": { "ATK%": 24.4, atk: 465 }, "63": { "ATK%": 24.4, atk: 470 }, "64": { "ATK%": 24.4, atk: 475 },
            "65": { "ATK%": 25.8, atk: 480 }, "66": { "ATK%": 25.8, atk: 485 }, "67": { "ATK%": 25.8, atk: 491 }, "68": { "ATK%": 25.8, atk: 496 }, "69": { "ATK%": 25.8, atk: 501 },
            "70": { "ATK%": 27.3, atk: 506 }, "71": { "ATK%": 27.3, atk: 543 }, "72": { "ATK%": 27.3, atk: 548 }, "73": { "ATK%": 27.3, atk: 553 }, "74": { "ATK%": 27.3, atk: 558 },
            "75": { "ATK%": 28.7, atk: 563 }, "76": { "ATK%": 28.7, atk: 569 }, "77": { "ATK%": 28.7, atk: 574 }, "78": { "ATK%": 28.7, atk: 579 }, "79": { "ATK%": 28.7, atk: 585 },
            "80": { "ATK%": 30.2, atk: 590 }, "81": { "ATK%": 30.2, atk: 626 }, "82": { "ATK%": 30.2, atk: 632 }, "83": { "ATK%": 30.2, atk: 637 }, "84": { "ATK%": 30.2, atk: 642 },
            "85": { "ATK%": 31.6, atk: 648 }, "86": { "ATK%": 31.6, atk: 653 }, "87": { "ATK%": 31.6, atk: 658 }, "88": { "ATK%": 31.6, atk: 664 }, "89": { "ATK%": 31.6, atk: 669 },
            "90": { "ATK%": 33.1, atk: 674 }
        }
    },
    {
        id: '13407',
        name: 'Favonius Lance',
        weaponType: 'WEAPON_POLE',
        qualityType: 'QUALITY_PURPLE',
        weaponIcon: 'UI_EquipIcon_Pole_Zephyrus',
        weaponDesc: "A polearm made in the style of the Knights of Favonius. Its shaft is straight, and its tip flows lightly like the wind.",
        mainStat: { type: 'ATK_FLAT', curve: 'atk' },
        subStat: { type: 'ENERGY_RECHARGE', curve: 'Energy Recharge%' },
        passiveName: 'Windfall',
        refinements: [
            { refinement: 1, proc: { trigger: 'OnCritHit', chance: 0.60, effect: { stat: 'ENERGY_RESTORE', value: 6 }, cooldown: 12 } },
            { refinement: 2, proc: { trigger: 'OnCritHit', chance: 0.70, effect: { stat: 'ENERGY_RESTORE', value: 6 }, cooldown: 10.5 } },
            { refinement: 3, proc: { trigger: 'OnCritHit', chance: 0.80, effect: { stat: 'ENERGY_RESTORE', value: 6 }, cooldown: 9 } },
            { refinement: 4, proc: { trigger: 'OnCritHit', chance: 0.90, effect: { stat: 'ENERGY_RESTORE', value: 6 }, cooldown: 7.5 } },
            { refinement: 5, proc: { trigger: 'OnCritHit', chance: 1.00, effect: { stat: 'ENERGY_RESTORE', value: 6 }, cooldown: 6 } }
        ],
        stats: {
            "1": { "Energy Recharge%": 6.7, atk: 44 }, "2": { "Energy Recharge%": 6.7, atk: 48 }, "3": { "Energy Recharge%": 6.7, atk: 51 }, "4": { "Energy Recharge%": 6.7, atk: 55 },
            "5": { "Energy Recharge%": 7.7, atk: 59 }, "6": { "Energy Recharge%": 7.7, atk: 63 }, "7": { "Energy Recharge%": 7.7, atk: 67 }, "8": { "Energy Recharge%": 7.7, atk: 71 }, "9": { "Energy Recharge%": 7.7, atk: 75 },
            "10": { "Energy Recharge%": 9.1, atk: 79 }, "11": { "Energy Recharge%": 9.1, atk: 83 }, "12": { "Energy Recharge%": 9.1, atk: 87 }, "13": { "Energy Recharge%": 9.1, atk: 91 }, "14": { "Energy Recharge%": 9.1, atk: 95 },
            "15": { "Energy Recharge%": 10.4, atk: 99 }, "16": { "Energy Recharge%": 10.4, atk: 103 }, "17": { "Energy Recharge%": 10.4, atk: 107 }, "18": { "Energy Recharge%": 10.4, atk: 111 }, "19": { "Energy Recharge%": 10.4, atk: 115 },
            "20": { "Energy Recharge%": 11.8, atk: 119 }, "21": { "Energy Recharge%": 11.8, atk: 148 }, "22": { "Energy Recharge%": 11.8, atk: 153 }, "23": { "Energy Recharge%": 11.8, atk: 157 }, "24": { "Energy Recharge%": 11.8, atk: 161 },
            "25": { "Energy Recharge%": 13.1, atk: 165 }, "26": { "Energy Recharge%": 13.1, atk: 169 }, "27": { "Energy Recharge%": 13.1, atk: 173 }, "28": { "Energy Recharge%": 13.1, atk: 177 }, "29": { "Energy Recharge%": 13.1, atk: 181 },
            "30": { "Energy Recharge%": 14.5, atk: 185 }, "31": { "Energy Recharge%": 14.5, atk: 189 }, "32": { "Energy Recharge%": 14.5, atk: 193 }, "33": { "Energy Recharge%": 14.5, atk: 197 }, "34": { "Energy Recharge%": 14.5, atk: 201 },
            "35": { "Energy Recharge%": 15.8, atk: 205 }, "36": { "Energy Recharge%": 15.8, atk: 210 }, "37": { "Energy Recharge%": 15.8, atk: 214 }, "38": { "Energy Recharge%": 15.8, atk: 218 }, "39": { "Energy Recharge%": 15.8, atk: 222 },
            "40": { "Energy Recharge%": 17.2, atk: 226 }, "41": { "Energy Recharge%": 17.2, atk: 256 }, "42": { "Energy Recharge%": 17.2, atk: 260 }, "43": { "Energy Recharge%": 17.2, atk: 264 }, "44": { "Energy Recharge%": 17.2, atk: 268 },
            "45": { "Energy Recharge%": 18.5, atk: 273 }, "46": { "Energy Recharge%": 18.5, atk: 277 }, "47": { "Energy Recharge%": 18.5, atk: 281 }, "48": { "Energy Recharge%": 18.5, atk: 285 }, "49": { "Energy Recharge%": 18.5, atk: 289 },
            "50": { "Energy Recharge%": 19.9, atk: 293 }, "51": { "Energy Recharge%": 19.9, atk: 323 }, "52": { "Energy Recharge%": 19.9, atk: 328 }, "53": { "Energy Recharge%": 19.9, atk: 332 }, "54": { "Energy Recharge%": 19.9, atk: 336 },
            "55": { "Energy Recharge%": 21.2, atk: 340 }, "56": { "Energy Recharge%": 21.2, atk: 344 }, "57": { "Energy Recharge%": 21.2, atk: 348 }, "58": { "Energy Recharge%": 21.2, atk: 353 }, "59": { "Energy Recharge%": 21.2, atk: 357 },
            "60": { "Energy Recharge%": 22.6, atk: 361 }, "61": { "Energy Recharge%": 22.6, atk: 391 }, "62": { "Energy Recharge%": 22.6, atk: 395 }, "63": { "Energy Recharge%": 22.6, atk: 399 }, "64": { "Energy Recharge%": 22.6, atk: 404 },
            "65": { "Energy Recharge%": 23.9, atk: 408 }, "66": { "Energy Recharge%": 23.9, atk: 412 }, "67": { "Energy Recharge%": 23.9, atk: 416 }, "68": { "Energy Recharge%": 23.9, atk: 420 }, "69": { "Energy Recharge%": 23.9, atk: 424 },
            "70": { "Energy Recharge%": 25.2, atk: 429 }, "71": { "Energy Recharge%": 25.2, atk: 459 }, "72": { "Energy Recharge%": 25.2, atk: 463 }, "73": { "Energy Recharge%": 25.2, atk: 467 }, "74": { "Energy Recharge%": 25.2, atk: 471 },
            "75": { "Energy Recharge%": 26.6, atk: 476 }, "76": { "Energy Recharge%": 26.6, atk: 480 }, "77": { "Energy Recharge%": 26.6, atk: 484 }, "78": { "Energy Recharge%": 26.6, atk: 488 }, "79": { "Energy Recharge%": 26.6, atk: 493 },
            "80": { "Energy Recharge%": 27.9, atk: 497 }, "81": { "Energy Recharge%": 27.9, atk: 527 }, "82": { "Energy Recharge%": 27.9, atk: 531 }, "83": { "Energy Recharge%": 27.9, atk: 535 }, "84": { "Energy Recharge%": 27.9, atk: 539 },
            "85": { "Energy Recharge%": 29.3, atk: 544 }, "86": { "Energy Recharge%": 29.3, atk: 548 }, "87": { "Energy Recharge%": 29.3, atk: 552 }, "88": { "Energy Recharge%": 29.3, atk: 556 }, "89": { "Energy Recharge%": 29.3, atk: 561 },
            "90": { "Energy Recharge%": 30.6, atk: 565 }
        }
    }
];