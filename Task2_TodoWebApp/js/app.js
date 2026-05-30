/**
 * ═══════════════════════════════════════════════════
 *  TASKFLOW — app.js
 *  Premium Task Manager Application
 * ═══════════════════════════════════════════════════
 */

'use strict';

/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
let tasks      = [];           // Array of task objects
let currentFilter = 'all';    // 'all' | 'pending' | 'completed'
let searchQuery   = '';
let selectedPriority = 'medium';
let pendingDeleteId  = null;
let editingTaskId    = null;
let dragSrcEl        = null;

const STORAGE_KEY       = 'taskflow_tasks_v2';
const THEME_KEY         = 'taskflow_theme';
const MOTIVATIONAL      = [
  'Stay productive today! 🚀',
  'One task at a time — you got this! 💪',
  'Progress over perfection! ✨',
  'Great job completing tasks! 🎉',
  'Keep the momentum going! ⚡',
  'Small steps lead to big wins! 🏆',
];

/* ══════════════════════════════════════════
   DOM REFS
══════════════════════════════════════════ */
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

const taskInput       = $('task-input');
const addBtn          = $('add-btn');
const fab             = $('fab');
const searchInput     = $('search-input');
const clearSearchBtn  = $('clear-search');
const pendingList     = $('pending-list');
const completedList   = $('completed-list');
const pendingEmpty    = $('pending-empty');
const completedEmpty  = $('completed-empty');
const pendingCount    = $('pending-count');
const completedCount  = $('completed-count');
const progressFill    = $('progress-bar-fill');
const progressLabel   = $('progress-bar-label');
const ringFill        = $('ring-fill');
const ringPct         = $('ring-pct');
const statTotal       = $('stat-total');
const statPending     = $('stat-pending');
const statDone        = $('stat-done');
const liveClock       = $('live-clock');
const motivMsg        = $('motivational-msg');
const themeToggle     = $('theme-toggle');
const themeIcon       = $('theme-icon');
const themeLabel      = $('theme-label');
const toastContainer  = $('toast-container');
const confettiCanvas  = $('confetti-canvas');
const confirmModal    = $('confirm-modal');
const confirmOk       = $('confirm-ok');
const confirmCancel   = $('confirm-cancel');
const editModal       = $('edit-modal');
const editTextarea    = $('edit-textarea');
const editSave        = $('edit-save');
const editCancel      = $('edit-cancel');
const editClose       = $('edit-close');
const hamburger       = $('hamburger');
const sidebar         = $('sidebar');
const badgeAll        = $('badge-all');
const badgePending    = $('badge-pending');
const badgeCompleted  = $('badge-completed');

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
function init() {
  injectSvgDefs();
  loadTheme();
  loadTasks();
  renderAll();
  startClock();
  rotateMotivational();
  bindEvents();
}

