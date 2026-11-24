"use client";
import { useMemo, useState } from "react";
import { islandPlaces, places, type Zone } from "@/data/places";
import { useContact } from "@/lib/contact";
import { t, tr } from "@/lib/i18n";
import type { L10n } from "@/lib/types";
import { useContactModal } from "@/components/site/ContactModal";
import { useLang } from "@/components/site/LangContext";
import { RevealText } from "@/components/site/RevealText";
import { SardiniaMap } from "@/components/site/SardiniaMap";
import { Trama } from "@/components/trama/Trama";
import { SectionHead } from "@/components/ui/SectionHead";
import { IconArrow } from "@/components/ui/icons";

/**
 * SARDEGNA — «Scegli la tua Sardegna».
 * Un tabellone di mete su fondo trachite: a sinistra la mappa dell'isola (sticky su desktop) che segna
 * la meta scelta, a destra l'elenco in tipografia gigante filtrabile per zona. Nessuna zona «centrale».
 * Nessun pin, nessuno scroll orizzontale: funziona identica con reduced-motion e da tastiera.
 * Nessun dato su distanze o tempi (// TODO cliente se servono).
 */
type Dest = { slug: string; name: string; area: L10n; line: L10n; zone: Zone; night?: boolean };

// Ordine geografico, dal sud verso nord-est. Il sud-ovest è una zona come le altre.
const ORDER: Zone[] = ["sud", "sudovest", "ovest", "nord", "est"];
const ALL: Dest[] = [...islandPlaces, ...places.map((p) => ({ ...p, zone: "sudovest" as Zone }))]
  .sort((a, b) => ORDER.indexOf(a.zone) - ORDER.indexOf(b.zone));
// «Tutta l'isola»: tutte le mete dell'isola + le più note del sud-ovest (il resto nel filtro dedicato)
const HIGHLIGHT_SW = ["sant-antioco", "carloforte", "porto-pino", "masua"];
const inAll = (x: Dest) => x.zone !== "sudovest" || HIGHLIGHT_SW.includes(x.slug);

const zoneLabel: Record<"tutte" | Zone, L10n> = {
  tutte: { it: "Tutta l'isola", en: "Whole island", fr: "Toute l'île", es: "Toda la isla", pt: "A ilha inteira", pl: "Cała wyspa" },
  sud: { it: "Sud", en: "South", fr: "Sud", es: "Sur", pt: "Sul", pl: "Południe" },
  sudovest: { it: "Sud-ovest e isole", en: "South-west & islands", fr: "Sud-ouest et îles", es: "Suroeste e islas", pt: "Sudoeste e ilhas", pl: "Południowy zachód i wyspy" },
  ovest: { it: "Ovest", en: "West", fr: "Ouest", es: "Oeste", pt: "Oeste", pl: "Zachód" },
  nord: { it: "Nord", en: "North", fr: "Nord", es: "Norte", pt: "Norte", pl: "Północ" },
  est: { it: "Est e Barbagia", en: "East & Barbagia", fr: "Est et Barbagia", es: "Este y Barbagia", pt: "Leste e Barbagia", pl: "Wschód i Barbagia" },
};

const img = (slug: string) => ({
  src: `/images/placeholder/places/${slug}-1280.webp`,
  srcSet: `/images/placeholder/places/${slug}-640.webp 640w, /images/placeholder/places/${slug}-1280.webp 1280w`,
});

