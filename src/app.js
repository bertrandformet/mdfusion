import { el } from './utils/dom.js';
import { icons } from './utils/icons.js';
import { ConvertView } from './views/convert.js';
import { MergeView } from './views/merge.js';
import { EditorView } from './views/editor.js';

const FONT_STACKS = {
  hanken: '"Hanken Grotesk", system-ui, sans-serif',
  helvetica: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  system: 'system-ui, -apple-system, "Segoe UI", sans-serif',
};

function hexA(hex, a) {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
function lighten(hex) {
  const n = hex.replace('#', '');
  const f = (i) => Math.min(255, Math.round(parseInt(n.slice(i, i + 2), 16) * 1.12 + 14));
  return `rgb(${f(0)},${f(2)},${f(4)})`;
}

export function App() {
  let view = 'convert';
  let dark = false;
  const accent = '#d97757';
  const font = 'hanken';
  const density = 'regular';

  const viewCache = {};

  function applyTheme() {
    const r = document.documentElement;
    r.dataset.theme = dark ? 'dark' : 'light';
    r.dataset.density = density;
    r.style.setProperty('--accent', dark ? lighten(accent) : accent);
    r.style.setProperty('--accent-ink', '#ffffff');
    r.style.setProperty('--accent-bg', hexA(accent, dark ? 0.18 : 0.11));
    r.style.setProperty('--sans', FONT_STACKS[font] || FONT_STACKS.hanken);
  }

  // Header
  const logo = el('div', { style: { display: 'flex', alignItems: 'center', gap: '9px' } });
  logo.appendChild(el('span', {
    style: {
      width: '25px', height: '25px', borderRadius: '7px', background: 'var(--ink)',
      color: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: '700',
    },
  }, 'M'));
  logo.appendChild(el('span', {
    style: { fontWeight: '700', fontSize: '15px', letterSpacing: '-0.02em' },
  }, 'MDFusion'));

  const tabs = [['convert', 'Convertir', 'file'], ['merge', 'Fusionner', 'layers'], ['editor', 'Éditeur', 'edit']];
  const nav = el('nav', {
    style: {
      display: 'flex', background: 'var(--bg-soft)', border: '1px solid var(--line)',
      borderRadius: 'var(--radius-sm)', padding: '3px', gap: '2px', marginLeft: '4px',
    },
  });

  function renderNav() {
    nav.innerHTML = '';
    tabs.forEach(([id, label, ic]) => {
      const on = view === id;
      const btn = el('button', {
        className: 'tap',
        onClick: () => { view = id; renderNav(); renderView(); },
        style: {
          display: 'flex', alignItems: 'center', gap: '7px', border: 'none',
          borderRadius: 'calc(var(--radius-sm) - 3px)', padding: '5px 13px',
          fontSize: '13px', fontWeight: on ? '600' : '500',
          color: on ? 'var(--ink)' : 'var(--sub)',
          background: on ? 'var(--bg-surface)' : 'transparent',
          boxShadow: on ? 'var(--shadow)' : 'none', cursor: 'pointer',
        },
      });
      btn.innerHTML = icons[ic](14);
      btn.appendChild(document.createTextNode(label));
      nav.appendChild(btn);
    });
  }

  const status = el('span', {
    style: { display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12.5px', color: 'var(--sub)' },
  });
  status.appendChild(el('span', {
    style: { width: '7px', height: '7px', borderRadius: '7px', background: 'var(--ok)' },
  }));
  status.appendChild(document.createTextNode('Hors-ligne · prêt'));

  const themeBtn = el('button', {
    className: 'tap',
    title: 'Thème clair / sombre',
    onClick: () => { dark = !dark; applyTheme(); themeBtn.innerHTML = dark ? icons.sun(16) : icons.moon(16); },
    style: {
      width: '34px', height: '34px', borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--line)', background: 'var(--bg-surface)',
      color: 'var(--sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    },
    innerHTML: icons.moon(16),
  });

  const header = el('header', {
    style: {
      height: '56px', flex: '0 0 auto', background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: '16px',
    },
  }, logo, nav, el('span', { style: { flex: '1' } }), status, themeBtn);

  // Main content area
  const main = el('main', {
    className: 'scroll',
    style: { flex: '1', minHeight: '0', padding: 'var(--gap)' },
  });
  const wrapper = el('div', {
    style: { height: '100%', maxWidth: '1320px', margin: '0 auto' },
  });
  main.appendChild(wrapper);

  function renderView() {
    wrapper.innerHTML = '';
    if (!viewCache[view]) {
      if (view === 'convert') viewCache[view] = ConvertView();
      else if (view === 'merge') viewCache[view] = MergeView();
      else if (view === 'editor') viewCache[view] = EditorView();
    }
    wrapper.appendChild(viewCache[view]);
  }

  const shell = el('div', {
    style: { height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  }, header, main);

  applyTheme();
  renderNav();
  renderView();

  return shell;
}