/* ══════════════════════════════════════════
   SVG GRADIENT DEFS (for progress ring)
══════════════════════════════════════════ */
function injectSvgDefs() {
  const div = document.createElement('div');
  div.className = 'svg-defs';
  div.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="#6C63FF" />
          <stop offset="100%" stop-color="#FF6584" />
        </linearGradient>
      </defs>
    </svg>`;
  document.body.prepend(div);
}

/* ══════════════════════════════════════════
   THEME
══════════════════════════════════════════ */
function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved, false);
}

function applyTheme(theme, save = true) {
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    themeIcon.className  = 'fa-solid fa-moon';
    themeLabel.textContent = 'Dark Mode';
  } else {
    themeIcon.className  = 'fa-solid fa-sun';
    themeLabel.textContent = 'Light Mode';
  }
  if (save) localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}

/* ══════════════════════════════════════════
   CLOCK
══════════════════════════════════════════ */
function startClock() {
  const tick = () => {
    const now = new Date();
    liveClock.textContent = now.toLocaleTimeString([], { hour12: false });
  };
  tick();
  setInterval(tick, 1000);
}

/* ══════════════════════════════════════════
   MOTIVATIONAL MESSAGES
══════════════════════════════════════════ */
function rotateMotivational() {
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % MOTIVATIONAL.length;
    motivMsg.style.opacity = '0';
    setTimeout(() => {
      motivMsg.textContent = MOTIVATIONAL[idx];
      motivMsg.style.opacity = '1';
    }, 300);
  }, 8000);
  motivMsg.style.transition = 'opacity 0.3s';
}

/* ══════════════════════════════════════════
   LOCAL STORAGE
══════════════════════════════════════════ */
function loadTasks() {
  try {
    tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { tasks = []; }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/* ══════════════════════════════════════════
   TASK CRUD
══════════════════════════════════════════ */

/** Create a new task object */
function createTask(text, priority) {
  const now = new Date();
  return {
    id:          Date.now().toString(36) + Math.random().toString(36).slice(2),
    text:        text.trim(),
    priority:    priority,
    completed:   false,
    createdAt:   now.toISOString(),
    completedAt: null,
  };
}

/** Add task from input */
function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.classList.add('shake');
    taskInput.addEventListener('animationend', () => taskInput.classList.remove('shake'), { once: true });
    showToast('Please enter a task!', 'error');
    taskInput.focus();
    return;
  }

  const task = createTask(text, selectedPriority);
  tasks.unshift(task);
  saveTasks();
  taskInput.value = '';
  renderAll();
  showToast('Task added successfully! ✅', 'success');
  taskInput.focus();
}

/** Toggle complete/pending */
function toggleComplete(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date().toISOString() : null;
  saveTasks();
  renderAll();
  if (task.completed) {
    showToast('Task completed! 🎉', 'success');
    launchConfetti();
  } else {
    showToast('Task moved back to pending ↩️', 'info');
  }
}

/** Open delete confirmation */
function confirmDelete(id) {
  pendingDeleteId = id;
  openModal(confirmModal);
}

/** Actually delete */
function deleteTask(id) {
  const el = document.querySelector(`[data-id="${id}"]`);
  if (el) {
    el.style.animation = 'removeCard 0.3s forwards';
    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      renderAll();
    }, 280);
  } else {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderAll();
  }
  showToast('Task deleted 🗑️', 'warning');
}

/** Open edit modal */
function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingTaskId = id;
  editTextarea.value = task.text;

  // Set priority radio
  const radios = editModal.querySelectorAll('input[name="edit-priority"]');
  radios.forEach(r => { r.checked = (r.value === task.priority); });

  openModal(editModal);
  setTimeout(() => editTextarea.focus(), 100);
}

/** Save edit */
function saveEdit() {
  const task = tasks.find(t => t.id === editingTaskId);
  if (!task) return;

  const newText = editTextarea.value.trim();
  if (!newText) { showToast('Task cannot be empty!', 'error'); return; }

  const radios = editModal.querySelectorAll('input[name="edit-priority"]');
  let newPriority = task.priority;
  radios.forEach(r => { if (r.checked) newPriority = r.value; });

  task.text     = newText;
  task.priority = newPriority;
  saveTasks();
  renderAll();
  closeModal(editModal);
  editingTaskId = null;
  showToast('Task updated ✏️', 'info');
}

/* ══════════════════════════════════════════
   FILTER & SEARCH
══════════════════════════════════════════ */
function getFilteredTasks() {
  let list = [...tasks];

  // Search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(t => t.text.toLowerCase().includes(q));
  }

  // Filter
  if (currentFilter === 'pending')   list = list.filter(t => !t.completed);
  if (currentFilter === 'completed') list = list.filter(t =>  t.completed);

  return list;
}

/* ══════════════════════════════════════════
   RENDER
══════════════════════════════════════════ */
function renderAll() {
  const filtered = getFilteredTasks();
  const pending   = filtered.filter(t => !t.completed);
  const completed = filtered.filter(t =>  t.completed);

  renderList(pendingList,   pending,   'pending');
  renderList(completedList, completed, 'completed');

  updateEmptyStates(pending, completed);
  updateStats();
}

function renderList(container, items, status) {
  // Keep existing cards that still belong, animate-out removed ones
  const existing = new Map(
    [...container.querySelectorAll('.task-card')].map(el => [el.dataset.id, el])
  );

  // Remove stale
  existing.forEach((el, id) => {
    if (!items.find(t => t.id === id)) {
      el.style.animation = 'removeCard 0.25s forwards';
      setTimeout(() => el.remove(), 240);
    }
  });

  // Build ordered fragment
  const frag = document.createDocumentFragment();
  items.forEach(task => {
    if (existing.has(task.id)) {
      // Update in-place (text/priority may have changed)
      const el = existing.get(task.id);
      updateCardInPlace(el, task);
      frag.appendChild(el);
    } else {
      frag.appendChild(buildCard(task));
    }
  });
  container.innerHTML = '';
  container.appendChild(frag);
}

/** Build a task card DOM element */
function buildCard(task) {
  const card = document.createElement('div');
  card.className = `task-card${task.completed ? ' completed-card' : ''}`;
  card.dataset.id       = task.id;
  card.dataset.priority = task.priority;
  card.draggable = true;

  card.innerHTML = `
    <button class="task-check" aria-label="${task.completed ? 'Mark pending' : 'Mark complete'}">
      ${task.completed ? '<i class="fa-solid fa-check"></i>' : ''}
    </button>
    <div class="task-body">
      <div class="task-text">${escHtml(task.text)}</div>
      <div class="task-meta">
        <span class="priority-badge ${task.priority}">${capFirst(task.priority)}</span>
        <span class="meta-tag"><i class="fa-regular fa-calendar"></i>${fmtDate(task.createdAt)}</span>
        <span class="meta-tag"><i class="fa-regular fa-clock"></i>${fmtTime(task.createdAt)}</span>
        ${task.completed && task.completedAt
          ? `<span class="meta-tag"><i class="fa-solid fa-circle-check"></i>Done ${fmtDate(task.completedAt)} ${fmtTime(task.completedAt)}</span>`
          : ''}
      </div>
    </div>
    <div class="task-actions">
      <button class="icon-btn edit"   title="Edit task"   aria-label="Edit task">
        <i class="fa-solid fa-pen"></i>
      </button>
      ${task.completed
        ? `<button class="icon-btn undo" title="Move to pending" aria-label="Undo complete">
             <i class="fa-solid fa-rotate-left"></i>
           </button>`
        : ''}
      <button class="icon-btn delete" title="Delete task"  aria-label="Delete task">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>`;

  // Events
  card.querySelector('.task-check').addEventListener('click', () => toggleComplete(task.id));
  card.querySelector('.icon-btn.edit').addEventListener('click', () => openEditModal(task.id));
  card.querySelector('.icon-btn.delete').addEventListener('click', () => confirmDelete(task.id));
  if (task.completed) {
    card.querySelector('.icon-btn.undo').addEventListener('click', () => toggleComplete(task.id));
  }

  // Drag
  card.addEventListener('dragstart', onDragStart);
  card.addEventListener('dragend',   onDragEnd);
  card.addEventListener('dragover',  onDragOver);
  card.addEventListener('dragleave', onDragLeave);
  card.addEventListener('drop',      onDrop);

  return card;
}

/** Sync existing card DOM with updated task data */
function updateCardInPlace(el, task) {
  el.dataset.priority = task.priority;
  el.className = `task-card${task.completed ? ' completed-card' : ''}`;

  const textEl   = el.querySelector('.task-text');
  const metaEl   = el.querySelector('.task-meta');
  const checkEl  = el.querySelector('.task-check');
  const actionsEl = el.querySelector('.task-actions');

  if (textEl)  textEl.textContent = task.text;
  if (checkEl) {
    checkEl.innerHTML = task.completed ? '<i class="fa-solid fa-check"></i>' : '';
    checkEl.setAttribute('aria-label', task.completed ? 'Mark pending' : 'Mark complete');
  }
  if (metaEl) {
    metaEl.innerHTML = `
      <span class="priority-badge ${task.priority}">${capFirst(task.priority)}</span>
      <span class="meta-tag"><i class="fa-regular fa-calendar"></i>${fmtDate(task.createdAt)}</span>
      <span class="meta-tag"><i class="fa-regular fa-clock"></i>${fmtTime(task.createdAt)}</span>
      ${task.completed && task.completedAt
        ? `<span class="meta-tag"><i class="fa-solid fa-circle-check"></i>Done ${fmtDate(task.completedAt)} ${fmtTime(task.completedAt)}</span>`
        : ''}`;
  }
  if (actionsEl) {
    actionsEl.innerHTML = `
      <button class="icon-btn edit"  title="Edit"   aria-label="Edit task"><i class="fa-solid fa-pen"></i></button>
      ${task.completed
        ? `<button class="icon-btn undo" title="Undo" aria-label="Undo complete"><i class="fa-solid fa-rotate-left"></i></button>`
        : ''}
      <button class="icon-btn delete" title="Delete" aria-label="Delete task"><i class="fa-solid fa-trash"></i></button>`;

    actionsEl.querySelector('.icon-btn.edit').addEventListener('click', () => openEditModal(task.id));
    actionsEl.querySelector('.icon-btn.delete').addEventListener('click', () => confirmDelete(task.id));
    const undoBtn = actionsEl.querySelector('.icon-btn.undo');
    if (undoBtn) undoBtn.addEventListener('click', () => toggleComplete(task.id));
  }

  // Re-bind check
  const newCheck = el.querySelector('.task-check');
  const freshCheck = newCheck.cloneNode(true);
  newCheck.parentNode.replaceChild(freshCheck, newCheck);
  freshCheck.addEventListener('click', () => toggleComplete(task.id));
}

/** Update empty states visibility */
function updateEmptyStates(pending, completed) {
  pendingEmpty.classList.toggle('hidden', pending.length > 0);
  completedEmpty.classList.toggle('hidden', completed.length > 0);
  pendingCount.textContent   = pending.length;
  completedCount.textContent = completed.length;

  // Show/hide sections when filtered
  const showPending   = currentFilter !== 'completed';
  const showCompleted = currentFilter !== 'pending';
  $('pending-section').style.display   = showPending   ? '' : 'none';
  $('completed-section').style.display = showCompleted ? '' : 'none';
}

/** Update stat widgets */
function updateStats() {
  const total     = tasks.length;
  const done      = tasks.filter(t => t.completed).length;
  const pending   = total - done;
  const pct       = total === 0 ? 0 : Math.round((done / total) * 100);

  statTotal.textContent   = total;
  statPending.textContent = pending;
  statDone.textContent    = done;
  badgeAll.textContent      = total;
  badgePending.textContent  = pending;
  badgeCompleted.textContent= done;

  progressFill.style.width  = `${pct}%`;
  progressLabel.textContent = `${done} of ${total} completed`;

  ringPct.textContent = `${pct}%`;
  const circumference = 201;
  const offset = circumference - (pct / 100) * circumference;
  ringFill.style.strokeDashoffset = offset;
}

/* ══════════════════════════════════════════
   DRAG & DROP REORDER
══════════════════════════════════════════ */
function onDragStart(e) {
  dragSrcEl = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.id);
}
function onDragEnd() {
  this.classList.remove('dragging');
  $$('.task-card.drag-over').forEach(el => el.classList.remove('drag-over'));
  dragSrcEl = null;
}
function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (this !== dragSrcEl) this.classList.add('drag-over');
}
function onDragLeave() { this.classList.remove('drag-over'); }
function onDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  if (!dragSrcEl || dragSrcEl === this) return;

  const srcId  = dragSrcEl.dataset.id;
  const dstId  = this.dataset.id;
  const srcIdx = tasks.findIndex(t => t.id === srcId);
  const dstIdx = tasks.findIndex(t => t.id === dstId);

  // Only allow reorder within same status group
  if (tasks[srcIdx].completed !== tasks[dstIdx].completed) return;

  const [removed] = tasks.splice(srcIdx, 1);
  tasks.splice(dstIdx, 0, removed);
  saveTasks();
  renderAll();
}

/* ══════════════════════════════════════════
   MODAL HELPERS
══════════════════════════════════════════ */
function openModal(modal)  { modal.classList.add('open');  }
function closeModal(modal) { modal.classList.remove('open'); }

/* ══════════════════════════════════════════
   TOAST NOTIFICATIONS
══════════════════════════════════════════ */
const toastIcons = {
  success: 'fa-circle-check',
  error:   'fa-circle-xmark',
  info:    'fa-circle-info',
  warning: 'fa-triangle-exclamation',
};

function showToast(message, type = 'info', duration = 3200) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${toastIcons[type]} toast-icon"></i>
    <span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

/* ══════════════════════════════════════════
   CONFETTI
══════════════════════════════════════════ */
function launchConfetti() {
  const canvas = confettiCanvas;
  const ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#6C63FF','#FF6584','#26D0A0','#FF9F43','#8B5CF6','#FCD34D'];
  const pieces = Array.from({ length: 90 }, () => ({
    x:    Math.random() * canvas.width,
    y:    Math.random() * -canvas.height,
    w:    6 + Math.random() * 8,
    h:    10 + Math.random() * 10,
    r:    Math.random() * Math.PI * 2,
    dr:   (Math.random() - 0.5) * 0.15,
    dy:   3 + Math.random() * 4,
    dx:   (Math.random() - 0.5) * 2.5,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  let frame;
  const DURATION = 2400;
  const startTime = performance.now();

  const tick = (now) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const elapsed = now - startTime;
    const progress = elapsed / DURATION;
    pieces.forEach(p => {
      p.y  += p.dy;
      p.x  += p.dx;
      p.r  += p.dr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - progress * 1.4);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (elapsed < DURATION) {
      frame = requestAnimationFrame(tick);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(frame);
    }
  };
  requestAnimationFrame(tick);
}

/* ══════════════════════════════════════════
   UTILITY HELPERS
══════════════════════════════════════════ */
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function capFirst(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ══════════════════════════════════════════
   SHAKE ANIMATION (CSS)
══════════════════════════════════════════ */
(function addShakeStyle() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-6px)}
      40%{transform:translateX(6px)}
      60%{transform:translateX(-4px)}
      80%{transform:translateX(4px)}
    }
    .shake { animation: shake 0.4s ease; }
  `;
  document.head.appendChild(style);
})();

