"use client";
import Link from "next/link";
import { ui } from "@/lib/i18n-ui";
import { useEffect, useState } from "react";
import { badgeLabel, catLabel, driveLabel, fuelLabel, transmissionLabel } from "@/data/catalog";
import { carName, euro } from "@/lib/car";
import { useFleet } from "@/lib/data";
import { paths, t, tr } from "@/lib/i18n";
import { carMeta, absolute } from "@/lib/seo";
import type { CatalogItem, Lang, PublicCar } from "@/lib/types";
import { useContactModal } from "@/components/site/ContactModal";
import { useLang } from "@/components/site/LangContext";
import { Magnetic } from "@/components/site/Magnetic";
import { Trama } from "@/components/trama/Trama";
import { Button } from "@/components/ui/Button";
import { IconArrow, Nodo } from "@/components/ui/icons";
import { CarCard } from "./CarCard";
import { CarImage } from "./CarImage";

type Row = { k: string; v: string };

function specRows(c: PublicCar, lang: Lang): Row[] {
  const d = t(lang).spec;
  const s = c.specs;
  const r: Row[] = [];
  const push = (k: string, v: unknown, fmt?: (x: never) => string) => { if (v !== undefined && v !== null && v !== "") r.push({ k, v: fmt ? fmt(v as never) : String(v) }); };
  push(d.fuel, s.fuel, (x: string) => tr(fuelLabel[x], lang) ?? x);
  push(d.transmission, s.transmission, (x: string) => tr(transmissionLabel[x], lang) ?? x);
  push(d.seats, s.seats);
  push(d.doors, s.doors);
  const lug = [s.luggageLarge ? `${s.luggageLarge} ${d.big}` : "", s.luggageSmall ? `${s.luggageSmall} ${d.small}` : "", s.luggageLiters ? `${s.luggageLiters} l` : ""].filter(Boolean).join(" · ");
  push(d.luggage, lug || undefined);
  push(d.engineCc, s.engineCc, (x: number) => `${x} cc`);
  const pw = [s.powerCv ? `${s.powerCv} CV` : "", s.powerKw ? `${s.powerKw} kW` : ""].filter(Boolean).join(" / ");
  push(d.power, pw || undefined);
  push(d.drive, s.drive, (x: string) => tr(driveLabel[x], lang) ?? x);
  push(d.consumption, s.consumption);
  push(d.euro, s.euro);
  push(d.rangeKm, s.rangeKm, (x: number) => `${x} km`);
  push(d.chargeTime, s.chargeTime);
  push(d.cargoM3, s.cargoM3, (x: number) => `${x} m³`);
  push(d.payloadKg, s.payloadKg, (x: number) => `${x} kg`);
  push(d.cargoLength, s.cargoLength);
  push(d.license, s.license);
  push(d.year, c.year);
  push(d.color, c.color?.name);
  return r;
}

function conditionRows(c: PublicCar, lang: Lang): Row[] {
  const d = t(lang);
  const k = d.cond;
  const r = c.rental;
  const out: Row[] = [];
  const prices = [
    typeof r.priceDay === "number" ? `${d.from} ${euro(r.priceDay, lang)}${d.perDay}` : "",
    typeof r.priceWeek === "number" ? `${d.from} ${euro(r.priceWeek, lang)}${d.perWeek}` : "",
    typeof r.priceMonth === "number" ? `${d.from} ${euro(r.priceMonth, lang)}${d.perMonth}` : "",
  ].filter(Boolean);
  if (prices.length) out.push({ k: k.price, v: prices.join(" · ") + (r.priceNote ? ` — ${tr(r.priceNote, lang)}` : "") });
  if (r.kmPerDay === "unlimited") out.push({ k: k.km, v: k.unlimited });
  else if (typeof r.kmPerDay === "number") out.push({ k: k.km, v: `${r.kmPerDay} ${k.perDayKm}` });
  if (r.minAge) out.push({ k: k.minAge, v: `${r.minAge} ${k.years}` });
  if (r.minLicenseYears) out.push({ k: k.license, v: `${r.minLicenseYears} ${k.years}` });
  if (r.deposit === "on_request") out.push({ k: k.deposit, v: k.onRequest });
  else if (typeof r.deposit === "number") out.push({ k: k.deposit, v: euro(r.deposit, lang) });
  if (typeof r.creditCard === "boolean") out.push({ k: k.creditCard, v: r.creditCard ? k.required : k.notRequired });
  if (r.delivery) {
    const opts = [r.delivery.home && k.home, r.delivery.airport && k.airport, r.delivery.port && k.port].filter(Boolean).join(", ");
    const note = tr(r.delivery.note, lang);
    if (opts || note) out.push({ k: k.delivery, v: [opts, note].filter(Boolean).join(" — ") });
  }
  if (r.insurance && tr(r.insurance, lang)) out.push({ k: k.insurance, v: tr(r.insurance, lang) });
  return out;
}

