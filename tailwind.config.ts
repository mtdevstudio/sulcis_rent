import type { Config } from "tailwindcss";

/**
 * SULCIS RENT — Design tokens «TRAMA»
 * Tutti i valori vivono come variabili CSS in src/app/globals.css (unica fonte).
 * Qui Tailwind li espone come utility. Cambia un colore là, cambia ovunque.
 */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    screens: { sm: "480px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1600px" },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#FFFFFF", // solo testo su campiture brand, mai come fondo pagina
      blue: { DEFAULT: v("sulcis-blue"), deep: v("sulcis-blue-deep") },
      magenta: { DEFAULT: v("rent-magenta"), deep: v("rent-magenta-deep") },
      sand: { DEFAULT: v("sand"), 200: v("sand-200"), 300: v("sand-300") },
      trachite: { DEFAULT: v("trachite"), 800: v("trachite-800"), 600: v("trachite-600") },
      stone: v("stone"), // testo secondario su sabbia
      turquoise: v("turquoise"),
      ochre: { DEFAULT: v("ochre"), deep: v("ochre-deep") },
    },
    fontFamily: {
      display: ["var(--font-display)", "Arial Narrow", "sans-serif"],
      sans: ["var(--font-text)", "system-ui", "sans-serif"],
    },
    fontSize: {
      // Display: fluidi, interlinea stretta. Usati con la classe .display (assi variabili).
      "d-xxl": ["clamp(4.5rem, 25.5vw, 34rem)", { lineHeight: "0.8", letterSpacing: "-0.01em" }],
      "d-xl": ["clamp(3.75rem, 15vw, 18rem)", { lineHeight: "0.82", letterSpacing: "-0.01em" }],
      "d-l": ["clamp(2.75rem, 8.5vw, 9.5rem)", { lineHeight: "0.86", letterSpacing: "-0.005em" }],
      "d-m": ["clamp(2.25rem, 5.2vw, 5.5rem)", { lineHeight: "0.9" }],
      "d-s": ["clamp(1.625rem, 2.6vw, 2.5rem)", { lineHeight: "0.95" }],
      // Testo
      lead: ["clamp(1.1875rem, 1.6vw, 1.5rem)", { lineHeight: "1.4" }],
      base: ["1.0625rem", { lineHeight: "1.6" }],
      sm: ["0.9375rem", { lineHeight: "1.5" }],
      xs: ["0.8125rem", { lineHeight: "1.4" }],
      lg: ["1.1875rem", { lineHeight: "1.4" }],
      xl: ["1.375rem", { lineHeight: "1.3" }],
      "2xl": ["1.75rem", { lineHeight: "1.1" }],
      "3xl": ["2.25rem", { lineHeight: "1" }],
      "4xl": ["3rem", { lineHeight: "1" }],
      eyebrow: ["0.75rem", { lineHeight: "1", letterSpacing: "0.16em" }],
    },
    extend: {
      spacing: {
        gutter: "var(--gutter)",
        section: "var(--section-y)",
        u: "var(--u)", // modulo della trama (unità del pattern)
      },
      maxWidth: { content: "88rem", prose: "38rem" },
      borderRadius: { none: "0", full: "9999px" },
      borderWidth: { filo: "1.5px" },
      transitionTimingFunction: {
        trama: "cubic-bezier(.77,0,.18,1)",
        out: "cubic-bezier(.16,1,.3,1)",
      },
      transitionDuration: { fast: "180ms", base: "400ms", slow: "800ms" },
      zIndex: { cursor: "90", modal: "80", sticky: "60", nav: "50" },
    },
  },
  plugins: [],
};

export default config;
