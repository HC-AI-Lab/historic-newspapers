// Issue viewer: embeds the storage provider's PDF viewer (see data/config.js).
// Pages, zoom and scrolling are handled inside the embedded viewer.
let curId = null;
const fill = (pattern, id) => pattern.replace('{id}', encodeURIComponent(id));

function openPdf(id, title) {
  curId = id;
  document.getElementById('viewer').style.display = 'flex';
  document.getElementById('vtitle').textContent = title || id;
  const wrap = document.getElementById('pdf-wrap');
  wrap.innerHTML = '<div class="loading"><div class="spin"></div><div>Loading…</div></div>';
  const f = document.createElement('iframe');
  f.src = fill(window.STORAGE.preview, id);
  f.title = title || 'Newspaper issue';
  f.allow = 'fullscreen';
  f.onload = () => { const l = wrap.querySelector('.loading'); if (l) l.remove(); };
  wrap.appendChild(f);
}
function closeViewer() {
  document.getElementById('viewer').style.display = 'none';
  document.getElementById('pdf-wrap').innerHTML = '';
  curId = null;
}
function dl() { if (curId) window.open(fill(window.STORAGE.download, curId), '_blank'); }
document.addEventListener('keydown', e => {
  if (document.getElementById('viewer').style.display !== 'flex') return;
  if (e.key === 'Escape') closeViewer();
});
