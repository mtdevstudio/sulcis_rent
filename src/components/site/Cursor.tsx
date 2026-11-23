"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Cursore custom (desktop, puntatore fine): un nodo magenta che segue il mouse.
 * Sopra elementi con data-cursor="Guarda" / "Prenota" diventa un disco con l'etichetta.
 * Il cursore di sistema resta visibile: questo è solo un livello visivo (accessibilità).
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
      setLabel(t?.dataset.cursor ?? null);
    };
    const loop = () => {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      if (dot.current) dot.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => { removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);

  if (!enabled) return null;
  return (
    <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-cursor" aria-hidden>
      <div
        className={`-translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,height,background-color] duration-base ease-trama grid place-items-center ${
          label ? "h-24 w-24 bg-magenta" : "h-3 w-3 bg-magenta"
        } ${label === "Prenota" || label === "Book" ? "!bg-trachite" : ""}`}
      >
        {label && <span className="eyebrow text-white">{label}</span>}
      </div>
    </div>
  );
}
