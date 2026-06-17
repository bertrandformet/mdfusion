// Primitives UI — converti depuis proto/ui.jsx en vanilla JS
import { el } from '../utils/dom.js?v=6';
import { icons } from '../utils/icons.js?v=6';
import { FORMATS } from '../utils/data.js?v=6';

// ── Btn ──────────────────────────────────────────────────
export function Btn({ children, icon, onClick, kind = 'primary', full, disabled, size = 'md' }) {
  const pad = size === 'sm' ? '7px 12px' : '0 16px';
  const h = size === 'sm' ? 'auto' : '38px';
  const kinds = {
    primary: { background: 'var(--accent)', color: 'var(--accent-ink)', boxShadow: '0 1px 2px rgba(217,119,87,0.4)', borderColor: 'transparent' },
    ghost: { background: 'var(--bg-surface)', color: 'var(--ink)', borderColor: 'var(--line)' },
    soft: { background: 'var(--bg-soft)', color: 'var(--ink)', borderColor: 'transparent' },
    quiet: { background: 'transparent', color: 'var(--sub)', borderColor: 'transparent' },
  };
  const k = kinds[kind] || kinds.primary;
  const btn = el('button', {
    className: 'tap',
    onClick,
    style: {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      height: h, padding: pad, borderRadius: 'var(--radius-sm)', fontSize: '13.5px', fontWeight: '600',
      letterSpacing: '-0.01em', border: '1px solid ' + (k.borderColor || 'transparent'),
      width: full ? '100%' : 'auto', opacity: disabled ? '0.5' : '1',
      pointerEvents: disabled ? 'none' : 'auto', whiteSpace: 'nowrap',
      background: k.background, color: k.color, boxShadow: k.boxShadow || 'none',
    },
  });
  if (icon) btn.innerHTML = icons[icon](15);
  if (children) {
    const span = document.createElement('span');
    span.textContent = children;
    btn.appendChild(span);
  }
  if (kind === 'ghost') {
    btn.addEventListener('mouseenter', () => { btn.style.borderColor = 'var(--line-strong)'; });
    btn.addEventListener('mouseleave', () => { btn.style.borderColor = 'var(--line)'; });
  }
  if (kind === 'quiet') {
    btn.addEventListener('mouseenter', () => { btn.style.background = 'var(--bg-soft)'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'transparent'; });
  }
  return btn;
}

// ── Segmented ────────────────────────────────────────────
export function Segmented({ options, value, onChange, size = 'md' }) {
  const wrap = el('div', {
    style: {
      display: 'inline-flex', background: 'var(--bg-soft)', border: '1px solid var(--line)',
      borderRadius: 'var(--radius-sm)', padding: '3px', gap: '2px',
    },
  });

  function render() {
    wrap.innerHTML = '';
    options.forEach((o) => {
      const v = typeof o === 'string' ? o : o.value;
      const label = typeof o === 'string' ? o : o.label;
      const on = v === value;
      const btn = el('button', {
        className: 'tap',
        onClick: () => { value = v; onChange(v); render(); },
        style: {
          border: 'none', borderRadius: 'calc(var(--radius-sm) - 3px)',
          padding: size === 'sm' ? '4px 11px' : '5px 14px',
          fontSize: size === 'sm' ? '11.5px' : '13px',
          fontWeight: on ? '600' : '500',
          fontFamily: o.mono ? 'var(--mono)' : 'inherit',
          color: on ? 'var(--ink)' : 'var(--sub)',
          background: on ? 'var(--bg-surface)' : 'transparent',
          boxShadow: on ? 'var(--shadow)' : 'none',
        },
      }, label);
      wrap.appendChild(btn);
    });
  }
  render();

  wrap.setValue = (v) => { value = v; render(); };
  return wrap;
}

// ── Toggle ───────────────────────────────────────────────
export function Toggle({ value, onChange }) {
  let on = value;
  const knob = el('span', {
    style: {
      position: 'absolute', top: '2px', left: on ? '18px' : '2px',
      width: '18px', height: '18px', borderRadius: '10px',
      background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
      transition: 'left .16s cubic-bezier(.2,.7,.3,1)',
    },
  });
  const btn = el('button', {
    className: 'tap',
    onClick: () => {
      on = !on;
      btn.style.background = on ? 'var(--accent)' : 'var(--line-strong)';
      knob.style.left = on ? '18px' : '2px';
      onChange(on);
    },
    style: {
      width: '38px', height: '22px', borderRadius: '12px', border: 'none', padding: '0',
      position: 'relative', background: on ? 'var(--accent)' : 'var(--line-strong)',
    },
  }, knob);
  return btn;
}

// ── StatusPill ───────────────────────────────────────────
export function StatusPill(st) {
  const map = {
    ok: ['Converti', 'var(--accent)', 'var(--accent-bg)'],
    run: ['En cours', 'var(--sub)', 'var(--bg-soft)'],
    wait: ['En attente', 'var(--faint)', 'var(--bg-soft)'],
    err: ['Erreur', '#cf4b3b', 'rgba(207,75,59,0.12)'],
  };
  const [t, c, bg] = map[st] || map.wait;
  const pill = el('span', {
    style: {
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      fontFamily: 'var(--mono)', fontSize: '10.5px',
      color: c, background: bg, padding: '3px 8px', borderRadius: '20px', whiteSpace: 'nowrap',
    },
  });
  if (st === 'run') {
    const spinner = el('span', {
      className: 'spin',
      style: {
        width: '8px', height: '8px', border: '1.5px solid currentColor',
        borderTopColor: 'transparent', borderRadius: '8px', display: 'inline-block',
      },
    });
    pill.appendChild(spinner);
  }
  pill.appendChild(document.createTextNode(t));
  return pill;
}

// ── FmtBadge ─────────────────────────────────────────────
export function FmtBadge(ext) {
  const f = FORMATS[ext] || { label: ext.toUpperCase() };
  return el('span', {
    style: {
      fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--sub)',
      background: 'var(--bg-canvas)', border: '1px solid var(--line)',
      borderRadius: '5px', padding: '2px 5px', minWidth: '44px', textAlign: 'center', flex: '0 0 auto',
    },
  }, f.label);
}

// ── Kbd ──────────────────────────────────────────────────
export function Kbd(text) {
  return el('span', {
    style: {
      fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--sub)',
      border: '1px solid var(--line)', borderBottomWidth: '2px', borderRadius: '5px',
      padding: '1px 6px', background: 'var(--bg-surface)',
    },
  }, text);
}

// ── Card ─────────────────────────────────────────────────
export function Card({ children, style = {}, flush, className = '' } = {}) {
  const card = el('div', {
    className,
    style: {
      background: 'var(--bg-surface)', border: '1px solid var(--line)',
      borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
      padding: flush ? '0' : 'var(--pad)',
      ...style,
    },
  });
  if (children) {
    if (Array.isArray(children)) children.forEach((c) => { if (c) card.appendChild(c); });
    else if (children instanceof Node) card.appendChild(children);
  }
  return card;
}
