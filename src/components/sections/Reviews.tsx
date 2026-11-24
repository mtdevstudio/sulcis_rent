"use client";
import { site } from "@/data/site";
import { ui } from "@/lib/i18n-ui";
import { useContact } from "@/lib/contact";
import { useReviews } from "@/lib/data";
import { t } from "@/lib/i18n";
import { useLang } from "@/components/site/LangContext";
import { SectionHead } from "@/components/ui/SectionHead";
import { IconArrow, IconStar } from "@/components/ui/icons";

/** Recensioni reali da /data/reviews.json. Se vuoto: solo il badge 5,0 ★ e il link a Google. */
export function Reviews() {
  const lang = useLang();
  const d = t(lang);
  const { reviews } = useReviews();
  const c = useContact();
  const gUrl = c.googleReviewsUrl || `https://www.google.com/search?q=${encodeURIComponent("Sulcis Rent Autonoleggio San Giovanni Suergiu recensioni")}`;
  return (
    <section className="bg-sand-200 py-section" aria-labelledby="reviews-title">
      <div className="wrap">
        <SectionHead index="06" label={d.reviewsTitle} />
        <div className="mt-10 grid gap-10 md:grid-cols-12 md:items-end">
          <h2 id="reviews-title" className="display text-d-l md:col-span-7">{d.reviewsTitle}</h2>
          <div className="md:col-span-5 md:text-right">
            <p className="flex items-end gap-4 md:justify-end">
              <span className="display text-[clamp(5rem,12vw,9rem)] leading-[0.8]" style={{ fontVariationSettings: '"wdth" 62, "wght" 900' }}>{site.google.ratingLabel}</span>
              <span className="pb-2">
                <span className="flex text-magenta" aria-hidden>{Array.from({ length: 5 }).map((_, i) => <IconStar key={i} className="h-6 w-6" />)}</span>
                <span className="eyebrow mt-2 block">Google · {site.google.reviewCount} {ui[lang].reviews}</span>
              </span>
            </p>
            <a href={gUrl} target="_blank" rel="noopener noreferrer" className="eyebrow mt-4 inline-flex h-12 items-center gap-2 border-filo border-trachite px-5 hover:bg-trachite hover:text-sand">
              {d.readReviews}<IconArrow className="h-4 w-4" />
            </a>
          </div>
        </div>
        {reviews.length > 0 && (
          <ul className="-mx-gutter mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-gutter pb-4" aria-label={d.reviewsTitle} tabIndex={0}>
            {reviews.map((r, i) => (
              <li key={i} className="w-[85%] shrink-0 snap-start border-filo border-trachite bg-sand p-6 sm:w-[60%] lg:w-[32%]">
                <p className="flex text-magenta" aria-label={`${r.rating} su 5`}>{Array.from({ length: r.rating }).map((_, k) => <IconStar key={k} />)}</p>
                <blockquote className="mt-4 text-lead">“{r.text}”</blockquote>
                <p className="mt-5 font-semibold">{r.author}</p>
                <p className="text-xs text-stone">
                  {new Date(r.date).toLocaleDateString(ui[lang].locale, { month: "long", year: "numeric" })} · {r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer" className="underline">{r.source}</a> : r.source}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
