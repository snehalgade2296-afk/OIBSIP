/**
 * ThermoConvert — app.js
 * Handles all functionality:
 *  - Temperature conversion (C, F, K)
 *  - Dark/Light mode toggle
 *  - Real-time preview while typing
 *  - Conversion history (localStorage)
 *  - Clipboard copy
 *  - Swap units
 *  - Toast notifications
 *  - Keyboard accessibility
 *  - Date/time header
 */

'use strict';

/* =============================================
   SECTION 1: DOM References
   ============================================= */
const tempInput        = document.getElementById('temp-input');
const inputError       = document.getElementById('input-error');
const inputUnitBadge   = document.getElementById('input-unit-badge');
const convertBtn       = document.getElementById('convert-btn');
const swapBtn          = document.getElementById('swap-btn');
const themeToggle      = document.getElementById('theme-toggle');
const resultArea       = document.getElementById('result-area');
const resultValue      = document.getElementById('result-value');
const resultFormula    = document.getElementById('result-formula');
const allUnitsEl       = document.getElementById('all-units');
const copyBtn          = document.getElementById('copy-btn');
const historyList      = document.getElementById('history-list');
const historyEmpty     = document.getElementById('history-empty');
const clearHistoryBtn  = document.getElementById('clear-history-btn');
const datetimeDisplay  = document.getElementById('datetime-display');
const footerYear       = document.getElementById('footer-year');
const toastContainer   = document.getElementById('toast-container');

/* =============================================
   SECTION 2: State
   ============================================= */
const state = {
  fromUnit: 'celsius',      // 'celsius' | 'fahrenheit' | 'kelvin'
  toUnit:   'fahrenheit',
  history:  [],             // [{id, from, fromUnit, to, toUnit, time}]
  lastResult: null,         // {value, unit}
  theme: 'dark',
};

/* =============================================
   SECTION 3: Unit Metadata
   ============================================= */
const UNITS = {
  celsius:    { symbol: '°C', name: 'Celsius',    abbr: 'C' },
  fahrenheit: { symbol: '°F', name: 'Fahrenheit', abbr: 'F' },
  kelvin:     { symbol: 'K',  name: 'Kelvin',     abbr: 'K' },
};

/* =============================================
   SECTION 4: Conversion Logic
   ============================================= */

/**
 * Convert a temperature value between any two units.
 * @param {number} value  - Input temperature
 * @param {string} from   - Source unit
 * @param {string} to     - Target unit
 * @returns {number}
 */
function convert(value, from, to) {
  if (from === to) return value;

  // Convert everything to Celsius first as a common base
  let celsius;
  switch (from) {
    case 'celsius':    celsius = value; break;
    case 'fahrenheit': celsius = (value - 32) * 5 / 9; break;
    case 'kelvin':     celsius = value - 273.15; break;
    default: throw new Error(`Unknown unit: ${from}`);
  }

  // Convert from Celsius to target
  switch (to) {
    case 'celsius':    return celsius;
    case 'fahrenheit': return (celsius * 9 / 5) + 32;
    case 'kelvin':     return celsius + 273.15;
    default: throw new Error(`Unknown unit: ${to}`);
  }
}

/**
 * Build a human-readable formula string for the conversion.
 * @param {number} value
 * @param {string} from
 * @param {string} to
 * @returns {string}
 */
function buildFormula(value, from, to) {
  const v = Number(value);
  if (from === to) return `${v} ${UNITS[from].symbol} = ${v} ${UNITS[to].symbol}`;

  const formulas = {
    celsius_fahrenheit:    `(${v} × 9/5) + 32`,
    fahrenheit_celsius:    `(${v} − 32) × 5/9`,
    celsius_kelvin:        `${v} + 273.15`,
    kelvin_celsius:        `${v} − 273.15`,
    fahrenheit_kelvin:     `(${v} − 32) × 5/9 + 273.15`,
    kelvin_fahrenheit:     `(${v} − 273.15) × 9/5 + 32`,
  };
  return formulas[`${from}_${to}`] || '';
}

/**
 * Compute all three unit values from the input.
 * @param {number} value
 * @param {string} fromUnit
 * @returns {{ celsius, fahrenheit, kelvin }}
 */
function computeAll(value, fromUnit) {
  return {
    celsius:    convert(value, fromUnit, 'celsius'),
    fahrenheit: convert(value, fromUnit, 'fahrenheit'),
    kelvin:     convert(value, fromUnit, 'kelvin'),
  };
}

/* =============================================
   SECTION 5: Input Validation
   ============================================= */

/**
 * Validate the temperature input.
 * @returns {{ valid: boolean, value?: number }}
 */
