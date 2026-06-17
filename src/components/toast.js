import { el } from '../utils/dom.js?v=5';
import { icons } from '../utils/icons.js?v=5';

let container = null;

function getContainer() {
  if (container) return container;
  container = el('div', {
    style: {
      position: 'fixed', bottom: '22px', left: '50%', transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', gap: '9px', alignItems: 'center', zIndex: '60',
    },
  });
  document.body.appendChild(container);
  return container;
}

const iconMap = { ok: 'check', copy: 'copy', dl: 'download', add: 'plus', warn: 'x', save: 'check' };

export function toast(msg, kind = 'ok') {
  const host = getContainer();
  const iconName = iconMap[kind] || 'check';
  const isWarn = kind === 'warn';
  const color = isWarn ? '#cf4b3b' : 'var(--accent)';
  const bg = isWarn ? 'rgba(207,75,59,0.12)' : 'var(--accent-bg)';

  const ic = el('span', {
    className: 'ic',
    style: {
      width: '22px', height: '22px', borderRadius: '6px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flex: '0 0 auto', background: bg, color: color,
    },
    innerHTML: icons[iconName](13),
  });

  const t = el('div', { className: 'toast' }, ic, document.createTextNode(msg));
  host.appendChild(t);
  setTimeout(() => { t.remove(); }, 2600);
}
