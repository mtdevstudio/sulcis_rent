"use client";
import { useEffect, useRef, useState } from "react";
import { t } from "@/lib/i18n";
import { isSlowConnection, loadGsap, prefersReducedMotion } from "@/lib/motion";
import { useContactModal } from "@/components/site/ContactModal";
import { useLang } from "@/components/site/LangContext";
import { Magnetic } from "@/components/site/Magnetic";
import { Button } from "@/components/ui/Button";
import { BadgeGoogle, BadgeOpen } from "@/components/ui/Badge";
import { IconArrow } from "@/components/ui/icons";
import { scrollToHash } from "@/lib/motion";
import { useContact } from "@/lib/contact";

/**
 * HERO — «Il Sulcis si apre a rombi».
 * Un solo SVG: titolo SULCIS in trachite sotto, e sopra (dentro un clipPath di rombi)
 * la foto della costa + lo stesso titolo in sabbia. Allo scroll i rombi scalano dal centro.
 * Griglia grossa (≤ 35 rombi), solo attributi `transform` → fluido su un telefono medio.
 * Fallback statico (reduced-motion / connessione lenta / no-JS): fotogramma finale, foto scoperta.
 */
type Cell = { x: number; y: number; d: number };
/** I rombi centrali partono socchiusi: si intravede il mare dentro le lettere e si capisce il gesto. */
const startScale = (d: number) => (d < 0.16 ? 0.34 : 0);

function grid(W: number, H: number, cy: number): { cells: Cell[]; r: number } {
  const cols = W < 700 ? 4 : 6;
  const cw = W / cols;
  const rows = Math.max(3, Math.round(H / cw));
  const ch = H / rows;
  const r = Math.max(cw, ch) * 0.75;
  const cells: Cell[] = [];
  for (let j = 0; j <= rows * 2; j++) {
    const y = (j / 2) * ch;
    const off = j % 2 ? cw / 2 : 0;
    for (let i = 0; i <= cols; i++) {
      const x = i * cw + off;
      if (x > W + cw / 2) continue;
      cells.push({ x, y, d: Math.hypot(x - W / 2, y - cy) / Math.hypot(W / 2, H / 2) });
    }
  }
  return { cells, r };
}

