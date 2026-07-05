// Weapon database generated from provided Lunaris pages
const weaponDatabase = [
    {
        id: 12516,
        name: "A Teaspoon of Transcendence",
        type: "claymore",
        baseAtk: 674,
        secondary: { stat: "CRIT DMG", value: "44.1%" },
        passiveName: "White Fairy's Queening",
        passiveDesc: "ATK is increased by 28%. Each time the equipping character hits an opponent with their Charged Attack, they attain 'Transcendence' for a short time: Stellar-Conduct and Stellar Swirl DMG +16% for 5s. Can stack (max 3, once per 0.2s).",
        icon: "https://api.lunaris.moe/data/assets/weaponicon/UI_EquipIcon_Claymore_CrystallineSword.webp",
        source: "https://lunaris.moe/weapon/12516"
    },
    {
        id: 14436,
        name: "Forgeable Catalyst",
        type: "catalyst",
        baseAtk: 565,
        secondary: { stat: "ATK%", value: "27.6%" },
        passiveName: null,
        passiveDesc: "Triggering an elemental reaction increases the character's Elemental Mastery by 60 for 12s, and when a Stellar-Conduct/Stellar Swirl reaction is triggered, Stellar-Conduct/Stellar Swirl DMG is increased by 16% for 12s. Effects can trigger even when character is off-field.",
        icon: "https://api.lunaris.moe/data/assets/weaponicon/UI_EquipIcon_Catalyst_GlintstoneCatalyst.webp",
        source: "https://lunaris.moe/weapon/14436"
    },
    {
        id: 13407,
        name: "Favonius Lance",
        type: "polearm",
        baseAtk: 565,
        secondary: { stat: "Energy Recharge", value: "30.6%" },
        passiveName: "Windfall",
        passiveDesc: "CRIT Hits have a 60% chance to generate a small amount of Elemental Particles, regenerating 6 Energy for the character. Can occur once every 12s.",
        icon: "https://api.lunaris.moe/data/assets/weaponicon/UI_EquipIcon_Pole_Zephyrus.webp",
        source: "https://lunaris.moe/weapon/13407"
    },
    {
        id: 11436,
        name: "Forgeable Sword",
        type: "sword",
        baseAtk: 510,
        secondary: { stat: "Elemental Mastery", value: "165" },
        passiveName: null,
        passiveDesc: "Triggering an elemental reaction increases the character's ATK by 16% for 12s, and when a Stellar-Conduct/Stellar Swirl reaction is triggered, Stellar-Conduct/Stellar Swirl DMG is increased by 16% for 12s. Effects can trigger even when character is off-field.",
        icon: "https://api.lunaris.moe/data/assets/weaponicon/UI_EquipIcon_Sword_GlintstoneSword.webp",
        source: "https://lunaris.moe/weapon/11436"
    },
    {
        id: 13502,
        name: "Skyward Spine",
        type: "polearm",
        baseAtk: 674,
        secondary: { stat: "Energy Recharge", value: "36.8%" },
        passiveName: "Black Wing",
        passiveDesc: "Increases CRIT Rate by 8% and Normal ATK SPD by 12%. Normal and Charged Attack hits have a 50% chance to trigger a vacuum blade that deals 40% ATK as DMG in a small AoE. Can occur once every 2s.",
        icon: "https://api.lunaris.moe/data/assets/weaponicon/UI_EquipIcon_Pole_Dvalin.webp",
        source: "https://lunaris.moe/weapon/13502"
    },
    {
        id: 14501,
        name: "Skyward Atlas",
        type: "catalyst",
        baseAtk: 674,
        secondary: { stat: "ATK%", value: "33.1%" },
        passiveName: "Wandering Clouds",
        passiveDesc: "Increases Elemental DMG Bonus by 12%. Normal Attack hits have a 50% chance to spawn clouds that attack nearby opponents for 15s, dealing 160% ATK DMG. Can occur once every 30s.",
        icon: "https://api.lunaris.moe/data/assets/weaponicon/UI_EquipIcon_Catalyst_Dvalin.webp",
        source: "https://lunaris.moe/weapon/14501"
    }
];

// Expose for other scripts
if (typeof module !== 'undefined') module.exports = weaponDatabase;
if (typeof window !== 'undefined') window.weaponDatabase = weaponDatabase;