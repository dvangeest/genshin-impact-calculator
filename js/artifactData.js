/**
 * Artifact reference data.
 *
 * ARTIFACT_SETS mirrors the shape of json/artifact/*.json — extend this array
 * whenever a new artifact set's JSON is added to the database.
 *
 * MAIN_STAT_OPTIONS / SUB_STAT_OPTIONS / ARTIFACT_TYPES are kept separate
 * from ARTIFACT_SETS since they're reused anywhere an artifact instance is
 * built or edited (the creation modal today, an editor or import tool later).
 */

const ARTIFACT_SETS = [
  {
    id: 'golden_troupe',
    name: 'Golden Troupe',
    qualityType: 'QUALITY_ORANGE',
    pieces: {
      flower: "Golden Song's Variation",
      plume: "Golden Bird's Shedding",
      sands: "Golden Era's Prelude",
      goblet: "Golden Night's Bustle",
      circlet: "Golden Troupe's Reward"
    }
  },
  {
    id: 'noblesse_oblige',
    name: 'Noblesse Oblige',
    qualityType: 'QUALITY_ORANGE',
    pieces: {
      flower: 'Royal Flora',
      plume: 'Royal Plume',
      sands: 'Royal Pocket Watch',
      goblet: 'Royal Silver Urn',
      circlet: 'Royal Masque'
    }
  },
  {
    id: 'disenchantment_in_deep_shadow',
    name: 'Disenchantment in Deep Shadow',
    qualityType: 'QUALITY_ORANGE',
    pieces: {
      flower: 'Iridescence That Ceased Amidst Glory',
      plume: 'Sharpness That Ceased Upon Wondrous Creation',
      sands: 'Moment That Ceased Upon Waking From Grand Dreams',
      goblet: 'Ovations That Ceased Upon Festivity',
      circlet: 'Pendulum That Ceased Amidst a Great Fall'
    }
  },
  {
    id: 'heart_forged_in_the_furnace_fire',
    name: 'Heart Forged in the Furnace Fire',
    qualityType: 'QUALITY_ORANGE',
    unreleased: true,
    pieces: {
      flower: '???',
      plume: '???',
      sands: '???',
      goblet: '???',
      circlet: '???'
    }
  }
];

// Dropdown label -> internal piece key, matching json/artifact/*.json "pieces" keys.
const ARTIFACT_TYPES = [
  { key: 'flower', label: 'Flower of Life' },
  { key: 'plume', label: 'Plume of Death' },
  { key: 'sands', label: 'Sands of Eon' },
  { key: 'goblet', label: 'Goblet of Eonothem' },
  { key: 'circlet', label: 'Circlet of Logos' }
];

const MAIN_STAT_OPTIONS = [
  'HP',
  'ATK',
  'HP%',
  'ATK%',
  'DEF%',
  'Physical DMG%',
  'Elemental DMG%',
  'Elemental Mastery',
  'Energy Recharge%',
  'Crit Rate%',
  'Crit DMG%',
  'Healing Bonus%'
];

const SUB_STAT_OPTIONS = [
  'HP',
  'HP%',
  'ATK',
  'ATK%',
  'DEF',
  'DEF%',
  'Elemental Mastery',
  'Energy Recharge',
  'CRIT Rate',
  'CRIT DMG'
];

const ARTIFACT_LEVEL_DEFAULT = 20;
const ARTIFACT_LEVEL_MAX = 20;
