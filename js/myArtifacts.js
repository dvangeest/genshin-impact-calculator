const STORAGE_KEY = 'gi_calc_my_artifacts';

const SUBSTAT_ROW_COUNT = 4;

function loadArtifacts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read saved artifacts:', err);
    return [];
  }
}

function saveArtifacts(artifacts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(artifacts));
}

function populateSelect(select, options, placeholder) {
  select.innerHTML = '';
  if (placeholder) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = placeholder;
    opt.disabled = true;
    opt.selected = true;
    select.appendChild(opt);
  }
  options.forEach((option) => {
    const opt = document.createElement('option');
    if (typeof option === 'string') {
      opt.value = option;
      opt.textContent = option;
    } else {
      opt.value = option.value;
      opt.textContent = option.label;
    }
    select.appendChild(opt);
  });
}

function buildSubstatRow(index) {
  const row = document.createElement('div');
  row.className = 'substat-row';

  const select = document.createElement('select');
  select.className = 'substat-type field-select h-10 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring';
  select.dataset.index = index;

  const input = document.createElement('input');
  input.type = 'number';
  input.step = '0.1';
  input.placeholder = 'Value';
  input.className = 'substat-value field-input h-10 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring';
  input.dataset.index = index;

  row.appendChild(select);
  row.appendChild(input);
  return row;
}

function initModalOptions() {
  const setSelect = document.getElementById('field-artifact-set');
  populateSelect(
    setSelect,
    ARTIFACT_SETS.map((set) => ({ value: set.id, label: set.unreleased ? `${set.name} (Unreleased)` : set.name })),
    'Select a set…'
  );

  const typeSelect = document.getElementById('field-artifact-type');
  populateSelect(
    typeSelect,
    ARTIFACT_TYPES.map((t) => ({ value: t.key, label: t.label })),
    'Select a type…'
  );

  const mainStatSelect = document.getElementById('field-main-stat');
  populateSelect(mainStatSelect, MAIN_STAT_OPTIONS, 'Select a main stat…');

  const levelInput = document.getElementById('field-level');
  levelInput.value = ARTIFACT_LEVEL_DEFAULT;
  levelInput.max = ARTIFACT_LEVEL_MAX;
  levelInput.min = 0;

  const substatContainer = document.getElementById('substat-rows');
  substatContainer.innerHTML = '';
  for (let i = 0; i < SUBSTAT_ROW_COUNT; i++) {
    substatContainer.appendChild(buildSubstatRow(i));
  }
  substatContainer.querySelectorAll('.substat-type').forEach((select) => {
    populateSelect(select, SUB_STAT_OPTIONS, 'Select a substat…');
  });
}

function clearForm() {
  document.getElementById('field-artifact-set').selectedIndex = 0;
  document.getElementById('field-level').value = ARTIFACT_LEVEL_DEFAULT;
  document.getElementById('field-artifact-type').selectedIndex = 0;
  document.getElementById('field-main-stat').selectedIndex = 0;
  document.getElementById('field-main-stat-value').value = '';

  document.querySelectorAll('.substat-type').forEach((select) => {
    select.selectedIndex = 0;
  });
  document.querySelectorAll('.substat-value').forEach((input) => {
    input.value = '';
  });

  document.getElementById('form-error').classList.add('hidden');
}

function openModal() {
  document.getElementById('artifact-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('artifact-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

function readSubstats() {
  const rows = document.querySelectorAll('#substat-rows .substat-row');
  const substats = [];
  rows.forEach((row) => {
    const type = row.querySelector('.substat-type').value;
    const value = row.querySelector('.substat-value').value;
    if (type && value !== '') {
      substats.push({ type, value: parseFloat(value) });
    }
  });
  return substats;
}

function handleAddArtifact() {
  const setId = document.getElementById('field-artifact-set').value;
  const level = parseInt(document.getElementById('field-level').value, 10);
  const type = document.getElementById('field-artifact-type').value;
  const mainStatType = document.getElementById('field-main-stat').value;
  const mainStatValue = document.getElementById('field-main-stat-value').value;

  const errorEl = document.getElementById('form-error');

  if (!setId || !type || !mainStatType || mainStatValue === '') {
    errorEl.textContent = 'Please fill in the artifact set, type, and main stat before adding.';
    errorEl.classList.remove('hidden');
    return;
  }

  const artifact = {
    id: `art_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    setId,
    level: Number.isFinite(level) ? level : ARTIFACT_LEVEL_DEFAULT,
    type,
    mainStat: { type: mainStatType, value: parseFloat(mainStatValue) },
    substats: readSubstats(),
    createdAt: Date.now()
  };

  const artifacts = loadArtifacts();
  artifacts.unshift(artifact);
  saveArtifacts(artifacts);

  clearForm();
  closeModal();
  renderArtifacts();
}

function handleDeleteArtifact(id) {
  const artifacts = loadArtifacts().filter((a) => a.id !== id);
  saveArtifacts(artifacts);
  renderArtifacts();
}

function typeLabel(key) {
  const found = ARTIFACT_TYPES.find((t) => t.key === key);
  return found ? found.label : key;
}

function formatStat(stat) {
  const isPercent = /%/.test(stat.type) || stat.type === 'CRIT Rate' || stat.type === 'CRIT DMG' || stat.type === 'Energy Recharge';
  const suffix = /%/.test(stat.type) ? '' : (stat.type === 'CRIT Rate' || stat.type === 'CRIT DMG' || stat.type === 'Energy Recharge' ? '%' : '');
  return `${stat.type} +${stat.value}${suffix}`;
}

function renderArtifacts() {
  const grid = document.getElementById('artifact-grid');
  const emptyState = document.getElementById('empty-state');
  const artifacts = loadArtifacts();

  if (artifacts.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  grid.innerHTML = artifacts.map((artifact) => {
    const set = getArtifactSetById(artifact.setId);
    const setName = set ? set.name : 'Unknown Set';
    const pieceName = set && set.pieces ? set.pieces[artifact.type] : '';
    const substatsHtml = artifact.substats.length
      ? artifact.substats.map((s) => `<li class="text-xs text-muted-foreground">${formatStat(s)}</li>`).join('')
      : '<li class="text-xs text-muted-foreground/50 italic">No substats</li>';

    return `
      <div class="quality-orange rounded-xl border border-border bg-card p-4 flex flex-col gap-3 hover:border-white/20 transition-all">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-[10px] uppercase tracking-wider text-muted-foreground">${typeLabel(artifact.type)}</p>
            <p class="font-semibold text-sm leading-tight mt-0.5">${pieceName || setName}</p>
            <p class="text-xs text-muted-foreground mt-0.5">${setName}</p>
          </div>
          <span class="shrink-0 text-xs font-mono px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">+${artifact.level}</span>
        </div>
        <div class="pt-2 border-t border-border/50">
          <p class="text-sm font-medium text-primary">${formatStat(artifact.mainStat)}</p>
        </div>
        <ul class="space-y-1">${substatsHtml}</ul>
        <button
          class="mt-auto w-full py-1.5 rounded-md bg-secondary text-xs font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors delete-artifact-btn"
          data-id="${artifact.id}">
          Remove
        </button>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.delete-artifact-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleDeleteArtifact(btn.dataset.id));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initModalOptions();
  renderArtifacts();

  document.getElementById('open-create-modal-btn').addEventListener('click', () => {
    clearForm();
    openModal();
  });
  document.getElementById('close-modal-btn').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', closeModal);
  document.getElementById('add-artifact-btn').addEventListener('click', handleAddArtifact);
  document.getElementById('clear-artifact-btn').addEventListener('click', clearForm);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});