import { useId } from "react";

/**
 * Anteprima statica del reveal a rombi dell'hero (per la tavola e come FALLBACK statico).
 * Griglia grossa: 6 colonne × 4 righe + righe sfalsate = max 31 rombi su desktop,
 * 4 × 7 su mobile ≈ 32. Ogni rombo scala dal centro con ritardo proporzionale alla distanza.
 * Nell'hero reale lo stesso clipPath è animato da GSAP (solo transform: scale → compositor-friendly).
 */
export function RevealFrame({ progress, cols = 6, rows = 4, word = "SULCIS" }: { progress: number; cols?: number; rows?: number; word?: string }) {
  const id = useId().replace(/:/g, "");
  const W = 600, H = 400;
  const cw = W / cols, ch = H / rows;
  const r = Math.max(cw, ch) * 0.72; // semi-diagonale: a scala 1 i rombi si toccano e coprono tutto
  const cells: { x: number; y: number; d: number }[] = [];
  for (let j = -0.5; j <= rows; j += 0.5) {
    for (let i = 0; i <= cols; i++) {
      const x = (i + (Math.abs(j % 1) === 0.5 ? 0.5 : 0)) * cw;
      const y = j * ch + ch / 2;
      if (x > W + cw / 2) continue;
      cells.push({ x, y, d: Math.hypot(x - W / 2, y - H / 2) / Math.hypot(W / 2, H / 2) });
    }
  }
  const scaleOf = (d: number) => Math.min(1, Math.max(0, (progress * 1.7 - d * 0.7)));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Reveal a rombi al ${Math.round(progress * 100)}%`}>
      <defs>
        <linearGradient id={`sea${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgb(var(--sulcis-blue-deep))" />
          <stop offset="0.55" stopColor="rgb(var(--sulcis-blue))" />
          <stop offset="1" stopColor="rgb(var(--turquoise))" />
        </linearGradient>
        <clipPath id={`clip${id}`}>
          {cells.map((c, k) => {
            const s = scaleOf(c.d);
            if (s <= 0) return null;
            const h = r * s;
            return <path key={k} d={`M${c.x} ${c.y - h}L${c.x + h} ${c.y}L${c.x} ${c.y + h}L${c.x - h} ${c.y}Z`} />;
          })}
        </clipPath>
      </defs>
      <rect width={W} height={H} fill="rgb(var(--sand))" />
      <text x={W / 2} y={H / 2 + 62} textAnchor="middle" className="display" fontSize={word.length > 6 ? 130 : 190} textLength={W * 0.92} lengthAdjust="spacingAndGlyphs" fill="rgb(var(--trachite))"
        style={{ fontVariationSettings: '"wdth" 66, "wght" 900' }}>{word}</text>
      <g clipPath={`url(#clip${id})`}>
        <rect width={W} height={H} fill={`url(#sea${id})`} />
        {/* segnaposto «strada costiera»: due nastri */}
        <path d={`M-20 ${H * 0.8} C ${W * 0.3} ${H * 0.55}, ${W * 0.6} ${H * 1.0}, ${W + 20} ${H * 0.62}`} stroke="rgb(var(--sand))" strokeWidth="14" fill="none" opacity=".9" />
        <path d={`M-20 ${H * 0.9} C ${W * 0.35} ${H * 0.68}, ${W * 0.62} ${H * 1.08}, ${W + 20} ${H * 0.74}`} stroke="rgb(var(--rent-magenta))" strokeWidth="10" fill="none" />
        <text x={W / 2} y={H / 2 + 62} textAnchor="middle" className="display" fontSize={word.length > 6 ? 130 : 190} textLength={W * 0.92} lengthAdjust="spacingAndGlyphs" fill="rgb(var(--sand))"
          style={{ fontVariationSettings: '"wdth" 66, "wght" 900' }}>{word}</text>
      </g>
    </svg>
  );
}
