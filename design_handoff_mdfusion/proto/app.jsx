// proto/app.jsx — shell : header, navigation, thème, toasts, Tweaks
const { useState: useStateA, useEffect: useEffectA, useRef: useRefA, useCallback: useCbA } = React;

const FONT_STACKS = {
  hanken: '"Hanken Grotesk", system-ui, sans-serif',
  helvetica: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  system: 'system-ui, -apple-system, "Segoe UI", sans-serif',
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#d97757",
  "font": "hanken",
  "density": "regular",
  "dark": false
}/*EDITMODE-END*/;

// ── Toasts ────────────────────────────────────────────────
function useToasts() {
  const [items, setItems] = useStateA([]);
  const push = useCbA((msg, kind = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setItems((x) => [...x, { id, msg, kind }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 2600);
  }, []);
  return [items, push];
}

function ToastHost({ items }) {
  const Ic = window.Ic;
  const icon = { ok: 'check', copy: 'copy', dl: 'download', add: 'plus', warn: 'x', save: 'check' };
  const col = { warn: '#cf4b3b' };
  return (
    <div style={{ position: 'fixed', bottom: 22, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', gap: 9, alignItems: 'center', zIndex: 60 }}>
      {items.map((t) => {
        const I = Ic[icon[t.kind] || 'check'];
        const c = col[t.kind] || 'var(--accent)';
        return (
          <div key={t.id} className="toast">
            <span className="ic" style={{ background: t.kind === 'warn' ? 'rgba(207,75,59,0.12)' : 'var(--accent-bg)', color: c }}><I size={13} /></span>
            {t.msg}
          </div>
        );
      })}
    </div>
  );
}

// ── Header ────────────────────────────────────────────────
function Header({ view, setView, dark, onToggleTheme }) {
  const Ic = window.Ic;
  const tabs = [['convert', 'Convertir', 'file'], ['merge', 'Fusionner', 'layers'], ['editor', 'Éditeur', 'edit']];
  return (
    <header style={{ height: 56, flex: '0 0 auto', background: 'var(--bg-surface)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ width: 25, height: 25, borderRadius: 7, background: 'var(--ink)', color: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700 }}>M</span>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>MDFusion</span>
      </div>
      <nav style={{ display: 'flex', background: 'var(--bg-soft)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 3, gap: 2, marginLeft: 4 }}>
        {tabs.map(([id, label, ic]) => {
          const on = view === id; const I = Ic[ic];
          return (
            <button key={id} className="tap" onClick={() => setView(id)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, border: 'none', borderRadius: 'calc(var(--radius-sm) - 3px)', padding: '5px 13px',
                fontSize: 13, fontWeight: on ? 600 : 500, color: on ? 'var(--ink)' : 'var(--sub)',
                background: on ? 'var(--bg-surface)' : 'transparent', boxShadow: on ? 'var(--shadow)' : 'none' }}>
              <I size={14} />{label}
            </button>
          );
        })}
      </nav>
      <span style={{ flex: 1 }} />
      <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--sub)' }}>
        <span style={{ width: 7, height: 7, borderRadius: 7, background: 'var(--ok)' }} />Hors-ligne · prêt
      </span>
      <button className="tap" onClick={onToggleTheme} title="Thème clair / sombre"
        style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--bg-surface)', color: 'var(--sub)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {dark ? <Ic.sun size={16} /> : <Ic.moon size={16} />}
      </button>
    </header>
  );
}

// ── App ───────────────────────────────────────────────────
function App() {
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = useStateA('convert');
  const [toasts, toast] = useToasts();

  const [convert, setConvert] = useStateA(window.convertDefaults);
  const [merge, setMerge] = useStateA(window.mergeDefaults);
  const [editor, setEditor] = useStateA(window.editorDefaults);

  // patch helpers (acceptent objet ou fonction)
  const patch = (setter) => (p) => setter((s) => ({ ...s, ...(typeof p === 'function' ? p(s) : p) }));

  // application du thème
  useEffectA(() => {
    const r = document.documentElement;
    r.dataset.theme = t.dark ? 'dark' : 'light';
    r.dataset.density = t.density;
    r.style.setProperty('--accent', t.dark ? lighten(t.accent) : t.accent);
    r.style.setProperty('--accent-ink', '#ffffff');
    r.style.setProperty('--accent-bg', hexA(t.accent, t.dark ? 0.18 : 0.11));
    r.style.setProperty('--sans', FONT_STACKS[t.font] || FONT_STACKS.hanken);
  }, [t.dark, t.density, t.accent, t.font]);

  const views = {
    convert: <window.ConvertView state={convert} set={patch(setConvert)} toast={toast} />,
    merge: <window.MergeView state={merge} set={patch(setMerge)} toast={toast} />,
    editor: <window.EditorView state={editor} set={patch(setEditor)} toast={toast} />,
  };

  const { TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakSelect, TweakToggle } = window;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Header view={view} setView={setView} dark={t.dark} onToggleTheme={() => setTweak('dark', !t.dark)} />
      <main className="scroll" style={{ flex: 1, minHeight: 0, padding: 'var(--gap)' }}>
        <div style={{ height: '100%', maxWidth: 1320, margin: '0 auto' }}>
          {views[view]}
        </div>
      </main>
      <ToastHost items={toasts} />
      <TweaksPanel>
        <TweakSection label="Accent" />
        <TweakColor label="Couleur" value={t.accent} options={['#d97757', '#2a6fdb', '#1f8a5b', '#7a5ae0']} onChange={(v) => setTweak('accent', v)} />
        <TweakSection label="Typographie" />
        <TweakSelect label="Police" value={t.font} onChange={(v) => setTweak('font', v)}
          options={[{ value: 'hanken', label: 'Hanken Grotesk' }, { value: 'helvetica', label: 'Helvetica' }, { value: 'system', label: 'Système' }]} />
        <TweakSection label="Mise en page" />
        <TweakRadio label="Densité" value={t.density} options={['compact', 'regular', 'comfy']} onChange={(v) => setTweak('density', v)} />
        <TweakToggle label="Mode sombre" value={t.dark} onChange={(v) => setTweak('dark', v)} />
      </TweaksPanel>
    </div>
  );
}

// utilitaires couleur
function hexA(hex, a) { const n = hex.replace('#', ''); const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16); return `rgba(${r},${g},${b},${a})`; }
function lighten(hex) { const n = hex.replace('#', ''); const f = (i) => Math.min(255, Math.round(parseInt(n.slice(i, i + 2), 16) * 1.12 + 14)); return `rgb(${f(0)},${f(2)},${f(4)})`; }

window.App = App;
