// proto/view-merge.jsx — Vue « Fusionner » : plusieurs .md → 1 .md
const { useState: useStateM, useMemo: useMemoM } = React;

function buildMerge(files, sep, offset) {
  const blocks = files.map((f) => {
    const body = offset ? window.offsetHeadings(f.md, offset) : f.md;
    if (sep === 'name') return `# ${f.name.replace(/\.[^.]+$/, '')}\n\n${body}`;
    return body;
  });
  const joiner = sep === 'rule' ? '\n\n---\n\n' : '\n\n';
  return blocks.join(joiner);
}

function Stepper({ value, onChange, min = -2, max = 3 }) {
  const btn = (d, label) => (
    <button className="tap" onClick={() => onChange(Math.max(min, Math.min(max, value + d)))}
      style={{ width: 26, height: 26, border: '1px solid var(--line)', background: 'var(--bg-surface)', color: 'var(--ink)',
        borderRadius: 'var(--radius-sm)', fontSize: 15, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{label}</button>
  );
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
      {btn(-1, '–')}
      <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, minWidth: 26, textAlign: 'center', color: value === 0 ? 'var(--sub)' : 'var(--accent)' }}>{value > 0 ? '+' + value : value}</span>
      {btn(1, '+')}
    </span>
  );
}

function MergeView({ state, set, toast }) {
  const { Btn, DropZone, FileList, PreviewPane, Card } = window;
  const { files, sep, offset } = state;

  const addFile = () => {
    const used = new Set(files.map((f) => f.id));
    const next = window.SAMPLE_MD.find((d) => !used.has(d.id)) || window.SAMPLE_MD[files.length % window.SAMPLE_MD.length];
    if (!next) return;
    const id = used.has(next.id) ? next.id + '-' + Date.now() : next.id;
    set({ files: [...files, { ...next, id }] });
    toast('Markdown ajouté · ' + next.name, 'add');
  };

  const md = useMemoM(() => buildMerge(files, sep, offset), [files, sep, offset]);
  const outKo = useMemoM(() => { const b = new Blob([md]).size; return (b / 1024).toFixed(1).replace('.', ','); }, [md]);

  return (
    <div className="view-in" style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 'var(--gap)', height: '100%', minHeight: 0 }}>
      {/* gauche */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)', minHeight: 0 }}>
        <Card pad="13px 16px" style={{ display: 'flex', alignItems: 'center', gap: 13, boxShadow: 'none' }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--accent-bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}><window.Ic.layers size={18} /></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Fusion de fichiers Markdown</div>
            <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 1 }}>Assemblez plusieurs <span style={{ fontFamily: 'var(--mono)' }}>.md</span> dans l'ordre de votre choix.</div>
          </div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)', textAlign: 'right' }}>{files.length} fichiers<br />→ {outKo} Ko</span>
        </Card>
        <DropZone onAdd={addFile} compact hint={<>fichiers <b style={{ fontWeight: 600, color: 'var(--ink)' }}>.md</b> uniquement</>} />
        <FileList files={files} title="Markdown" onReorder={(f) => set({ files: f })} onRemove={(id) => set({ files: files.filter((x) => x.id !== id) })} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', flex: '0 0 auto' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--sub)', letterSpacing: '0.06em' }}>SÉPARATEUR</span>
            <window.Segmented size="sm" value={sep} onChange={(v) => set({ sep: v })}
              options={[{ value: 'rule', label: '---', mono: true }, { value: 'name', label: '# Nom' }, { value: 'none', label: 'Aucun' }]} />
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--sub)', letterSpacing: '0.06em' }}>NIVEAUX DE TITRE</span>
            <Stepper value={offset} onChange={(v) => set({ offset: v })} />
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, flex: '0 0 auto' }}>
          <Btn full icon="merge" onClick={() => toast('Fusion exportée · fusion.md', 'ok')}>Fusionner & exporter</Btn>
          <Btn kind="ghost" icon="copy" onClick={() => { navigator.clipboard?.writeText(md).catch(() => {}); toast('Markdown copié', 'copy'); }}>Copier</Btn>
        </div>
      </div>
      {/* droite */}
      <PreviewPane md={md} filename="fusion.md" empty={files.length ? null : 'Ajoutez des fichiers .md à fusionner'} />
    </div>
  );
}

window.MergeView = MergeView;
window.mergeDefaults = () => ({ files: window.SAMPLE_MD.map((d) => ({ ...d })), sep: 'rule', offset: 0 });
