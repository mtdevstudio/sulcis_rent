"use client";
import Link from "next/link";
import { paths, t } from "@/lib/i18n";
import { FleetGrid, useFleetCount } from "@/components/car/FleetGrid";
import { useLang } from "@/components/site/LangContext";
import { RevealText } from "@/components/site/RevealText";
import { SectionHead } from "@/components/ui/SectionHead";
import { IconArrow } from "@/components/ui/icons";

/** Home: le auto in evidenza (max 6) e il link alla flotta completa. */
export function Fleet() {
  const lang = useLang();
  const d = t(lang);
  const total = useFleetCount();
  return (
    <section id="flotta" className="scroll-mt-20 bg-sand-200 py-section" aria-labelledby="flotta-title">
      <div className="wrap">
        <SectionHead index="02" label={d.nav.fleet} />
        <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
          <RevealText as="h2" lines={[d.fleetTitle]} className="display text-d-l md:col-span-8" />
          <span id="flotta-title" className="sr-only">{d.fleetTitle}</span>
          <p className="fx-fade text-stone md:col-span-4">{d.fleetText}</p>
        </div>
        <div className="mt-10"><FleetGrid limit={6} filters={false} /></div>
        <div className="mt-10 flex justify-center">
          <Link href={paths[lang].fleet} className="eyebrow inline-flex h-16 items-center gap-3 border-filo border-trachite bg-sand px-8 hover:bg-trachite hover:text-sand">
            {d.fleetAll} ({total})<IconArrow className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
