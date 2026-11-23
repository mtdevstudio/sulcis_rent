"use client";
import { useMemo, useState } from "react";
import { useFleet } from "@/lib/data";
import { t, tr } from "@/lib/i18n";
import { CarCard } from "@/components/car/CarCard";
import { useLang } from "@/components/site/LangContext";
import { RevealText } from "@/components/site/RevealText";
import { Chip } from "@/components/ui/Chip";
import { SectionHead } from "@/components/ui/SectionHead";
import { useContactModal } from "@/components/site/ContactModal";
import { Button } from "@/components/ui/Button";

export function Fleet() {
  const lang = useLang();
  const d = t(lang);
  const fleet = useFleet();
  const open = useContactModal();
  const [cat, setCat] = useState<string>("all");
  const cars = useMemo(() => [...fleet.cars].sort((a, b) => a.order - b.order), [fleet.cars]);
  // Solo categorie con almeno un'auto pubblicata
  const cats = useMemo(() => fleet.categories.filter((c) => cars.some((x) => x.category === c.key)), [fleet.categories, cars]);
  const shown = cat === "all" ? cars : cars.filter((c) => c.category === cat);

  return (
    <section id="flotta" className="scroll-mt-20 bg-sand-200 py-section" aria-labelledby="flotta-title">
      <div className="wrap">
        <SectionHead index="02" label={d.nav.fleet} />
        <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
          <RevealText as="h2" lines={[d.fleetTitle]} className="display text-d-l md:col-span-8" />
          <span id="flotta-title" className="sr-only">{d.fleetTitle}</span>
          <p className="fx-fade text-stone md:col-span-4">{d.fleetText}</p>
        </div>
        {cats.length > 1 && (
          <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label={lang === "it" ? "Filtra per categoria" : "Filter by category"}>
            <Chip active={cat === "all"} onClick={() => setCat("all")} count={cars.length}>{d.all}</Chip>
            {cats.map((c) => (
              <Chip key={c.key} active={cat === c.key} onClick={() => setCat(c.key)} count={cars.filter((x) => x.category === c.key).length}>{tr(c.label, lang)}</Chip>
            ))}
          </div>
        )}
        {shown.length ? (
          <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
            {shown.map((car, i) => <li key={car.slug} className="flex"><div className="w-full"><CarCard car={car} categories={fleet.categories} index={i} /></div></li>)}
          </ul>
        ) : (
          <div className="mt-10 flex flex-col items-start gap-4 border-filo border-trachite bg-sand p-8">
            <p className="text-lead">{d.noCars}</p>
            <Button variant="magenta" nodo onClick={() => open()}>{d.ajo}</Button>
          </div>
        )}
      </div>
    </section>
  );
}
