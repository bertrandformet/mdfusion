import { el } from '../utils/dom.js';
import { icons } from '../utils/icons.js';
import { EDITOR_SAMPLE } from '../utils/data.js';
import { mdToHtml, wordCount } from '../utils/engine.js';
import { copyToClipboard, downloadMd } from '../utils/download.js';
import { Btn, Segmented, Card } from '../components/ui.js';
import { toast } from '../components/toast.js';

export function EditorView() {
  let doc = EDITOR_SAMPLE;
  let tab = 'split';

  const container = el('div', {
    className: 'view-in',
    style: { display: 'flex', flexDirection: 'column', gap: 'var(--gap)', height: '100%', minHeight: '0' },
  });

  const textarea = el('textarea', {
    className: 'scroll',
    spellcheck: 'false',
    style: {
      flex: '1', minHeight: '0', resize: 'none', border: 'none', outline: 'none',
      background: 'transparent', padding: '20px 24px', fontFamily: 'var(--mono)',
      fontSize: '13px', lineHeight: '1.7', color: 'var(--ink)', tabSize: '2', width: '100%',
    },
  });
  textarea.value = doc;
  textarea.addEventListener('input', () => { doc = textarea.value; refresh(); });

  const previewBody = el('div', {
    className: 'scroll md-body',
    style: { flex: '1', minHeight: '0', padding: '22px 28px' },
  });

  const wordsEl = el('span', {
    style: { fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--faint)' },
  });

  // Toolbar actions
  function apply(fn) {
    const s = textarea.selectionStart, e = textarea.selectionEnd;
    const before = doc.slice(0, s), sel = doc.slice(s, e), after = doc.slice(e);
    const { text, cursor } = fn(sel, before, after);
    doc = before + text + after;
    textarea.value = doc;
    refresh();
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = before.length + (cursor != null ? cursor : text.length);
      textarea.setSelectionRange(pos, pos);
    });
  }

  const wrap = (mark, ph) => () => apply((sel) => {
    const t = sel || ph;
    return { text: mark + t + mark, cursor: sel ? mark.length + t.length + mark.length : mark.length + t.length };
  });
  const line = (prefix, ph) => () => apply((sel, before) => {
    const nl = before.length === 0 || before.endsWith('\n') ? '' : '\n';
    const t = sel || ph;
    return { text: nl + prefix + t, cursor: (nl + prefix + t).length };
  });
  const insertBlock = (block) => () => apply((sel, before) => {
    const nl = before.length === 0 || before.endsWith('\n') ? '' : '\n';
    return { text: nl + block };
  });

  const tools = [
    ['h1', 'Titre', line('# ', 'Titre')],
    ['bold', 'Gras', wrap('**', 'gras')],
    ['italic', 'Italique', wrap('*', 'italique')],
    ['code', 'Code', wrap('`', 'code')],
    ['list', 'Liste', line('- ', 'élément')],
    ['quote', 'Citation', line('> ', 'citation')],
    ['link', 'Lien', () => apply((sel) => { const t = sel || 'texte'; return { text: `[${t}](https://)`, cursor: t.length + 3 }; })],
    ['table', 'Tableau', insertBlock('| Colonne A | Colonne B |\n| --- | --- |\n| valeur | valeur |\n')],
  ];

  // Toolbar
  const toolbar = Card({
    flush: true,
    style: { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 8px', flex: '0 0 auto' },
  });
  tools.forEach(([icon, title, action]) => {
    const btn = el('button', {
      className: 'tap',
      title,
      onClick: action,
      style: {
        width: '32px', height: '30px', border: 'none', background: 'transparent',
        color: 'var(--sub)', borderRadius: 'var(--radius-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      },
      innerHTML: icons[icon](16),
    });
    btn.addEventListener('mouseenter', () => { btn.style.background = 'var(--bg-soft)'; btn.style.color = 'var(--ink)'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'transparent'; btn.style.color = 'var(--sub)'; });
    toolbar.appendChild(btn);
  });

  toolbar.appendChild(el('span', { style: { width: '1px', height: '20px', background: 'var(--line)', margin: '0 4px' } }));
  toolbar.appendChild(wordsEl);
  toolbar.appendChild(el('span', { style: { flex: '1' } }));

  const tabSeg = Segmented({
    size: 'sm', value: tab,
    options: [{ value: 'edit', label: 'Édition' }, { value: 'split', label: 'Partagé' }, { value: 'preview', label: 'Aperçu' }],
    onChange: (v) => { tab = v; renderPanels(); },
  });
  toolbar.appendChild(tabSeg);

  // Editor panel
  function makeEditorPanel() {
    const panel = Card({
      flush: true,
      style: { display: 'flex', flexDirection: 'column', minHeight: '0', overflow: 'hidden' },
    });
    const header = el('div', {
      style: {
        display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px',
        borderBottom: '1px solid var(--line)', background: 'var(--bg-inset)', flex: '0 0 auto',
      },
    });
    header.innerHTML = icons.edit(14);
    header.appendChild(el('span', {
      style: { fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--sub)' },
    }, 'document.md'));
    panel.appendChild(header);
    panel.appendChild(textarea);
    return panel;
  }

  // Preview panel
  function makePreviewPanel() {
    const panel = Card({
      flush: true,
      style: { display: 'flex', flexDirection: 'column', minHeight: '0', overflow: 'hidden' },
    });
    const header = el('div', {
      style: {
        display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 14px',
        borderBottom: '1px solid var(--line)', background: 'var(--bg-inset)', flex: '0 0 auto',
      },
    });
    header.innerHTML = icons.eye(14);
    header.appendChild(el('span', {
      style: { fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--sub)' },
    }, 'aperçu'));
    header.appendChild(el('span', { style: { flex: '1' } }));
    header.appendChild(Btn({
      children: 'Copier', icon: 'copy', kind: 'quiet', size: 'sm',
      onClick: () => { copyToClipboard(doc); toast('Markdown copié', 'copy'); },
    }));
    panel.appendChild(header);
    panel.appendChild(previewBody);
    return panel;
  }

  const grid = el('div', { style: { flex: '1', minHeight: '0' } });

  function renderPanels() {
    const showEdit = tab !== 'preview';
    const showPrev = tab !== 'edit';
    grid.innerHTML = '';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = showEdit && showPrev ? '1fr 1fr' : '1fr';
    grid.style.gap = 'var(--gap)';
    if (showEdit) grid.appendChild(makeEditorPanel());
    if (showPrev) grid.appendChild(makePreviewPanel());
    refresh();
  }

  function refresh() {
    previewBody.innerHTML = mdToHtml(doc);
    wordsEl.textContent = wordCount(doc) + ' mots';
  }

  container.appendChild(toolbar);
  container.appendChild(grid);
  renderPanels();

  return container;
}