/* ══════════════════════════════════════════
   EVENT BINDINGS
══════════════════════════════════════════ */
function bindEvents() {

  // ── ADD TASK ──────────────────────────
  addBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
  fab.addEventListener('click', () => {
    taskInput.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => taskInput.focus(), 350);
  });

  // ── PRIORITY BUTTONS ─────────────────
  $$('.priority-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.priority-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      selectedPriority = btn.dataset.p;
    });
  });

  // ── SEARCH ───────────────────────────
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.trim();
    clearSearchBtn.classList.toggle('hidden', !searchQuery);
    renderAll();
  });
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    renderAll();
    searchInput.focus();
  });

  // ── FILTER CHIPS ─────────────────────
  $$('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      syncNavFilter(currentFilter);
      renderAll();
    });
  });

  // ── SIDEBAR NAV FILTER ───────────────
  $$('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      $$('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentFilter = item.dataset.filter;
      syncChipFilter(currentFilter);
      renderAll();
    });
  });

  // ── THEME TOGGLE ─────────────────────
  themeToggle.addEventListener('click', toggleTheme);

  // ── CONFIRM MODAL ────────────────────
  confirmOk.addEventListener('click', () => {
    if (pendingDeleteId) deleteTask(pendingDeleteId);
    pendingDeleteId = null;
    closeModal(confirmModal);
  });
  confirmCancel.addEventListener('click', () => {
    pendingDeleteId = null;
    closeModal(confirmModal);
  });

  // ── EDIT MODAL ───────────────────────
  editSave.addEventListener('click', saveEdit);
  editCancel.addEventListener('click', () => { closeModal(editModal); editingTaskId = null; });
  editClose.addEventListener('click',  () => { closeModal(editModal); editingTaskId = null; });
  editTextarea.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.ctrlKey) saveEdit();
  });

  // ── KEYBOARD SHORTCUTS ───────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal(confirmModal);
      closeModal(editModal);
      editingTaskId = null;
      pendingDeleteId = null;
    }
  });

  // ── HAMBURGER (MOBILE) ───────────────
  let overlay = null;
  hamburger.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    if (open) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay active';
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.remove();
        overlay = null;
      });
      document.body.appendChild(overlay);
    } else if (overlay) {
      overlay.remove();
      overlay = null;
    }
  });

  // ── RESIZE: fix canvas ───────────────
  window.addEventListener('resize', () => {
    confettiCanvas.width  = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  });
}

/** Keep nav-items and chips in sync */
function syncNavFilter(filter) {
  $$('.nav-item').forEach(i => {
    i.classList.toggle('active', i.dataset.filter === filter);
  });
}
function syncChipFilter(filter) {
  $$('.chip').forEach(c => {
    c.classList.toggle('active', c.dataset.filter === filter);
  });
}

/* ══════════════════════════════════════════
   KICK OFF
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', init);
