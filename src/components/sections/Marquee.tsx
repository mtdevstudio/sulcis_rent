"use client";
import { useEffect, useRef } from "react";
import { places } from "@/data/places";
import { loadGsap, prefersReducedMotion } from "@/lib/motion";
import { Nodo } from "@/components/ui/icons";

/**
 * Marquee infinito delle località: la direzione segue lo scroll (giù → sinistra, su → destra)
 * e la velocità cresce con la velocità di scroll. Con reduced-motion è una riga ferma, scorribile a mano.
 */
export function Marquee() {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let kill = () => {};
    (async () => {
      const { gsap, ScrollTrigger } = await loadGsap();
      const tween = gsap.to(track.current, { xPercent: -50, ease: "none", duration: 38, repeat: -1 });
      let dir = 1;
      const st = ScrollTrigger.create({
        trigger: track.current, start: "top bottom", end: "bottom top",
        onUpdate: (self) => {
          dir = self.direction;
          const v = Math.min(Math.abs(self.getVelocity()) / 400, 6);
          gsap.to(tween, { timeScale: dir * (1 + v), duration: 0.25, overwrite: true });
          gsap.to(tween, { timeScale: dir, duration: 1.2, delay: 0.25, ease: "power2.out" });
        },
      });
      kill = () => { tween.kill(); st.kill(); };
    })();
    return () => kill();
  }, []);
  const row = places.map((p) => p.name);
  return (
    <div role="marquee" className="overflow-hidden border-y-filo border-trachite bg-blue py-5 text-sand motion-reduce:overflow-x-auto" aria-label="Sant'Antioco, Calasetta, Carloforte, Porto Pino, Masua, Porto Flavia, Nebida, Iglesias, Carbonia, Tratalias, Punta Trettu, Maladroxia">
      <div ref={track} className="marquee-track" aria-hidden>
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {row.map((n) => (
              <span key={n + k} className="flex items-center">
                <span className="display whitespace-nowrap px-6 text-[clamp(2.5rem,7vw,6rem)] leading-none">{n}</span>
                <Nodo className="h-4 w-4 text-magenta" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