function validateInput() {
  const raw = tempInput.value.trim();

  if (raw === '') {
    showError('Please enter a temperature value.');
    return { valid: false };
  }

  const num = parseFloat(raw);

  if (isNaN(num)) {
    showError('Please enter a valid number.');
    return { valid: false };
  }

  // Kelvin cannot be negative
  if (state.fromUnit === 'kelvin' && num < 0) {
    showError('Kelvin cannot be below 0 K (absolute zero).');
    return { valid: false };
  }

  // Absolute zero in Celsius is −273.15
  if (state.fromUnit === 'celsius' && num < -273.15) {
    showError('Temperature below absolute zero (−273.15 °C).');
    return { valid: false };
  }

  // Absolute zero in Fahrenheit is −459.67
  if (state.fromUnit === 'fahrenheit' && num < -459.67) {
    showError('Temperature below absolute zero (−459.67 °F).');
    return { valid: false };
  }

  clearError();
  return { valid: true, value: num };
}

function showError(msg) {
  inputError.textContent = msg;
  tempInput.classList.add('error');
}

function clearError() {
  inputError.textContent = '';
  tempInput.classList.remove('error');
}

/* =============================================
   SECTION 6: Unit Selector UI
   ============================================= */

// Set up all unit-btn click handlers
document.querySelectorAll('.unit-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const selector = btn.dataset.selector;  // 'from' | 'to'
    const unit = btn.dataset.unit;

    // Prevent same unit on both sides
    if (selector === 'from' && unit === state.toUnit) {
      swapUnits();
      return;
    }
    if (selector === 'to' && unit === state.fromUnit) {
      swapUnits();
      return;
    }

    if (selector === 'from') {
      state.fromUnit = unit;
      updateUnitBadge();
    } else {
      state.toUnit = unit;
    }

    updateUnitButtons();
    triggerRealtimePreview();
    clearError();
  });
});

/**
 * Update active state of unit buttons.
 */
function updateUnitButtons() {
  document.querySelectorAll('.unit-btn').forEach(btn => {
    const selector = btn.dataset.selector;
    const unit = btn.dataset.unit;
    const isActive = (selector === 'from' && unit === state.fromUnit) ||
                     (selector === 'to'   && unit === state.toUnit);
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

/**
 * Update the input badge to reflect the from-unit.
 */
function updateUnitBadge() {
  inputUnitBadge.textContent = UNITS[state.fromUnit].symbol;
}

/* =============================================
   SECTION 7: Swap Units
   ============================================= */
swapBtn.addEventListener('click', swapUnits);

function swapUnits() {
  [state.fromUnit, state.toUnit] = [state.toUnit, state.fromUnit];
  updateUnitButtons();
  updateUnitBadge();
  triggerRealtimePreview();

  // Visual micro-interaction handled by CSS rotate on hover; add programmatic spin
  swapBtn.style.transform = 'rotate(360deg)';
  setTimeout(() => { swapBtn.style.transform = ''; }, 400);
}

/* =============================================
   SECTION 8: Real-time Preview
   ============================================= */
let previewTimeout = null;

tempInput.addEventListener('input', () => {
  clearTimeout(previewTimeout);
  previewTimeout = setTimeout(triggerRealtimePreview, 120);
});

function triggerRealtimePreview() {
  const raw = tempInput.value.trim();
  if (raw === '') {
    if (!resultArea.hidden) {
      // Keep result visible but dim it
    }
    return;
  }

  const num = parseFloat(raw);
  if (isNaN(num)) return;

  // Silently show result without showing error
  performConversion(num, { silent: true });
}

/* =============================================
   SECTION 9: Conversion — Core
   ============================================= */

/**
 * Perform the conversion and update the UI.
 * @param {number} value
 * @param {{ silent?: boolean, addHistory?: boolean }} opts
 */
function performConversion(value, opts = {}) {
  const { silent = false, addHistory = false } = opts;
  const result = convert(value, state.fromUnit, state.toUnit);
  const formula = buildFormula(value, state.fromUnit, state.toUnit);
  const allVals = computeAll(value, state.fromUnit);

  // Store last result for clipboard
  state.lastResult = {
    value: result,
    unit: UNITS[state.toUnit].symbol,
    text: `${result.toFixed(2)} ${UNITS[state.toUnit].symbol}`,
  };

  // Update result display
  resultValue.textContent = `${result.toFixed(2)} ${UNITS[state.toUnit].symbol}`;
  resultFormula.textContent = formula ? `Formula: ${formula}` : '';

  // Update all-units panel
  renderAllUnits(allVals);

  // Show the result area
  resultArea.removeAttribute('hidden');

  // Trigger pop-in animation on value
  resultValue.classList.remove('pop-anim');
  void resultValue.offsetWidth; // force reflow
  resultValue.classList.add('pop-anim');

  if (addHistory && !silent) {
    addToHistory(value, result);
  }
}

/**
 * Render the "all units" quick reference grid.
 */
function renderAllUnits(allVals) {
  allUnitsEl.innerHTML = '';
  ['celsius', 'fahrenheit', 'kelvin'].forEach((unit, i) => {
    const item = document.createElement('div');
    item.className = 'all-unit-item';
    item.style.animationDelay = `${i * 0.06}s`;
    const v = allVals[unit];
    item.innerHTML = `
      <div class="all-unit-sym">${UNITS[unit].symbol}</div>
      <div class="all-unit-val">${v.toFixed(2)}</div>
      <div class="all-unit-name">${UNITS[unit].name}</div>
    `;
    allUnitsEl.appendChild(item);
  });
}

/* =============================================
   SECTION 10: Convert Button
   ============================================= */
convertBtn.addEventListener('click', handleConvert);

// Also trigger on Enter key from the input
tempInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') handleConvert();
});

/**
 * Main handler for the Convert button click.
 */
function handleConvert() {
  const { valid, value } = validateInput();
  if (!valid) return;

  // Loading animation (short artificial delay feels premium)
  convertBtn.classList.add('loading');
  convertBtn.disabled = true;

  setTimeout(() => {
    convertBtn.classList.remove('loading');
    convertBtn.disabled = false;
    performConversion(value, { addHistory: true });
    showToast(`Converted to ${state.lastResult.text}`, 'success');
  }, 420);
}

/* =============================================
   SECTION 11: Copy to Clipboard
   ============================================= */
copyBtn.addEventListener('click', async () => {
  if (!state.lastResult) return;

  try {
    await navigator.clipboard.writeText(state.lastResult.text);
    showToast('Copied to clipboard!', 'success');

    // Visual feedback
    copyBtn.style.color = 'var(--success)';
    copyBtn.style.borderColor = 'var(--success)';
    setTimeout(() => {
      copyBtn.style.color = '';
      copyBtn.style.borderColor = '';
    }, 1500);
  } catch {
    // Fallback for older browsers
    const tmp = document.createElement('textarea');
    tmp.value = state.lastResult.text;
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);
    showToast('Copied to clipboard!', 'success');
  }
});