export function Hero() {
  const lang = useLang();
  const d = t(lang);
  const c = useContact();
  const open = useContactModal();
  const section = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ W: 1440, H: 900 });
  // SSR = stato animabile (rombi quasi chiusi). Reduced-motion / rete lenta → fotogramma finale statico.
  const [animated, setAnimated] = useState(true);

  useEffect(() => {
    const el = svg.current!;
    const ro = new ResizeObserver(([e]) => {
      const W = Math.round(e.contentRect.width), H = Math.round(e.contentRect.height);
      setSize((s) => (Math.abs(s.W - W) > 2 || Math.abs(s.H - H) > 60 ? { W, H } : s));
    });
    ro.observe(el);
    if (prefersReducedMotion() || isSlowConnection()) setAnimated(false);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!animated) return;
    let kill = () => {};
    (async () => {
      const { gsap } = await loadGsap();
      const diamonds = Array.from(svg.current!.querySelectorAll<SVGPathElement>("[data-d]"));
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: section.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
        });
        diamonds.forEach((p) => {
          const dist = Number(p.dataset.d);
          tl.fromTo(p, { scale: startScale(dist) }, { scale: 1, ease: "power2.inOut", duration: 0.5 }, dist * 0.5);
        });
      }, section);
      kill = () => ctx.revert();
    })();
    return () => kill();
  }, [animated, size.W, size.H]);

  const fontSize = size.W * (size.W < 700 ? 0.3 : 0.27);
  const ty = size.H * (size.W < 700 ? 0.42 : 0.5) + fontSize * 0.36;
  const margin = size.W * 0.03;
  const { cells, r } = grid(size.W, size.H, ty - fontSize * 0.36);
  const titleProps = {
    x: margin, y: ty, textLength: size.W - margin * 2, lengthAdjust: "spacingAndGlyphs" as const,
    fontSize, className: "display", style: { fontVariationSettings: '"wdth" 72, "wght" 900' },
  };

  return (
    <section ref={section} id="top" className={`relative bg-sand ${animated ? "motion-safe:h-[190svh] h-[100svh]" : "h-[100svh]"} min-h-[620px]`} aria-labelledby="hero-title">
      <div className="sticky top-0 h-[100svh] min-h-[620px] overflow-hidden">
        <svg ref={svg} className="absolute inset-0 h-full w-full" viewBox={`0 0 ${size.W} ${size.H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
          <defs>
            <clipPath id="hero-rombi">
              {animated ? (
                cells.map((cl, k) => (
                  <path key={k} data-d={cl.d.toFixed(3)} d={`M${cl.x} ${cl.y - r}L${cl.x + r} ${cl.y}L${cl.x} ${cl.y + r}L${cl.x - r} ${cl.y}Z`}
                    style={{ transform: `scale(${startScale(cl.d)})`, transformBox: "fill-box", transformOrigin: "center" }} />
                ))
              ) : (
                <rect width={size.W} height={size.H} />
              )}
            </clipPath>
          </defs>
          <text id="hero-title-ink" {...titleProps} fill="rgb(var(--trachite))">SULCIS</text>
          <g clipPath="url(#hero-rombi)">
            <image href="/images/placeholder/places/hero-costa-1920.webp" width={size.W} height={size.H} preserveAspectRatio="xMidYMid slice" />
            <rect width={size.W} height={size.H} fill="rgb(var(--trachite))" opacity=".18" />
            <text {...titleProps} fill="rgb(var(--sand))">SULCIS</text>
          </g>
        </svg>

        {/* Livello contenuti (HTML reale, accessibile) */}
        <div className="relative flex h-full flex-col justify-between pb-6 pt-24 md:pb-10 md:pt-28">
          <div className="wrap flex flex-wrap items-start justify-between gap-3">
            <p className="eyebrow max-w-[18rem] bg-sand/85 px-2 py-1 text-trachite">{d.heroEyebrow}</p>
            <p className="eyebrow bg-sand/85 px-2 py-1 text-trachite" title={d.greetingTr}>
              <span lang="sc">{d.greeting}</span> <span className="text-stone">· {d.greetingTr}</span>
            </p>
          </div>
          <h1 id="hero-title" className="sr-only">Sulcis Rent – {lang === "it" ? "noleggio auto a San Giovanni Suergiu, Sulcis, Sud Sardegna" : "car rental in San Giovanni Suergiu, Sulcis, South Sardinia"}</h1>
          <div className="wrap grid gap-5 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="display display-stretch text-[clamp(2.25rem,7vw,6.5rem)] leading-[0.86] text-trachite [text-shadow:0_0_24px_rgb(var(--sand)/.6)]">
                <span className="bg-sand px-1">{d.heroLine2}</span>
              </p>
              <p className="mt-4 max-w-md bg-sand/90 p-2 text-lead font-semibold text-trachite">{d.payoff}</p>
            </div>
            <div className="flex flex-col gap-3 md:col-span-5 md:items-end">
              <div className="flex flex-wrap gap-2"><BadgeOpen /><BadgeGoogle href={c.googleReviewsUrl || undefined} /></div>
              <div className="flex flex-wrap gap-3">
                <Magnetic><Button variant="magenta" size="xl" nodo onClick={() => open()} data-cursor={d.bookCursor} title={d.ajoTr}>{d.ajo}</Button></Magnetic>
                <a href="#flotta" onClick={(e) => { e.preventDefault(); scrollToHash("#flotta"); }}
                  className="eyebrow hidden h-16 items-center gap-2 border-filo border-trachite bg-sand px-6 hover:bg-trachite hover:text-sand sm:inline-flex md:h-[4.5rem]">
                  {d.seeFleet}<IconArrow className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div data-hero-end className="absolute bottom-0 h-px w-full" aria-hidden />
    </section>
  );
}
