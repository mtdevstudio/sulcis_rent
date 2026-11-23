import { Archivo, Hanken_Grotesk } from "next/font/google";

/**
 * Display: Archivo variable — assi wdth 62–125 e wght 100–900.
 * Il condensato nero (wdth 62–75 / 800–900) ha il taglio delle gothic americane da insegna
 * e targa industriale: è la voce mineraria. Gli assi permettono lo «stiramento» allo scroll.
 */
export const fontDisplay = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-display",
  // block: il display è preloadato da next/font; evita il flash del fallback sui titoli giganti
  display: "block",
  adjustFontFallback: true,
});

/** Testo: Hanken Grotesk variable — grotesk pulito, ottima leggibilità a 15–17px. */
export const fontText = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-text",
  display: "swap",
});
