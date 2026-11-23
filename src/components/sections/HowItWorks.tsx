import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { RevealText } from "@/components/site/RevealText";
import { TramaBand } from "@/components/trama/Trama";
import { SectionHead } from "@/components/ui/SectionHead";

export function HowItWorks({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <section id="come-funziona" className="scroll-mt-20 bg-sand pb-section" aria-labelledby="how-title">
      <TramaBand fg="sulcis-blue" cell={8} />
      <div className="wrap pt-section">
        <SectionHead index="04" label={d.howTitle} />
        <RevealText as="h2" lines={[d.howTitle]} className="display display-stretch mt-10 text-d-l" />
        <span id="how-title" className="sr-only">{d.howTitle}</span>
        <ol className="mt-14 grid gap-px border-filo border-trachite bg-trachite md:grid-cols-3">
          {d.howSteps.map((s, i) => (
            <li key={s.t} className="fx-fade relative flex flex-col bg-sand p-6 md:p-8" style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="display text-[clamp(6rem,14vw,12rem)] leading-[0.8] text-blue" aria-hidden style={{ fontVariationSettings: '"wdth" 62, "wght" 900' }}>
                {i + 1}
              </span>
              <h3 className="display mt-6 text-d-s">{s.t}</h3>
              <p className="mt-3 text-stone">{s.d}</p>
            </li>
          ))}
        </ol>
        <p className="fx-fade mt-8 inline-flex items-center gap-3 bg-trachite px-4 py-3 font-semibold text-sand">
          <span className="h-2.5 w-2.5 bg-magenta" aria-hidden />{d.howNote}
        </p>
      </div>
    </section>
  );
}