export function Sardinia() {
  const lang = useLang();
  const d = t(lang);
  const c = useContact();
  const open = useContactModal();
  const [zone, setZone] = useState<"tutte" | Zone>("tutte");
  const list = useMemo(() => (zone === "tutte" ? ALL.filter(inAll) : ALL.filter((x) => x.zone === zone)), [zone]);
  const [activeSlug, setActive] = useState<string>(ALL[0].slug);
  const active = list.find((x) => x.slug === activeSlug) ?? list[0];
  const delivery = c.deliveryAreas(lang);
  const night = !!active.night;

  return (
    <section id="sardegna" className="relative scroll-mt-20 overflow-hidden bg-trachite py-section text-sand" aria-labelledby="sardegna-title">
      <div className="absolute inset-x-0 top-0 h-3" aria-hidden><Trama motif="scala" fg="trachite" bg="rent-magenta" cell={3} /></div>
      <div className="wrap">
        <SectionHead index="03" label={d.island.label} tone="dark" />
        <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
          <RevealText as="h2" lines={d.island.title} accent={[1]} className="display text-d-l md:col-span-8" />
          <span id="sardegna-title" className="sr-only">{d.island.title.join(" ")}</span>
          <p className="fx-fade text-sand/80 md:col-span-4">{d.island.text}</p>
        </div>

        {/* filtri per zona */}
        <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label={d.island.filter}>
          {(["tutte", "sud", "sudovest", "ovest", "nord", "est"] as const).map((z) => (
            <button
              key={z}
              type="button"
              aria-pressed={zone === z}
              onClick={() => { setZone(z); const first = z === "tutte" ? ALL.find(inAll) : ALL.find((x) => x.zone === z); if (first) setActive(first.slug); }}
              className={`inline-flex h-11 items-center gap-2 border-filo px-4 text-sm font-semibold uppercase tracking-[0.06em] transition-colors ${
                zone === z ? "border-magenta bg-magenta text-white" : "border-sand/30 text-sand hover:border-sand"
              }`}
            >
              {tr(zoneLabel[z], lang)}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          {/* mappa + meta selezionata */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-start gap-4 lg:block">
                <div className="relative border-filo border-sand/20 bg-trachite-800 p-4">
                  <SardiniaMap
                    pin={null}
                    pins={list.map((x) => x.slug)}
                    active={active.slug}
                    showBase={false}
                    highlightSulcis={false}
                    tone="dark"
                    className="mx-auto h-auto w-full max-w-[17rem]"
                    label={`${d.island.mapLabel}: ${active.name}`}
                  />
                  <p className="eyebrow mt-3 flex items-center gap-2 text-sand/70">
                    <span className="inline-block h-2.5 w-2.5 rotate-45 bg-magenta" aria-hidden />{active.name}
                  </p>
                </div>
                <figure className="lg:mt-4">
                  <div className="relative aspect-[4/3] overflow-hidden border-filo border-sand/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img key={active.slug} src={img(active.slug).src} srcSet={img(active.slug).srcSet} sizes="(min-width:1024px) 38vw, 50vw"
                      alt={active.name} loading="lazy" className="h-full w-full object-cover motion-safe:animate-[fadeIn_.5s_ease-out]" />
                    <span className={`eyebrow absolute left-2 top-2 px-2 py-1 ${night ? "bg-ochre text-trachite" : "bg-sand text-trachite"}`}>{tr(active.area, lang)}</span>
                  </div>
                  <figcaption className="mt-3">
                    <span className={`display block text-d-s ${night ? "text-ochre" : ""}`}>{active.name}</span>
                    <span className="mt-1 block text-sand/80">{tr(active.line, lang)}</span>
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>

          {/* tabellone */}
          <div className="lg:col-span-7">
            <p className="eyebrow mb-3 flex items-center justify-between border-b-filo border-sand/30 pb-3 text-sand/60">
              <span>{d.island.from}</span><span>{list.length} {d.island.count}</span>
            </p>
            <ol className="divide-y divide-sand/15">
              {list.map((p, i) => {
                const on = p.slug === active.slug;
                const accent = p.night ? "text-ochre" : "text-magenta-light";
                return (
                  <li key={p.slug}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setActive(p.slug)}
                      onMouseEnter={() => setActive(p.slug)}
                      onFocus={() => setActive(p.slug)}
                      className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 py-4 text-left md:grid-cols-[3.5rem_1fr_auto] md:py-5"
                    >
                      <span className={`eyebrow ${on ? accent : "text-sand/50"}`}>{String(i + 1).padStart(2, "0")}</span>
                      <span className={`display text-[clamp(2rem,5.4vw,4.75rem)] leading-[0.88] transition-colors ${on ? (p.night ? "text-ochre" : "text-sand") : "text-sand/45 group-hover:text-sand/80"}`}>
                        {p.name}
                      </span>
                      <span className={`eyebrow hidden text-right sm:block ${on ? "text-sand" : "text-sand/50"}`}>{tr(p.area, lang)}</span>
                    </button>
                    {/* su mobile la riga attiva si apre con la frase */}
                    <p className={`pb-4 pl-[2.5rem] pr-2 text-sand/80 lg:hidden ${on ? "" : "hidden"}`}>{tr(p.line, lang)}</p>
                  </li>
                );
              })}
            </ol>

            {/* consegna: SOLO se il titolare ha confermato delle zone in admin → Impostazioni */}
            <div className="mt-10 border-filo border-sand/25 p-5 md:p-6">
              {delivery.length > 0 ? (
                <>
                  <p className="eyebrow text-magenta-light">{d.island.deliveryTitle}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {delivery.map((a) => <li key={a} className="border-filo border-sand/30 px-3 py-2 text-sm font-semibold">{a}</li>)}
                  </ul>
                  <p className="mt-3 text-sm text-sand/70">{d.island.deliveryNote}</p>
                </>
              ) : (
                <p className="text-lead text-sand/90">{d.island.elsewhere}</p>
              )}
              <button type="button" onClick={() => open()} data-cursor={d.bookCursor}
                className="eyebrow mt-5 inline-flex h-14 items-center gap-3 bg-magenta px-6 text-white hover:bg-magenta-deep">
                {d.ajo}<IconArrow className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
