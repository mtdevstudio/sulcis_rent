import { alternatesOf, t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { FleetGrid } from "@/components/car/FleetGrid";
import { SiteShell } from "@/components/site/SiteShell";
import { TramaBand } from "@/components/trama/Trama";

/** Pagina «Flotta»: tutte le auto pubblicate, filtri per categoria. Si aggiorna da /data/fleet.json. */
export function FleetPage({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <SiteShell lang={lang} alternates={alternatesOf((p) => p.fleet)}>
      <section className="bg-sand pb-12 pt-28 md:pt-36" aria-labelledby="fleet-h1">
        <div className="wrap">
          <p className="eyebrow text-magenta-deep">{d.fleetPage.eyebrow}</p>
          <h1 id="fleet-h1" className="display mt-4 text-d-xl leading-[0.82]">{d.fleetPage.title}</h1>
          <div className="mt-8 grid gap-6 md:grid-cols-12">
            <p className="text-lead md:col-span-7">{d.fleetPage.text}</p>
            <ul className="space-y-2 text-sm md:col-span-4 md:col-start-9">
              {d.fleetPage.points.map((p) => <li key={p} className="flex gap-3"><span className="mt-1.5 h-2.5 w-2.5 shrink-0 rotate-45 bg-magenta" aria-hidden />{p}</li>)}
            </ul>
          </div>
        </div>
        <div data-hero-end className="h-px" aria-hidden />
      </section>
      <TramaBand fg="sulcis-blue" cell={8} />
      <section className="bg-sand-200 py-14 md:py-20" aria-label={d.fleetPage.title}>
        <div className="wrap"><h2 className="sr-only">{d.fleetPage.title}</h2><FleetGrid eager={3} /></div>
      </section>
    </SiteShell>
  );
}
