// proto/ui.jsx — primitives d'interface (Direction B « Console »)
const { useState, useRef, useEffect, useCallback } = React;
const Ic = window.Ic;

// ── Boutons ───────────────────────────────────────────────
function Btn({ children, icon, onClick, kind = 'primary', full, disabled, size = 'md' }) {
  const Icon = icon ? Ic[icon] : null;
  const pad = size === 'sm' ? '7px 12px' : '0 16px';
  const h = size === 'sm' ? 'auto' : 38;
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: h, padding: pad, borderRadius: 'var(--radius-sm)', fontSize: 13.5, fontWeight: 600,
    letterSpacing: '-0.01em', border: '1px solid transparent', width: full ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto', whiteSpace: 'nowrap',
  };
  const kinds = {
    primary: { background: 'var(--accent)', color: 'var(--accent-ink)', boxShadow: '0 1px 2px rgba(217,119,87,0.4)' },
    ghost: { background: 'var(--bg-surface)', color: 'var(--ink)', borderColor: 'var(--line)' },
    soft: { background: 'var(--bg-soft)', color: 'var(--ink)' },
    quiet: { background: 'transparent', color: 'var(--sub)' },
  };
  return (
    <button className="tap" onClick={onClick} style={{ ...base, ...kinds[kind] }}
      onMouseEnter={(e) => { if (kind === 'ghost') e.currentTarget.style.borderColor = 'var(--line-strong)'; if (kind === 'quiet') e.currentTarget.style.background = 'var(--bg-soft)'; }}
      onMouseLeave={(e) => { if (kind === 'ghost') e.currentTarget.style.borderColor = 'var(--line)'; if (kind === 'quiet') e.currentTarget.style.background = 'transparent'; }}>
      {Icon && <Icon size={15} />}{children}
    </button>
  );
}

// ── Segmented control ─────────────────────────────────────
function Segmented({ options, value, onChange, size = 'md' }) {
  return (
    <div style={{ display: 'inline-flex', background: 'var(--bg-soft)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 3, gap: 2 }}>
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        const on = v === value;
        return (
          <button key={v} className="tap" onClick={() => onChange(v)}
            style={{ border: 'none', borderRadius: 'calc(var(--radius-sm) - 3px)', padding: size === 'sm' ? '4px 11px' : '5px 14px',
              fontSize: size === 'sm' ? 11.5 : 13, fontWeight: on ? 600 : 500, fontFamily: o.mono ? 'var(--mono)' : 'inherit',
              color: on ? 'var(--ink)' : 'var(--sub)', background: on ? 'var(--bg-surface)' : 'transparent',
              boxShadow: on ? 'var(--shadow)' : 'none' }}>{label}</button>
        );
      })}
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button className="tap" onClick={() => onChange(!value)}
      style={{ width: 38, height: 22, borderRadius: 12, border: 'none', padding: 0, position: 'relative',
        background: value ? 'var(--accent)' : 'var(--line-strong)' }}>
      <span style={{ position: 'absolute', top: 2, left: value ? 18 : 2, width: 18, height: 18, borderRadius: 10,
        background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.25)', transition: 'left .16s cubic-bezier(.2,.7,.3,1)' }} />
    </button>
  );
}

// ── Pastille de statut ────────────────────────────────────
function StatusPill({ st }) {
  const map = {
    ok: ['Converti', 'var(--accent)', 'var(--accent-bg)'],
    run: ['En cours', 'var(--sub)', 'var(--bg-soft)'],
    wait: ['En attente', 'var(--faint)', 'var(--bg-soft)'],
    err: ['Erreur', '#cf4b3b', 'rgba(207,75,59,0.12)'],
  };
  const [t, c, bg] = map[st] || map.wait;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--mono)', fontSize: 10.5,
      color: c, background: bg, padding: '3px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>
      {st === 'run' && <span className="spin" style={{ width: 8, height: 8, border: '1.5px solid currentColor', borderTopColor: 'transparent', borderRadius: 8, display: 'inline-block' }} />}
      {t}
    </span>
  );
}

// ── Touche clavier ────────────────────────────────────────
function Kbd({ children }) {
  return <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--sub)', border: '1px solid var(--line)',
    borderBottomWidth: 2, borderRadius: 5, padding: '1px 6px', background: 'var(--bg-surface)' }}>{children}</span>;
}

// ── Badge format ──────────────────────────────────────────
function FmtBadge({ ext }) {
  const f = (window.FORMATS || {})[ext] || { label: ext.toUpperCase() };
  return <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--sub)', background: 'var(--bg-canvas)',
    border: '1px solid var(--line)', borderRadius: 5, padding: '2px 5px', minWidth: 44, textAlign: 'center', flex: '0 0 auto' }}>{f.label}</span>;
}

