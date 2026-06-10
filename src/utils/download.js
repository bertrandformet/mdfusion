export function downloadMd(content, filename = 'resultat.md') {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text) {
  return navigator.clipboard?.writeText(text).catch(() => {});
}

export function formatSize(md) {
  const b = new Blob([md]).size;
  return b > 1024 ? (b / 1024).toFixed(1).replace('.', ',') + ' Ko' : b + ' o';
}
