// Moteur Markdown (rendu HTML) + helpers de fusion.
// Converti depuis proto/engine.jsx — logique inchangée.

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s) {
  let t = escapeHtml(s);
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return t;
}

export function mdToHtml(md) {
  const lines = (md || '').replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      const lang = line.replace(/^```/, '').trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(escapeHtml(lines[i])); i++; }
      i++;
      out.push(`<pre data-lang="${lang}"><code>${buf.join('\n')}</code></pre>`);
      continue;
    }
    if (/^---+\s*$/.test(line) || /^\*\s*\*\s*\*/.test(line)) { out.push('<hr/>'); i++; continue; }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { const n = h[1].length; out.push(`<h${n}>${inline(h[2])}</h${n}>`); i++; continue; }
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(inline(lines[i].replace(/^>\s?/, ''))); i++; }
      out.push(`<blockquote>${buf.join('<br/>')}</blockquote>`);
      continue;
    }
    if (/\|/.test(line) && i + 1 < lines.length && /^[\s|:-]+$/.test(lines[i + 1]) && /-/.test(lines[i + 1])) {
      const head = line.split('|').filter((c) => c.trim() !== '').map((c) => c.trim());
      i += 2;
      const rows = [];
      while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim() !== '') {
        rows.push(lines[i].split('|').filter((c, idx, arr) => !(idx === 0 && c.trim() === '') && !(idx === arr.length - 1 && c.trim() === '')).map((c) => c.trim()));
        i++;
      }
      let html = '<table><thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
      html += rows.map((r) => '<tr>' + head.map((_, ci) => `<td>${inline(r[ci] || '')}</td>`).join('') + '</tr>').join('');
      html += '</tbody></table>';
      out.push(html);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { buf.push(`<li>${inline(lines[i].replace(/^\s*[-*]\s+/, ''))}</li>`); i++; }
      out.push(`<ul>${buf.join('')}</ul>`);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { buf.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`); i++; }
      out.push(`<ol>${buf.join('')}</ol>`);
      continue;
    }
    if (line.trim() === '') { i++; continue; }
    const buf = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,6}\s|>\s?|```|---+\s*$|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i])) {
      buf.push(inline(lines[i])); i++;
    }
    out.push(`<p>${buf.join('<br/>')}</p>`);
  }
  return out.join('\n');
}

export function offsetHeadings(md, offset) {
  if (!offset) return md;
  return md.split('\n').map((l) => {
    const m = l.match(/^(#{1,6})(\s+.*)$/);
    if (!m) return l;
    const n = Math.min(6, Math.max(1, m[1].length + offset));
    return '#'.repeat(n) + m[2];
  }).join('\n');
}

export function wordCount(md) {
  return (md || '').replace(/[#>*`|_-]/g, ' ').split(/\s+/).filter(Boolean).length;
}
