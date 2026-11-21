// Chooser: Newspaper → Year → Edition, with an in-page reader.
// Data comes from data/<paper>.js (window.PAPERS); storage URLs from data/config.js.
// Every selection is reflected in the URL (#paper/year/month/issue), so editions can be bookmarked and shared.
(() => {
  const P = window.PAPERS || {};
  const $ = id => document.getElementById(id);
  const selPaper = $('sel-paper'), selYear = $('sel-year'), selEd = $('sel-edition');
  const fill = (pattern, id) => pattern.replace('{id}', encodeURIComponent(id));
  const opt = (value, text) => Object.assign(document.createElement('option'), { value, textContent: text });

  // Flat, chronological list of editions for a paper+year: [{key, month, label, issue, id}]
  const editions = (paper, year) => {
    const y = P[paper]?.years?.[year]; if (!y) return [];
    return Object.keys(y.months).sort().flatMap(mm =>
      y.months[mm].issues.map(i => ({ key: `${mm}/${i.issue}`, month: mm, label: y.months[mm].label, issue: i.issue, id: i.id })));
  };

  function fillPapers() {
    selPaper.replaceChildren(opt('', 'Select a newspaper…'));
    for (const [k, p] of Object.entries(P)) selPaper.append(opt(k, `${p.name} (${p.span})`));
  }
  function fillYears(paper) {
    selYear.replaceChildren(opt('', 'Select a year…'));
    const years = paper ? Object.keys(P[paper].years).sort() : [];
    years.forEach(y => selYear.append(opt(y, y)));
    selYear.disabled = !years.length;
    if (years.length === 1) selYear.value = years[0];
  }
  function fillEditions(paper, year) {
    selEd.replaceChildren(opt('', 'Select an edition…'));
    let group = null, cur = null;
    for (const e of editions(paper, year)) {
      if (e.month !== cur) { cur = e.month; group = Object.assign(document.createElement('optgroup'), { label: `${e.label} ${year}` }); selEd.append(group); }
      group.append(opt(e.key, `${e.label} ${year} — Issue ${e.issue}`));
    }
    selEd.disabled = !paper || !year;
  }

  function show(paper, year, key, push = true) {
    const list = editions(paper, year), idx = list.findIndex(e => e.key === key);
    if (idx < 0) { $('reader').hidden = true; $('empty').hidden = false; return; }
    const e = list[idx];
    $('empty').hidden = true; $('reader').hidden = false;
    $('ed-title').textContent = `${P[paper].name} — ${e.label} ${year} — Issue ${e.issue}`;
    const frame = document.querySelector('#reader .frame');
    frame.querySelector('iframe')?.remove();
    frame.querySelector('.loading').hidden = false;
    const f = document.createElement('iframe');
    f.src = fill(window.STORAGE.preview, e.id);
    f.title = $('ed-title').textContent;
    f.allow = 'fullscreen';
    f.onload = () => { frame.querySelector('.loading').hidden = true; };
    frame.append(f);
    $('lnk-full').href = fill(window.STORAGE.preview, e.id);
    $('lnk-dl').href = fill(window.STORAGE.download, e.id);
    $('btn-prev').disabled = idx === 0;
    $('btn-next').disabled = idx === list.length - 1;
    $('btn-prev').onclick = () => go(list[idx - 1]);
    $('btn-next').onclick = () => go(list[idx + 1]);
    function go(n) { if (n) { selEd.value = n.key; show(paper, year, n.key); } }
    if (push) history.replaceState(null, '', `#${paper}/${year}/${key}`);
    document.title = `${$('ed-title').textContent} · Historic Newspapers`;
  }
  function reset(level) {
    $('reader').hidden = true; $('empty').hidden = false;
    document.querySelector('#reader .frame iframe')?.remove();
    history.replaceState(null, '', level ? `#${level}` : location.pathname);
  }

  selPaper.onchange = () => {
    fillYears(selPaper.value); fillEditions(selPaper.value, selYear.value);
    reset(selPaper.value && [selPaper.value, selYear.value].filter(Boolean).join('/'));
  };
  selYear.onchange = () => { fillEditions(selPaper.value, selYear.value); reset([selPaper.value, selYear.value].filter(Boolean).join('/')); };
  selEd.onchange = () => selEd.value ? show(selPaper.value, selYear.value, selEd.value) : reset(`${selPaper.value}/${selYear.value}`);

  document.addEventListener('keydown', ev => {
    if ($('reader').hidden || ['SELECT', 'INPUT'].includes(document.activeElement?.tagName)) return;
    if (ev.key === 'ArrowLeft' && !$('btn-prev').disabled) $('btn-prev').click();
    if (ev.key === 'ArrowRight' && !$('btn-next').disabled) $('btn-next').click();
  });

  // Restore from the URL: #paper[/year[/month/issue]]
  function fromHash() {
    const [paper, year, mm, iss] = decodeURIComponent(location.hash.slice(1)).split('/');
    fillPapers();
    if (!P[paper]) { fillYears(''); fillEditions('', ''); return; }
    selPaper.value = paper; fillYears(paper);
    if (year && P[paper].years[year]) selYear.value = year;
    fillEditions(paper, selYear.value);
    if (mm && iss) { selEd.value = `${mm}/${iss}`; show(paper, selYear.value, `${mm}/${iss}`, false); }
  }
  fromHash();
  window.addEventListener('hashchange', fromHash); // pasted/edited links; replaceState() above does not fire this
})();
