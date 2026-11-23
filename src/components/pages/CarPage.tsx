import { fleetSnapshot } from "@/data/snapshot.generated";
import { paths } from "@/lib/i18n";
import { carJsonLd, carMeta } from "@/lib/seo";
import { pageMetadata } from "@/lib/metadata";
import type { Lang } from "@/lib/types";
import { CarDetail } from "@/components/car/CarDetail";
import { SiteShell } from "@/components/site/SiteShell";

export const carStaticParams = () => fleetSnapshot.cars.map((c) => ({ slug: c.slug }));

export function carPageMetadata(lang: Lang, slug: string) {
  const car = fleetSnapshot.cars.find((c) => c.slug === slug);
  const other = lang === "it" ? "en" : "it";
  if (!car) return pageMetadata({ lang, title: "Sulcis Rent", description: "", path: paths[lang].car(slug), noindex: true });
  const m = carMeta(car, lang, fleetSnapshot.categories);
  return pageMetadata({ lang, title: m.title, description: m.description, path: paths[lang].car(slug), altPath: paths[other].car(slug) });
}

/** Pagina auto pre-renderizzata. In produzione api/car.php ne aggiorna i meta con i dati freschi. */
export function CarPage({ lang, slug }: { lang: Lang; slug?: string }) {
  const car = slug ? fleetSnapshot.cars.find((c) => c.slug === slug) : undefined;
  const other = lang === "it" ? "en" : "it";
  return (
    <SiteShell lang={lang} altHref={slug ? paths[other].car(slug) : paths[other].home}>
      {car && <script id="car-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(carJsonLd(car, lang, fleetSnapshot.categories)) }} />}
      <CarDetail slug={slug} />
    </SiteShell>
  );
}
