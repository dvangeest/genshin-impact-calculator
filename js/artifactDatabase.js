// Artifact database generated from provided Lunaris links
// Each entry is structured for programmatic use by the calculator.
// Fields:
//  - id, name, setKey, rarity, source
//  - setBonuses: structured when possible (`two`, `four`) else `text`
//  - slots: map of slotKey -> { mainStat: { key, type } | mainStatOptions: [ {key, type} ] }
//  - substats: array of possible substat keys

const artifacts = [
    {
        id: 15048,
        name: "Unknown Stellar Set",
        setKey: "unknown_15048",
        rarity: 5,
        source: "https://lunaris.moe/artifact/15048",
        setBonuses: {
            two: { type: 'atk%', value: 0.18 },
            four: {
                // complex effect — store both a short structured part and full text
                structured: {
                    onReactionTrigger: ['Stellar-Conduct', 'Stellar Swirl'],
                    selfAtkPercent: 0.12,
                    partyBuff: { type: 'stellar_reaction_damage%', value: 0.5, duration: 12 }
                },
                text: "When you trigger Stellar-Conduct, Stellar Swirl, or directly deal reaction DMG of the above types, your ATK increases by 12% and nearby party members gain a buff that increases their Stellar-Conduct and Stellar Swirl DMG by 50% for 12s. Unique, cannot stack."
            }
        },
        // Slot main stat options (flower/plume are fixed; others have options)
        slots: {
            flower: { mainStat: { key: 'hp', type: 'flat' } },
            plume: { mainStat: { key: 'atk', type: 'flat' } },
            sands: {
                mainStatOptions: [
                    { key: 'atk%', type: 'percent' },
                    { key: 'hp%', type: 'percent' },
                    { key: 'def%', type: 'percent' },
                    { key: 'elementalMastery', type: 'flat' },
                    { key: 'energyRecharge', type: 'percent' }
                ]
            },
            goblet: {
                mainStatOptions: [
                    { key: 'atk%', type: 'percent' },
                    { key: 'elementalDamage%', type: 'percent' },
                    { key: 'hp%', type: 'percent' },
                    { key: 'def%', type: 'percent' }
                ]
            },
            circlet: {
                mainStatOptions: [
                    { key: 'critRate', type: 'percent' },
                    { key: 'critDmg', type: 'percent' },
                    { key: 'atk%', type: 'percent' },
                    { key: 'healing%', type: 'percent' }
                ]
            }
        },
        // Typical substat pool (keys used by calculator)
        substats: [
            'critRate',
            'critDmg',
            'atk%',
            'flatAtk',
            'hp%',
            'flatHp',
            'def%',
            'elementalMastery',
            'energyRecharge'
        ]
    },
    {
        id: 15007,
        name: "Noblesse Oblige",
        setKey: "noblesse_oblige",
        rarity: 5,
        source: "https://lunaris.moe/artifact/15007",
        setBonuses: {
            two: { type: 'burstDmg%', value: 0.20 },
            four: {
                structured: { partyAtkPercentOnBurst: 0.20, duration: 12 },
                text: "Using an Elemental Burst increases all party members' ATK by 20% for 12s. This effect cannot stack."
            }
        },
        slots: {
            flower: { mainStat: { key: 'hp', type: 'flat' } },
            plume: { mainStat: { key: 'atk', type: 'flat' } },
            sands: { mainStatOptions: [{ key: 'atk%', type: 'percent' }, { key: 'energyRecharge', type: 'percent' }, { key: 'elementalMastery', type: 'flat' }] },
            goblet: { mainStatOptions: [{ key: 'burstDmg%', type: 'percent' }, { key: 'atk%', type: 'percent' }, { key: 'elementalDamage%', type: 'percent' }] },
            circlet: { mainStatOptions: [{ key: 'critRate', type: 'percent' }, { key: 'critDmg', type: 'percent' }, { key: 'atk%', type: 'percent' }] }
        },
        substats: ['critRate', 'critDmg', 'atk%', 'flatAtk', 'hp%', 'def%', 'elementalMastery', 'energyRecharge']
    },
    {
        id: 15032,
        name: "Golden Troupe",
        setKey: "golden_troupe",
        rarity: 5,
        source: "https://lunaris.moe/artifact/15032",
        setBonuses: {
            two: { type: 'skillDmg%', value: 0.20 },
            four: {
                structured: { skillDmgPercent: 0.25, offFieldBonus: 0.25, offFieldDurationClearOnSwapSecs: 2 },
                text: "Increases Elemental Skill DMG by 25%. Additionally, when not on the field, Elemental Skill DMG will be further increased by 25%. This effect will be cleared 2s after taking the field."
            }
        },
        slots: {
            flower: { mainStat: { key: 'hp', type: 'flat' } },
            plume: { mainStat: { key: 'atk', type: 'flat' } },
            sands: { mainStatOptions: [{ key: 'atk%', type: 'percent' }, { key: 'energyRecharge', type: 'percent' }, { key: 'elementalMastery', type: 'flat' }] },
            goblet: { mainStatOptions: [{ key: 'skillDmg%', type: 'percent' }, { key: 'elementalDamage%', type: 'percent' }] },
            circlet: { mainStatOptions: [{ key: 'critRate', type: 'percent' }, { key: 'critDmg', type: 'percent' }, { key: 'atk%', type: 'percent' }] }
        },
        substats: ['critRate', 'critDmg', 'atk%', 'flatAtk', 'hp%', 'elementalMastery', 'energyRecharge']
    },
    {
        id: 15046,
        name: "Disenchantment in Deep Shadow",
        setKey: "disenchantment_in_deep_shadow",
        rarity: 5,
        source: "https://lunaris.moe/artifact/15046",
        setBonuses: {
            two: { type: 'atk%', value: 0.18 },
            four: {
                structured: { superconductDmgPercent: 0.80, stellarConductDmgPercent: 0.40, critRateWhenTargetHasStatus: 0.16 },
                text: "Increases Superconduct Reaction DMG by 80% and Stellar-Conduct Reaction DMG by 40%. When the wielder attacks opponents affected by Superconduct or Stellar-Conduct, this attack's CRIT Rate is increased by 16%."
            }
        },
        slots: {
            flower: { mainStat: { key: 'hp', type: 'flat' } },
            plume: { mainStat: { key: 'atk', type: 'flat' } },
            sands: { mainStatOptions: [{ key: 'atk%', type: 'percent' }, { key: 'elementalMastery', type: 'flat' }, { key: 'energyRecharge', type: 'percent' }] },
            goblet: { mainStatOptions: [{ key: 'elementalDamage%', type: 'percent' }, { key: 'atk%', type: 'percent' }] },
            circlet: { mainStatOptions: [{ key: 'critRate', type: 'percent' }, { key: 'critDmg', type: 'percent' }, { key: 'atk%', type: 'percent' }] }
        },
        substats: ['critRate', 'critDmg', 'atk%', 'flatAtk', 'hp%', 'elementalMastery', 'def%', 'energyRecharge']
    }
];

export default artifacts;
