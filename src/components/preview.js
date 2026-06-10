import { el } from '../utils/dom.js';
import { icons } from '../utils/icons.js';
import { mdToHtml } from '../utils/engine.js';
import { Segmented, Card } from './ui.js';

export function PreviewPane({ md = '', filename = 'resultat.md', empty }) {
  let mode = 'rendu';
  let currentMd = md;

  const dots = el('span', { style: { display: 'flex', gap: '6px' } });
  ['#e0584a', '#e3b341', '#3ea76a'].forEach((c) => {
    dots.appendChild(el('span', {
      style: { width: '10px', height: '10px', borderRadius: '6px', background: c, opacity: '0.85' },
    }));
  });

  const fileLabel = el('span', {
    style: { fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--sub)', marginLeft: '4px' },
  }, filename);

  const seg = Segmented({
    size: 'sm', value: mode,
    options: [{ value: 'rendu', label: 'Rendu' }, { value: 'source', label: 'Source' }],
    onChange: (v) => { mode = v; renderBody(); },
  });

  const headerBar = el('div', {
    style: {
      display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 14px',
      borderBottom: '1px solid var(--line)', background: 'var(--bg-inset)', flex: '0 0 auto',
    },
  }, dots, fileLabel, el('span', { style: { flex: '1' } }), seg);

  const bodyEl = el('div', {
    className: 'scroll',
    style: { flex: '1', minHeight: '0', padding: '22px 26px' },
  });

  function renderBody() {
    bodyEl.innerHTML = '';
    if (empty && (!currentMd || currentMd.trim() === '')) {
      bodyEl.appendChild(el('div', {
        style: {
          height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--faint)',
        },
      }, el('span', { innerHTML: icons.file(26) }), el('span', { style: { fontSize: '13px' } }, empty)));
      return;
    }
    if (mode === 'rendu') {
      const rendered = el('div', { className: 'md-body', innerHTML: mdToHtml(currentMd) });
      bodyEl.appendChild(rendered);
    } else {
      bodyEl.appendChild(el('div', { className: 'md-source' }, currentMd));
    }
  }

  renderBody();

  const card = Card({
    flush: true,
    style: { display: 'flex', flexDirection: 'column', minHeight: '0', overflow: 'hidden', height: '100%' },
  });
  card.appendChild(headerBar);
  card.appendChild(bodyEl);

  card.update = (newMd, newEmpty) => {
    currentMd = newMd;
    if (newEmpty !== undefined) empty = newEmpty;
    renderBody();
  };
  card.setFilename = (name) => { fileLabel.textContent = name; };
  return card;
}
