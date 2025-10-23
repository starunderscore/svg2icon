let currentRoot = '';
let currentPath = '';

async function loadTOC() {
  const res = await fetch('toc.json');
  return res.json();
}

function $(sel){ return document.querySelector(sel); }

function renderNav(pagesOrSections, onClick) {
  const nav = $('#toc');
  nav.innerHTML = '';
  if (Array.isArray(pagesOrSections) && pagesOrSections.length && pagesOrSections[0].pages) {
    for (const section of pagesOrSections) {
      const title = document.createElement('div');
      title.className = 'nav-title';
      title.textContent = section.title;
      nav.appendChild(title);
      const sec = document.createElement('div');
      sec.className = 'nav-section';
      for (const p of section.pages) {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'nav-link';
        a.textContent = p.title;
        a.addEventListener('click', (e) => { e.preventDefault(); onClick(p.path); });
        sec.appendChild(a);
      }
      nav.appendChild(sec);
    }
  } else {
    const sec = document.createElement('div');
    sec.className = 'nav-section';
    for (const p of pagesOrSections) {
      const a = document.createElement('a');
      a.href = '#';
      a.className = 'nav-link';
      a.textContent = p.title;
      a.addEventListener('click', (e) => { e.preventDefault(); onClick(p.path); });
      sec.appendChild(a);
    }
    nav.appendChild(sec);
  }
}

async function loadMarkdown(root, path) {
  currentRoot = root;
  currentPath = path;
  const url = `${root}/${path}` + `?t=${Date.now()}`;
  const res = await fetch(url);
  const md = await res.text();
  $('#content').innerHTML = markdownToHtml(md);
}

