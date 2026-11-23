"use client";
/**
 * Motion loader: GSAP + ScrollTrigger + Lenis caricati SOLO quando servono
 * (dopo il primo paint, mai con prefers-reduced-motion) → non pesano su LCP/TBT.
 */
import type Lenis from "lenis";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Connessione lenta o risparmio dati → niente animazioni pesanti (hero statico). */
export const isSlowConnection = () => {
  if (typeof navigator === "undefined") return false;
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c && (c.saveData === true || /(^|-)2g|3g/.test(c.effectiveType ?? ""));
};

type G = { gsap: typeof import("gsap").gsap; ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger };
let gsapPromise: Promise<G> | null = null;
export function loadGsap(): Promise<G> {
  if (!gsapPromise) {
    gsapPromise = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, st]) => {
      g.gsap.registerPlugin(st.ScrollTrigger);
      return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger };
    });
  }
  return gsapPromise;
}

let lenis: Lenis | null = null;
export const getLenis = () => lenis;
export function setLenis(l: Lenis | null) { lenis = l; }

/** Blocca/sblocca lo scroll (modale): funziona con e senza Lenis. */
export function lockScroll(lock: boolean) {
  if (lenis) { if (lock) lenis.stop(); else lenis.start(); }
  document.documentElement.style.overflow = lock ? "hidden" : "";
}

/** Scroll verso un'ancora con Lenis se attivo. */
export function scrollToHash(hash: string) {
  const el = document.querySelector(hash);
  if (!el) return;
  if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -8 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}
