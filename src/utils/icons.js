// Icônes SVG inline — converti depuis proto/icons.jsx
// Chaque fonction retourne une string SVG.

function mk(paths, opts = {}) {
  return (size = 16) => {
    const fill = opts.fill ? 'currentColor' : 'none';
    const stroke = opts.fill ? 'none' : 'currentColor';
    const sw = opts.sw || 1.7;
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  };
}

export const icons = {
  upload: mk('<path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 18h16"/>'),
  copy: mk('<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>'),
  download: mk('<path d="M12 3v12"/><path d="M7 11l5 4 5-4"/><path d="M4 20h16"/>'),
  check: mk('<path d="M5 12.5l4.5 4.5L19 6.5"/>', { sw: 2 }),
  x: mk('<path d="M6 6l12 12M18 6L6 18"/>'),
  plus: mk('<path d="M12 5v14M5 12h14"/>'),
  reset: mk('<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>'),
  grip: mk('<circle cx="9" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.3" fill="currentColor" stroke="none"/>'),
  arrow: mk('<path d="M4 12h15"/><path d="M13 6l6 6-6 6"/>'),
  moon: mk('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'),
  sun: mk('<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>'),
  merge: mk('<path d="M7 4v5a4 4 0 0 0 4 4h6"/><path d="M14 9l4 4-4 4"/>'),
  layers: mk('<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>'),
  edit: mk('<path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>'),
  file: mk('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>'),
  eye: mk('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>'),
  code: mk('<path d="M8 8l-4 4 4 4"/><path d="M16 8l4 4-4 4"/>'),
  bold: mk('<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z"/>', { sw: 1.6 }),
  italic: mk('<path d="M15 5h-5M14 19H9M14 5l-4 14"/>'),
  h1: mk('<path d="M5 6v12M13 6v12M5 12h8"/><path d="M17 9.5l2.5-1.5V18"/>', { sw: 1.6 }),
  h2: mk('<path d="M5 6v12M13 6v12M5 12h8"/><path d="M16.5 9a2 2 0 1 1 4 2l-4 5h4"/>', { sw: 1.6 }),
  h3: mk('<path d="M5 6v12M13 6v12M5 12h8"/><path d="M16.5 9.5a1.8 1.8 0 0 1 3.5.5 1.8 1.8 0 0 1-2 1.8 1.8 1.8 0 0 1 2 1.8 1.8 1.8 0 0 1-3.5.5"/>', { sw: 1.6 }),
  h4: mk('<path d="M5 6v12M13 6v12M5 12h8"/><path d="M17 9v5h4M20 9v9"/>', { sw: 1.6 }),
  h5: mk('<path d="M5 6v12M13 6v12M5 12h8"/><path d="M20.5 9h-3.5l-.5 3h3a2 2 0 0 1 0 4h-3"/>', { sw: 1.6 }),
  underline: mk('<path d="M6 4v6a6 6 0 0 0 12 0V4"/><path d="M4 21h16"/>', { sw: 1.6 }),
  strikethrough: mk('<path d="M4 12h16"/><path d="M16 7a4 4 0 0 0-4-3 4 4 0 0 0-4 3M8 17a4 4 0 0 0 4 3 4 4 0 0 0 4-3"/>', { sw: 1.6 }),
  listOrdered: mk('<path d="M10 6h11M10 12h11M10 18h11"/><path d="M4 7V4l-1 .5M3.5 18.5h2M4 14v2.5a1.5 1.5 0 0 0 1.5 0M4 11V9l1 .5M5.5 11h-2"/>', { sw: 1.5 }),
  checkbox: mk('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12l2 2 4-4"/>', { sw: 1.6 }),
  link2: mk('<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>', { sw: 1.8 }),
  hr: mk('<path d="M3 12h18"/><circle cx="6" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1" fill="currentColor" stroke="none"/>'),
  list: mk('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1.1" fill="currentColor" stroke="none"/>'),
  table: mk('<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 10h18M3 15h18M12 4v16"/>'),
  link: mk('<path d="M9 14a4 4 0 0 0 6 .5l2-2a4 4 0 0 0-6-6l-1 1"/><path d="M15 10a4 4 0 0 0-6-.5l-2 2a4 4 0 0 0 6 6l1-1"/>'),
  quote: mk('<path d="M7 7H4v6h3l-1.5 4M16 7h-3v6h3l-1.5 4"/>', { sw: 1.4 }),
  bolt: mk('<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>', { fill: true }),
  spinner: mk('<path d="M12 3a9 9 0 1 0 9 9"/>'),
};
