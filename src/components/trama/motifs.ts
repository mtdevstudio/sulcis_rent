/**
 * TRAMA — motivi geometrici derivati dalla tessitura sarda (rombi, pibiones, denti).
 * Ogni motivo è una griglia di celle quadrate, come i punti di un telaio:
 * nessun disegno a mano libera, nessun ornamento. Solo geometria, al massimo due colori.
 *
 * Coordinate in celle; l'SVG viene scalato da `cell` (px) nel componente <Trama />.
 */
export type MotifName = "rombo" | "occhio" | "pibiones" | "denti" | "scala";

type Motif = {
  w: number; // larghezza del tile in celle
  h: number; // altezza del tile in celle
  /** dimensione del punto (1 = cella piena; <1 = grano «pibione» staccato) */
  dot: number;
  fill: (x: number, y: number) => boolean;
};

const ring = (x: number, y: number, cx: number, cy: number) => Math.abs(x - cx) + Math.abs(y - cy);

export const motifs: Record<MotifName, Motif> = {
  /** Rombo a gradini concentrico: nucleo pieno, anello, fascia. Agli angoli nascono rombi secondari. */
  rombo: {
    w: 14, h: 14, dot: 1,
    fill: (x, y) => {
      const d = ring(x + 0.5, y + 0.5, 7, 7);
      return d <= 2 || (d > 4 && d <= 5) || (d > 7 && d <= 9) || d > 12;
    },
  },
  /** Occhio: rombo vuoto con punto centrale. Più arioso, per fondi grandi. */
  occhio: {
    w: 12, h: 12, dot: 1,
    fill: (x, y) => {
      const d = ring(x + 0.5, y + 0.5, 6, 6);
      return d <= 1 || (d > 3 && d <= 5);
    },
  },
  /** Pibiones: grani in reticolo diagonale. La texture più leggera del sistema. */
  pibiones: {
    w: 8, h: 8, dot: 0.5,
    fill: (x, y) => (x % 4 === 0 && y % 4 === 0) || (x % 4 === 2 && y % 4 === 2),
  },
  /** Banda: due fili pieni e una fila di rombi vuoti col punto, punta contro punta. Per divisori. */
  denti: {
    w: 8, h: 11, dot: 1,
    fill: (x, y) => {
      if (y === 0 || y === 10) return true; // fili
      const d = ring(x + 0.5, y + 0.5, 4, 5.5);
      return d <= 1 || (d > 2 && d <= 4); // punto + anello
    },
  },
  /** Scala: chevron a gradini (zig-zag). Direzione, movimento: la strada. */
  scala: {
    w: 8, h: 8, dot: 1,
    fill: (x, y) => (x + Math.abs(y - 3.5) - 0.5) % 8 < 3,
  },
};

/** Converte il motivo in un unico path SVG (un solo nodo nel DOM per tile). */
export function motifPath(name: MotifName): { d: string; w: number; h: number } {
  const m = motifs[name];
  const inset = (1 - m.dot) / 2;
  let d = "";
  for (let y = 0; y < m.h; y++) {
    for (let x = 0; x < m.w; x++) {
      if (m.fill(x, y)) d += `M${x + inset} ${y + inset}h${m.dot}v${m.dot}h-${m.dot}z`;
    }
  }
  return { d, w: m.w, h: m.h };
}
