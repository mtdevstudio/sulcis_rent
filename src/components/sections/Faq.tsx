"use client";
import { useFaq } from "@/lib/data";
import { t, tr } from "@/lib/i18n";
import { useLang } from "@/components/site/LangContext";
import { SectionHead } from "@/components/ui/SectionHead";

export function Faq() {
  const lang = useLang();
  const d = t(lang);
  const { items } = useFaq();
  if (!items.length) return null;
  return (
    <section id="faq" className="scroll-mt-20 bg-sand py-section" aria-labelledby="faq-title">
      <div className="wrap grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <SectionHead index="07" label="FAQ" />
          <h2 id="faq-title" className="display mt-10 text-d-m">{d.faqTitle}</h2>
        </div>
        <div className="divide-y-filo divide-trachite border-y-filo border-trachite md:col-span-8">
          {items.map((f, i) => (
            <details key={i} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                <span>{tr(f.q, lang)}</span>
                <span className="grid h-10 w-10 shrink-0 place-items-center border-filo border-trachite transition-transform duration-base ease-trama group-open:rotate-45 group-open:bg-trachite group-open:text-sand" aria-hidden>+</span>
              </summary>
              <div className="prose-car pb-6 pr-12 text-stone" dangerouslySetInnerHTML={{ __html: tr(f.a, lang) }} />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
