import { sardiniaMap } from "@/data/sardinia-map";

/**
 * Tracciati della Sardegna definiti UNA volta (<MapSymbols/> nel layout) e riusati con <use>:
 * l'HTML resta leggero anche con molte mappe in pagina.
 * Colori e animazione passano per variabili CSS, che attraversano lo shadow tree di <use>.
 */
export function MapSymbols() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <path id="sr-sard-outline" d={sardiniaMap.outline} />
        <path id="sr-sard-sulcis" d={sardiniaMap.sulcis} />
      </defs>
    </svg>
  );
}

/**
 * La Sardegna con il Sulcis Iglesiente in magenta e il pin.
 * `drawn`: il contorno si disegna e il Sulcis si accende. Confini ISTAT (CC BY 4.0).
 */
export function SardiniaMap({
  pin = "san-giovanni-suergiu", drawn = true, className = "", tone = "light", showBase = true, label, pins = [], active,
}: { pin?: string | null; drawn?: boolean; className?: string; tone?: "light" | "dark"; showBase?: boolean; label?: string; pins?: string[]; active?: string | null }) {
  const [px, py] = (pin && sardiniaMap.points[pin]) || sardiniaMap.points["san-giovanni-suergiu"];
  const [bx, by] = sardiniaMap.points["san-giovanni-suergiu"];
  const ink = tone === "light" ? "rgb(var(--trachite))" : "rgb(var(--sand))";
  return (
    <svg viewBox={sardiniaMap.viewBox} className={className} role="img" aria-label={label ?? "Mappa della Sardegna con il Sulcis Iglesiente evidenziato"}>
      <use
        href="#sr-sard-outline" fill="none" stroke={tone === "light" ? "rgb(var(--sulcis-blue))" : "rgb(var(--sand))"} strokeWidth={2.2} strokeLinejoin="round"
        pathLength={1} strokeDasharray="1" style={{ strokeDashoffset: drawn ? 0 : 1, transition: "stroke-dashoffset 1.8s cubic-bezier(.77,0,.18,1)" }}
      />
      <use href="#sr-sard-sulcis" fill="rgb(var(--rent-magenta))" stroke="rgb(var(--rent-magenta))" strokeWidth={0.8} style={{ opacity: drawn ? 1 : 0, transition: "opacity .8s .9s ease-out" }} />
      {pins.map((k) => {
        const pt = sardiniaMap.points[k];
        if (!pt) return null;
        const on = k === active;
        const r = on ? 9 : 5;
        return (
          <g key={k}>
            {on && <line x1={bx} y1={by} x2={pt[0]} y2={pt[1]} stroke="rgb(var(--rent-magenta))" strokeWidth={1.6} strokeDasharray="4 4" />}
            <rect x={pt[0] - r} y={pt[1] - r} width={r * 2} height={r * 2} transform={`rotate(45 ${pt[0]} ${pt[1]})`}
              fill={on ? "rgb(var(--rent-magenta))" : ink} style={{ transition: "all .3s ease" }} />
          </g>
        );
      })}
      {showBase && <rect x={bx - 4} y={by - 4} width={8} height={8} transform={`rotate(45 ${bx} ${by})`} fill={ink} />}
      {pin && <g style={{ transform: `translate(${px}px, ${py}px)`, transition: "transform .7s cubic-bezier(.77,0,.18,1)" }}>
        <path d="M0 -28 C 9 -28 14 -21 14 -14 C 14 -5 0 6 0 6 C 0 6 -14 -5 -14 -14 C -14 -21 -9 -28 0 -28Z" fill={ink} />
        <circle cy={-14} r={4.5} fill="rgb(var(--rent-magenta))" />
      </g>}
    </svg>
  );
}
