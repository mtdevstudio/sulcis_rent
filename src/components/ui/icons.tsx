type P = { className?: string };
const base = { "aria-hidden": true, focusable: false } as const;

/** Glifo chat per WhatsApp (fumetto + cornetta), disegnato per la UI. */
export const IconWhatsApp = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4l-4.5 1.1z" />
    <path d="M9 8.2c.2-.5.5-.6.8-.6h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.7l-.5.6c-.1.1-.1.3 0 .5.6 1.1 1.5 2 2.6 2.6.2.1.4.1.5 0l.6-.6c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3-.2.6-.6.8-.6.3-1.5.5-2.6.1-1.9-.7-3.9-2.6-4.6-4.6-.4-1.1-.2-2 .5-2.6z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPhone = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <path d="M5 3.5h3.2l1.6 4.3-2.1 1.4a11 11 0 0 0 7.1 7.1l1.4-2.1 4.3 1.6V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.1 1.5 1.5 0 0 1 5 3.5z" />
  </svg>
);

export const IconArrow = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export const IconStar = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2.5l2.9 6.2 6.6.7-5 4.5 1.4 6.6L12 17.2l-5.9 3.3 1.4-6.6-5-4.5 6.6-.7z" />
  </svg>
);

/** Nodo: rombo a gradini 3×3, il «punto» della trama. Usato come bullet e nei CTA. */
export const Nodo = ({ className = "h-3 w-3" }: P) => (
  <svg {...base} viewBox="0 0 3 3" className={className} shapeRendering="crispEdges" fill="currentColor">
    <path d="M1 0h1v1h1v1H2v1H1V2H0V1h1z" />
  </svg>
);

/* Specifiche auto */
export const IconSeats = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="7" r="3.5" /><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
  </svg>
);
export const IconGear = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
    <circle cx="6" cy="5" r="1.8" /><circle cx="12" cy="5" r="1.8" /><circle cx="18" cy="5" r="1.8" />
    <circle cx="6" cy="19" r="1.8" /><circle cx="12" cy="19" r="1.8" />
    <path d="M6 7v10M12 7v10M18 7v5H6" />
  </svg>
);
export const IconFuel = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <path d="M4.5 20.5V5a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 1 13.5 5v15.5M3 20.5h12M4.5 10h9M13.5 8l3.5 3v6.5a1.5 1.5 0 0 0 3 0V8l-2.5-2.5" />
  </svg>
);
