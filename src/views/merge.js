import { el } from '../utils/dom.js?v=5';
import { icons } from '../utils/icons.js?v=5';
import { offsetHeadings } from '../utils/engine.js?v=5';
import { formatSize, copyToClipboard, downloadMd } from '../utils/download.js?v=5';
import { Btn, Segmented, Card } from '../components/ui.js?v=5';
import { DropZone } from '../components/dropzone.js?v=5';
import { FileList } from '../components/filelist.js?v=5';
import { PreviewPane } from '../components/preview.js?v=5';
import { toast } from '../components/toast.js?v=5';

function buildMerge(files, sep, offset) {
  const blocks = files.filter((f) => f.md).map((f) => {
    const body = offset ? offsetHeadings(f.md, offset) : f.md;
    if (sep === 'name') return `# ${f.name.replace(/\.[^.]+$/, '')}\n\n${body}`;
    return body;
  });
  const joiner = sep === 'rule' ? '\n\n---\n\n' : '\n\n';
  return blocks.join(joiner);
}

function Stepper({ value, onChange, min = -2, max = 3 }) {
  let val = value;
  const display = el('span', {
    style: {
      fontFamily: 'var(--mono)', fontSize: '12.5px', minWidth: '26px', textAlign: 'center',
      color: val === 0 ? 'var(--sub)' : 'var(--accent)',
    },
  }, val > 0 ? '+' + val : '' + val);

  function mkBtn(delta, label) {
    return el('button', {
      className: 'tap',
      onClick: () => {
        val = Math.max(min, Math.min(max, val + delta));
        display.textContent = val > 0 ? '+' + val : '' + val;
        display.style.color = val === 0 ? 'var(--sub)' : 'var(--accent)';
        onChange(val);
      },
      style: {
        width: '26px', height: '26px', border: '1px solid var(--line)', background: 'var(--bg-surface)',
        color: 'var(--ink)', borderRadius: 'var(--radius-sm)', fontSize: '15px', lineHeight: '1',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      },
    }, label);
  }

  return el('span', {
    style: { display: 'inline-flex', alignItems: 'center', gap: '7px' },
  }, mkBtn(-1, '–'), display, mkBtn(1, '+'));
}

export function MergeView() {
  let files = [];
  let sep = 'rule';
  let offset = 0;
  let idCounter = 0;

  const container = el('div', {
    className: 'view-in',
    style: { display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 'var(--gap)', height: '100%', minHeight: '0' },
  });

  let editedMd = null;

  const preview = PreviewPane({
    md: '', filename: 'fusion.md', empty: 'Déposez des fichiers .md à fusionner',
    onEdit: (md) => { editedMd = md; },
  });

  const fileList = FileList({
    files,
    title: 'Markdown',
    onReorder: (f) => { files = f; refresh(); },
    onRemove: (id) => { files = files.filter((x) => x.id !== id); refresh(); },
  });

  function getMd() { return editedMd !== null ? editedMd : buildMerge(files, sep, offset); }

  async function handleFiles(realFiles) {
    for (const f of realFiles) {
      const ext = f.name.split('.').pop().toLowerCase();
      if (ext !== 'md' && ext !== 'markdown') {
        toast(f.name + ' : seuls les .md sont acceptés', 'warn');
        continue;
      }
      idCounter++;
      const text = await f.text();
      files.push({
        id: 'm-' + idCounter,
        name: f.name,
        ext: 'md',
        size: (f.size / 1024).toFixed(1).replace('.', ',') + ' Ko',
        md: text,
      });
    }
    toast(files.length + ' fichier' + (files.length > 1 ? 's' : '') + ' markdown', 'add');
    refresh();
  }

  const counterEl = el('span', {
    style: { fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--faint)', textAlign: 'right' },
  });

  function refresh() {
    fileList._setFiles(files);
    const md = getMd();
    preview.update(md, files.length ? null : 'Déposez des fichiers .md à fusionner');
    const outKo = (new Blob([md]).size / 1024).toFixed(1).replace('.', ',');
    counterEl.innerHTML = `${files.length} fichiers<br/>→ ${outKo} Ko`;
  }

  const introIcon = el('span', {
    style: {
      width: '34px', height: '34px', borderRadius: '9px', background: 'var(--accent-bg)',
      color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
    },
    innerHTML: icons.layers(18),
  });
  const introText = el('div', { style: { flex: '1' } });
  introText.appendChild(el('div', { style: { fontSize: '14px', fontWeight: '600' } }, 'Fusion de fichiers Markdown'));
  const subText = el('div', { style: { fontSize: '12px', color: 'var(--sub)', marginTop: '1px' } });
  subText.innerHTML = 'Assemblez plusieurs <span style="font-family:var(--mono)">.md</span> dans l\'ordre de votre choix.';
  introText.appendChild(subText);

  const introCard = Card({
    style: { display: 'flex', alignItems: 'center', gap: '13px', boxShadow: 'none', padding: '13px 16px' },
    children: [introIcon, introText, counterEl],
  });

  const sepSeg = Segmented({
    size: 'sm', value: sep,
    options: [{ value: 'rule', label: '---', mono: true }, { value: 'name', label: '# Nom' }, { value: 'none', label: 'Aucun' }],
    onChange: (v) => { sep = v; refresh(); },
  });
  const stepper = Stepper({ value: offset, onChange: (v) => { offset = v; refresh(); } });

  const optLabel = (text) => el('span', {
    style: { fontFamily: 'var(--mono)', fontSize: '10.5px', color: 'var(--sub)', letterSpacing: '0.06em' },
  }, text);

  const optionsRow = el('div', {
    style: { display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', flex: '0 0 auto' },
  },
    el('span', { style: { display: 'flex', alignItems: 'center', gap: '11px' } }, optLabel('SEPARATEUR'), sepSeg),
    el('span', { style: { display: 'flex', alignItems: 'center', gap: '11px' } }, optLabel('NIVEAUX DE TITRE'), stepper),
  );

  const mergeBtn = Btn({ children: 'Fusionner & exporter', icon: 'merge', full: true, onClick: () => { downloadMd(getMd(), 'fusion.md'); toast('Fusion exportée · fusion.md', 'ok'); } });
  const copyBtn = Btn({ children: 'Copier', icon: 'copy', kind: 'ghost', onClick: () => { copyToClipboard(getMd()); toast('Markdown copié', 'copy'); } });
  const actionsRow = el('div', { style: { display: 'flex', gap: '10px', flex: '0 0 auto' } }, mergeBtn, copyBtn);

  const leftCol = el('div', {
    style: { display: 'flex', flexDirection: 'column', gap: 'var(--gap)', minHeight: '0' },
  });
  leftCol.appendChild(introCard);
  leftCol.appendChild(DropZone({
    onFiles: handleFiles, compact: true,
    accept: 'MD · MARKDOWN',
    hint: 'fichiers <b style="font-weight:600;color:var(--ink)">.md</b> uniquement',
  }));
  leftCol.appendChild(fileList);
  leftCol.appendChild(optionsRow);
  leftCol.appendChild(actionsRow);

  container.appendChild(leftCol);
  container.appendChild(preview);
  refresh();

  return container;
}
