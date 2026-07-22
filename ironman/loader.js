function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function listHtml(items) {
  if (!items || !items.length) return '';
  return `<ul>${items.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>`;
}

async function loadPlan() {
  const titleEl = document.getElementById('title');
  try {
    const res = await fetch(`ironman.yaml?v=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = jsyaml.load(await res.text());
    render(data);
  } catch (err) {
    console.error(err);
    titleEl.className = 'error';
    titleEl.textContent = 'Could not load ironman.yaml';
    document.getElementById('description').textContent =
      'Open this page via a local HTTP server (not file://), or check the console.';
  }
}

function render(data) {
  const meta = data.meta || {};
  document.title = meta.title || 'Ironman Plan';
  document.getElementById('badge').textContent = meta.badge || '';
  const titleEl = document.getElementById('title');
  titleEl.className = '';
  titleEl.textContent = meta.title || '';
  document.getElementById('description').textContent = meta.description || '';
  document.getElementById('footer').textContent = meta.footer || '';

  const habits = data.habits || {};
  document.getElementById('habits-title').textContent = habits.title || '';
  document.getElementById('habits').innerHTML = (habits.items || [])
    .map(
      (h) => `<article class="habit">
  <h3>${escapeHtml(h.name)}</h3>
  <p class="target">${escapeHtml(h.target)}</p>
  ${listHtml(h.details)}
</article>`
    )
    .join('');

  const workouts = data.workouts || {};
  document.getElementById('workouts-title').textContent = workouts.title || '';
  document.getElementById('workouts').innerHTML = (workouts.items || [])
    .map(
      (w) => `<article class="workout">
  <header>
    <span class="num">${escapeHtml(w.id)}</span>
    <div>
      <h3>${escapeHtml(w.goal)}</h3>
      <ul class="meta">
        <li>${escapeHtml(w.cardio)}</li>
        <li>${escapeHtml(w.duration)}</li>
      </ul>
    </div>
  </header>
  <ul class="ex">${(w.exercises || []).map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul>
</article>`
    )
    .join('');

  const running = data.running || {};
  document.getElementById('running-title').textContent = running.title || '';
  const cols = running.columns || [];
  const rows = running.rows || [];
  // Prefer bullets: one card per month with column/value pairs
  document.getElementById('running').innerHTML = `<div class="habit-grid">${rows
    .map((r) => {
      const month = r[0];
      const pairs = cols
        .slice(1)
        .map((col, i) => `<li><strong>${escapeHtml(col)}:</strong> ${escapeHtml(r[i + 1])}</li>`)
        .join('');
      return `<article class="habit">
  <h3>Month ${escapeHtml(month)}</h3>
  <ul>${pairs}</ul>
</article>`;
    })
    .join('')}</div>`;
}

loadPlan();
