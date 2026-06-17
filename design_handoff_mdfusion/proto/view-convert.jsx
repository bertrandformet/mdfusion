// proto/view-convert.jsx — Vue « Convertir » : multi-documents → 1 Markdown
const { useState: useStateC, useMemo: useMemoC } = React;

function stripExt(n) { return n.replace(/\.[^.]+$/, ''); }

function buildMarkdown(files, sep, nest) {
  const blocks = files.filter((f) => f.st !== 'err').map((f) => {
    const body = nest ? window.offsetHeadings(f.md, 1) : f.md;
    if (sep === 'name') return `# ${stripExt(f.name)}\n\n${body}`;
    return body;
  });
  const joiner = sep === 'rule' ? '\n\n---\n\n' : '\n\n';
  return blocks.join(joiner);
}

function OptionRow({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--sub)', letterSpacing: '0.06em' }}>{label}</span>
      {children}
    </div>
  );
}

function PipelineStrip({ files, sep, outSize }) {
  const { Card } = window;
  const fmts = [...new Set(files.map((f) => (window.FORMATS[f.ext] || {}).label || f.ext.toUpperCase()))].join(' · ');
  const sepLabel = sep === 'rule' ? 'séparateur ---' : sep === 'name' ? 'titre = nom de fichier' : 'sans séparateur';
  const steps = [
    [`${files.length} source${files.length > 1 ? 's' : ''}`, fmts || '—', false],
    ['Fusion', sepLabel, false],
    ['1 Markdown', `resultat.md · ~${outSize}`, true],
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <Card pad="11px 15px" style={{ flex: 1, borderColor: s[2] ? 'var(--accent)' : 'var(--line)', background: s[2] ? 'var(--accent-bg)' : 'var(--bg-surface)', boxShadow: 'none', overflow: 'hidden' }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.01em', color: s[2] ? 'var(--accent)' : 'var(--ink)' }}>{s[0]}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: s[2] ? 'var(--accent)' : 'var(--faint)', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: s[2] ? 0.8 : 1 }}>{s[1]}</div>
          </Card>
          {i < 2 && <span style={{ flex: '0 0 auto', color: 'var(--faint)', display: 'flex' }}><window.Ic.arrow size={17} /></span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function ConvertView({ state, set, toast }) {
  const { Btn, DropZone, FileList, PreviewPane } = window;
  const { files, sep, nest } = state;
  const [busy, setBusy] = useStateC(false);

  const addFile = () => {
    const pool = window.SAMPLE_DOCS;
    const used = new Set(files.map((f) => f.id));
    const next = pool.find((d) => !used.has(d.id)) || pool[files.length % pool.length];
    if (!next) return;
    const id = used.has(next.id) ? next.id + '-' + Date.now() : next.id;
    set({ files: [...files, { ...next, id, st: 'wait' }] });
    toast('Fichier ajouté · ' + next.name, 'add');
  };

  const convert = () => {
    if (!files.length) { toast('Ajoutez au moins un fichier', 'warn'); return; }
    setBusy(true);
    set({ files: files.map((f) => ({ ...f, st: 'run' })) });
    let n = 0;
    const tick = () => {
      n++;
      set((s) => ({ files: s.files.map((f, i) => ({ ...f, st: i < n ? 'ok' : f.st })) }));
      if (n < files.length) setTimeout(tick, 160);
      else { setBusy(false); toast('Conversion terminée · ' + files.length + ' fichiers fusionnés', 'ok'); }
    };
    setTimeout(tick, 220);
  };

  const md = useMemoC(() => buildMarkdown(files, sep, nest), [files, sep, nest]);
  const totalKo = useMemoC(() => { const b = new Blob([md]).size; return b > 1024 ? (b / 1024).toFixed(1).replace('.', ',') + ' Ko' : b + ' o'; }, [md]);
  const totalSize = useMemoC(() => {
    const ko = files.reduce((a, f) => { const m = f.size.match(/([\d,]+)\s*(Ko|Mo)/); if (!m) return a; const v = parseFloat(m[1].replace(',', '.')); return a + (m[2] === 'Mo' ? v * 1024 : v); }, 0);
    return ko > 1024 ? (ko / 1024).toFixed(1).replace('.', ',') + ' Mo' : Math.round(ko) + ' Ko';
  }, [files]);

  return (
    <div className="view-in" style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 'var(--gap)', height: '100%', minHeight: 0 }}>
      <PipelineStrip files={files} sep={sep} outSize={totalKo} />
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 'var(--gap)', minHeight: 0 }}>
        {/* colonne gauche */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)', minHeight: 0 }}>
          <DropZone onAdd={addFile} />
          <FileList files={files} title="Fichiers" onReorder={(f) => set({ files: f })} onRemove={(id) => set({ files: files.filter((x) => x.id !== id) })} />
          {/* options */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', flex: '0 0 auto' }}>
            <OptionRow label="SÉPARATEUR">
              <window.Segmented size="sm" value={sep} onChange={(v) => set({ sep: v })}
                options={[{ value: 'rule', label: '---', mono: true }, { value: 'name', label: '# Nom' }, { value: 'none', label: 'Aucun' }]} />
            </OptionRow>
            <OptionRow label="TITRES">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <window.Toggle value={nest} onChange={(v) => set({ nest: v })} />
                <span style={{ fontSize: 12.5 }}>Imbriquer sous le document</span>
              </span>
            </OptionRow>
          </div>
          {/* actions */}
          <div style={{ display: 'flex', gap: 10, flex: '0 0 auto' }}>
            <Btn full icon={busy ? undefined : 'bolt'} onClick={convert} disabled={busy}>
              {busy ? 'Conversion…' : 'Convertir & fusionner'}
            </Btn>
            <Btn kind="ghost" icon="copy" onClick={() => { navigator.clipboard?.writeText(md).catch(() => {}); toast('Markdown copié dans le presse-papier', 'copy'); }}>Copier</Btn>
            <Btn kind="ghost" icon="download" onClick={() => toast('Téléchargement de resultat.md', 'dl')}>.md</Btn>
          </div>
        </div>
        {/* colonne droite */}
        <PreviewPane md={md} filename="resultat.md" empty={files.length ? null : 'Ajoutez des documents pour voir l\u2019aperçu'} />
      </div>
    </div>
  );
}

window.ConvertView = ConvertView;
window.convertDefaults = () => ({ files: window.SAMPLE_DOCS.slice(0, 6).map((d) => ({ ...d, st: 'ok' })), sep: 'rule', nest: false });
