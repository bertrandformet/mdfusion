import { el } from '../utils/dom.js';
import { icons } from '../utils/icons.js';
import { Kbd } from './ui.js';

export function DropZone({ onAdd, onFiles, accept = 'PDF · DOCX · XLSX · CSV · HTML · EPUB · IMG · XML · JSON', hint, compact }) {
  let over = false;

  const iconWrap = el('span', {
    style: {
      width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-bg)',
      color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all .15s',
    },
    innerHTML: icons.upload(19),
  });

  const label = el('div', {
    style: { fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' },
  });
  label.innerHTML = 'Déposez ou <span style="color:var(--accent)">parcourez</span>';

  const hintRow = el('div', {
    style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--sub)', whiteSpace: 'nowrap' },
  });
  if (hint) {
    hintRow.innerHTML = hint;
  } else {
    hintRow.appendChild(document.createTextNode('ou collez avec '));
    hintRow.appendChild(Kbd('⌘'));
    hintRow.appendChild(Kbd('V'));
  }

  const fmtLine = !compact ? el('div', {
    style: {
      fontFamily: 'var(--mono)', fontSize: '9.5px', color: 'var(--faint)',
      letterSpacing: '0.04em', marginTop: '2px', whiteSpace: 'nowrap',
    },
  }, accept) : null;

  const fileInput = el('input', { type: 'file', style: { display: 'none' } });
  fileInput.multiple = true;
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0 && onFiles) {
      onFiles(Array.from(fileInput.files));
    } else if (fileInput.files.length > 0 && onAdd) {
      onAdd();
    }
    fileInput.value = '';
  });

  const zone = el('div', {
    className: 'tap',
    onClick: () => fileInput.click(),
    onDragover: (e) => {
      e.preventDefault();
      if (!over) {
        over = true;
        zone.style.borderColor = 'var(--accent)';
        zone.style.background = 'var(--accent-bg)';
        iconWrap.style.background = 'var(--accent)';
        iconWrap.style.color = 'var(--accent-ink)';
      }
    },
    onDragleave: () => {
      over = false;
      zone.style.borderColor = 'var(--line-strong)';
      zone.style.background = 'var(--bg-inset)';
      iconWrap.style.background = 'var(--accent-bg)';
      iconWrap.style.color = 'var(--accent)';
    },
    onDrop: (e) => {
      e.preventDefault();
      over = false;
      zone.style.borderColor = 'var(--line-strong)';
      zone.style.background = 'var(--bg-inset)';
      iconWrap.style.background = 'var(--accent-bg)';
      iconWrap.style.color = 'var(--accent)';
      if (e.dataTransfer.files.length > 0 && onFiles) {
        onFiles(Array.from(e.dataTransfer.files));
      } else if (onAdd) {
        onAdd();
      }
    },
    style: {
      cursor: 'pointer', border: '1.5px dashed var(--line-strong)',
      borderRadius: 'var(--radius-sm)', background: 'var(--bg-inset)',
      padding: compact ? '20px 16px' : '26px 16px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '9px',
    },
  }, fileInput, iconWrap, label, hintRow);

  if (fmtLine) zone.appendChild(fmtLine);
  return zone;
}