function Rows({ rows }: { rows: Row[] }) {
  return (
    <dl className="divide-y divide-sand-300 border-y-filo border-trachite">
      {rows.map((r) => (
        <div key={r.k} className="grid grid-cols-2 gap-4 py-3 text-sm md:text-base">
          <dt className="text-stone">{r.k}</dt><dd className="font-semibold">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CarDetail({ slug, car: carProp, preview = false, catalog }: { slug?: string; car?: PublicCar; preview?: boolean; catalog?: { categories: CatalogItem[]; features: CatalogItem[]; tags: CatalogItem[] } }) {
  const lang = useLang();
  const d = t(lang);
  const store = useFleet();
  const fleet = catalog ? { ...store, ...catalog } : store;
  const [pathSlug, setPathSlug] = useState(slug);
  useEffect(() => {
    if (!slug && !carProp) {
      const m = location.pathname.match(/\/(?:flotta|fleet)\/([a-z0-9-]+)\/?$/);
      if (m) setPathSlug(m[1]);
    }
  }, [slug, carProp]);
  const car = carProp ?? fleet.cars.find((c) => c.slug === pathSlug);
  const open = useContactModal(car?.slug);
  const [idx, setIdx] = useState(0);

  // Allinea title/description/canonical ai dati freschi (stesse regole di car.php), anche dopo l'idratazione.
  useEffect(() => {
    if (!car || preview) return;
    const m = carMeta(car, lang, fleet.categories);
    document.title = m.title;
    const set = (sel: string, make: () => HTMLElement, attr: string, val: string) => {
      const els = document.head.querySelectorAll<HTMLElement>(sel);
      els.forEach((el, i) => { if (i > 0) el.remove(); });
      const el = els[0] ?? document.head.appendChild(make());
      el.setAttribute(attr, val);
    };
    set('meta[name="description"]', () => Object.assign(document.createElement("meta"), { name: "description" }), "content", m.description);
    set('link[rel="canonical"]', () => Object.assign(document.createElement("link"), { rel: "canonical" }), "href", absolute(paths[lang].car(car.slug)));
    document.head.querySelectorAll('meta[name="robots"]').forEach((el) => el.remove());
  }, [car, lang, fleet.categories, preview]);

  if (!car) {
    if (!pathSlug) return <div className="min-h-[60vh]" />;
    return (
      <section className="wrap flex min-h-[70vh] flex-col items-start justify-center gap-6 pt-24">
        <h1 className="display text-d-l">{d.car.notFound}</h1>
        <p className="max-w-prose text-lead">{d.car.notFoundText}</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="magenta" nodo onClick={() => open()}>{d.ajo}</Button>
          <Link href={paths[lang].fleet} className="eyebrow inline-flex h-14 items-center border-filo border-trachite px-6">{d.car.back}</Link>
        </div>
      </section>
    );
  }

  const cats: CatalogItem[] = fleet.categories;
  const cat = cats.find((c) => c.key === car.category);
  const specs = specRows(car, lang);
  const conds = conditionRows(car, lang);
  const feats = car.features.map((k) => fleet.features.find((f) => f.key === k)).filter(Boolean) as CatalogItem[];
  const tags = car.perfectFor.map((k) => fleet.tags.find((x) => x.key === k)).filter(Boolean) as CatalogItem[];
  const others = fleet.cars.filter((c) => c.slug !== car.slug).sort((a, b) => Number(b.category === car.category) - Number(a.category === car.category) || a.order - b.order).slice(0, 3);
  const img = car.images[idx] ?? car.images[0];
  const long = tr(car.content.long, lang);

  return (
    <article>
      {preview && <div className="sticky top-0 z-[55] bg-ochre px-4 py-2 text-center text-sm font-bold text-trachite">{d.car.preview}</div>}
      <header className="relative bg-sand pt-24 md:pt-28">
        <div className="wrap">
          <Link href={paths[lang].fleet} className="eyebrow inline-flex items-center gap-2 hover:text-magenta-deep">
            <IconArrow className="h-4 w-4 rotate-180" />{d.car.back}
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {cat && <span className="eyebrow bg-trachite px-2 py-1 text-sand">{catLabel(cat, lang)}</span>}
            {car.badge && <span className="eyebrow bg-magenta px-2 py-1 text-white">{tr(badgeLabel[car.badge], lang)}</span>}
            {car.version && <span className="eyebrow text-stone">{car.version}</span>}
          </div>
          <h1 className="display mt-4 text-d-xl leading-[0.82]">
            <span className="block text-blue">{car.brand}</span>
            <span className="block">{car.model}</span>
          </h1>
        </div>
        <div className="wrap mt-8 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="relative aspect-[4/3] overflow-hidden bg-blue" style={{ viewTransitionName: "car-hero" }}>
              <Trama motif="pibiones" fg="sand" cell={14} opacity={0.3} />
              <CarImage image={img} lang={lang} priority sizes="(min-width: 1024px) 66vw, 100vw" className="relative h-full w-full object-cover" />
            </div>
            {car.images.length > 1 && (
              <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label={d.car.gallery}>
                {car.images.map((im, i) => (
                  <li key={im.base} className="shrink-0">
                    <button type="button" onClick={() => setIdx(i)} aria-label={`${tr(im.alt, lang)}`} aria-current={i === idx}
                      className={`block h-20 w-28 overflow-hidden border-filo ${i === idx ? "border-magenta" : "border-transparent opacity-70 hover:opacity-100"}`}>
                      <CarImage image={im} lang={lang} sizes="120px" className="h-full w-full object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              {car.content.short && <p className="text-lead">{tr(car.content.short, lang)}</p>}
              {car.content.highlights && car.content.highlights.length > 0 && (
                <ul className="mt-5 space-y-2">
                  {car.content.highlights.map((h, i) => <li key={i} className="flex gap-3"><Nodo className="mt-1.5 h-2.5 w-2.5 shrink-0 text-magenta" /><span className="font-semibold">{tr(h, lang)}</span></li>)}
                </ul>
              )}
              {!conds.some((c) => c.k === d.cond.price) && <p className="mt-5 font-semibold text-magenta-deep">{d.askPrice}</p>}
              <Magnetic className="mt-6 block w-full">
                <Button variant="magenta" size="xl" nodo className="w-full" onClick={() => open(car)} data-cursor={d.bookCursor}>{d.car.book}</Button>
              </Magnetic>
              <p className="mt-3 text-xs text-stone">{d.modalSub}</p>
            </div>
          </aside>
        </div>
        <div data-hero-end className="h-px" aria-hidden />
      </header>

      <div className="wrap grid gap-12 py-section lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-7">
          {long && (
            <section aria-labelledby="desc-t">
              <h2 id="desc-t" className="sr-only">{ui[lang].description}</h2>
              <div className="prose-car text-lead" dangerouslySetInnerHTML={{ __html: long }} />
            </section>
          )}
          {specs.length > 0 && (
            <section aria-labelledby="spec-t">
              <h2 id="spec-t" className="display text-d-s">{d.car.specs}</h2>
              <div className="mt-5"><Rows rows={specs} /></div>
            </section>
          )}
          {conds.length > 0 && (
            <section aria-labelledby="cond-t">
              <h2 id="cond-t" className="display text-d-s">{d.car.conditions}</h2>
              <div className="mt-5"><Rows rows={conds} /></div>
            </section>
          )}
        </div>
        <div className="space-y-12 lg:col-span-4 lg:col-start-9">
          {tags.length > 0 && (
            <section aria-labelledby="perf-t">
              <h2 id="perf-t" className="display text-d-s">{d.car.perfect}</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {tags.map((x) => <li key={x.key} className="border-filo border-trachite px-3 py-2 text-sm font-semibold">{catLabel(x, lang)}</li>)}
              </ul>
            </section>
          )}
          {feats.length > 0 && (
            <section aria-labelledby="feat-t">
              <h2 id="feat-t" className="display text-d-s">{d.car.features}</h2>
              <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {feats.map((f) => <li key={f.key} className="flex items-center gap-3 bg-sand-200 px-3 py-2.5 text-sm"><Nodo className="h-2.5 w-2.5 shrink-0 text-blue" />{catLabel(f, lang)}</li>)}
              </ul>
            </section>
          )}
        </div>
      </div>

      {!preview && others.length > 0 && (
        <section className="bg-sand-200 py-section" aria-labelledby="others-t">
          <div className="wrap">
            <h2 id="others-t" className="display text-d-m">{d.car.others}</h2>
            <ul className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {others.map((c, i) => <li key={c.slug}><CarCard car={c} categories={cats} index={i} /></li>)}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
