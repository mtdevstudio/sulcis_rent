"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isSlowConnection, loadGsap, prefersReducedMotion, setLenis } from "@/lib/motion";

/**
 * Regia del movimento per tutte le pagine pubbliche:
 * Lenis (smooth scroll) + reveal di parole + fade + parallax leggero.
 * Con prefers-reduced-motion: nessun Lenis/GSAP; i contenuti restano visibili (vedi globals.css).
 */
export function MotionDirector() {
  const pathname = usePathname();

  // Lenis: una volta sola
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let destroyed = false;
    let cleanup = () => {};
    (async () => {
      const [{ default: Lenis }, { gsap, ScrollTrigger }] = await Promise.all([import("lenis"), loadGsap()]);
      if (destroyed) return;
      const lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
      setLenis(lenis);
      document.documentElement.classList.add("lenis");
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      cleanup = () => { gsap.ticker.remove(raf); lenis.destroy(); setLenis(null); };
    })();
    return () => { destroyed = true; cleanup(); };
  }, []);

  // Reveal e parallax: a ogni cambio pagina
  useEffect(() => {
    const root = document.documentElement;
    const reveal = Array.from(document.querySelectorAll<HTMLElement>(".rv:not(.rv-done)"));
    const fades = Array.from(document.querySelectorAll<HTMLElement>(".fx-fade:not(.fx-done)"));
    if (!root.classList.contains("motion")) return;

    // Fade: IntersectionObserver puro (niente GSAP)
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("fx-done"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -10% 0px" });
    fades.forEach((el) => io.observe(el));

    // Rete di sicurezza: se GSAP non arriva, mostra tutto
    const safety = window.setTimeout(() => reveal.forEach((el) => el.classList.add("rv-done")), 6000);
    let ctx: { revert: () => void } | null = null;

    (async () => {
      const { gsap, ScrollTrigger } = await loadGsap();
      window.clearTimeout(safety);
      ctx = gsap.context(() => {
        reveal.forEach((el) => {
          const words = el.querySelectorAll(".rv-w > span");
          el.classList.add("rv-done"); // prima togli lo stato CSS, poi GSAP prende il controllo (altrimenti legge 105% come px)
          gsap.set(words, { y: 0, yPercent: 105 });
          ScrollTrigger.create({
            trigger: el, start: "top 88%", once: true,
            onEnter: () => gsap.to(words, { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.045 }),
          });
        });
        if (!isSlowConnection()) {
          document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
            const amt = Number(el.dataset.parallax || 8);
            gsap.fromTo(el, { yPercent: -amt }, { yPercent: amt, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
          });
        }
      });
      ScrollTrigger.refresh();
    })();

    return () => { io.disconnect(); window.clearTimeout(safety); ctx?.revert(); };
  }, [pathname]);

  return null;
}
