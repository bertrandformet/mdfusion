import { el } from '../utils/dom.js?v=6';
import { icons } from '../utils/icons.js?v=6';
import { FORMATS } from '../utils/data.js?v=6';
import { offsetHeadings } from '../utils/engine.js?v=6';
import { formatSize, copyToClipboard, downloadMd } from '../utils/download.js?v=6';
import { Btn, Segmented, Toggle, Card } from '../components/ui.js?v=6';
import { DropZone } from '../components/dropzone.js?v=6';
import { FileList } from '../components/filelist.js?v=6';
import { PreviewPane } from '../components/preview.js?v=6';
import { toast } from '../components/toast.js?v=6';
import { convert, getExt, formatSize as fmtBytes } from '../converters/index.js?v=6';

function stripExt(n) { return n.replace(/\.[^.]+$/, ''); }

function buildMarkdown(files, sep, nest) {
  const blocks = files.filter((f) => f.st === 'ok' && f.md).map((f) => {
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
  let files = [];
  let sep = 'rule';
  let nest = false;
  let busy = false;
  let idCounter = 0;
  let downloaded = false;

  const container = el('div', {
    className: 'view-in',
    style: { display: 'grid', gridTemplateRows: 'auto 1fr', gap: 'var(--gap)', height: '100%', minHeight: '0' },
  });

  let editedMd = null;

  const preview = PreviewPane({
    md: '', filename: 'resultat.md', empty: 'Déposez des documents pour commencer',
    onEdit: (md) => { editedMd = md; },
  });

  const fileList = FileList({
    files,
    title: 'Fichiers',
    onReorder: (f) => { files = f; refresh(); },
    onRemove: (id) => { files = files.filter((x) => x.id !== id); refresh(); },
  });

  function getMd() { return editedMd !== null ? editedMd : buildMarkdown(files, sep, nest); }

  function handleFiles(realFiles) {
    let hasPptx = false;
    for (const f of realFiles) {
      const ext = getExt(f);
      if (ext === 'pptx') hasPptx = true;
      idCounter++;
      files.push({
        id: 'f-' + idCounter,
        name: f.name,
        ext,
        size: fmtBytes(f.size),
        st: 'wait',
        md: '',
        file: f,
      });
    }
    downloaded = false;
    toast(realFiles.length + ' fichier' + (realFiles.length > 1 ? 's' : '') + ' ajouté' + (realFiles.length > 1 ? 's' : ''), 'add');
    if (hasPptx) toast('PPTX : seul le texte sera extrait (images et mise en page non conservées)', 'warn');
    refresh();
  }

  async function convert1(entry) {
    try {
      entry.st = 'run';
      fileList._setFiles(files);
      const result = await convert(entry.file);
      entry.md = result.md;
      entry.st = 'ok';
    } catch (e) {
      entry.md = '';
      entry.st = 'err';
      toast(entry.name + ' : ' + e.message, 'warn');
    }
  }

  async function convertAll() {
    if (!files.length) { toast('Ajoutez au moins un fichier', 'warn'); return; }
    busy = true;
    const pending = files.filter((f) => f.st === 'wait' || f.st === 'err');
    if (!pending.length) {
      toast('Tous les fichiers sont déjà convertis', 'ok');
      busy = false;
      return;
    }
    for (const entry of pending) {
      await convert1(entry);
      fileList._setFiles(files);
    }
    busy = false;
    editedMd = null;
    downloaded = false;
    toast('Conversion terminée · ' + files.length + ' fichiers fusionnés', 'ok');
    refresh();
  }

  function refresh() {
    fileList._setFiles(files);
    const md = getMd();
    preview.update(md, files.length ? null : 'Déposez des documents pour commencer');
    renderPipeline();
    window._mdfusionDirty = files.some((f) => f.st === 'ok') && !downloaded;
  }

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

  function resetAll() {
    if (!files.length) return;
    if (!downloaded && files.some((f) => f.st === 'ok')) {
      if (!confirm('Le fichier Markdown n\'a pas été téléchargé. Voulez-vous vraiment recommencer ?')) return;
    }
    files = [];
    editedMd = null;
    downloaded = false;
    idCounter = 0;
    refresh();
    toast('Remise à zéro', 'ok');
  }

  const convertBtn = Btn({ children: 'Convertir & fusionner', icon: 'bolt', full: true, onClick: convertAll });
  const copyBtn = Btn({ children: 'Copier', icon: 'copy', kind: 'ghost', onClick: () => { downloaded = true; copyToClipboard(getMd()); toast('Markdown copié dans le presse-papier', 'copy'); } });
  const dlBtn = Btn({ children: '.md', icon: 'download', kind: 'ghost', onClick: () => { downloaded = true; downloadMd(getMd(), 'resultat.md'); toast('Téléchargement de resultat.md', 'dl'); } });
  const resetBtn = Btn({ children: 'Recommencer', icon: 'reset', kind: 'ghost', onClick: resetAll });
  const actionsRow = el('div', { style: { display: 'flex', gap: '10px', flex: '0 0 auto' } }, convertBtn, copyBtn, dlBtn, resetBtn);

  const leftCol = el('div', {
    style: { display: 'flex', flexDirection: 'column', gap: 'var(--gap)', minHeight: '0' },
  });
  leftCol.appendChild(DropZone({ onFiles: handleFiles }));
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
