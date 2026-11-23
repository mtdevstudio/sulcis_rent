"use client";
import { useEffect } from "react";

/**
 * Scrive --wdth e --wght su :root in base alla velocità di scroll.
 * I titoli con .display-stretch si STIRANO in velocità (più larghi, più leggeri)
 * e si COMPRIMONO in frenata (molla sotto-smorzata + impulso di frenata → overshoot condensato/nero).
 *
 * - Un solo loop rAF per tutta la pagina, che si spegne da solo a riposo.
 * - Scrive le variabili solo se cambiano in modo percettibile.
 * - prefers-reduced-motion: non parte (i titoli restano a riposo, vedi globals.css).
 */
const REST_W = 72;
const REST_G = 850;

export function StretchAxes() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    let raf = 0;
    let running = false;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let speed = 0; // velocità smussata, px/frame@60
    let x = 0; // stato della molla (0 = riposo, 1 = stirato, <0 = compresso)
    let vx = 0;
    let prevTarget = 0;
    let wW = REST_W;
    let wG = REST_G;

    const tick = (now: number) => {
      const dt = Math.min(Math.max(now - lastT, 1), 64);
      lastT = now;
      const y = window.scrollY;
      const raw = (Math.abs(y - lastY) / dt) * 16.7;
      lastY = y;
      speed += (raw - speed) * 0.18;
      const target = Math.min(speed / 45, 1);

      const f = dt / 16.7;
      vx = (vx + (target - x) * 0.12 * f) * Math.pow(0.8, f);
      vx -= Math.max(0, prevTarget - target) * 0.6; // frenata
      prevTarget = target;
      x += vx * f;

      const w = Math.min(125, Math.max(62, REST_W + x * 38));
      const g = Math.min(900, Math.max(450, REST_G - x * 380));
      if (Math.abs(w - wW) > 0.25 || Math.abs(g - wG) > 2) {
        wW = w; wG = g;
        root.style.setProperty("--wdth", w.toFixed(1));
        root.style.setProperty("--wght", g.toFixed(0));
      }

      const settled = Math.abs(x) < 0.002 && Math.abs(vx) < 0.002 && speed < 0.05;
      if (settled) {
        running = false;
        root.style.setProperty("--wdth", String(REST_W));
        root.style.setProperty("--wght", String(REST_G));
        wW = REST_W; wG = REST_G;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (running) return;
      running = true;
      lastT = performance.now();
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", wake, { passive: true });
    return () => {
      window.removeEventListener("scroll", wake);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
