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
  // swap + fallback con metriche corrette (adjustFontFallback): il titolo LCP si dipinge subito,
  // il font è preloadato quindi lo scambio avviene quasi sempre prima del primo frame utile
  display: "swap",
  adjustFontFallback: true,
});

/** Testo: Hanken Grotesk variable — grotesk pulito, ottima leggibilità a 15–17px. */
export const fontText = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-text",
  display: "swap",
  // niente preload: il titolo LCP usa Archivo; il testo arriva subito dopo con metriche di fallback corrette (zero CLS)
  preload: false,
  adjustFontFallback: true,
});
