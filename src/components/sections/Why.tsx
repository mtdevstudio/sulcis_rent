import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { RevealText } from "@/components/site/RevealText";
import { Trama } from "@/components/trama/Trama";
import { SectionHead } from "@/components/ui/SectionHead";

export function Why({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <section className="relative overflow-hidden bg-blue py-section text-white" aria-labelledby="why-title">
      <Trama motif="rombo" fg="sulcis-blue-deep" cell={20} opacity={0.55} />
      <div className="wrap relative">
        <SectionHead index="05" label={d.whyTitle} tone="dark" />
        <RevealText as="h2" lines={[d.whyTitle]} className="display mt-10 text-d-l" />
        <span id="why-title" className="sr-only">{d.whyTitle}</span>
        <ul className="mt-14 grid gap-px bg-white/25 md:grid-cols-2 xl:grid-cols-4">
          {d.why.map((w, i) => (
            <li key={w.t} className="fx-fade bg-blue p-6 md:p-8" style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="eyebrow text-white/80">0{i + 1}</span>
              <h3 className="display mt-6 text-d-s">{w.t}</h3>
              <p className="mt-3 text-white/90">{w.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
