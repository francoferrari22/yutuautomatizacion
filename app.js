const $ = (id) => document.getElementById(id);
const input = $('videoFiles');
const selected = $('selectedFiles');
const addButton = $('addQueue');
const queueRoot = $('queue');
const toast = $('toast');
let chosen = [];
let queue = [];
let toastTimer;

const formatLabels = { short: 'Short', long: 'Video largo', both: 'Ambos formatos' };
const visibilityLabels = { private: 'Privado', unlisted: 'No listado', public: 'Público' };

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}
function saveQueue() {
  try { localStorage.setItem('yutuStudioQueue', JSON.stringify(queue)); }
  catch { notify('No se pudo guardar en este navegador. Exportá tu lista como respaldo.'); }
}
function loadQueue() {
  try {
    const parsed = JSON.parse(localStorage.getItem('yutuStudioQueue') || '[]');
    queue = Array.isArray(parsed) ? parsed : [];
  } catch { queue = []; }
}
function renderChosen() {
  selected.innerHTML = '';
  if (!chosen.length) {
    selected.innerHTML = '<div class="empty-files">Todavía no seleccionaste archivos.</div>';
    addButton.disabled = true;
    return;
  }
  chosen.forEach((file, index) => {
    const row = document.createElement('div'); row.className = 'file-row';
    const icon = document.createElement('span'); icon.className = 'file-type'; icon.textContent = '▶';
    const info = document.createElement('div'); info.className = 'file-info';
    const name = document.createElement('b'); name.textContent = file.name;
    const meta = document.createElement('small'); meta.textContent = formatSize(file.size);
    info.append(name, meta);
    const remove = document.createElement('button'); remove.className = 'remove-file'; remove.type = 'button'; remove.setAttribute('aria-label', 'Quitar ' + file.name); remove.textContent = '×';
    remove.addEventListener('click', () => { chosen.splice(index, 1); renderChosen(); });
    row.append(icon, info, remove); selected.append(row);
  });
  addButton.disabled = false;
}
function updateStats() {
  $('statQueue').textContent = queue.length;
  $('statShorts').textContent = queue.filter(v => v.format === 'short' || v.format === 'both').length;
  $('statLong').textContent = queue.filter(v => v.format === 'long' || v.format === 'both').length;
  $('queueCount').textContent = `${queue.length} ${queue.length === 1 ? 'elemento' : 'elementos'}`;
  $('navCount').textContent = queue.length;
  $('clearQueue').disabled = $('exportQueue').disabled = queue.length === 0;
}
function renderQueue() {
  queueRoot.innerHTML = '';
  if (!queue.length) {
    queueRoot.innerHTML = '<div class="queue-empty"><div class="empty-icon">▤</div><b>Tu cola está vacía</b><p>Los videos que agregues aparecerán aquí.</p><a href="#new-video">Agregar el primer video <span>→</span></a></div>';
    updateStats(); return;
  }
  queue.forEach((item, index) => {
    const row = document.createElement('div'); row.className = 'queue-row';
    const number = document.createElement('span'); number.className = 'queue-index'; number.textContent = String(index + 1).padStart(2, '0');
    const info = document.createElement('div'); info.style.minWidth = '0';
    const title = document.createElement('div'); title.className = 'queue-title'; title.textContent = item.name;
    const meta = document.createElement('div'); meta.className = 'queue-meta';
    meta.textContent = `${formatLabels[item.format]} · ${visibilityLabels[item.visibility]} · ${formatSize(item.size)}` + (item.schedule ? ` · ${item.schedule.replace('T', ' ')}` : '');
    info.append(title, meta);
    const state = document.createElement('span'); state.className = 'queue-state'; state.textContent = 'Pendiente de conexión';
    const remove = document.createElement('button'); remove.className = 'queue-remove'; remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', 'Eliminar ' + item.name);
    remove.addEventListener('click', () => { queue.splice(index, 1); saveQueue(); renderQueue(); notify('Video quitado de la cola.'); });
    row.append(number, info, state, remove); queueRoot.append(row);
  });
  updateStats();
}
input.addEventListener('change', () => {
  const incoming = Array.from(input.files || []);
  const valid = incoming.filter(file => file.type.startsWith('video/') || /\.(mp4|mov|webm|avi|mkv)$/i.test(file.name));
  const rejected = incoming.length - valid.length;
  chosen = [...chosen, ...valid];
  renderChosen();
  if (rejected) notify(`${rejected} archivo(s) no parecen ser videos y se omitieron.`);
  input.value = '';
});
$('addQueue').addEventListener('click', () => {
  if (!chosen.length) return;
  const format = document.querySelector('input[name="format"]:checked').value;
  const visibility = $('visibility').value;
  const notes = $('notes').value.trim();
  const schedule = $('schedule').value;
  chosen.forEach(file => queue.push({
    id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
    name: file.name, size: file.size, format, visibility, notes, schedule,
    addedAt: new Date().toISOString()
  }));
  chosen = []; renderChosen(); saveQueue(); renderQueue();
  $('notes').value = ''; notify('Contenido agregado a tu cola.');
});
document.querySelectorAll('.format-option').forEach(option => {
  option.addEventListener('click', () => {
    document.querySelectorAll('.format-option').forEach(el => el.classList.remove('selected'));
    option.classList.add('selected');
  });
});
$('clearQueue').addEventListener('click', () => {
  if (!confirm('¿Querés vaciar toda la cola de trabajo?')) return;
  queue = []; saveQueue(); renderQueue(); notify('La cola quedó vacía.');
});
$('exportQueue').addEventListener('click', () => {
  const data = queue.map(({id, name, size, format, visibility, notes, schedule, addedAt}) => ({id, name, size, format, visibility, notes, schedule, addedAt}));
  const blob = new Blob([JSON.stringify({project: 'Yutu Studio', exportedAt: new Date().toISOString(), items: data}, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = 'yutu-studio-cola.json'; a.click(); URL.revokeObjectURL(url);
  notify('Lista JSON descargada.');
});
const dropzone = $('dropzone');
['dragenter', 'dragover'].forEach(eventName => dropzone.addEventListener(eventName, event => { event.preventDefault(); dropzone.classList.add('dragover'); }));
['dragleave', 'drop'].forEach(eventName => dropzone.addEventListener(eventName, event => { event.preventDefault(); dropzone.classList.remove('dragover'); }));
dropzone.addEventListener('drop', event => {
  const files = Array.from(event.dataTransfer.files || []).filter(f => f.type.startsWith('video/') || /\.(mp4|mov|webm|avi|mkv)$/i.test(f.name));
  chosen = [...chosen, ...files]; renderChosen();
  if (files.length) notify(`${files.length} video(s) seleccionado(s).`);
});
$('menuToggle').addEventListener('click', () => $('sidebar').classList.toggle('open'));
document.querySelectorAll('.nav-item').forEach(link => link.addEventListener('click', () => $('sidebar').classList.remove('open')));
loadQueue(); renderChosen(); renderQueue();
