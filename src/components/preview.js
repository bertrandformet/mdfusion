import { el } from '../utils/dom.js?v=6';
import { icons } from '../utils/icons.js?v=6';
import { mdToHtml } from '../utils/engine.js?v=6';
import { Segmented, Card } from './ui.js?v=6';

export function PreviewPane({ md = '', filename = 'resultat.md', empty, onEdit }) {
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

  const options = [
    { value: 'rendu', label: 'Rendu' },
    { value: 'edit', label: 'Édition' },
    { value: 'source', label: 'Source' },
  ];

  const seg = Segmented({
    size: 'sm', value: mode,
    options,
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
    style: { flex: '1', minHeight: '0', padding: '0' },
  });

  let editTextarea = null;

  function renderBody() {
    bodyEl.innerHTML = '';
    bodyEl.style.padding = '0';

    if (empty && (!currentMd || currentMd.trim() === '')) {
      bodyEl.style.padding = '22px 26px';
      bodyEl.appendChild(el('div', {
        style: {
          height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--faint)',
        },
      }, el('span', { innerHTML: icons.file(26) }), el('span', { style: { fontSize: '13px' } }, empty)));
      return;
    }

    if (mode === 'rendu') {
      bodyEl.style.padding = '22px 26px';
      const rendered = el('div', { className: 'md-body', innerHTML: mdToHtml(currentMd) });
      bodyEl.appendChild(rendered);
    } else if (mode === 'edit') {
      editTextarea = el('textarea', {
        className: 'scroll',
        spellcheck: 'false',
        style: {
          width: '100%', height: '100%', resize: 'none', border: 'none', outline: 'none',
          background: 'transparent', padding: '20px 24px', fontFamily: 'var(--mono)',
          fontSize: '13px', lineHeight: '1.7', color: 'var(--ink)', tabSize: '2',
          boxSizing: 'border-box',
        },
      });
      editTextarea.value = currentMd;
      editTextarea.addEventListener('input', () => {
        currentMd = editTextarea.value;
        if (onEdit) onEdit(currentMd);
      });
      bodyEl.appendChild(editTextarea);
    } else {
      bodyEl.style.padding = '22px 26px';
      bodyEl.appendChild(el('pre', {
        style: {
          fontFamily: 'var(--mono)', fontSize: '12px', lineHeight: '1.7',
          color: 'var(--ink)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: '0',
        },
      }, currentMd));
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
    if (mode === 'edit' && editTextarea && document.activeElement === editTextarea) return;
    renderBody();
  };
  card.getMd = () => currentMd;
  card.setFilename = (name) => { fileLabel.textContent = name; };
  return card;
}