function markdownToHtml(md){
  const lines = md.split(/\r?\n/);
  let html = '';
  let inList = false;
  let inTree = false; let treeLines = [];
  let inCode = false; let codeLang = ''; let codeLines = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (!inCode && /^```\s*tree\s*$/.test(line)) { inTree = true; treeLines = []; continue; }
    if (inTree) { if (/^```\s*$/.test(line)) { html += renderTree(treeLines.join('\n')); inTree = false; } else { treeLines.push(line); } continue; }
    const start = line.match(/^```\s*([a-z0-9+_-]*)\s*$/i);
    if (start && !inCode) { inCode = true; codeLang = start[1] || ''; codeLines = []; continue; }
    if (inCode) { if (/^```\s*$/.test(line)) { html += renderCode(codeLines.join('\n'), codeLang); inCode = false; codeLang=''; codeLines=[]; } else { codeLines.push(line); } continue; }
    // Markdown image: ![alt](src)
    const mImgMd = line.match(/^\s*!\[(.*?)\]\((.*?)\)\s*$/);
    if (mImgMd) {
      if (inList) { html += '</ul>'; inList = false; }
      const alt = mImgMd[1] || '';
      const src = resolveAssetSrc(mImgMd[2] || '');
      html += `<div class="doc-image"><img src="${src}" alt="${esc(alt)}"/></div>`;
      continue;
    }
    if (/^\s*\|/.test(line) && i+1 < lines.length && /^\s*\|\s*[-:]/.test(lines[i+1])) {
      const header = splitTableRow(line);
      i++;
      const rows = [];
      while (i+1 < lines.length && /^\s*\|/.test(lines[i+1])) { rows.push(splitTableRow(lines[i+1])); i++; }
      html += renderTable(header, rows);
      continue;
    }
    if (/^\s*>\s?/.test(line)) {
      if (inList) { html += '</ul>'; inList = false; }
      const raw = line.replace(/^\s*>\s?/, '');
      const m = raw.match(/^(Tip|Remember|Warning|Technical Stuff):\s*(.*)$/i);
      if (m) {
        const kind = m[1].toLowerCase();
        const body = m[2] || '';
        html += renderCallout(kind, body);
      } else {
        html += `<blockquote><p>${linkify(esc(raw))}</p></blockquote>`;
      }
      continue;
    }
    const mImg = line.match(/^\s*\[Image:\s*(.*?)\]\s*$/i);
    if (mImg) {
      if (inList) { html += '</ul>'; inList = false; }
      const desc = mImg[1] || '';
      html += renderImageCard(desc);
      continue;
    }
    if (/^###\s+/.test(line)) { html += `<h3>${linkify(esc(line.replace(/^###\s+/,'')))}</h3>`; continue; }
    if (/^##\s+/.test(line)) { html += `<h2>${linkify(esc(line.replace(/^##\s+/,'')))}</h2>`; continue; }
    if (/^#\s+/.test(line)) { html += `<h1>${linkify(esc(line.replace(/^#\s+/,'')))}</h1>`; continue; }
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${linkify(esc(line.replace(/^\s*[-*]\s+/,'')))}</li>`; continue;
    } else if (inList) { html += '</ul>'; inList = false; }
    if (line.trim() === '') { html += '<p></p>'; continue; }
    html += `<p>${linkify(esc(line))}</p>`;
  }
  if (inList) html += '</ul>';
  return html;
}

function splitTableRow(line){
  return line.trim().replace(/^\||\|$/g,'').split('|').map(c => c.trim());
}

function renderTable(header, rows){
  let h = '<table class="md-table"><thead><tr>' + header.map(h=>`<th>${esc(h)}</th>`).join('') + '</tr></thead><tbody>';
  for (const r of rows) { h += '<tr>' + r.map(c=>`<td>${linkify(esc(c))}</td>`).join('') + '</tr>'; }
  h += '</tbody></table>';
  return h;
}

function renderTree(text){
  return `<pre class="tree">${esc(text)}</pre>`;
}

function renderCode(text, lang){
  const cls = lang ? `code lang-${lang}` : 'code';
  return `<pre class="${cls}"><code>${esc(text)}</code></pre>`;
}

function resolveAssetSrc(path){
  if (/^https?:/i.test(path) || path.startsWith('/')) return path;
  return `${currentRoot}/${path}`;
}

function renderImageCard(desc){
  const out = { view: '', arrows: [], squares: [] };
  const parts = desc.split(/\s*;\s*/).filter(Boolean);
  for (const p of parts) {
    const mView = p.match(/^view:\s*(.+)$/i);
    const mArrow = p.match(/^arrow:\s*(.+)$/i);
    const mSquare = p.match(/^squares?:\s*(.+)$/i);
    if (mView) { out.view = mView[1]; continue; }
    if (mArrow) {
      const items = mArrow[1].split(/\s*;\s*/).filter(Boolean);
      out.arrows.push(...items);
      continue;
    }
    if (mSquare) {
      const items = mSquare[1].split(/\s*;\s*/).filter(Boolean);
      out.squares.push(...items);
      continue;
    }
  }
  let body = '';
  if (out.view) {
    body += `<div class="img-meta"><span class="img-label">View:</span> ${esc(out.view)}</div>`;
  }
  if (out.arrows.length) {
    body += `<div class="img-meta"><span class="img-label">Arrows:</span></div><ul class="img-arrows">`;
    out.arrows.forEach((it) => { body += `<li>${esc(it)}</li>`; });
    body += `</ul>`;
  }
  if (out.squares.length) {
    body += `<div class="img-meta"><span class="img-label">Red Squares:</span></div><ul class="img-arrows">`;
    out.squares.forEach((it) => { body += `<li>${esc(it)}</li>`; });
    body += `</ul>`;
  }
  if (!body) {
    body = `<div class="img-card-desc">${esc(desc)}</div>`;
  }
  return `<div class="img-card"><div class="img-card-title"><span class="img-icon">📷</span>Image</div>${body}</div>`;
}

function esc(s){
  return s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
}

function linkify(s){
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\[(.*?)\]\((.*?)\)/g, (m, text, href) => {
    const isExternal = /^https?:/i.test(href);
    const target = isExternal ? ' target="_blank"' : '';
    return `<a href="${href}" class="nav-link"${target}>${text}</a>`;
  });
  return s;
}

function renderCallout(kind, content){
  const map = {
    'tip': { icon: '💡', label: 'Tip', cls: 'callout-tip' },
    'remember': { icon: '🔑', label: 'Remember', cls: 'callout-remember' },
    'warning': { icon: '⚠️', label: 'Warning', cls: 'callout-warning' },
    'technical stuff': { icon: '🧩', label: 'Technical Stuff', cls: 'callout-technical' },
  };
  const meta = map[kind] || { icon: '💬', label: kind, cls: 'callout-generic' };
  const title = `<div class=\"callout-title\"><span class=\"callout-icon\">${meta.icon}</span>${meta.label}</div>`;
  const body = content ? `<div class=\"callout-body\">${linkify(esc(content))}</div>` : '';
  return `<div class=\"callout ${meta.cls}\">${title}${body}</div>`;
}

(async function init(){
  const toc = await loadTOC();
  const select = $('#version');
  const versions = Object.keys(toc.versions);
  versions.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v; opt.textContent = v;
    if (v === toc.default) opt.selected = true;
    select.appendChild(opt);
  });

  function mount(version){
    const cfg = toc.versions[version];
    renderNav(cfg.sections || cfg.pages, (path) => loadMarkdown(cfg.root, path));
    if (cfg.sections && cfg.sections[0] && cfg.sections[0].pages[0]) {
      loadMarkdown(cfg.root, cfg.sections[0].pages[0].path);
    } else if (cfg.pages && cfg.pages[0]) {
      loadMarkdown(cfg.root, cfg.pages[0].path);
    }
  }

  select.addEventListener('change', () => mount(select.value));
  mount(select.value);
  $('#content').addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || /^https?:/i.test(href)) return;
    if (!href.endsWith('.md')) return;
    e.preventDefault();
    const resolved = resolveRelative(currentPath, href);
    loadMarkdown(currentRoot, resolved);
  });
})();

function resolveRelative(base, link){
  try {
    const u = new URL(link, 'https://example/' + base);
    return u.pathname.replace(/^\//,'');
  } catch {
    return link;
  }
}
