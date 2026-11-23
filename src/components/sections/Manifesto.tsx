import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { RevealText } from "@/components/site/RevealText";
import { SectionHead } from "@/components/ui/SectionHead";

export function Manifesto({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <section className="relative bg-sand py-section" aria-labelledby="manifesto-title">
      <div className="wrap">
        <SectionHead index="01" label={lang === "it" ? "Manifesto" : "Manifesto"} />
        <RevealText as="h2" lines={d.manifesto} accent={[3]} className="display display-stretch mt-10 text-d-l" />
        <span id="manifesto-title" className="sr-only">{d.manifesto.join(" ")}</span>
        <div className="mt-12 grid md:grid-cols-12">
          <p className="fx-fade text-lead md:col-span-5 md:col-start-8">{d.manifestoText}</p>
        </div>
      </div>
    </section>
  );
}
