"use client";
import { useEffect, useRef, useState } from "react";
import { places } from "@/data/places";
import { t, tr } from "@/lib/i18n";
import { loadGsap, prefersReducedMotion } from "@/lib/motion";
import { useLang } from "@/components/site/LangContext";
import { RevealText } from "@/components/site/RevealText";
import { SardiniaMap } from "@/components/site/SardiniaMap";
import { Trama } from "@/components/trama/Trama";
import { SectionHead } from "@/components/ui/SectionHead";

/**
 * TERRITORIO — scroll orizzontale pinnato (desktop ≥ 1024px, motion ok).
 * Su mobile e con reduced-motion: stack verticale di pannelli, nessun pin.
 * Sullo sfondo la mappa: il contorno si disegna, il Sulcis si accende, il pin si sposta.
 */
function placeImg(slug: string) {
  return { src: `/images/placeholder/places/${slug}-1280.webp`, srcSet: `/images/placeholder/places/${slug}-640.webp 640w, /images/placeholder/places/${slug}-1280.webp 1280w, /images/placeholder/places/${slug}-1920.webp 1920w` };
}

export function Territory() {
  const lang = useLang();
  const d = t(lang);
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [drawn, setDrawn] = useState(false);
  const [horizontal, setHorizontal] = useState(false);

  useEffect(() => {
    const mq = matchMedia("(min-width: 1024px)");
    const update = () => setHorizontal(mq.matches && !prefersReducedMotion());
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setDrawn(true); io.disconnect(); } }, { threshold: 0.2 });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!horizontal) return;
    let kill = () => {};
    (async () => {
      const { gsap, ScrollTrigger } = await loadGsap();
      const el = track.current!;
      const ctx = gsap.context(() => {
        const dist = () => el.scrollWidth - innerWidth;
        gsap.to(el, {
          x: () => -dist(), ease: "none",
          scrollTrigger: {
            trigger: wrap.current, pin: true, refreshPriority: 1, scrub: 0.8, start: "top top", end: () => `+=${dist()}`, invalidateOnRefresh: true,
            onUpdate: (self) => setActive(Math.min(places.length - 1, Math.round(self.progress * (places.length - 1)))),
          },
        });
      }, wrap);
      ScrollTrigger.refresh();
      kill = () => ctx.revert();
    })();
    return () => kill();
  }, [horizontal]);

  return (
    <section id="territorio" className="scroll-mt-20 bg-sand" aria-labelledby="territorio-title">
      <div className="wrap pt-section">
        <SectionHead index="03" label={d.nav.territory} />
        <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
          <RevealText as="h2" lines={[d.territoryTitle]} className="display text-d-l md:col-span-8" />
          <span id="territorio-title" className="sr-only">{d.territoryTitle}</span>
          <p className="fx-fade text-stone md:col-span-4">{d.territoryText}</p>
        </div>
      </div>

      <div ref={wrap} className={`relative mt-16 ${horizontal ? "h-[100svh] overflow-hidden" : ""}`}>
        <div ref={track} className={horizontal ? "flex h-full w-max" : "flex flex-col"}>
          {places.map((p, i) => {
            const img = placeImg(p.slug);
            const night = p.night;
            return (
              <article
                key={p.slug}
                className={`relative flex shrink-0 flex-col justify-end overflow-hidden ${horizontal ? "h-full w-[88vw] xl:w-[78vw]" : "min-h-[82svh] w-full"} ${night ? "bg-trachite text-sand" : "text-sand"}`}
                aria-label={p.name}
              >
                {night ? (
                  <>
                    <Trama motif="occhio" fg="ochre" cell={22} opacity={0.14} />
                    <div className="absolute right-[6%] top-[12%] aspect-[4/5] w-[42%] max-w-md overflow-hidden border-filo border-ochre/60 max-lg:hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.src} srcSet={img.srcSet} sizes="40vw" alt={`${p.name} – foto segnaposto`} loading="lazy" className="h-full w-full object-cover" data-parallax="6" />
                    </div>
                  </>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.src} srcSet={img.srcSet} sizes={horizontal ? "80vw" : "100vw"} alt={`${p.name} – foto segnaposto`} loading="lazy" className="absolute inset-0 h-full w-full scale-110 object-cover" data-parallax={horizontal ? undefined : "5"} />
                    <div className="absolute inset-0 bg-gradient-to-t from-trachite/85 via-trachite/25 to-transparent" />
                  </>
                )}
                <div className="relative px-gutter pb-10 md:pb-16">
                  <p className={`eyebrow ${night ? "text-ochre" : "text-sand/90"}`}>
                    <span className={night ? "" : "text-magenta-light"}>{String(i + 1).padStart(2, "0")}</span> / {String(places.length).padStart(2, "0")} · {tr(p.area, lang)}
                  </p>
                  <h3 className={`display mt-3 whitespace-nowrap leading-[0.82] ${horizontal ? "text-[min(9.6vw,12rem)]" : "text-[12.5vw]"} ${night ? "text-ochre" : ""}`}>{p.name}</h3>
                  <p className="mt-4 max-w-xl text-lead text-sand/90">{tr(p.line, lang)}</p>
                </div>
                {!horizontal && (
                  <div className="absolute right-4 top-4 w-20 border-filo border-sand/30 bg-trachite/40 p-1.5 backdrop-blur-sm" aria-hidden>
                    <SardiniaMap pin={p.slug} tone="dark" className="h-auto w-full" />
                  </div>
                )}
              </article>
            );
          })}
        </div>
        {horizontal && (
          <div className="pointer-events-none absolute right-8 top-24 z-10 w-44 border-filo border-trachite bg-sand p-3 xl:w-52">
            <SardiniaMap pin={places[active].slug} drawn={drawn} className="h-auto w-full" label={`${places[active].name} sulla mappa del Sulcis`} />
            <p className="eyebrow mt-2 text-center">{places[active].name}</p>
          </div>
        )}
      </div>
      <div className="h-section" aria-hidden />
    </section>
  );
}
