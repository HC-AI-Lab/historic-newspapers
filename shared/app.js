// Newspaper → Year → Edition, phone-first.
// Editions are numbered 1..N within each year, in chronological order of the source folders.
// URL: #paper/year/edition  (shareable, bookmarkable)
(() => {
  const P = window.PAPERS || {}, S = window.STORAGE;
  const $ = id => document.getElementById(id);
  const fill = (pat, id) => pat.replace('{id}', encodeURIComponent(id));
  const thumb = (id, w) => `https://lh3.googleusercontent.com/d/${encodeURIComponent(id)}=w${w}`;
  const el = (tag, props = {}, kids = []) => { const e = Object.assign(document.createElement(tag), props); e.append(...kids); return e; };
  let state = { paper: null, year: null, ed: null };

  const editions = (paper, year) => {
    const y = P[paper]?.years?.[year]; if (!y) return [];
    return Object.keys(y.months).sort((a, b) => a - b)
      .flatMap(mm => [...y.months[mm].issues].sort((a, b) => a.issue - b.issue))
      .map((e, i) => ({ ...e, n: i + 1 }));
  };
  const years = paper => Object.keys(P[paper]?.years || {}).sort();

  function renderPapers() {
    $('papers').replaceChildren(...Object.entries(P).map(([k, p]) =>
      el('button', { type: 'button', className: 'paper' + (k === state.paper ? ' on' : ''), onclick: () => go(k) },
        [el('span', { className: 'ur', lang: 'ur', dir: 'rtl', textContent: p.urdu || '' }),
         el('span', { className: 'en', textContent: p.name }),
         el('small', { textContent: p.span })])));
  }
  function renderYears() {
    $('years').replaceChildren(...years(state.paper).map(y =>
      el('button', { type: 'button', className: 'chip' + (y === state.year ? ' on' : ''), textContent: y, onclick: () => go(state.paper, y) })));
  }
  function renderGrid() {
    const list = editions(state.paper, state.year);
    $('count').textContent = list.length ? `${P[state.paper].name} · ${state.year} · ${list.length} editions` : '';
    $('grid').replaceChildren(...list.map(e =>
      el('button', { type: 'button', className: 'ed', onclick: () => go(state.paper, state.year, e.n) }, [
        el('img', { src: thumb(e.id, 320), alt: `Front page, edition ${e.n}`, loading: 'lazy', decoding: 'async' }),
        el('span', { className: 'ed-n', textContent: `Edition ${e.n}` }),
        el('small', { textContent: `${e.pages} pages` })])));
  }
  function openReader() {
    const list = editions(state.paper, state.year), e = list[state.ed - 1];
    if (!e) return closeReader(false);
    $('reader').hidden = false; document.body.classList.add('lock');
    $('r-title').textContent = `${P[state.paper].name} · ${state.year} · Edition ${e.n}`;
    $('r-sub').textContent = `${e.n} of ${list.length} · ${e.pages} pages: scroll down to read all pages`;
    $('r-dl').href = fill(S.download, e.id);
    const body = $('r-body'); body.querySelector('iframe')?.remove(); body.querySelector('.r-load').hidden = false;
    const f = el('iframe', { src: fill(S.preview, e.id), title: $('r-title').textContent, allow: 'fullscreen' });
    f.onload = () => { body.querySelector('.r-load').hidden = true; };
    body.append(f);
    $('r-prev').disabled = e.n === 1;
    $('r-next').disabled = e.n === list.length;
    document.title = `${$('r-title').textContent} · Historic Newspapers`;
  }
  function closeReader(updateUrl = true) {
    $('reader').hidden = true; document.body.classList.remove('lock');
    $('r-body').querySelector('iframe')?.remove();
    document.title = 'Historic Newspapers — HCAI Lab';
    if (updateUrl && state.ed) go(state.paper, state.year);
  }

  // Single entry point: update state + URL, then render.
  function go(paper, year, ed) {
    const ys = years(paper);
    state = { paper, year: ys.includes(year) ? year : ys[0], ed: ed ? Number(ed) : null };
    const hash = '#' + [state.paper, state.year, state.ed].filter(Boolean).join('/');
    if (location.hash !== hash) history.pushState(null, '', hash);
    render();
  }
  function render() {
    renderPapers(); renderYears(); renderGrid();
    state.ed ? openReader() : closeReader(false);
  }
  function fromHash() {
    let [paper, year, ed, legacyIssue] = decodeURIComponent(location.hash.slice(1)).split('/');
    const first = Object.keys(P)[0];
    const p = P[paper] ? paper : first, ys = years(p);
    // Legacy links from the dropdown version: #paper/year/<month>/<source issue>
    if (legacyIssue) {
      const hit = editions(p, year).find(e => P[p].years[year].months[ed]?.issues.some(i => i.id === e.id && i.issue === legacyIssue));
      ed = hit ? String(hit.n) : '';
      if (hit) history.replaceState(null, '', `#${p}/${year}/${hit.n}`);
    }
    state = { paper: p, year: ys.includes(year) ? year : ys[0], ed: /^\d+$/.test(ed || '') ? Number(ed) : null };
    render();
  }

  $('r-close').onclick = () => closeReader();
  $('r-prev').onclick = () => go(state.paper, state.year, state.ed - 1);
  $('r-next').onclick = () => go(state.paper, state.year, state.ed + 1);
  document.addEventListener('keydown', ev => {
    if ($('reader').hidden) return;
    if (ev.key === 'Escape') closeReader();
    if (ev.key === 'ArrowLeft' && !$('r-prev').disabled) $('r-prev').click();
    if (ev.key === 'ArrowRight' && !$('r-next').disabled) $('r-next').click();
  });
  window.addEventListener('popstate', fromHash);
  window.addEventListener('hashchange', fromHash);
  fromHash();
})();