/* =============================================
   SECTION 12: History
   ============================================= */
const HISTORY_KEY = 'thermoconvert_history';

/**
 * Add a new item to conversion history.
 */
function addToHistory(inputVal, outputVal) {
  const item = {
    id: Date.now(),
    from: inputVal,
    fromUnit: state.fromUnit,
    to: outputVal,
    toUnit: state.toUnit,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  state.history.unshift(item);

  // Cap history at 20 items
  if (state.history.length > 20) state.history.pop();

  saveHistory();
  renderHistory();
}

/**
 * Save history to localStorage.
 */
function saveHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
  } catch { /* storage unavailable */ }
}

/**
 * Load history from localStorage.
 */
function loadHistory() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) state.history = JSON.parse(saved);
  } catch { /* ignore */ }
}

/**
 * Render the history list.
 */
function renderHistory() {
  // Remove all items except the empty placeholder
  Array.from(historyList.querySelectorAll('.history-item')).forEach(el => el.remove());

  if (state.history.length === 0) {
    historyEmpty.style.display = '';
    return;
  }

  historyEmpty.style.display = 'none';

  state.history.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.style.animationDelay = `${idx * 0.04}s`;
    li.setAttribute('aria-label',
      `${item.from.toFixed(2)} ${UNITS[item.fromUnit].symbol} equals ${item.to.toFixed(2)} ${UNITS[item.toUnit].symbol} at ${item.time}`
    );
    li.innerHTML = `
      <div class="history-item-main">
        <span class="history-from">${item.from.toFixed(2)} ${UNITS[item.fromUnit].symbol}</span>
        <span class="history-arrow">→</span>
        <span class="history-to">${item.to.toFixed(2)} ${UNITS[item.toUnit].symbol}</span>
      </div>
      <span class="history-time">${item.time}</span>
    `;
    historyList.appendChild(li);
  });
}

/**
 * Clear all history.
 */
clearHistoryBtn.addEventListener('click', () => {
  if (state.history.length === 0) return;
  state.history = [];
  saveHistory();
  renderHistory();
  showToast('History cleared', 'info');
});

/* =============================================
   SECTION 13: Theme Toggle
   ============================================= */
const THEME_KEY = 'thermoconvert_theme';

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
}

themeToggle.addEventListener('click', () => {
  setTheme(state.theme === 'dark' ? 'light' : 'dark');
});

function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) setTheme(saved);
  } catch { /* ignore */ }
}

/* =============================================
   SECTION 14: Toast Notifications
   ============================================= */

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {number} duration  - ms before auto-dismiss
 */
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `<span class="toast-dot"></span><span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

/* =============================================
   SECTION 15: Date/Time Header
   ============================================= */

/**
 * Update the header datetime display.
 */
function updateDateTime() {
  const now = new Date();
  const dateStr = now.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  datetimeDisplay.innerHTML = `${dateStr}<br>${timeStr}`;
}

/* =============================================
   SECTION 16: Footer Year
   ============================================= */
footerYear.textContent = new Date().getFullYear();

/* =============================================
   SECTION 17: Keyboard Shortcut
   ============================================= */
document.addEventListener('keydown', e => {
  // Ctrl/Cmd + K focuses the input
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    tempInput.focus();
    tempInput.select();
  }
});

/* =============================================
   SECTION 18: Init
   ============================================= */

function init() {
  loadTheme();
  loadHistory();
  renderHistory();
  updateUnitBadge();
  updateUnitButtons();
  updateDateTime();

  // Tick the clock every second
  setInterval(updateDateTime, 1000);

  // Focus the input on load (desktop only)
  if (window.innerWidth >= 768) {
    tempInput.focus();
  }
}

init();
