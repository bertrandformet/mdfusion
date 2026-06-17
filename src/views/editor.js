import { el } from '../utils/dom.js?v=5';
import { icons } from '../utils/icons.js?v=5';
import { EDITOR_SAMPLE } from '../utils/data.js?v=5';
import { mdToHtml, wordCount } from '../utils/engine.js?v=5';
import { copyToClipboard, downloadMd } from '../utils/download.js?v=5';
import { Btn, Segmented, Card } from '../components/ui.js?v=5';
import { toast } from '../components/toast.js?v=5';

let TurndownService;
async function loadTurndown() {
  if (!TurndownService) {
    const mod = await import('https://esm.sh/turndown@7.2.0');
    TurndownService = mod.default;
  }
  return TurndownService;
}

export function EditorView() {
  let doc = EDITOR_SAMPLE;
  let tab = 'split';
  let updatingFromPreview = false;
  let updatingFromEditor = false;

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
  textarea.addEventListener('input', () => {
    if (updatingFromPreview) return;
    doc = textarea.value;
    updatingFromEditor = true;
    refresh();
    updatingFromEditor = false;
  });

  const previewBody = el('div', {
    className: 'scroll md-body',
    style: { flex: '1', minHeight: '0', padding: '22px 28px', outline: 'none' },
  });

  const wordsEl = el('span', {
    style: { fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--faint)' },
  });

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

  const headingLevels = [
    ['# ', 'H1'], ['## ', 'H2'], ['### ', 'H3'], ['#### ', 'H4'], ['##### ', 'H5'],
  ];

  function HeadingDropdown() {
    const wrap = el('div', { style: { position: 'relative', display: 'inline-flex' } });
    const btn = el('button', {
      className: 'tap',
      title: 'Titre',
      style: {
        height: '28px', border: 'none', background: 'transparent', color: 'var(--sub)',
        borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '3px',
        padding: '0 8px', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: '600',
      },
    });
    btn.innerHTML = icons.h1(15) + '<span style="font-size:9px;opacity:.6">▾</span>';

    const menu = el('div', {
      style: {
        position: 'absolute', top: '100%', left: '0', marginTop: '4px', zIndex: '100',
        background: 'var(--bg-surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
        boxShadow: 'var(--shadow-lg, 0 4px 12px rgba(0,0,0,.12))', padding: '4px', display: 'none',
        minWidth: '110px',
      },
    });

    headingLevels.forEach(([prefix, label]) => {
      const item = el('button', {
        className: 'tap',
        onClick: () => { menu.style.display = 'none'; line(prefix, 'Titre')(); },
        style: {
          display: 'block', width: '100%', border: 'none', background: 'transparent',
          padding: '5px 10px', textAlign: 'left', cursor: 'pointer', borderRadius: '4px',
          fontSize: '13px', fontWeight: '600', color: 'var(--ink)',
        },
      }, label);
      item.addEventListener('mouseenter', () => { item.style.background = 'var(--bg-soft)'; });
      item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
      menu.appendChild(item);
    });

    btn.addEventListener('click', () => {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) menu.style.display = 'none';
    });

    btn.addEventListener('mouseenter', () => { btn.style.background = 'var(--bg-soft)'; btn.style.color = 'var(--ink)'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'transparent'; btn.style.color = 'var(--sub)'; });

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    return wrap;
  }

  const SEP = 'sep';
  const tools = [
    ['bold', 'Gras', wrap('**', 'gras')],
    ['italic', 'Italique', wrap('*', 'italique')],
    ['underline', 'Souligné', () => apply((sel) => { const t = sel || 'souligné'; return { text: '<u>' + t + '</u>', cursor: 3 + t.length + 4 }; })],
    ['strikethrough', 'Barré', wrap('~~', 'barré')],
    ['code', 'Code', wrap('`', 'code')],
    SEP,
    ['list', 'Liste à puces', line('- ', 'élément')],
    ['listOrdered', 'Liste numérotée', line('1. ', 'élément')],
    ['checkbox', 'Case à cocher', line('- [ ] ', 'tâche')],
    ['quote', 'Citation', line('> ', 'citation')],
    SEP,
    ['link2', 'Lien', () => apply((sel) => { const t = sel || 'texte'; return { text: `[${t}](https://)`, cursor: t.length + 3 }; })],
    ['table', 'Tableau', insertBlock('| Colonne A | Colonne B |\n| --- | --- |\n| valeur | valeur |\n')],
    ['hr', 'Ligne horizontale', insertBlock('\n---\n')],
  ];

  const toolbar = Card({
    flush: true,
    style: { display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 8px', flex: '0 0 auto' },
  });
  toolbar.appendChild(HeadingDropdown());
  toolbar.appendChild(el('span', { style: { width: '1px', height: '20px', background: 'var(--line)', margin: '0 2px' } }));
  tools.forEach((item) => {
    if (item === SEP) {
      toolbar.appendChild(el('span', { style: { width: '1px', height: '20px', background: 'var(--line)', margin: '0 2px' } }));
      return;
    }
    const [icon, title, action] = item;
    const btn = el('button', {
      className: 'tap',
      title,
      onClick: action,
      style: {
        width: '30px', height: '28px', border: 'none', background: 'transparent',
        color: 'var(--sub)', borderRadius: 'var(--radius-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      },
      innerHTML: icons[icon](15),
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

  let previewEditable = false;

  function makePreviewPanel() {
    const showPrev = tab !== 'edit';
    const showEdit = tab !== 'preview';
    previewEditable = showPrev && !showEdit;

    previewBody.contentEditable = previewEditable ? 'true' : 'false';
    previewBody.style.cursor = previewEditable ? 'text' : 'default';

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
    const labelText = previewEditable ? 'aperçu · éditable' : 'aperçu';
    header.appendChild(el('span', {
      style: { fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--sub)' },
    }, labelText));
    if (previewEditable) {
      header.appendChild(el('span', {
        style: {
          fontFamily: 'var(--mono)', fontSize: '9.5px', color: 'var(--accent)',
          background: 'var(--accent-bg)', padding: '2px 7px', borderRadius: '4px', marginLeft: '6px',
        },
      }, 'WYSIWYG'));
    }
    header.appendChild(el('span', { style: { flex: '1' } }));
    header.appendChild(Btn({
      children: 'Copier', icon: 'copy', kind: 'quiet', size: 'sm',
      onClick: () => { copyToClipboard(doc); toast('Markdown copié', 'copy'); },
    }));
    panel.appendChild(header);
    panel.appendChild(previewBody);
    return panel;
  }

  let debounceTimer = null;

  previewBody.addEventListener('input', () => {
    if (!previewEditable || updatingFromEditor) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const Td = await loadTurndown();
        const td = new Td({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
        const html = previewBody.innerHTML;
        const newMd = td.turndown(html);
        updatingFromPreview = true;
        doc = newMd;
        textarea.value = doc;
        wordsEl.textContent = wordCount(doc) + ' mots';
        updatingFromPreview = false;
      } catch (e) {
        console.warn('Turndown error:', e);
      }
    }, 300);
  });

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
    if (!updatingFromPreview) {
      previewBody.innerHTML = mdToHtml(doc);
    }
    wordsEl.textContent = wordCount(doc) + ' mots';
  }

  container.appendChild(toolbar);
  container.appendChild(grid);
  renderPanels();

  return container;
}
