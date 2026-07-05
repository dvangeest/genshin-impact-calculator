# Genshin Impact Team Damage Calculator

A local web-based calculator for Genshin Impact team damage analysis featuring a comprehensive character database.

## Features

### Character Database
- **6 Characters Included:**
  - Sandrone (Cryo Claymore, 5★) - Snezhnaya
  - Yae Miko (Electro Catalyst, 5★) - Inazuma  
  - Nicole (Pyro Catalyst, 5★) - Unknown Region
  - Alyosha (Electro, 5★) - Snezhnaya [UPCOMING]
  - Odette (Cryo, 5★) - Snezhnaya [UPCOMING]
  - Escoffier (Cryo Polearm, 5★) - Fontaine

### Database Information Per Character
- **Base Stats:** HP, ATK, DEF, Crit Rate, Crit DMG, Energy Recharge, Elemental Mastery
- **Talents:** 
  - Normal Attack (scalings for each hit)
  - Elemental Skill (with cooldown and effects)
  - Elemental Burst (with energy cost)
- **Constellations:** All 6 levels (C1-C6) with descriptions and effects
- **Metadata:** Rarity, Element, Weapon, Region, Release Date, Version

## Project Structure

```
genshin-impact-calculator/
├── index.html                 # Main HTML file
├── css/
│   └── style.css             # Styling with element-based color scheme
├── js/
│   ├── characterDatabase.js   # Character data (primary database)
│   └── main.js               # UI logic and calculations
└── README.md                 # This file
```

## How to Use

1. **Open the Calculator:**
   - Open `index.html` in your web browser
   - The calculator will load with all characters displayed

2. **Browse Characters:**
   - Filter by **Element** (Cryo, Pyro, Electro, etc.)
   - Filter by **Weapon** (Sword, Claymore, Polearm, Catalyst, Bow)
   - View character cards with quick stats

3. **View Character Details:**
   - Click the "Details" button on any character card
   - View complete stats, talents, and constellations
   - Modal window opens with full character information

4. **Build a Team:**
   - Click "Select" on character cards to add them to your team
   - Maximum 4 characters per team
   - Remove characters from team using the "Remove" button

5. **Calculate Damage:**
   - Open browser console (F12 → Console)
   - Use `calculateTeamDPS()` to get quick DPS calculation
   - Access character database via `CHARACTER_DATABASE`

## Database Structure

### Character Object
```javascript
{
  id: 'unique_identifier',
  name: 'Character Name',
  rarity: 5,
  element: 'cryo',           // cryo, pyro, electro, anemo, hydro, dendro, geo
  weapon: 'claymore',        // claymore, polearm, sword, catalyst, bow
  region: 'snezhnaya',
  gender: 'female',
  title: 'Character Title',
  description: 'Character description',
  
  baseStats: {
    hp: 335,
    atk: 82,
    def: 56,
    critRate: 0.05,
    critDmg: 0.50,
    energyRecharge: 1.0,
    elementalMastery: 0
  },
  
  talents: {
    normal: { name, type, description, scalings[], levels },
    skill: { name, type, description, scaling, cooldown, duration, levels },
    burst: { name, type, description, scaling, energyCost, duration, levels }
  },
  
  constellations: {
    c1: { level, name, description, effect },
    c2: { ... },
    // ... c3 through c6
  },
  
  releaseDate: '2026-07-01',
  version: '6.7',
  status: 'upcoming' // optional, for unreleased characters
}
```

## Styling

- **Element Color Scheme:**
  - Cryo: #4a90e2 (Blue)
  - Pyro: #ff6b6b (Red)
  - Electro: #b19cd9 (Purple)
  - Anemo: #52c0a1 (Teal)
  - Hydro: #00b4d8 (Cyan)
  - Dendro: #7cb342 (Green)
  - Geo: #ffc107 (Yellow)

- **Responsive Design:** Mobile-friendly with breakpoints at 768px and 480px
- **Animations:** Smooth transitions and hover effects throughout

## API Reference

### Functions in main.js

```javascript
// Calculate damage for a single character
calculateDamage(character, talent, atk) → number

// Calculate total team DPS
calculateTeamDPS() → number

// Add character to team
addCharacterToTeam(character) → void

// Remove character from team slot
removeCharacterFromTeam(slotIndex) → void

// Render all characters in grid
renderCharacterGrid() → void

// Show character details modal
showCharacterDetails(character) → void

// Update team display UI
updateTeamDisplay() → void
```

## Extending the Database

To add new characters:

1. Open `js/characterDatabase.js`
2. Add a new entry in the `CHARACTER_DATABASE` object:

```javascript
newCharacter: {
  id: 'new_character_id',
  name: 'New Character',
  rarity: 5,
  element: 'cryo',
  weapon: 'sword',
  region: 'fontaine',
  gender: 'female',
  // ... complete the rest of the properties
}
```

3. Refresh the browser to see the new character

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## Notes

- **Upcoming Characters:** Alyosha and Odette are marked as upcoming and have placeholder talent/constellation data
- **Stats:** Base stats are taken from official game data as of the database creation date
- **Local Database:** All data is stored in JavaScript - no external API calls required
- **Offline:** Calculator works completely offline once loaded

## Future Enhancements

Potential features for future versions:
- Artifact and weapon optimizer
- Elemental reaction damage calculations
- Team synergy analysis
- Export team composition as JSON
- More advanced DPS calculations with multipliers
- Local storage for saved teams
- Character comparison tool

## Sources

Character data compiled from:
- https://genshin.gg/
- https://genshin-impact.fandom.com/wiki/Character/List
- https://game8.co/games/Genshin-Impact/archives/296707
- https://game8.co/games/Genshin-Impact/archives/307054

## License

Personal project for learning and reference purposes.

---

**Version:** 1.0  
**Last Updated:** 2026-07-05  
**Characters:** 6 (4 released, 2 upcoming)
