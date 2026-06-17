// proto/icons.jsx — petites icônes inline (stroke, hérite currentColor)
const Ic = {};
const mk = (paths, opts = {}) => ({ size = 16, ...p } = {}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={opts.fill ? 'currentColor' : 'none'}
    stroke={opts.fill ? 'none' : 'currentColor'} strokeWidth={opts.sw || 1.7}
    strokeLinecap="round" strokeLinejoin="round" {...p}>
    {paths}
  </svg>
);

Ic.upload = mk(<><path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M4 18h16" /></>);
Ic.copy = mk(<><rect x="8" y="8" width="13" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>);
Ic.download = mk(<><path d="M12 3v12" /><path d="M7 11l5 4 5-4" /><path d="M4 20h16" /></>);
Ic.check = mk(<path d="M5 12.5l4.5 4.5L19 6.5" />, { sw: 2 });
Ic.x = mk(<path d="M6 6l12 12M18 6L6 18" />);
Ic.plus = mk(<path d="M12 5v14M5 12h14" />);
Ic.grip = mk(<><circle cx="9" cy="6" r="1.3" fill="currentColor" stroke="none" /><circle cx="15" cy="6" r="1.3" fill="currentColor" stroke="none" /><circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="9" cy="18" r="1.3" fill="currentColor" stroke="none" /><circle cx="15" cy="18" r="1.3" fill="currentColor" stroke="none" /></>);
Ic.arrow = mk(<><path d="M4 12h15" /><path d="M13 6l6 6-6 6" /></>);
Ic.moon = mk(<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />);
Ic.sun = mk(<><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></>);
Ic.merge = mk(<><path d="M7 4v5a4 4 0 0 0 4 4h6" /><path d="M14 9l4 4-4 4" /><circle cx="7" cy="4" r="0" /></>);
Ic.layers = mk(<><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></>);
Ic.edit = mk(<><path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></>);
Ic.file = mk(<><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /></>);
Ic.eye = mk(<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>);
Ic.code = mk(<><path d="M8 8l-4 4 4 4" /><path d="M16 8l4 4-4 4" /></>);
Ic.bold = mk(<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" />, { sw: 1.6 });
Ic.italic = mk(<><path d="M15 5h-5M14 19H9M14 5l-4 14" /></>);
Ic.h1 = mk(<><path d="M5 6v12M13 6v12M5 12h8" /><path d="M17 9.5l2.5-1.5V18" /></>, { sw: 1.6 });
Ic.list = mk(<><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1.1" fill="currentColor" stroke="none" /><circle cx="4.5" cy="12" r="1.1" fill="currentColor" stroke="none" /><circle cx="4.5" cy="18" r="1.1" fill="currentColor" stroke="none" /></>);
Ic.table = mk(<><rect x="3" y="4" width="18" height="16" rx="1.5" /><path d="M3 10h18M3 15h18M12 4v16" /></>);
Ic.link = mk(<><path d="M9 14a4 4 0 0 0 6 .5l2-2a4 4 0 0 0-6-6l-1 1" /><path d="M15 10a4 4 0 0 0-6-.5l-2 2a4 4 0 0 0 6 6l1-1" /></>);
Ic.quote = mk(<path d="M7 7H4v6h3l-1.5 4M16 7h-3v6h3l-1.5 4" />, { sw: 1.4 });
Ic.bolt = mk(<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />, { fill: true });
Ic.spinner = mk(<><path d="M12 3a9 9 0 1 0 9 9" /></>);

window.Ic = Ic;