// ── Carte ─────────────────────────────────────────────────
function Card({ children, style, pad, className, flush }) {
  return <div className={className} style={{ background: 'var(--bg-surface)', border: '1px solid var(--line)',
    borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', padding: flush ? 0 : (pad ?? 'var(--pad)'), ...style }}>{children}</div>;
}

// ── Dropzone ──────────────────────────────────────────────
function DropZone({ onAdd, accept = 'PDF · DOCX · XLSX · CSV · HTML · EPUB · IMG · XML · JSON', hint, compact }) {
  const [over, setOver] = useState(false);
  return (
    <div onClick={onAdd} onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); onAdd(); }}
      className="tap" style={{ cursor: 'pointer', border: `1.5px dashed ${over ? 'var(--accent)' : 'var(--line-strong)'}`,
        borderRadius: 'var(--radius-sm)', background: over ? 'var(--accent-bg)' : 'var(--bg-inset)',
        padding: compact ? '20px 16px' : '26px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
      <span style={{ width: 40, height: 40, borderRadius: 10, background: over ? 'var(--accent)' : 'var(--accent-bg)',
        color: over ? 'var(--accent-ink)' : 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>
        <Ic.upload size={19} />
      </span>
      <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>Déposez ou <span style={{ color: 'var(--accent)' }}>parcourez</span></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--sub)', whiteSpace: 'nowrap' }}>
        {hint || <>ou collez avec <Kbd>⌘</Kbd><Kbd>V</Kbd></>}
      </div>
      {!compact && <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--faint)', letterSpacing: '0.04em', marginTop: 2, whiteSpace: 'nowrap' }}>{accept}</div>}
    </div>
  );
}

// ── Liste de fichiers réordonnable (drag natif) ───────────
function FileList({ files, onReorder, onRemove, title }) {
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  const onDrop = (targetId) => {
    if (dragId == null || dragId === targetId) { setDragId(null); setOverId(null); return; }
    const from = files.findIndex((f) => f.id === dragId);
    const to = files.findIndex((f) => f.id === targetId);
    const next = files.slice();
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onReorder(next);
    setDragId(null); setOverId(null);
  };

  return (
    <Card flush style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', borderBottom: '1px solid var(--line)', flex: '0 0 auto' }}>
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{title} <span style={{ color: 'var(--faint)', fontWeight: 500 }}>· {files.length}</span></span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)' }}>glisser pour réordonner</span>
      </div>
      <div className="scroll" style={{ flex: 1, minHeight: 0 }}>
        {files.length === 0 && (
          <div style={{ padding: '34px 0', textAlign: 'center', color: 'var(--faint)', fontSize: 13 }}>Aucun fichier — ajoutez-en ci-dessus.</div>
        )}
        {files.map((f) => (
          <div key={f.id} className="row-in" draggable
            onDragStart={() => setDragId(f.id)} onDragEnd={() => { setDragId(null); setOverId(null); }}
            onDragOver={(e) => { e.preventDefault(); setOverId(f.id); }} onDrop={() => onDrop(f.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '0 15px', height: 'calc(34px + var(--row-pad))',
              borderBottom: '1px solid var(--line)', opacity: dragId === f.id ? 0.4 : 1,
              boxShadow: overId === f.id && dragId !== f.id ? 'inset 0 2px 0 var(--accent)' : 'none',
              background: dragId === f.id ? 'var(--bg-soft)' : 'transparent', cursor: 'grab' }}>
            <span style={{ color: 'var(--faint)', display: 'flex', flex: '0 0 auto' }}><Ic.grip size={15} /></span>
            <FmtBadge ext={f.ext} />
            <span style={{ fontSize: 13.5, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)', flex: '0 0 auto', whiteSpace: 'nowrap' }}>{f.size}</span>
            {f.st && <StatusPill st={f.st} />}
            <button className="tap fl-x" onClick={() => onRemove(f.id)} title="Retirer"
              style={{ border: 'none', background: 'transparent', color: 'var(--faint)', display: 'flex', padding: 3, borderRadius: 5, flex: '0 0 auto' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-soft)'; e.currentTarget.style.color = 'var(--ink)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--faint)'; }}>
              <Ic.x size={14} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Panneau d'aperçu (rendu / source) ─────────────────────
function PreviewPane({ md, filename = 'resultat.md', empty }) {
  const [mode, setMode] = useState('rendu');
  const html = window.mdToHtml(md || '');
  return (
    <Card flush style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', borderBottom: '1px solid var(--line)', background: 'var(--bg-inset)', flex: '0 0 auto' }}>
        <span style={{ display: 'flex', gap: 6 }}>{['#e0584a', '#e3b341', '#3ea76a'].map((c) => <span key={c} style={{ width: 10, height: 10, borderRadius: 6, background: c, opacity: 0.85 }} />)}</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--sub)', marginLeft: 4 }}>{filename}</span>
        <span style={{ flex: 1 }} />
        <Segmented size="sm" value={mode} onChange={setMode} options={[{ value: 'rendu', label: 'Rendu' }, { value: 'source', label: 'Source' }]} />
      </div>
      <div className="scroll" style={{ flex: 1, minHeight: 0, padding: '22px 26px' }}>
        {empty ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--faint)' }}>
            <Ic.file size={26} />
            <span style={{ fontSize: 13 }}>{empty}</span>
          </div>
        ) : mode === 'rendu'
          ? <div className="md-body" dangerouslySetInnerHTML={{ __html: html }} />
          : <div className="md-source">{md}</div>}
      </div>
    </Card>
  );
}

Object.assign(window, { Btn, Segmented, Toggle, StatusPill, Kbd, FmtBadge, Card, DropZone, FileList, PreviewPane });
