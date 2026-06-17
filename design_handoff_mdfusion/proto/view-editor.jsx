// proto/view-editor.jsx — Vue « Éditeur » : texte → Markdown, aperçu live
const { useRef: useRefE, useState: useStateE, useMemo: useMemoE } = React;

function EditorView({ state, set, toast }) {
  const { Card, Segmented, Btn } = window;
  const Ic = window.Ic;
  const ref = useRefE(null);
  const doc = state.doc;
  const [tab, setTab] = useStateE('split'); // split | edit | preview

  const apply = (fn) => {
    const ta = ref.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const before = doc.slice(0, s), sel = doc.slice(s, e), after = doc.slice(e);
    const { text, cursor } = fn(sel, before, after);
    set({ doc: before + text + after });
    requestAnimationFrame(() => { ta.focus(); const pos = before.length + (cursor != null ? cursor : text.length); ta.setSelectionRange(pos, pos); });
  };

  const wrap = (mark, ph) => apply((sel) => { const t = sel || ph; return { text: mark + t + mark, cursor: sel ? mark.length + t.length + mark.length : mark.length + t.length }; });
  const line = (prefix, ph) => apply((sel, before) => {
    const nl = before.length === 0 || before.endsWith('\n') ? '' : '\n';
    const t = sel || ph; return { text: nl + prefix + t, cursor: (nl + prefix + t).length };
  });
  const insert = (block) => apply((sel, before) => { const nl = before.length === 0 || before.endsWith('\n') ? '' : '\n'; return { text: nl + block }; });

  const tools = [
    ['h1', 'Titre', () => line('# ', 'Titre')],
    ['bold', 'Gras', () => wrap('**', 'gras')],
    ['italic', 'Italique', () => wrap('*', 'italique')],
    ['code', 'Code', () => wrap('`', 'code')],
    ['list', 'Liste', () => line('- ', 'élément')],
    ['quote', 'Citation', () => line('> ', 'citation')],
    ['link', 'Lien', () => apply((sel) => { const t = sel || 'texte'; return { text: `[${t}](https://)`, cursor: t.length + 3 }; })],
    ['table', 'Tableau', () => insert('| Colonne A | Colonne B |\n| --- | --- |\n| valeur | valeur |\n')],
  ];

  const html = useMemoE(() => window.mdToHtml(doc), [doc]);
  const words = useMemoE(() => window.wordCount(doc), [doc]);

  const ToolbarBtn = ({ icon, title, onClick }) => {
    const I = Ic[icon];
    return (
      <button className="tap" title={title} onClick={onClick}
        style={{ width: 32, height: 30, border: 'none', background: 'transparent', color: 'var(--sub)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-soft)'; e.currentTarget.style.color = 'var(--ink)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--sub)'; }}>
        <I size={16} />
      </button>
    );
  };

  const showEdit = tab !== 'preview';
  const showPrev = tab !== 'edit';

  return (
    <div className="view-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)', height: '100%', minHeight: 0 }}>
      {/* barre d'outils */}
      <Card flush style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 8px', flex: '0 0 auto' }}>
        {tools.map((t) => <ToolbarBtn key={t[0]} icon={t[0]} title={t[1]} onClick={t[2]} />)}
        <span style={{ width: 1, height: 20, background: 'var(--line)', margin: '0 4px' }} />
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)' }}>{words} mots</span>
        <span style={{ flex: 1 }} />
        <Segmented size="sm" value={tab} onChange={setTab}
          options={[{ value: 'edit', label: 'Édition' }, { value: 'split', label: 'Partagé' }, { value: 'preview', label: 'Aperçu' }]} />
      </Card>

      {/* éditeur + aperçu */}
      <div style={{ display: 'grid', gridTemplateColumns: showEdit && showPrev ? '1fr 1fr' : '1fr', gap: 'var(--gap)', flex: 1, minHeight: 0 }}>
        {showEdit && (
          <Card flush style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderBottom: '1px solid var(--line)', background: 'var(--bg-inset)', flex: '0 0 auto' }}>
              <Ic.edit size={14} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--sub)' }}>document.md</span>
            </div>
            <textarea ref={ref} value={doc} onChange={(e) => set({ doc: e.target.value })} spellCheck={false}
              className="scroll" style={{ flex: 1, minHeight: 0, resize: 'none', border: 'none', outline: 'none', background: 'transparent',
                padding: '20px 24px', fontFamily: 'var(--mono)', fontSize: 13, lineHeight: 1.7, color: 'var(--ink)', tabSize: 2 }} />
          </Card>
        )}
        {showPrev && (
          <Card flush style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderBottom: '1px solid var(--line)', background: 'var(--bg-inset)', flex: '0 0 auto' }}>
              <Ic.eye size={14} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--sub)' }}>aperçu</span>
              <span style={{ flex: 1 }} />
              <Btn size="sm" kind="quiet" icon="copy" onClick={() => { navigator.clipboard?.writeText(doc).catch(() => {}); toast('Markdown copié', 'copy'); }}>Copier</Btn>
            </div>
            <div className="scroll md-body" style={{ flex: 1, minHeight: 0, padding: '22px 28px' }} dangerouslySetInnerHTML={{ __html: html }} />
          </Card>
        )}
      </div>
    </div>
  );
}

window.EditorView = EditorView;
window.editorDefaults = () => ({ doc: window.EDITOR_SAMPLE });
