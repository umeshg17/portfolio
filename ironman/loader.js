const STORAGE_KEY = 'ironman-dashboard-v1';
const PIN_SESSION_KEY = 'ironman-pin';
const SYNC_DEBOUNCE_MS = 400;
const BOTTLE_COOLDOWN_MS = 6 * 60 * 60 * 1000; // 6 hours between bottle finishes

const ICONS = {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
  morning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20h16M6 20V10l6-6 6 6v10"/><path d="M10 20v-4h4v4"/></svg>',
  breakfast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><path d="M6 1v3M10 1v3M14 1v3"/></svg>',
  office: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  lunch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>',
  afternoon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/></svg>',
  workout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11M4 9v6M2 10v4M20 9v6M22 10v4"/></svg>',
  recover: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v6l3 2"/><path d="M12 21a9 9 0 100-18 9 9 0 000 18z"/></svg>',
  dinner: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 21a9 9 0 100-18"/><path d="M12 3c2 3.5 2 7.5 0 11s-2 7.5 0 7"/></svg>',
  night: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 14.5A8.5 8.5 0 1110.5 3 7 7 0 0021 14.5z"/></svg>',
  sleep: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 18h18M5 18V10l7-5 7 5v8"/><path d="M9 18v-4h6v4"/></svg>',
  protein: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>',
  water: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3s6 6.5 6 11a6 6 0 11-12 0c0-4.5 6-11 6-11z"/></svg>',
  veg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22V11M12 11C8 11 5 8 5 5c4 0 7 3 7 6zm0 0c4 0 7-3 7-6-4 0-7 3-7 6z"/></svg>',
  fruit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4c-2 0-3 1.5-3 1.5S7 4 5.5 5.5 5 9 7 11c1.5 1.5 3 2 5 7 2-5 3.5-5.5 5-7 2-2 1.5-4 .5-5.5S14 4 12 4z"/><path d="M12 4c0-1.5 1-2.5 2.5-3"/></svg>',
  steps: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 16l3-8 3 4 3-8 3 8 3-4 1 8"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>',
};

