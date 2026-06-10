import { el } from '../utils/dom.js';
import { icons } from '../utils/icons.js';
import { FORMATS, SAMPLE_DOCS } from '../utils/data.js';
import { offsetHeadings } from '../utils/engine.js';
import { formatSize, copyToClipboard, downloadMd } from '../utils/download.js';
import { Btn, Segmented, Toggle, Card } from '../components/ui.js';
import { DropZone } from '../components/dropzone.js';
import { FileList } from '../components/filelist.js';
import { PreviewPane } from '../components/preview.js';
import { toast } from '../components/toast.js';

function stripExt(n) { return n.replace(/\.[^.]+$/, ''); }

function buildMarkdown(files, sep, nest) {
  const blocks = files.filter((f) => f.st !== 'err').map((f) => {
    const body = nest ? offsetHeadings(f.md, 1) : f.md;
    if (sep === 'name') return `# ${stripExt(f.name)}\n\n${body}`;
    return body;
  });
  const joiner = sep === 'rule' ? '\n\n---\n\n' : '\n\n';
  return blocks.join(joiner);
}

function OptionRow(label, ...children) {
  const row = el('div', { style: { display: 'flex', alignItems: 'center', gap: '11px' } });
  row.appendChild(el('span', {
    style: { fontFamily: 'var(--mono)', fontSize: '10.5px', color: 'var(--sub)', letterSpacing: '0.06em' },
  }, label));
  children.forEach((c) => row.appendChild(c));
  return row;
}

function PipelineStrip(state) {
  const { files, sep } = state;
  const fmts = [...new Set(files.map((f) => (FORMATS[f.ext] || {}).label || f.ext.toUpperCase()))].join(' · ');
  const sepLabel = sep === 'rule' ? 'séparateur ---' : sep === 'name' ? 'titre = nom de fichier' : 'sans séparateur';
  const md = buildMarkdown(files, sep, state.nest);
  const outSize = formatSize(md);

  const steps = [
    [`${files.length} source${files.length > 1 ? 's' : ''}`, fmts || '—', false],
    ['Fusion', sepLabel, false],
    ['1 Markdown', `resultat.md · ~${outSize}`, true],
  ];

  const strip = el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } });
  steps.forEach((s, i) => {
    const card = Card({
      style: {
        flex: '1', padding: '11px 15px',
        borderColor: s[2] ? 'var(--accent)' : 'var(--line)',
        background: s[2] ? 'var(--accent-bg)' : 'var(--bg-surface)', boxShadow: 'none', overflow: 'hidden',
      },
    });
    card.appendChild(el('div', {
      style: { fontSize: '13.5px', fontWeight: '600', letterSpacing: '-0.01em', color: s[2] ? 'var(--accent)' : 'var(--ink)' },
    }, s[0]));
    card.appendChild(el('div', {
      style: {
        fontFamily: 'var(--mono)', fontSize: '10px', color: s[2] ? 'var(--accent)' : 'var(--faint)',
        marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: s[2] ? '0.8' : '1',
      },
    }, s[1]));
    strip.appendChild(card);
    if (i < 2) {
      strip.appendChild(el('span', {
        style: { flex: '0 0 auto', color: 'var(--faint)', display: 'flex' },
        innerHTML: icons.arrow(17),
      }));
    }
  });
  return strip;
}

