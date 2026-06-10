import { el } from '../utils/dom.js';
import { icons } from '../utils/icons.js';
import { FmtBadge, StatusPill, Card } from './ui.js';

export function FileList({ files, onReorder, onRemove, title }) {
  let dragId = null;
  let overId = null;

  const header = el('div', {
    style: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 15px', borderBottom: '1px solid var(--line)', flex: '0 0 auto',
    },
  });

  const body = el('div', { className: 'scroll', style: { flex: '1', minHeight: '0' } });

  const card = Card({
    flush: true,
    style: { flex: '1', minHeight: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  });
  card.appendChild(header);
  card.appendChild(body);

  function render() {
    header.innerHTML = '';
    const titleSpan = el('span', { style: { fontSize: '13.5px', fontWeight: '600' } });
    titleSpan.innerHTML = `${title} <span style="color:var(--faint);font-weight:500">· ${files.length}</span>`;
    header.appendChild(titleSpan);
    header.appendChild(el('span', {
      style: { fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--faint)' },
    }, 'glisser pour réordonner'));

    body.innerHTML = '';
    if (files.length === 0) {
      body.appendChild(el('div', {
        style: { padding: '34px 0', textAlign: 'center', color: 'var(--faint)', fontSize: '13px' },
      }, 'Aucun fichier — ajoutez-en ci-dessus.'));
      return;
    }

    files.forEach((f) => {
      const row = el('div', {
        className: 'row-in',
        draggable: true,
        onDragstart: () => { dragId = f.id; row.style.opacity = '0.4'; row.style.background = 'var(--bg-soft)'; },
        onDragend: () => { dragId = null; overId = null; row.style.opacity = '1'; row.style.background = 'transparent'; render(); },
        onDragover: (e) => {
          e.preventDefault();
          if (dragId && dragId !== f.id) {
            overId = f.id;
            row.style.boxShadow = 'inset 0 2px 0 var(--accent)';
          }
        },
        onDragleave: () => {
          if (overId === f.id) {
            overId = null;
            row.style.boxShadow = 'none';
          }
        },
        onDrop: () => {
          if (dragId == null || dragId === f.id) { dragId = null; overId = null; return; }
          const from = files.findIndex((x) => x.id === dragId);
          const to = files.findIndex((x) => x.id === f.id);
          const next = files.slice();
          const [m] = next.splice(from, 1);
          next.splice(to, 0, m);
          dragId = null; overId = null;
          onReorder(next);
        },
        style: {
          display: 'flex', alignItems: 'center', gap: '11px', padding: '0 15px',
          height: 'calc(34px + var(--row-pad))', borderBottom: '1px solid var(--line)',
          cursor: 'grab', background: 'transparent',
        },
      });

      row.innerHTML = `<span style="color:var(--faint);display:flex;flex:0 0 auto">${icons.grip(15)}</span>`;
      row.appendChild(FmtBadge(f.ext));
      row.appendChild(el('span', {
        style: { fontSize: '13.5px', flex: '1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
      }, f.name));
      row.appendChild(el('span', {
        style: { fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--faint)', flex: '0 0 auto', whiteSpace: 'nowrap' },
      }, f.size));
      if (f.st) row.appendChild(StatusPill(f.st));

      const xBtn = el('button', {
        className: 'tap',
        title: 'Retirer',
        onClick: (e) => { e.stopPropagation(); onRemove(f.id); },
        style: {
          border: 'none', background: 'transparent', color: 'var(--faint)',
          display: 'flex', padding: '3px', borderRadius: '5px', flex: '0 0 auto', cursor: 'pointer',
        },
        innerHTML: icons.x(14),
      });
      xBtn.addEventListener('mouseenter', () => { xBtn.style.background = 'var(--bg-soft)'; xBtn.style.color = 'var(--ink)'; });
      xBtn.addEventListener('mouseleave', () => { xBtn.style.background = 'transparent'; xBtn.style.color = 'var(--faint)'; });
      row.appendChild(xBtn);

      body.appendChild(row);
    });
  }

  render();
  card._render = render;
  card._setFiles = (f) => { files = f; render(); };
  return card;
}
