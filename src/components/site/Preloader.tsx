"use client";
import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { Trama } from "@/components/trama/Trama";
import { useLang } from "./LangContext";

/**
 * Preloader (< 1,8 s, saltabile, una volta per sessione).
 * Visibile solo se lo script inline in <head> ha impostato html[data-pl="on"]:
 * niente flash per chi l'ha già visto, niente preloader senza JS o con reduced-motion.
 * I due nastri della «S» si disegnano, poi il titolo esplode.
 */
export function Preloader() {
  const lang = useLang();
  const d = t(lang);
  const [phase, setPhase] = useState<"draw" | "burst" | "done">("draw");

  useEffect(() => {
    if (document.documentElement.dataset.pl !== "on") { setPhase("done"); return; }
    const finish = () => {
      setPhase("done");
      document.documentElement.dataset.pl = "off";
      try { sessionStorage.setItem("sr_pl", "1"); } catch { /* privato */ }
    };
    const t1 = window.setTimeout(() => setPhase("burst"), 1050);
    const t2 = window.setTimeout(finish, 1700);
    const skip = () => { window.clearTimeout(t1); window.clearTimeout(t2); finish(); };
    addEventListener("keydown", skip, { once: true });
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); removeEventListener("keydown", skip); };
  }, []);

  if (phase === "done") return null;
  return (
    <div
      className={`preloader fixed inset-0 z-[100] place-items-center bg-sand transition-[clip-path] duration-500 ease-trama ${phase === "burst" ? "[clip-path:inset(0_0_100%_0)] delay-200" : "[clip-path:inset(0)]"}`}
      onClick={() => { setPhase("done"); document.documentElement.dataset.pl = "off"; try { sessionStorage.setItem("sr_pl", "1"); } catch {} }}
      role="presentation"
    >
      <div className="absolute inset-x-0 bottom-0 h-16 overflow-hidden opacity-90"><Trama motif="pibiones" fg="sulcis-blue" cell={12} /></div>
      <div className="relative flex flex-col items-center">
        <svg viewBox="0 0 120 140" className="h-32 w-28 md:h-40 md:w-36" aria-hidden>
          {/* Nastri della S — da sostituire con il tracciato del logo SVG quando disponibile */}
          <path d="M98 28 C 78 6, 26 8, 24 38 C 22 64, 70 62, 74 74" fill="none" stroke="rgb(var(--rent-magenta))" strokeWidth="16" strokeLinecap="square"
            pathLength={1} strokeDasharray="1" className="animate-[draw_.8s_cubic-bezier(.77,0,.18,1)_forwards]" style={{ strokeDashoffset: 1 }} />
          <path d="M46 66 C 50 78, 98 76, 96 102 C 94 132, 42 134, 22 112" fill="none" stroke="rgb(var(--sulcis-blue))" strokeWidth="16" strokeLinecap="square"
            pathLength={1} strokeDasharray="1" className="animate-[draw_.8s_.25s_cubic-bezier(.77,0,.18,1)_forwards]" style={{ strokeDashoffset: 1 }} />
        </svg>
        <p className={`display mt-6 text-[clamp(3rem,14vw,8rem)] leading-none transition-[transform,opacity,letter-spacing] duration-500 ease-trama ${phase === "burst" ? "scale-[2.4] opacity-0 tracking-[0.2em]" : ""}`}>
          {d.greeting}
        </p>
        <p className="eyebrow mt-3 text-stone">{d.greetingTr}</p>
      </div>
      <span className="eyebrow absolute bottom-20 text-stone">{lang === "it" ? "Tocca per saltare" : "Tap to skip"}</span>
    </div>
  );
}
