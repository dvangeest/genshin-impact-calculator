/**
 * Genshin Impact Damage Calculator - Main Script
 * Manages character selection, calculations, and UI interactions
 */

// Global state
let selectedTeam = [null, null, null, null]; // 4 character slots
const modal = document.getElementById('characterModal');
const closeBtn = document.querySelector('.close');

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    renderCharacterGrid();
    attachEventListeners();
});

/**
 * Initialize UI components
 */
function initializeUI() {
    // Create team slots
    const teamSlotsContainer = document.getElementById('teamSlots');
    for (let i = 0; i < 4; i++) {
        const slot = document.createElement('div');
        slot.className = 'team-slot';
        slot.setAttribute('data-slot', i);
        slot.innerHTML = `
      <div class="slot-placeholder">
        <span>Slot ${i + 1}</span>
        <small>Click to select</small>
      </div>
    `;
        slot.addEventListener('click', () => openCharacterSelector(i));
        teamSlotsContainer.appendChild(slot);
    }
}

/**
 * Render all characters in the grid
 */
function renderCharacterGrid() {
    const grid = document.getElementById('characterGrid');
    grid.innerHTML = '';

    // Get filter values
    const elementFilter = document.getElementById('elementFilter')?.value || '';
    const weaponFilter = document.getElementById('weaponFilter')?.value || '';

    // Loop through database and create cards
    for (const [key, char] of Object.entries(CHARACTER_DATABASE)) {
        // Apply filters
        if (elementFilter && char.element !== elementFilter) continue;
        if (weaponFilter && char.weapon !== weaponFilter) continue;

        const card = createCharacterCard(char);
        grid.appendChild(card);
    }
}

/**
 * Create a character card element
 */
function createCharacterCard(character) {
    const card = document.createElement('div');
    card.className = `character-card element-${character.element}`;

    const status = character.status === 'upcoming' ? ' (Upcoming)' : '';

    card.innerHTML = `
    <div class="card-header">
      <h3>${character.name}${status}</h3>
      <span class="rarity">★${character.rarity}</span>
    </div>
    <div class="card-body">
      <p><strong>Element:</strong> <span class="element-tag">${character.element.toUpperCase()}</span></p>
      <p><strong>Weapon:</strong> ${character.weapon.charAt(0).toUpperCase() + character.weapon.slice(1)}</p>
      <p><strong>Region:</strong> ${character.region.charAt(0).toUpperCase() + character.region.slice(1)}</p>
      <div class="card-stats">
        <span>ATK: ${character.baseStats.atk}</span>
        <span>HP: ${character.baseStats.hp}</span>
        <span>DEF: ${character.baseStats.def}</span>
      </div>
    </div>
    <div class="card-footer">
      <button class="btn-select" data-id="${character.id}">Select</button>
      <button class="btn-details" data-id="${character.id}">Details</button>
    </div>
  `;

    // Add event listeners
    const selectBtn = card.querySelector('.btn-select');
    const detailsBtn = card.querySelector('.btn-details');

    selectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addCharacterToTeam(character);
    });

    detailsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showCharacterDetails(character);
    });

    return card;
}

/**
 * Show detailed character information
 */
function showCharacterDetails(character) {
    const detailsDiv = document.getElementById('characterDetails');

    // Build talents HTML
    let talentsHTML = '';
    for (const [key, talent] of Object.entries(character.talents)) {
        talentsHTML += `
      <div class="talent">
        <h4>${talent.name}</h4>
        <p><strong>Type:</strong> ${talent.type}</p>
        <p>${talent.description}</p>
      </div>
    `;
    }

    // Build constellations HTML
    let constellationsHTML = '';
    for (const [key, const_] of Object.entries(character.constellations)) {
        constellationsHTML += `
      <div class="constellation">
        <h5>C${const_.level}: ${const_.name}</h5>
        <p>${const_.description}</p>
      </div>
    `;
    }

    detailsDiv.innerHTML = `
    <div class="details-header">
      <h2>${character.name}</h2>
      <span class="rarity">★${character.rarity}</span>
      <span class="element-tag element-${character.element}">${character.element.toUpperCase()}</span>
    </div>

    <div class="details-body">
      <section>
        <h3>Basic Info</h3>
        <ul>
          <li><strong>Title:</strong> ${character.title}</li>
          <li><strong>Element:</strong> ${character.element.charAt(0).toUpperCase() + character.element.slice(1)}</li>
          <li><strong>Weapon:</strong> ${character.weapon.charAt(0).toUpperCase() + character.weapon.slice(1)}</li>
          <li><strong>Region:</strong> ${character.region.charAt(0).toUpperCase() + character.region.slice(1)}</li>
          <li><strong>Gender:</strong> ${character.gender.charAt(0).toUpperCase() + character.gender.slice(1)}</li>
        </ul>
      </section>

      <section>
        <h3>Base Stats (Lv. 90/90)</h3>
        <div class="stats-grid">
          <div><strong>HP:</strong> ${character.baseStats.hp}</div>
          <div><strong>ATK:</strong> ${character.baseStats.atk}</div>
          <div><strong>DEF:</strong> ${character.baseStats.def}</div>
          <div><strong>Crit Rate:</strong> ${(character.baseStats.critRate * 100).toFixed(1)}%</div>
          <div><strong>Crit DMG:</strong> ${(character.baseStats.critDmg * 100).toFixed(1)}%</div>
          <div><strong>Energy Recharge:</strong> ${(character.baseStats.energyRecharge * 100).toFixed(1)}%</div>
        </div>
      </section>

      <section>
        <h3>Talents</h3>
        ${talentsHTML}
      </section>

      <section>
        <h3>Constellations</h3>
        <div class="constellations-grid">
          ${constellationsHTML}
        </div>
      </section>
    </div>
  `;

    modal.style.display = 'block';
}

