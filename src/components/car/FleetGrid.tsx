"use client";
import { useMemo, useState } from "react";
import { useFleet } from "@/lib/data";
import { t, tr } from "@/lib/i18n";
import { CarCard } from "@/components/car/CarCard";
import { useContactModal } from "@/components/site/ContactModal";
import { useLang } from "@/components/site/LangContext";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

/**
 * Griglia della flotta con filtri per categoria (solo categorie con almeno un'auto pubblicata).
 * `limit`: in home mostra prima le auto «in evidenza», fino a N; la pagina /flotta/ le mostra tutte.
 */
export function FleetGrid({ limit, filters = true }: { limit?: number; filters?: boolean }) {
  const lang = useLang();
  const d = t(lang);
  const fleet = useFleet();
  const open = useContactModal();
  const [cat, setCat] = useState<string>("all");
  const cars = useMemo(() => {
    const sorted = [...fleet.cars].sort((a, b) => a.order - b.order);
    return limit ? [...sorted.filter((c) => c.featured), ...sorted.filter((c) => !c.featured)] : sorted;
  }, [fleet.cars, limit]);
  const cats = useMemo(() => fleet.categories.filter((c) => cars.some((x) => x.category === c.key)), [fleet.categories, cars]);
  const filtered = cat === "all" ? cars : cars.filter((c) => c.category === cat);
  const shown = limit ? filtered.slice(0, limit) : filtered;

  return (
    <>
      {filters && cats.length > 1 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label={lang === "it" ? "Filtra per categoria" : "Filter by category"}>
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
    </>
  );
}

export function useFleetCount() { return useFleet().cars.length; }
