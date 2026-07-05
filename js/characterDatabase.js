/**
 * Genshin Impact Character Database
 * Contains character data for: Sandrone, Yae Miko, Nicole, Alyosha, Odette, Escoffier
 */

const CHARACTER_DATABASE = {
    // ============================================================================
    // SANDRONE - Cryo Claymore (5★) - Snezhnaya
    // ============================================================================
    sandrone: {
        id: 'sandrone',
        name: 'Sandrone',
        rarity: 5,
        element: 'cryo',
        weapon: 'claymore',
        region: 'snezhnaya',
        gender: 'female',
        title: 'Marionette Colossus',
        description: 'A construct created by the Fatui. A mechanical lifeform that mimics the appearance of a human.',

        // Base Stats at Level 90/90 (with no artifacts or weapons)
        baseStats: {
            hp: 13226,
            atk: 342,
            def: 752,
            critRate: 0.192,
            critDmg: 0.50,
            energyRecharge: 1.0,
            elementalMastery: 0,
            cryo: 0,
        },

        // Ascension Stats (Level 90)
        ascensionStats: {
            level: 90,
            hp: 13226,
            atk: 342,
            def: 752,
            critRate: 0.192,
            critDmg: 0.50,
            elementalMastery: 96,
        },

        // Talents
        talents: {
            normal: {
                name: 'Marionette Strike',
                type: 'Normal Attack',
                description: 'Perform up to 5 consecutive strikes with her cannon arm.',
                scalings: [0.49, 0.48, 0.56, 0.61, 0.70],
                levels: 10,
            },
            skill: {
                name: 'Mecha Fortress',
                type: 'Elemental Skill',
                description: 'Creates a cryo-infused cannon that deals AoE Cryo DMG and provides a shield.',
                scaling: 1.2,
                cooldown: 10,
                duration: 8,
                shieldScaling: 0.15,
                levels: 10,
            },
            burst: {
                name: 'Mechanized Cataclysm',
                type: 'Elemental Burst',
                description: 'Transforms into a massive construct dealing continuous Cryo DMG.',
                scaling: 2.5,
                duration: 12,
                energyCost: 80,
                levels: 10,
            },
        },

        // Constellations
        constellations: {
            c1: {
                level: 1,
                name: 'Siege Protocol',
                description: 'When Mecha Fortress hits an enemy, Mechanized Cataclysm\'s cooldown is reduced by 3s.',
                effect: 'Cooldown Reduction',
            },
            c2: {
                level: 2,
                name: 'Reinforced Armor',
                description: 'Mecha Fortress shield scales 25% more from DEF.',
                effect: '+25% shield strength from DEF',
            },
            c3: {
                level: 3,
                name: 'Upgraded Cannon',
                description: 'Increases Marionette Strike level by 3.',
                effect: 'Normal Attack +3 levels',
            },
            c4: {
                level: 4,
                name: 'Eternal Vigil',
                description: 'While in Mechanized Cataclysm state, gain 20% Cryo DMG Bonus.',
                effect: '+20% Cryo DMG',
            },
            c5: {
                level: 5,
                name: 'Critical Protocol',
                description: 'Increases Mechanized Cataclysm level by 3.',
                effect: 'Elemental Burst +3 levels',
            },
            c6: {
                level: 6,
                name: 'Perfect Construction',
                description: 'Upon exiting Mechanized Cataclysm, gain 80% of the shield on Mecha Fortress.',
                effect: 'Shield carry-over effect',
            },
        },

        releaseDate: '2026-07-01',
        version: '6.7',
    },

    // ============================================================================
    // YAE MIKO - Electro Catalyst (5★) - Inazuma
    // ============================================================================
    yaeMiko: {
        id: 'yae_miko',
        name: 'Yae Miko',
        rarity: 5,
        element: 'electro',
        weapon: 'catalyst',
        region: 'inazuma',
        gender: 'female',
        title: 'Astute Amusement',
        description: 'The Guuji of the Grand Narukami Shrine. A fox with a keen intellect and cunning.',

        baseStats: {
            hp: 10372,
            atk: 340,
            def: 569,
            critRate: 0.192,
            critDmg: 0.50,
            energyRecharge: 1.0,
            elementalMastery: 0,
            electro: 0,
        },

        ascensionStats: {
            level: 90,
            hp: 10372,
            atk: 340,
            def: 569,
            critRate: 0.192,
            critDmg: 0.50,
            elementalMastery: 96,
        },

        talents: {
            normal: {
                name: 'Sesshou Sakura',
                type: 'Normal Attack',
                description: 'Perform up to 3 consecutive strikes.',
                scalings: [0.53, 0.53, 0.81],
                levels: 10,
            },
            skill: {
                name: 'Yakan Evocation - Sesshou Sakura',
                type: 'Elemental Skill',
                description: 'Summons a Sesshou Sakura that deals electro damage and marks enemies.',
                scaling: 0.66,
                cooldown: 8,
                duration: 8,
                levels: 10,
            },
            burst: {
                name: 'Great Secret Art - Mistsplitter',
                type: 'Elemental Burst',
                description: 'Deals massive electro damage and grants electro infusion to all party members.',
                scaling: 2.88,
                energyCost: 90,
                duration: 5,
                levels: 10,
            },
        },

        constellations: {
            c1: {
                level: 1,
                name: 'Yakan Evocation - Sesshou Sakura (Reimagined)',
                description: 'Yakan Evocation gains 2 charges.',
                effect: '+2 charges to Elemental Skill',
            },
            c2: {
                level: 2,
                name: 'Kitsune Obscuration',
                description: 'Enemies marked by Sesshou Sakura take 20% increased damage.',
                effect: '+20% Marked Enemy DMG Taken',
            },
            c3: {
                level: 3,
                name: 'Electro Efflorescence',
                description: 'Increases Great Secret Art level by 3.',
                effect: 'Elemental Burst +3 levels',
            },
            c4: {
                level: 4,
                name: 'Miscellany of Yokai',
                description: 'When a Sesshou Sakura hits an enemy, Yae gains 20% Electro DMG for 3s.',
                effect: '+20% Electro DMG Bonus',
            },
            c5: {
                level: 5,
                name: 'Mystical Mastery',
                description: 'Increases Yakan Evocation level by 3.',
                effect: 'Elemental Skill +3 levels',
            },
            c6: {
                level: 6,
                name: 'Akitsushima Gekizoku',
                description: 'After using Great Secret Art, gain an extra charge of Yakan Evocation immediately.',
                effect: 'Bonus skill charge after Burst',
            },
        },

        releaseDate: '2022-02-16',
        version: '2.5',
    },

    // ============================================================================
    // NICOLE - Pyro Catalyst (5★) - Unknown Region
    // ============================================================================
    nicole: {
        id: 'nicole',
        name: 'Nicole',
        rarity: 5,
        element: 'pyro',
        weapon: 'catalyst',
        region: 'nod-krai',
        gender: 'female',
        title: 'Clamor Within',
        description: 'The Silent "Mage," the Voiceless "Angel."',

        baseStats: {
            hp: 10409,
            atk: 342,
            def: 563,
            critRate: 0.05,
            critDmg: 0.50,
            energyRecharge: 1.0,
            elementalMastery: 0,
            atk_bonus: 0.288,
        },

        ascensionStats: {
            level: 90,
            hp: 10409,
            atk: 342,
            def: 563,
            critDmg: 0.50,
            atk_bonus: 0.288,
        },

        talents: {
            normal: {
                name: 'Graceful Performance',
                type: 'Normal Attack',
                description: 'Perform up to 4 consecutive strikes with dramatic flair.',
                scalings: [0.42, 0.42, 0.56, 0.66],
                levels: 10,
            },
            skill: {
                name: 'Pyrotechnic Display',
                type: 'Elemental Skill',
                description: 'Creates a fiery spectacle dealing Pyro damage and pulling nearby enemies.',
                scaling: 1.08,
                cooldown: 12,
                duration: 10,
                levels: 10,
            },
            burst: {
                name: 'Grand Finale',
                type: 'Elemental Burst',
                description: 'A spectacular finale that deals massive Pyro damage to all enemies on field.',
                scaling: 3.2,
                energyCost: 80,
                duration: 8,
                levels: 10,
            },
        },

        constellations: {
            c1: {
                level: 1,
                name: 'Encore Performance',
                description: 'Pyrotechnic Display can be used twice before cooldown.',
                effect: '+1 charge to Elemental Skill',
            },
            c2: {
                level: 2,
                name: 'Standing Ovation',
                description: 'When Grand Finale hits, gain 30% Pyro DMG Bonus for 8s.',
                effect: '+30% Pyro DMG Bonus',
            },
            c3: {
                level: 3,
                name: 'Dramatic Crescendo',
                description: 'Increases Graceful Performance level by 3.',
                effect: 'Normal Attack +3 levels',
            },
            c4: {
                level: 4,
                name: 'Curtain Call',
                description: 'Enemies hit by Pyrotechnic Display take 25% more damage from Pyro sources.',
                effect: '+25% Pyro DMG Taken (marked enemies)',
            },
            c5: {
                level: 5,
                name: 'Spectacle Peak',
                description: 'Increases Grand Finale level by 3.',
                effect: 'Elemental Burst +3 levels',
            },
            c6: {
                level: 6,
                name: 'Masterpiece',
                description: 'After casting Grand Finale, Pyrotechnic Display cooldown resets immediately.',
                effect: 'Instant skill cooldown reset',
            },
        },

        releaseDate: '2026-05-20',
        version: '6.6',
    },

    // ============================================================================
    // ALYOSHA - Electro (5★) - Snezhnaya (Upcoming)
    // ============================================================================
    alyosha: {
        id: 'alyosha',
        name: 'Alyosha',
        rarity: 5,
        element: 'electro',
        weapon: 'polearm',
        region: 'snezhnaya',
        gender: 'male',
        title: 'Unknown',
        description: 'An upcoming Fatui character. Details are still shrouded in mystery.',

        baseStats: {
            hp: 11962,
            atk: 265,
            def: 703,
            critRate: 0.05,
            critDmg: 0.50,
            energyRecharge: 0.267,
            elementalMastery: 0,
            electro: 0,
        },

        ascensionStats: {
            level: 90,
            hp: 11962,
            atk: 265,
            def: 703,
            critDmg: 0.50,
            energyRecharge: 0.267,
        },

        talents: {
            normal: {
                name: 'Placeholder Attack',
                type: 'Normal Attack',
                description: 'Details to be revealed upon release.',
                scalings: [0.50, 0.50, 0.60, 0.65],
                levels: 10,
            },
            skill: {
                name: 'Placeholder Skill',
                type: 'Elemental Skill',
                description: 'Details to be revealed upon release.',
                scaling: 1.0,
                cooldown: 10,
                duration: 8,
                levels: 10,
            },
            burst: {
                name: 'Placeholder Burst',
                type: 'Elemental Burst',
                description: 'Details to be revealed upon release.',
                scaling: 2.5,
                energyCost: 80,
                duration: 10,
                levels: 10,
            },
        },

        constellations: {
            c1: { level: 1, name: 'Unknown', description: 'To be revealed', effect: 'TBD' },
            c2: { level: 2, name: 'Unknown', description: 'To be revealed', effect: 'TBD' },
            c3: { level: 3, name: 'Unknown', description: 'To be revealed', effect: 'TBD' },
            c4: { level: 4, name: 'Unknown', description: 'To be revealed', effect: 'TBD' },
            c5: { level: 5, name: 'Unknown', description: 'To be revealed', effect: 'TBD' },
            c6: { level: 6, name: 'Unknown', description: 'To be revealed', effect: 'TBD' },
        },

        releaseDate: '2026-07-00', // Version 7.0
        version: '7.0',
        status: 'upcoming',
    },

    // ============================================================================
    // ODETTE - Cryo (5★) - Snezhnaya (Upcoming)
    // ============================================================================
    odette: {
        id: 'odette',
        name: 'Odette',
        rarity: 5,
        element: 'cryo',
        weapon: 'sword',
        region: 'snezhnaya',
        gender: 'female',
        title: 'Soaring Winds and Swirling Snow',
        description: 'An upcoming character from Snezhnaya. Her role and abilities are yet to be revealed.',

        baseStats: {
            hp: 12981,
            atk: 335,
            def: 787,
            critRate: 0.05,
            critDmg: 0.384,
            energyRecharge: 1.0,
            elementalMastery: 0,
            cryo: 0,
        },

        ascensionStats: {
            level: 90,
            hp: 12981,
            atk: 335,
            def: 787,
            critDmg: 0.384,
            elementalMastery: 96,
        },

        talents: {
            normal: {
                name: 'Placeholder Attack',
                type: 'Normal Attack',
                description: 'Details to be revealed upon release.',
                scalings: [0.48, 0.48, 0.58, 0.63],
                levels: 10,
            },
            skill: {
                name: 'Placeholder Skill',
                type: 'Elemental Skill',
                description: 'Details to be revealed upon release.',
                scaling: 0.95,
                cooldown: 10,
                duration: 8,
                levels: 10,
            },
            burst: {
                name: 'Placeholder Burst',
                type: 'Elemental Burst',
                description: 'Details to be revealed upon release.',
                scaling: 2.4,
                energyCost: 80,
                duration: 10,
                levels: 10,
            },
        },

        constellations: {
            c1: { level: 1, name: 'Unknown', description: 'To be revealed', effect: 'TBD' },
            c2: { level: 2, name: 'Unknown', description: 'To be revealed', effect: 'TBD' },
            c3: { level: 3, name: 'Unknown', description: 'To be revealed', effect: 'TBD' },
            c4: { level: 4, name: 'Unknown', description: 'To be revealed', effect: 'TBD' },
            c5: { level: 5, name: 'Unknown', description: 'To be revealed', effect: 'TBD' },
            c6: { level: 6, name: 'Unknown', description: 'To be revealed', effect: 'TBD' },
        },

        releaseDate: '2026-07-00', // Version 7.0
        version: '7.0',
        status: 'upcoming',
    },

    // ============================================================================
    // ESCOFFIER - Cryo Polearm (5★) - Fontaine
    // ============================================================================
    escoffier: {
        id: 'escoffier',
        name: 'Escoffier',
        rarity: 5,
        element: 'cryo',
        weapon: 'polearm',
        region: 'fontaine',
        gender: 'female',
        title: 'Tasteful Excellence',
        description: 'The ex-head chef of Hotel Debord, renowned throughout Fontaine as the Patissiere Supreme and vanguard of precision gastronomy.',

        baseStats: {
            hp: 13348,
            atk: 347,
            def: 732,
            critRate: 0.192,
            critDmg: 0.50,
            energyRecharge: 1.0,
            elementalMastery: 0,
            cryo: 0,
        },

        ascensionStats: {
            level: 90,
            hp: 13348,
            atk: 347,
            def: 732,
            critRate: 0.192,
            critDmg: 0.50,
            elementalMastery: 96,
        },

        talents: {
            normal: {
                name: 'Culinary Arts',
                type: 'Normal Attack',
                description: 'Perform up to 5 consecutive polearm strikes with precise technique.',
                scalings: [0.46, 0.46, 0.54, 0.59, 0.68],
                levels: 10,
            },
            skill: {
                name: 'Frostbite Cuisine',
                type: 'Elemental Skill',
                description: 'Creates a chilled aura that deals Cryo damage and heals nearby allies.',
                scaling: 0.88,
                cooldown: 10,
                duration: 12,
                healingScaling: 0.25,
                levels: 10,
            },
            burst: {
                name: 'Culinary Masterpiece',
                type: 'Elemental Burst',
                description: 'Creates a magnificent ice sculpture that damages and freezes enemies.',
                scaling: 2.56,
                energyCost: 80,
                duration: 10,
                levels: 10,
            },
        },

        constellations: {
            c1: {
                level: 1,
                name: 'Delectable Precision',
                description: 'Frostbite Cuisine heals more when hitting frozen enemies (50% increase).',
                effect: '+50% healing on frozen enemies',
            },
            c2: {
                level: 2,
                name: 'Exquisite Presentation',
                description: 'When Culinary Masterpiece hits, gain 20% movement speed for 6s.',
                effect: '+20% movement speed',
            },
            c3: {
                level: 3,
                name: 'Flavor Enhancement',
                description: 'Increases Culinary Arts level by 3.',
                effect: 'Normal Attack +3 levels',
            },
            c4: {
                level: 4,
                name: 'Perfectly Cooked',
                description: 'Enemies affected by Frostbite Cuisine take 25% more Cryo damage.',
                effect: '+25% Cryo DMG to affected enemies',
            },
            c5: {
                level: 5,
                name: 'Supreme Artistry',
                description: 'Increases Culinary Masterpiece level by 3.',
                effect: 'Elemental Burst +3 levels',
            },
            c6: {
                level: 6,
                name: 'Chef\'s Kiss',
                description: 'After using Culinary Masterpiece, Frostbite Cuisine cooldown resets and gains a free use.',
                effect: 'Cooldown reset + free use',
            },
        },

        releaseDate: '2025-05-07',
        version: '5.6',
    },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CHARACTER_DATABASE;
}