/**
 * Add character to team
 */
function addCharacterToTeam(character) {
    // Find first empty slot
    const emptySlot = selectedTeam.findIndex(slot => slot === null);

    if (emptySlot === -1) {
        alert('Team is full! Remove a character first.');
        return;
    }

    selectedTeam[emptySlot] = character;
    updateTeamDisplay();
    logTeamComposition();
}

/**
 * Remove character from team
 */
function removeCharacterFromTeam(slotIndex) {
    selectedTeam[slotIndex] = null;
    updateTeamDisplay();
    logTeamComposition();
}

/**
 * Update team display in UI
 */
function updateTeamDisplay() {
    const slots = document.querySelectorAll('.team-slot');

    slots.forEach((slot, index) => {
        const character = selectedTeam[index];

        if (character) {
            slot.innerHTML = `
        <div class="slot-selected element-${character.element}">
          <h4>${character.name}</h4>
          <small>${character.element.toUpperCase()}</small>
          <button class="btn-remove" data-slot="${index}">Remove</button>
        </div>
      `;

            const removeBtn = slot.querySelector('.btn-remove');
            removeBtn.addEventListener('click', () => removeCharacterFromTeam(index));
        } else {
            slot.innerHTML = `
        <div class="slot-placeholder">
          <span>Slot ${index + 1}</span>
          <small>Click to select</small>
        </div>
      `;
        }
    });
}

/**
 * Open character selector for a specific slot
 */
function openCharacterSelector(slotIndex) {
    console.log(`Opening character selector for slot ${slotIndex}`);
    // This would open a modal to select a character
    // For now, just log it
}

/**
 * Log current team composition
 */
function logTeamComposition() {
    const teamComp = selectedTeam
        .filter(char => char !== null)
        .map(char => `${char.name} (${char.element.toUpperCase()})`)
        .join(' | ');

    console.log(`Current Team: ${teamComp || 'Empty'}`);
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
    // Filter controls
    const elementFilter = document.getElementById('elementFilter');
    const weaponFilter = document.getElementById('weaponFilter');

    if (elementFilter) {
        elementFilter.addEventListener('change', renderCharacterGrid);
    }

    if (weaponFilter) {
        weaponFilter.addEventListener('change', renderCharacterGrid);
    }

    // Modal controls
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

/**
 * Calculate damage for a character
 * @param {Object} character - Character object
 * @param {number} talent - Talent scaling (0-1)
 * @param {number} atk - Attack stat
 * @returns {number} Calculated damage
 */
function calculateDamage(character, talent, atk) {
    const baseATK = character.baseStats.atk;
    const totalATK = baseATK + atk;
    return totalATK * talent;
}

/**
 * Calculate team DPS
 */
function calculateTeamDPS() {
    const validCharacters = selectedTeam.filter(char => char !== null);

    if (validCharacters.length === 0) {
        console.log('No characters in team');
        return 0;
    }

    let totalDPS = 0;
    validCharacters.forEach(char => {
        // Simple DPS calculation: base damage * talent scaling
        const baseDamage = calculateDamage(char, 0.5, 100);
        totalDPS += baseDamage;
    });

    console.log(`Total Team DPS: ${totalDPS.toFixed(2)}`);
    return totalDPS;
}

// Make functions available globally for testing
window.calculateTeamDPS = calculateTeamDPS;
window.CHARACTER_DATABASE = CHARACTER_DATABASE;