function icon(name) {
  return ICONS[name] || ICONS.sun;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function apiBaseUrl() {
  const base = (window.IRONMAN_API && window.IRONMAN_API.baseUrl) || '';
  return String(base).replace(/\/$/, '');
}

function apiConfigured() {
  return !!apiBaseUrl();
}

function getSessionPin() {
  try {
    return sessionStorage.getItem(PIN_SESSION_KEY) || '';
  } catch {
    return '';
  }
}

function setSessionPin(pin) {
  sessionStorage.setItem(PIN_SESSION_KEY, pin);
}

function clearSessionPin() {
  try {
    sessionStorage.removeItem(PIN_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

function defaultState(targets) {
  const progress = {};
  (targets.items || []).forEach((t) => {
    progress[t.id] = t.default ?? 0;
  });
  return {
    day: todayKey(),
    checks: {},
    progress,
    waterLog: [],
    lastBottleFinishedAt: null,
    workoutIndex: 0,
    openSections: {},
    review: {},
    workoutDoneToday: false,
    completedWorkoutIndex: null,
    updatedAt: null,
  };
}

function readLocalRaw() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function loadLocalState(targets) {
  const state = readLocalRaw();
  const base = defaultState(targets);
  if (!state) return base;

  // Preserve cycle + review + last bottle time across days; reset daily checks/progress.
  if (state.day !== todayKey()) {
    return {
      ...base,
      workoutIndex: state.workoutIndex ?? 0,
      review: state.review || {},
      lastBottleFinishedAt: state.lastBottleFinishedAt || null,
      openSections: {},
      updatedAt: state.updatedAt || null,
    };
  }
  return {
    ...base,
    ...state,
    progress: { ...base.progress, ...(state.progress || {}) },
    checks: state.checks || {},
    waterLog: Array.isArray(state.waterLog) ? state.waterLog : [],
    lastBottleFinishedAt: state.lastBottleFinishedAt || null,
    openSections: state.openSections || {},
    review: state.review || {},
    updatedAt: state.updatedAt || null,
  };
}

function saveLocalState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function mergeServerState(targets, remote) {
  const base = defaultState(targets);
  const meta = remote?.meta || {};
  const day = remote?.day || {};
  return {
    ...base,
    day: day.day || todayKey(),
    checks: day.checks || {},
    progress: { ...base.progress, ...(day.progress || {}) },
    waterLog: Array.isArray(day.waterLog) ? day.waterLog : [],
    openSections: day.openSections || {},
    workoutDoneToday: !!day.workoutDoneToday,
    completedWorkoutIndex:
      day.completedWorkoutIndex == null ? null : day.completedWorkoutIndex,
    workoutIndex: meta.workoutIndex ?? 0,
    review: meta.review || {},
    lastBottleFinishedAt: meta.lastBottleFinishedAt || null,
    updatedAt: newerTimestamp(meta.updatedAt, day.updatedAt),
  };
}

function newerTimestamp(a, b) {
  if (!a) return b || null;
  if (!b) return a;
  return a >= b ? a : b;
}

function statePayload(state) {
  return {
    day: state.day,
    checks: state.checks || {},
    progress: state.progress || {},
    waterLog: Array.isArray(state.waterLog) ? state.waterLog : [],
    openSections: state.openSections || {},
    workoutDoneToday: !!state.workoutDoneToday,
    completedWorkoutIndex:
      state.completedWorkoutIndex == null ? null : state.completedWorkoutIndex,
    workoutIndex: state.workoutIndex ?? 0,
    review: state.review || {},
    lastBottleFinishedAt: state.lastBottleFinishedAt || null,
  };
}

function formatClock(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatBottleStamp(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const day = todayKey();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const time = formatClock(iso);
  if (key === day) return `Today ${time}`;
  if (key === yesterday) return `Yesterday ${time}`;
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function bottleCooldownRemainingMs(lastIso) {
  if (!lastIso) return 0;
  const last = new Date(lastIso).getTime();
  if (Number.isNaN(last)) return 0;
  const remaining = last + BOTTLE_COOLDOWN_MS - Date.now();
  return remaining > 0 ? remaining : 0;
}

function formatDuration(ms) {
  const totalMin = Math.ceil(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function newWaterLogId() {
  return `wb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

async function apiRequest(path, { method = 'GET', body, pin } = {}) {
  const base = apiBaseUrl();
  if (!base) throw new Error('API not configured');
  const headers = {
    Authorization: `Bearer ${pin}`,
  };
  if (body != null) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function fetchRemoteState(pin, day) {
  return apiRequest(`/state?day=${encodeURIComponent(day)}`, { pin });
}

async function putRemoteState(pin, state) {
  return apiRequest('/state', {
    method: 'PUT',
    pin,
    body: statePayload(state),
  });
}

/**
 * Prefer newer server state; if local is newer (or server empty), keep local
 * and mark for upload (first-run migration / offline catch-up).
 */
function resolveBootState(targets, local, remote) {
  const serverState = mergeServerState(targets, remote);
  const serverTs = serverState.updatedAt;
  const localTs = local.updatedAt;
  const serverHasDayData =
    Object.keys(serverState.checks || {}).length > 0 ||
    Object.values(serverState.progress || {}).some((v) => Number(v) > 0) ||
    (serverState.waterLog || []).length > 0 ||
    serverState.workoutDoneToday ||
    !!serverTs;

  if (!serverHasDayData && (localTs || localHasMeaningfulData(local))) {
    return { state: { ...local, day: todayKey() }, shouldUpload: true };
  }
  if (localTs && serverTs && localTs > serverTs) {
    return { state: { ...local, day: todayKey() }, shouldUpload: true };
  }
  if (localTs && !serverTs && local.day === todayKey() && localHasMeaningfulData(local)) {
    return { state: { ...local, day: todayKey() }, shouldUpload: true };
  }
  return { state: serverState, shouldUpload: false };
}

function localHasMeaningfulData(local) {
  return (
    Object.keys(local.checks || {}).length > 0 ||
    Object.values(local.progress || {}).some((v) => Number(v) > 0) ||
    (local.waterLog || []).length > 0
  );
}

function setSyncStatus(text, isError) {
  const el = document.getElementById('sync-status');
  if (!el) return;
  el.textContent = text || '';
  el.classList.toggle('err', !!isError);
}

function formatValue(item, value) {
  const decimals = item.decimals ?? (Number.isInteger(item.step) ? 0 : 2);
  const n = Number(value) || 0;
  if (item.display === 'hours') {
    const totalMin = Math.round(n * 60);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (!n) return '0h';
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  const fixed = decimals > 0 ? n.toFixed(decimals).replace(/\.?0+$/, '') : String(Math.round(n));
  return fixed;
}

function formatGoal(item) {
  if (item.display === 'hours') return `${item.goal}h`;
  const decimals = item.decimals ?? (Number.isInteger(item.step) ? 0 : 2);
  if (decimals > 0) return String(item.goal);
  return String(item.goal);
}

async function loadJson(path) {
  const res = await fetch(`${path}?v=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

function readUnlockPin() {
  const inputs = [...document.querySelectorAll('#unlock-pin input')];
  return inputs.map((i) => i.value).join('');
}

function setUnlockError(msg) {
  const el = document.getElementById('unlock-error');
  if (el) el.textContent = msg || '';
}

function setupUnlockForm() {
  const form = document.getElementById('unlock-form');
  const inputs = [...document.querySelectorAll('#unlock-pin input')];
  const submit = document.getElementById('unlock-submit');
  let resolvePin = null;

  const refreshSubmit = () => {
    submit.disabled = readUnlockPin().length !== 4;
  };

  inputs.forEach((input, idx) => {
    input.addEventListener('input', () => {
      const digit = input.value.replace(/\D/g, '').slice(-1);
      input.value = digit;
      setUnlockError('');
      if (digit && idx < inputs.length - 1) inputs[idx + 1].focus();
      refreshSubmit();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && idx > 0) {
        inputs[idx - 1].focus();
      }
    });
    input.addEventListener('paste', (e) => {
      const text = (e.clipboardData || window.clipboardData).getData('text') || '';
      const digits = text.replace(/\D/g, '').slice(0, 4);
      if (digits.length < 2) return;
      e.preventDefault();
      digits.split('').forEach((d, i) => {
        if (inputs[i]) inputs[i].value = d;
      });
      const focusIdx = Math.min(digits.length, inputs.length - 1);
      inputs[focusIdx].focus();
      refreshSubmit();
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = readUnlockPin();
    if (pin.length !== 4 || !resolvePin) return;
    const done = resolvePin;
    resolvePin = null;
    done(pin);
  });

  return {
    waitForPin() {
      refreshSubmit();
      inputs[0]?.focus();
      return new Promise((resolve) => {
        resolvePin = resolve;
      });
    },
  };
}

async function unlockWithPin(pin) {
  setUnlockError('');
  const submit = document.getElementById('unlock-submit');
  submit.disabled = true;
  submit.textContent = 'Checking…';
  try {
    await fetchRemoteState(pin, todayKey());
    setSessionPin(pin);
    return true;
  } catch (err) {
    if (err.status === 401) {
      setUnlockError('Incorrect PIN');
      clearSessionPin();
      document.querySelectorAll('#unlock-pin input').forEach((i) => {
        i.value = '';
      });
      document.querySelector('#unlock-pin input')?.focus();
    } else {
      setUnlockError(err.message || 'Could not reach API');
    }
    return false;
  } finally {
    submit.textContent = 'Unlock';
    submit.disabled = readUnlockPin().length !== 4;
  }
}

async function ensureUnlocked() {
  if (!apiConfigured()) return null;

  const gate = document.getElementById('unlock-gate');
  gate.hidden = false;

  let pin = getSessionPin();
  if (pin.length === 4) {
    try {
      await fetchRemoteState(pin, todayKey());
      gate.hidden = true;
      return pin;
    } catch (err) {
      if (err.status === 401) clearSessionPin();
    }
  }

  const unlockForm = setupUnlockForm();
  while (true) {
    const entered = await unlockForm.waitForPin();
    if (await unlockWithPin(entered)) {
      gate.hidden = true;
      return entered;
    }
  }
}

async function boot() {
  const titleEl = document.getElementById('title');
  const appShell = document.getElementById('app-shell');
  try {
    const pin = await ensureUnlocked();
    appShell.hidden = false;

    const [meta, targets, routine, workouts, milestones, mobility] = await Promise.all([
      loadJson('data/meta.json'),
      loadJson('data/targets.json'),
      loadJson('data/routine.json'),
      loadJson('data/workouts.json'),
      loadJson('data/milestones.json'),
      loadJson('data/mobility.json'),
    ]);

    const local = loadLocalState(targets);
    let initialState = local;
    let shouldUpload = false;

    if (apiConfigured() && pin) {
      setSyncStatus('Syncing…');
      try {
        const remote = await fetchRemoteState(pin, todayKey());
        const resolved = resolveBootState(targets, local, remote);
        initialState = resolved.state;
        shouldUpload = resolved.shouldUpload;
        setSyncStatus('Synced');
      } catch (err) {
        console.error(err);
        setSyncStatus('Offline · local cache', true);
      }
    } else {
      setSyncStatus(apiConfigured() ? '' : 'Local only');
    }

    const app = new Dashboard({
      meta,
      targets,
      routine,
      workouts,
      milestones,
      mobility,
      state: initialState,
      pin,
    });
    app.render();

    if (shouldUpload && pin) {
      app.persist({ forceUpload: true });
    }
  } catch (err) {
    console.error(err);
    appShell.hidden = false;
    titleEl.className = 'error';
    titleEl.textContent = 'Could not load dashboard data';
    document.getElementById('subtitle').textContent =
      'Open via a local HTTP server (not file://), or check the console.';
  }
}

class Dashboard {
  constructor(data) {
    this.meta = data.meta;
    this.targets = data.targets;
    this.routine = data.routine;
    this.workouts = data.workouts;
    this.milestones = data.milestones;
    this.mobility = data.mobility || { routines: {} };
    this.state = data.state || loadLocalState(this.targets);
    this.pin = data.pin || null;
    this._bound = false;
    this._syncTimer = null;
    this._syncing = false;
  }

  workoutAt(index) {
    const items = this.workouts.items || [];
    if (!items.length) return null;
    const i = ((index % items.length) + items.length) % items.length;
    return items[i];
  }

  get currentWorkout() {
    return this.workoutAt(this.state.workoutIndex);
  }

  get nextWorkout() {
    return this.workoutAt(this.state.workoutIndex + 1);
  }

  /** Workout shown in today's timeline slot (completed session if already logged). */
  get displayWorkout() {
    if (this.state.workoutDoneToday && this.state.completedWorkoutIndex != null) {
      return this.workoutAt(this.state.completedWorkoutIndex);
    }
    return this.currentWorkout;
  }

  persist(opts = {}) {
    this.state.day = todayKey();
    this.state.updatedAt = new Date().toISOString();
    saveLocalState(this.state);

    if (!apiConfigured() || !this.pin) return;

    if (opts.forceUpload) {
      this.flushRemote();
      return;
    }
    clearTimeout(this._syncTimer);
    this._syncTimer = setTimeout(() => this.flushRemote(), SYNC_DEBOUNCE_MS);
  }

  async flushRemote() {
    if (!apiConfigured() || !this.pin) return;
    if (this._syncing) {
      this._syncAgain = true;
      return;
    }
    this._syncing = true;
    setSyncStatus('Saving…');
    try {
      const remote = await putRemoteState(this.pin, this.state);
      const ts = newerTimestamp(remote?.meta?.updatedAt, remote?.day?.updatedAt);
      if (ts) this.state.updatedAt = ts;
      saveLocalState(this.state);
      setSyncStatus('Synced');
    } catch (err) {
      console.error(err);
      if (err.status === 401) {
        clearSessionPin();
        setSyncStatus('PIN rejected', true);
      } else {
        setSyncStatus('Save failed · local cache', true);
      }
    } finally {
      this._syncing = false;
      if (this._syncAgain) {
        this._syncAgain = false;
        this.flushRemote();
      }
    }
  }

  render() {
    this.renderMeta();
    this.renderProgress();
    this.renderTimeline();
    this.renderCycle();
    this.renderLongRun();
    this.renderReview();
    this.renderNextUp();
    this.bindOnce();
  }

  renderMeta() {
    const { meta } = this;
    document.title = `${meta.title || 'Daily Execution'} — Phase 1`;
    document.getElementById('badge').textContent = meta.badge || '';
    const titleEl = document.getElementById('title');
    titleEl.className = '';
    titleEl.textContent = meta.title || '';
    document.getElementById('subtitle').textContent = meta.subtitle || '';
    document.getElementById('phase').textContent = meta.phase || '';
    document.getElementById('footer').textContent = meta.footer || '';
    document.getElementById('targets-title').textContent = this.targets.title || "Today's Progress";
    document.getElementById('longrun-title').textContent =
      this.milestones.longRun?.title || 'Long Run Progress';
    document.getElementById('review-title').textContent =
      this.milestones.weeklyReview?.title || 'Weekly Review';
  }

  renderProgress() {
    const sticky = document.getElementById('progress-sticky');
    sticky.hidden = false;
    this.recalcChecklistTargets();
    this.recalcBottleLogTargets();
    const grid = document.getElementById('progress-grid');
    let doneCount = 0;
    grid.innerHTML = (this.targets.items || [])
      .map((item) => {
        const val = Number(this.state.progress[item.id]) || 0;
        const pct = Math.min(100, Math.round((val / item.goal) * 100));
        const done = val >= item.goal;
        if (done) doneCount += 1;
        const unit = item.unit ? ` ${escapeHtml(item.unit)}` : '';
        const noCtrls = item.input === 'checklist' || item.input === 'bottle-log';
        const ctrls = noCtrls
          ? ''
          : `<div class="stat-ctrls">
    <button type="button" data-action="dec" data-id="${escapeHtml(item.id)}" aria-label="Decrease ${escapeHtml(item.label)}">−</button>
    <button type="button" data-action="inc" data-id="${escapeHtml(item.id)}" aria-label="Increase ${escapeHtml(item.label)}">+</button>
  </div>`;
        return `<div class="stat${done ? ' done' : ''}${noCtrls ? ' checklist-mode' : ''}" data-target="${escapeHtml(item.id)}">
  <span class="stat-label">${escapeHtml(item.label)}</span>
  <div class="stat-value">${escapeHtml(formatValue(item, val))}<span class="goal"> / ${escapeHtml(formatGoal(item))}${unit}</span></div>
  <div class="stat-bar"><i style="width:${pct}%"></i></div>
  ${ctrls}
</div>`;
      })
      .join('');

    const total = (this.targets.items || []).length;
    document.getElementById('progress-pct').textContent =
      total ? `${doneCount}/${total} targets` : '';

    this.renderProteinLog();
    this.renderWaterLog();
  }

  proteinTarget() {
    return (this.targets.items || []).find((t) => t.id === 'protein');
  }

  waterTarget() {
    return (this.targets.items || []).find((t) => t.id === 'water');
  }

  /** Sum protein grams from checked source boxes (single source of truth). */
  recalcChecklistTargets() {
    (this.targets.items || []).forEach((item) => {
      if (item.input !== 'checklist' || !item.sources) return;
      let sum = 0;
      item.sources.forEach((s) => {
        if (this.state.checks[s.id]) sum += Number(s.amount) || 0;
      });
      const decimals = item.decimals ?? 0;
      this.state.progress[item.id] =
        decimals > 0 ? Math.round(sum * 100) / 100 : Math.round(sum);
    });
  }

  /** Day bar = sum of bottle liters logged today; finishedAt kept for weekly analytics. */
  recalcBottleLogTargets() {
    (this.targets.items || []).forEach((item) => {
      if (item.input !== 'bottle-log') return;
      const liters = Number(item.bottleLiters) || 2;
      const log = Array.isArray(this.state.waterLog) ? this.state.waterLog : [];
      const sum = log.reduce((acc, e) => acc + (Number(e.liters) || liters), 0);
      const decimals = item.decimals ?? 2;
      this.state.progress[item.id] = Math.round(sum * 100) / 100;
      if (decimals === 0) this.state.progress[item.id] = Math.round(sum);
    });
  }

  renderProteinLog() {
    const el = document.getElementById('protein-log');
    if (!el) return;
    const protein = this.proteinTarget();
    const sources = protein?.sources || [];
    if (!sources.length) {
      el.hidden = true;
      el.innerHTML = '';
      return;
    }
    el.hidden = false;
    const title = protein.sourcesTitle || 'Protein log';
    el.innerHTML = `
      <div class="protein-log-head">
        <h3>${escapeHtml(title)}</h3>
        <span class="protein-log-hint">Check foods — total updates automatically</span>
      </div>
      <ul class="checks">${sources
        .map((s) => {
          const done = !!this.state.checks[s.id];
          return `<li class="check${done ? ' done' : ''}" data-check="${escapeHtml(s.id)}" role="checkbox" aria-checked="${done}" tabindex="0">
  <span class="box">${icon('check')}</span>
  <span class="check-text">${escapeHtml(s.label)}</span>
  <span class="check-meta">+${escapeHtml(String(s.amount))} g</span>
</li>`;
        })
        .join('')}</ul>`;
  }

  renderWaterLog() {
    const el = document.getElementById('water-log');
    if (!el) return;
    const water = this.waterTarget();
    if (!water || water.input !== 'bottle-log') {
      el.hidden = true;
      el.innerHTML = '';
      return;
    }
    el.hidden = false;
    const liters = Number(water.bottleLiters) || 2;
    const log = [...(this.state.waterLog || [])].sort((a, b) =>
      String(a.finishedAt).localeCompare(String(b.finishedAt))
    );
    const lastAt = this.state.lastBottleFinishedAt || log[log.length - 1]?.finishedAt || null;
    const cooldownMs = bottleCooldownRemainingMs(lastAt);
    const coolingDown = cooldownMs > 0;
    const armed = !!this._bottleArmed;
    const title = water.logTitle || 'Bottle finishes';
    const hint = (water.logHint || '').trim();
    const lastLine = lastAt
      ? `Last finish: ${formatBottleStamp(lastAt)}`
      : 'Last finish: none yet';
    const cooldownLine = coolingDown
      ? `Next log available in ${formatDuration(cooldownMs)}`
      : 'Ready to log another bottle';

    const rows = log.length
      ? `<ul class="bottle-list">${log
          .map((e) => {
            const L = Number(e.liters) || liters;
            return `<li class="bottle-row">
  <span class="bottle-main">${escapeHtml(String(L))} L bottle</span>
  <span class="bottle-time">${escapeHtml(formatBottleStamp(e.finishedAt))}</span>
  <button type="button" class="bottle-undo" data-action="remove-bottle" data-id="${escapeHtml(e.id)}" aria-label="Remove bottle finish">Undo</button>
</li>`;
          })
          .join('')}</ul>`
      : `<p class="bottle-empty">No bottles finished yet today.</p>`;

    el.innerHTML = `
      <div class="protein-log-head">
        <h3>${escapeHtml(title)}</h3>
        <span class="protein-log-hint">${log.length} today · ${escapeHtml(String(liters))} L each</span>
      </div>
      ${hint ? `<p class="water-log-hint">${escapeHtml(hint)}</p>` : ''}
      <p class="bottle-last">${escapeHtml(lastLine)}</p>
      <p class="bottle-cooldown${coolingDown ? ' wait' : ''}">${escapeHtml(cooldownLine)}</p>
      <label class="bottle-toggle${coolingDown ? ' disabled' : ''}">
        <input type="checkbox" id="bottle-arm" data-action="arm-bottle" ${armed ? 'checked' : ''} ${coolingDown ? 'disabled' : ''} />
        <span>I finished a ${escapeHtml(String(liters))} L bottle</span>
      </label>
      <button type="button" class="bottle-add" data-action="log-bottle" ${!armed || coolingDown ? 'disabled' : ''}>
        Confirm bottle finish
      </button>
      ${rows}`;
  }

  setBottleArmed(armed) {
    this._bottleArmed = !!armed;
    this.renderWaterLog();
  }

  logWaterBottle() {
    if (!this._bottleArmed) return;
    const lastAt = this.state.lastBottleFinishedAt;
    if (bottleCooldownRemainingMs(lastAt) > 0) {
      this._bottleArmed = false;
      this.renderWaterLog();
      return;
    }
    const water = this.waterTarget();
    const liters = Number(water?.bottleLiters) || 2;
    if (!Array.isArray(this.state.waterLog)) this.state.waterLog = [];
    const finishedAt = new Date().toISOString();
    this.state.waterLog.push({
      id: newWaterLogId(),
      finishedAt,
      liters,
    });
    this.state.lastBottleFinishedAt = finishedAt;
    this._bottleArmed = false;
    this.recalcBottleLogTargets();
    this.persist();
    this.renderProgress();
  }

  removeWaterBottle(id) {
    this.state.waterLog = (this.state.waterLog || []).filter((e) => e.id !== id);
    // Recompute last finish from remaining today + keep meta if newer is gone
    const times = (this.state.waterLog || [])
      .map((e) => e.finishedAt)
      .filter(Boolean)
      .sort();
    const todayLast = times.length ? times[times.length - 1] : null;
    if (
      this.state.lastBottleFinishedAt &&
      todayLast &&
      this.state.lastBottleFinishedAt <= todayLast
    ) {
      this.state.lastBottleFinishedAt = todayLast;
    } else if (!todayLast && this.state.lastBottleFinishedAt) {
      // Undoing today's last finish: clear only if it was today's stamp
      const lastKey = String(this.state.lastBottleFinishedAt).slice(0, 10);
      if (lastKey === todayKey()) this.state.lastBottleFinishedAt = null;
    }
    this.recalcBottleLogTargets();
    this.persist();
    this.renderProgress();
  }

  sectionTasks(section) {
    if (section.type === 'workout-slot') {
      const w = this.displayWorkout;
      const { pre, post } = this.splitMobilityTasks(w);
      const exerciseTasks = (w?.exercises || []).map((e, i) => ({
        id: `ex-${w.id}-${i}`,
        text: `${e.name} · ${e.sets}×${e.reps}`,
      }));
      return [...pre, ...exerciseTasks, ...post];
    }
    const out = [];
    (section.tasks || []).forEach((t) => {
      if (t.mobilityRoutine) {
        out.push(...this.mobilityItemTasks(t.mobilityRoutine));
      } else {
        out.push(t);
      }
    });
    return out;
  }

  mobilityRoutine(id) {
    return this.mobility?.routines?.[id] || null;
  }

  mobilityCheckId(routineId, itemId) {
    return `mob-${routineId}-${itemId}`;
  }

  mobilityItemTasks(routineId) {
    const routine = this.mobilityRoutine(routineId);
    if (!routine) return [];
    return (routine.items || []).map((item) => ({
      id: this.mobilityCheckId(routineId, item.id),
      text: item.text,
    }));
  }

  splitMobilityTasks(w) {
    const preIds = new Set(['warmup']);
    const pre = [];
    const post = [];
    if (!w) return { pre, post };
    (w.mobility || []).forEach((entry) => {
      const routineId = typeof entry === 'string' ? null : entry.routine;
      if (!routineId) return;
      const tasks = this.mobilityItemTasks(routineId);
      if (preIds.has(routineId)) pre.push(...tasks);
      else post.push(...tasks);
    });
    return { pre, post };
  }

  mobilityTasksForWorkout(w) {
    const { pre, post } = this.splitMobilityTasks(w);
    return [...pre, ...post];
  }

  renderMobilityBlock(routineId) {
    const routine = this.mobilityRoutine(routineId);
    if (!routine) return '';
    const items = routine.items || [];
    let done = 0;
    items.forEach((item) => {
      if (this.state.checks[this.mobilityCheckId(routineId, item.id)]) done += 1;
    });
    const total = items.length;
    const allDone = total > 0 && done === total;
    return `<div class="mobility-block${allDone ? ' done' : ''}">
  <div class="mobility-block-head">
    <h4>${escapeHtml(routine.label)}</h4>
    <span class="mobility-count">${done}/${total}</span>
  </div>
  <ul class="checks">${items
    .map((item) => {
      const id = this.mobilityCheckId(routineId, item.id);
      const checked = !!this.state.checks[id];
      return `<li class="check${checked ? ' done' : ''}" data-check="${escapeHtml(id)}" role="checkbox" aria-checked="${checked}" tabindex="0">
  <span class="box">${icon('check')}</span>
  <span class="check-text">${escapeHtml(item.text)}</span>
</li>`;
    })
    .join('')}</ul>
</div>`;
  }

  sectionProgress(section) {
    const tasks = this.sectionTasks(section);
    if (!tasks.length) return { done: 0, total: 0 };
    let done = 0;
    tasks.forEach((t) => {
      if (this.state.checks[t.id]) done += 1;
    });
    if (section.type === 'workout-slot' && this.state.workoutDoneToday) {
      return { done: tasks.length, total: tasks.length };
    }
    return { done, total: tasks.length };
  }

  isSectionOpen(section, index) {
    if (this.state.openSections[section.id] !== undefined) {
      return !!this.state.openSections[section.id];
    }
    // Auto-open first incomplete section; primary workout also defaults open if current.
    const firstIncomplete = this.firstIncompleteSectionId();
    if (section.id === firstIncomplete) return true;
    if (section.primary && !this.state.workoutDoneToday) return true;
    return index === 0;
  }

  firstIncompleteSectionId() {
    for (const section of this.routine.sections || []) {
      const { done, total } = this.sectionProgress(section);
      if (total === 0) continue;
      if (done < total) return section.id;
    }
    return null;
  }

  renderNextUp() {
    const el = document.getElementById('next-up');
    const sections = this.routine.sections || [];
    let next = null;
    for (const section of sections) {
      const { done, total } = this.sectionProgress(section);
      if (total && done < total) {
        next = section;
        break;
      }
    }
    if (!next) {
      el.hidden = false;
      el.className = 'next-up complete';
      el.innerHTML = `
        <div class="next-icon">${icon('check')}</div>
        <div>
          <p class="next-label">Status</p>
          <p class="next-title">Day complete</p>
          <p class="next-meta">All timeline sections checked off.</p>
        </div>`;
      return;
    }
    const { done, total } = this.sectionProgress(next);
    const sub =
      next.type === 'workout-slot' && this.displayWorkout
        ? `Workout #${this.displayWorkout.id} · ${this.displayWorkout.goal}`
        : `${done}/${total} done`;
    el.hidden = false;
    el.className = 'next-up';
    el.innerHTML = `
      <div class="next-icon">${icon(next.icon)}</div>
      <div>
        <p class="next-label">Up next</p>
        <p class="next-title">${escapeHtml(next.title)}</p>
        <p class="next-meta">${escapeHtml(sub)}</p>
      </div>`;
  }

  renderTimeline() {
    const root = document.getElementById('timeline');
    root.innerHTML = (this.routine.sections || [])
      .map((section, index) => this.renderSection(section, index))
      .join('');
  }

  renderSection(section, index) {
    const { done, total } = this.sectionProgress(section);
    const allDone = total > 0 && done === total;
    const open = this.isSectionOpen(section, index);
    const count = total ? `${done}/${total}` : '';
    const sub =
      section.type === 'workout-slot' && this.displayWorkout
        ? `#${this.displayWorkout.id} · ${this.displayWorkout.duration}`
        : section.proteinTarget
          ? `Protein · ${section.proteinTarget}`
          : section.note || '';

    let body = '';
    if (section.reminder) {
      body += `<div class="reminder">
  <p class="reminder-label">${escapeHtml(section.reminder.label)}</p>
  <ul class="reminder-items">${(section.reminder.items || [])
    .map((i) => `<li>${escapeHtml(i)}</li>`)
    .join('')}</ul>
</div>`;
    }
    if (section.plate) {
      body += `<div class="plate">${(section.plate.thirds || [])
        .map(
          (t) => `<div class="plate-third">
  <h4>${escapeHtml(t.label)}</h4>
  <ul>${(t.items || []).map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>
</div>`
        )
        .join('')}</div>`;
    }
    if (section.note) {
      body += `<p class="sec-note">${escapeHtml(section.note)}</p>`;
    }
    if (section.suggestions && section.suggestions.length) {
      body += `<div class="suggest">
  <p class="suggest-label">Suggestions</p>
  <ul class="suggest-list">${section.suggestions
    .map((s) => `<li>${escapeHtml(s)}</li>`)
    .join('')}</ul>
</div>`;
    }

    if (section.type === 'workout-slot') {
      body += this.renderWorkoutBody();
    } else {
      body += this.renderChecks(section.tasks || []);
    }

    const classes = [
      'section',
      open ? 'open' : '',
      section.primary ? 'primary' : '',
      allDone ? 'all-done' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return `<section class="${classes}" data-section="${escapeHtml(section.id)}">
  <button type="button" class="section-head" data-toggle="${escapeHtml(section.id)}" aria-expanded="${open}">
    <span class="sec-icon">${icon(section.icon)}</span>
    <span class="sec-titles">
      <h3>${escapeHtml(section.title)}</h3>
      ${sub ? `<p class="sec-sub">${escapeHtml(sub)}</p>` : ''}
    </span>
    <span class="sec-count">${escapeHtml(count)}</span>
    <span class="chev">${icon('chev')}</span>
  </button>
  <div class="section-body">${body}</div>
</section>`;
  }

  renderChecks(tasks) {
    if (!tasks.length) return '';
    const parts = [];
    tasks.forEach((t) => {
      if (t.mobilityRoutine) {
        parts.push(this.renderMobilityBlock(t.mobilityRoutine));
        return;
      }
      const done = !!this.state.checks[t.id];
      parts.push(`<li class="check${done ? ' done' : ''}" data-check="${escapeHtml(t.id)}" role="checkbox" aria-checked="${done}" tabindex="0">
  <span class="box">${icon('check')}</span>
  <span class="check-text">${escapeHtml(t.text)}</span>
</li>`);
    });
    // Wrap plain checks in one list; mobility blocks stay outside
    let html = '';
    let buf = [];
    const flush = () => {
      if (!buf.length) return;
      html += `<ul class="checks">${buf.join('')}</ul>`;
      buf = [];
    };
    parts.forEach((p) => {
      if (p.startsWith('<div class="mobility-block')) {
        flush();
        html += p;
      } else {
        buf.push(p);
      }
    });
    flush();
    return html;
  }

  renderWorkoutBody() {
    const w = this.displayWorkout;
    if (!w) return '<p class="sec-note">No workouts configured.</p>';
    const doneToday = this.state.workoutDoneToday;
    const preIds = new Set(['warmup']);
    const preMobility = [];
    const postMobility = [];
    (w.mobility || []).forEach((entry) => {
      const routineId = typeof entry === 'string' ? null : entry.routine;
      if (!routineId) return;
      const html = this.renderMobilityBlock(routineId);
      if (preIds.has(routineId)) preMobility.push(html);
      else postMobility.push(html);
    });
    const rows = (w.exercises || [])
      .map((e, i) => {
        const id = `ex-${w.id}-${i}`;
        const checked = !!this.state.checks[id] || doneToday;
        return `<tr>
  <td>
    <label class="check${checked ? ' done' : ''}" data-check="${escapeHtml(id)}" style="padding:0;border:0;background:transparent">
      <span class="box">${icon('check')}</span>
      <span class="check-text">${escapeHtml(e.name)}</span>
    </label>
  </td>
  <td>${escapeHtml(e.sets)}</td>
  <td>${escapeHtml(e.reps)}</td>
</tr>`;
      })
      .join('');

    const next = this.currentWorkout;
    const doneLabel = doneToday && next
      ? `Done · Next up: #${next.id} ${next.goal}`
      : 'Mark workout complete';

    return `<div class="wo-card">
  <div class="wo-header">
    <span class="wo-num">${escapeHtml(w.id)}</span>
    <div>
      <h4>${escapeHtml(w.goal)}</h4>
      <p class="wo-type">${escapeHtml(w.dayType || '')}</p>
    </div>
  </div>
  <ul class="wo-meta">
    <li>${escapeHtml(w.duration)}</li>
    <li>${escapeHtml(w.cardio)}</li>
    <li>${escapeHtml(w.setsSummary || '')}</li>
  </ul>
  ${preMobility.join('')}
  <table class="ex-table">
    <thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  ${postMobility.join('')}
  <div class="wo-actions">
    <button type="button" class="btn btn-primary${doneToday ? ' done-state' : ''}" data-action="complete-workout" ${doneToday ? 'disabled' : ''}>
      ${escapeHtml(doneLabel)}
    </button>
    <button type="button" class="btn btn-ghost" data-action="undo-workout">
      Undo
    </button>
  </div>
</div>`;
  }

  renderCycle() {
    const cur = this.currentWorkout;
    const next = this.nextWorkout;
    const row = document.getElementById('cycle-row');
    if (!cur) {
      row.innerHTML = '';
      return;
    }
    row.innerHTML = `
      <article class="cycle-card current">
        <p class="tag">Current Workout</p>
        <h3>Workout #${escapeHtml(cur.id)}</h3>
        <p>${escapeHtml(cur.goal)}</p>
      </article>
      <article class="cycle-card">
        <p class="tag">Next</p>
        <h3>Workout #${escapeHtml(next.id)}</h3>
        <p>${escapeHtml(next.goal)}</p>
      </article>`;
  }

  renderLongRun() {
    const lr = this.milestones.longRun || {};
    const cards = [lr.currentEasy, lr.currentLong, lr.nextIncrease].filter(Boolean);
    document.getElementById('run-grid').innerHTML = cards
      .map(
        (c) => `<article class="run-card">
  <p class="tag">${escapeHtml(c.label)}</p>
  <p class="val">${escapeHtml(c.value)}</p>
</article>`
      )
      .join('');
  }

  renderReview() {
    const fields = this.milestones.weeklyReview?.fields || [];
    document.getElementById('review-grid').innerHTML = fields
      .map((f) => {
        const val = this.state.review[f.id] || '';
        return `<div class="review-field">
  <label for="review-${escapeHtml(f.id)}">${escapeHtml(f.label)}</label>
  <input id="review-${escapeHtml(f.id)}" data-review="${escapeHtml(f.id)}" type="text" inputmode="decimal" placeholder="${escapeHtml(f.placeholder || '')}" value="${escapeHtml(val)}" />
</div>`;
      })
      .join('');
  }

  findTask(taskId) {
    for (const section of this.routine.sections || []) {
      for (const t of section.tasks || []) {
        if (t.id === taskId) return t;
      }
    }
    for (const item of this.targets.items || []) {
      if (item.input !== 'checklist') continue;
      for (const s of item.sources || []) {
        if (s.id === taskId) {
          return {
            id: s.id,
            text: s.label,
            target: item.id,
            amount: s.amount,
          };
        }
      }
    }
    return null;
  }

  adjustTarget(id, dir) {
    const item = (this.targets.items || []).find((t) => t.id === id);
    if (!item || item.input === 'checklist' || item.input === 'bottle-log') return;
    const step = item.step || 1;
    let val = Number(this.state.progress[id]) || 0;
    val = Math.max(0, val + dir * step);
    const decimals = item.decimals ?? (Number.isInteger(item.step) ? 0 : 2);
    if (decimals > 0) val = Math.round(val * 100) / 100;
    else val = Math.round(val);
    this.state.progress[id] = val;
    this.persist();
    this.renderProgress();
  }

  toggleCheck(taskId) {
    const was = !!this.state.checks[taskId];
    this.state.checks[taskId] = !was;
    const task = this.findTask(taskId);
    const targetItem = task?.target
      ? (this.targets.items || []).find((t) => t.id === task.target)
      : null;

    // Checklist targets (protein) are always recomputed from checked sources.
    if (targetItem?.input === 'checklist') {
      this.recalcChecklistTargets();
    } else if (task?.target && task.amount != null && targetItem) {
      let val = Number(this.state.progress[task.target]) || 0;
      const delta = was ? -task.amount : task.amount;
      val = Math.max(0, val + delta);
      const decimals = targetItem.decimals ?? (Number.isInteger(targetItem.step) ? 0 : 2);
      if (decimals > 0) val = Math.round(val * 100) / 100;
      this.state.progress[task.target] = val;
    }
    this.persist();
    this.renderProgress();
    this.renderTimeline();
    this.renderNextUp();
    this.renderCycle();
  }

  completeWorkout() {
    if (this.state.workoutDoneToday) return;
    const len = (this.workouts.items || []).length;
    if (!len) return;
    const w = this.currentWorkout;
    if (w) {
      (w.exercises || []).forEach((_, i) => {
        this.state.checks[`ex-${w.id}-${i}`] = true;
      });
      this.mobilityTasksForWorkout(w).forEach((t) => {
        this.state.checks[t.id] = true;
      });
    }
    this.state.completedWorkoutIndex = this.state.workoutIndex;
    this.state.workoutIndex = (this.state.workoutIndex + 1) % len;
    this.state.workoutDoneToday = true;
    this.persist();
    this.render();
  }

  undoWorkout() {
    const len = (this.workouts.items || []).length;
    if (!len) return;
    if (this.state.workoutDoneToday) {
      const completedIdx =
        this.state.completedWorkoutIndex != null
          ? this.state.completedWorkoutIndex
          : (this.state.workoutIndex - 1 + len) % len;
      const w = this.workoutAt(completedIdx);
      if (w) {
        (w.exercises || []).forEach((_, i) => {
          delete this.state.checks[`ex-${w.id}-${i}`];
        });
        this.mobilityTasksForWorkout(w).forEach((t) => {
          delete this.state.checks[t.id];
        });
      }
      this.state.workoutIndex = completedIdx;
      this.state.workoutDoneToday = false;
      this.state.completedWorkoutIndex = null;
    } else {
      // Step cycle back one (manual correction)
      this.state.workoutIndex = (this.state.workoutIndex - 1 + len) % len;
    }
    this.persist();
    this.render();
  }

  resetDay() {
    if (!confirm('Clear today\'s checkboxes and progress? Workout cycle position is kept.')) return;
    const keepIndex = this.state.workoutIndex;
    const keepReview = this.state.review;
    const keepLastBottle = this.state.lastBottleFinishedAt;
    this.state = defaultState(this.targets);
    this.state.workoutIndex = keepIndex;
    this.state.review = keepReview;
    this.state.lastBottleFinishedAt = keepLastBottle;
    this._bottleArmed = false;
    this.persist();
    this.render();
  }

  toggleSection(id) {
    const currently = this.isSectionOpen(
      (this.routine.sections || []).find((s) => s.id === id) || { id },
      0
    );
    this.state.openSections[id] = !currently;
    this.persist();
    const el = document.querySelector(`[data-section="${CSS.escape(id)}"]`);
    if (!el) return;
    el.classList.toggle('open', !currently);
    const btn = el.querySelector('[data-toggle]');
    if (btn) btn.setAttribute('aria-expanded', String(!currently));
  }

  bindOnce() {
    if (this._bound) return;
    this._bound = true;
    const root = document.querySelector('.wrap');

    root.addEventListener('click', (e) => {
      const toggle = e.target.closest('[data-toggle]');
      if (toggle) {
        this.toggleSection(toggle.getAttribute('data-toggle'));
        return;
      }
      const check = e.target.closest('[data-check]');
      if (check) {
        this.toggleCheck(check.getAttribute('data-check'));
        return;
      }
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      if (action === 'inc') this.adjustTarget(btn.getAttribute('data-id'), 1);
      else if (action === 'dec') this.adjustTarget(btn.getAttribute('data-id'), -1);
      else if (action === 'complete-workout') this.completeWorkout();
      else if (action === 'undo-workout') this.undoWorkout();
      else if (action === 'log-bottle') this.logWaterBottle();
      else if (action === 'remove-bottle') this.removeWaterBottle(btn.getAttribute('data-id'));
      else if (action === 'arm-bottle') {
        /* handled on change */
      }
    });

    root.addEventListener('change', (e) => {
      const arm = e.target.closest('[data-action="arm-bottle"]');
      if (arm) {
        this.setBottleArmed(arm.checked);
        return;
      }
      const input = e.target.closest('[data-review]');
      if (!input) return;
      this.state.review[input.getAttribute('data-review')] = input.value;
      this.persist();
    });

    root.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const check = e.target.closest('[data-check]');
      if (!check) return;
      e.preventDefault();
      this.toggleCheck(check.getAttribute('data-check'));
    });

    root.addEventListener('input', (e) => {
      const input = e.target.closest('[data-review]');
      if (!input) return;
      this.state.review[input.getAttribute('data-review')] = input.value;
      this.persist();
    });

    document.getElementById('reset-day').addEventListener('click', () => this.resetDay());
  }
}

boot();