export function ConvertView() {
  let files = SAMPLE_DOCS.slice(0, 6).map((d) => ({ ...d, st: 'ok' }));
  let sep = 'rule';
  let nest = false;
  let busy = false;

  const container = el('div', {
    className: 'view-in',
    style: { display: 'grid', gridTemplateRows: 'auto 1fr', gap: 'var(--gap)', height: '100%', minHeight: '0' },
  });

  const preview = PreviewPane({ md: '', filename: 'resultat.md' });

  const fileList = FileList({
    files,
    title: 'Fichiers',
    onReorder: (f) => { files = f; refresh(); },
    onRemove: (id) => { files = files.filter((x) => x.id !== id); refresh(); },
  });

  function getMd() { return buildMarkdown(files, sep, nest); }

  function addFile() {
    const used = new Set(files.map((f) => f.id));
    const next = SAMPLE_DOCS.find((d) => !used.has(d.id)) || SAMPLE_DOCS[files.length % SAMPLE_DOCS.length];
    if (!next) return;
    const id = used.has(next.id) ? next.id + '-' + Date.now() : next.id;
    files = [...files, { ...next, id, st: 'wait' }];
    toast('Fichier ajouté · ' + next.name, 'add');
    refresh();
  }

  function convert() {
    if (!files.length) { toast('Ajoutez au moins un fichier', 'warn'); return; }
    busy = true;
    files = files.map((f) => ({ ...f, st: 'run' }));
    refresh();
    let n = 0;
    const tick = () => {
      n++;
      files = files.map((f, i) => ({ ...f, st: i < n ? 'ok' : f.st }));
      fileList._setFiles(files);
      if (n < files.length) {
        setTimeout(tick, 160);
      } else {
        busy = false;
        toast('Conversion terminée · ' + files.length + ' fichiers fusionnés', 'ok');
        refresh();
      }
    };
    setTimeout(tick, 220);
  }

  function refresh() {
    fileList._setFiles(files);
    const md = getMd();
    preview.update(md, files.length ? null : 'Ajoutez des documents pour voir l’aperçu');
    renderPipeline();
  }

  // Options
  const sepSeg = Segmented({
    size: 'sm', value: sep,
    options: [{ value: 'rule', label: '---', mono: true }, { value: 'name', label: '# Nom' }, { value: 'none', label: 'Aucun' }],
    onChange: (v) => { sep = v; refresh(); },
  });

  const nestToggle = Toggle({ value: nest, onChange: (v) => { nest = v; refresh(); } });
  const nestLabel = el('span', { style: { fontSize: '12.5px' } }, 'Imbriquer sous le document');
  const nestWrap = el('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '8px' } }, nestToggle, nestLabel);

  const optionsRow = el('div', {
    style: { display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', flex: '0 0 auto' },
  }, OptionRow('SÉPARATEUR', sepSeg), OptionRow('TITRES', nestWrap));

  const convertBtn = Btn({ children: 'Convertir & fusionner', icon: 'bolt', full: true, onClick: convert });
  const copyBtn = Btn({ children: 'Copier', icon: 'copy', kind: 'ghost', onClick: () => { copyToClipboard(getMd()); toast('Markdown copié dans le presse-papier', 'copy'); } });
  const dlBtn = Btn({ children: '.md', icon: 'download', kind: 'ghost', onClick: () => { downloadMd(getMd(), 'resultat.md'); toast('Téléchargement de resultat.md', 'dl'); } });
  const actionsRow = el('div', { style: { display: 'flex', gap: '10px', flex: '0 0 auto' } }, convertBtn, copyBtn, dlBtn);

  const leftCol = el('div', {
    style: { display: 'flex', flexDirection: 'column', gap: 'var(--gap)', minHeight: '0' },
  });
  leftCol.appendChild(DropZone({ onAdd: addFile }));
  leftCol.appendChild(fileList);
  leftCol.appendChild(optionsRow);
  leftCol.appendChild(actionsRow);

  const grid = el('div', {
    style: { display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 'var(--gap)', minHeight: '0' },
  }, leftCol, preview);

  let pipelineEl = PipelineStrip({ files, sep, nest });
  container.appendChild(pipelineEl);
  container.appendChild(grid);

  function renderPipeline() {
    const newPipeline = PipelineStrip({ files, sep, nest });
    container.replaceChild(newPipeline, pipelineEl);
    pipelineEl = newPipeline;
  }

  refresh();

  return container;
}
