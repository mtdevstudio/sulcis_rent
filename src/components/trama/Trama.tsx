import { useId } from "react";
import { motifPath, type MotifName } from "./motifs";

/** Colori ammessi: solo token di palette. Massimo due per istanza (fg + bg). */
export type TramaColor =
  | "sulcis-blue" | "sulcis-blue-deep" | "rent-magenta" | "rent-magenta-deep"
  | "sand" | "sand-200" | "sand-300" | "trachite" | "trachite-800"
  | "turquoise" | "ochre";

type Props = {
  motif: MotifName;
  fg: TramaColor;
  /** Fondo. Se omesso il pattern è trasparente (eredita il fondo della sezione = 2° colore). */
  bg?: TramaColor;
  /** Lato cella in px. Il pattern è sempre «grande»: minimo 10px. */
  cell?: number;
  opacity?: number;
  className?: string;
  /** Decorativo per default: nascosto agli screen reader. */
  title?: string;
};

const c = (t: TramaColor) => `rgb(var(--${t}))`;

/**
 * Riempie il contenitore (position: relative) con un motivo della trama.
 * Server component: SVG statico, zero JS lato client.
 */
export function Trama({ motif, fg, bg, cell = 20, opacity = 1, className = "", title }: Props) {
  const id = useId().replace(/:/g, "");
  const { d, w, h } = motifPath(motif);
  const size = Math.max(cell, 10);
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      style={{ opacity }}
    >
      {title && <title>{title}</title>}
      <defs>
        <pattern id={`t${id}`} width={w * size} height={h * size} patternUnits="userSpaceOnUse">
          {bg && <rect width={w * size} height={h * size} fill={c(bg)} />}
          <path d={d} fill={c(fg)} transform={`scale(${size})`} shapeRendering="crispEdges" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#t${id})`} />
    </svg>
  );
}

/** Fascia divisoria orizzontale (motivo «denti» di default). Altezza = tile × cella. */
export function TramaBand({
  fg, bg, motif = "denti", cell = 8, className = "",
}: { fg: TramaColor; bg?: TramaColor; motif?: MotifName; cell?: number; className?: string }) {
  const { h } = motifPath(motif);
  return (
    <div className={`relative w-full ${className}`} style={{ height: h * cell }} aria-hidden>
      <Trama motif={motif} fg={fg} bg={bg} cell={cell} />
    </div>
  );
}
