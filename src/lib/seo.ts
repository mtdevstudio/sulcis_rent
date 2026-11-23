import { site } from "@/data/site";
import { carName, priceFrom } from "./car";
import { paths, tr } from "./i18n";
import type { CatalogItem, Lang, PublicCar } from "./types";

/**
 * Regole SEO condivise. ⚠️ api/car.php replica le stesse regole per le auto aggiunte dopo il build:
 * se cambi qui, aggiorna anche server/lib/seo.php.
 */
export const absolute = (p: string) => `${site.domain}${p}`;

export function carMeta(car: PublicCar, lang: Lang, cats: CatalogItem[]) {
  const cat = tr(cats.find((c) => c.key === car.category)?.label, lang);
  const name = carName(car);
  const title = tr(car.seo?.title, lang) || (lang === "it" ? `Noleggio ${name}${cat ? ` · ${cat}` : ""} a San Giovanni Suergiu` : `Rent a ${name}${cat ? ` · ${cat}` : ""} in South Sardinia`);
  const description =
    tr(car.seo?.description, lang) || tr(car.content.short, lang) ||
    (lang === "it" ? `${name} a noleggio nel Sulcis Iglesiente. Scrivici su WhatsApp per disponibilità e prezzo: siamo aperti h24.` : `${name} for rent in Sulcis Iglesiente, South Sardinia. Message us on WhatsApp for availability and price: open 24/7.`);
  return { title, description: description.slice(0, 160) };
}

export function localBusinessJsonLd(lang: Lang) {
  return {
    "@context": "https://schema.org",
    "@type": ["AutoRental", "LocalBusiness"],
    "@id": `${site.domain}/#business`,
    name: site.legalName,
    url: absolute(paths[lang].home),
    image: absolute("/og.png"),
    telephone: site.phone.e164,
    address: {
      "@type": "PostalAddress", streetAddress: site.address.street, postalCode: site.address.postalCode,
      addressLocality: site.address.city, addressRegion: site.address.province, addressCountry: site.address.country,
    },
    openingHours: site.hours.schema,
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" }],
    sameAs: [site.social.instagram],
    areaServed: [{ "@type": "Place", name: "Sulcis Iglesiente" }, { "@type": "AdministrativeArea", name: "Sud Sardegna" }],
    aggregateRating: { "@type": "AggregateRating", ratingValue: site.google.rating, reviewCount: site.google.reviewCount, bestRating: 5 },
  };
}

export function carJsonLd(car: PublicCar, lang: Lang, cats: CatalogItem[]) {
  const { description } = carMeta(car, lang, cats);
  const p = priceFrom(car);
  const json: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["Product", "Car"],
    name: carName(car) + (car.version ? ` ${car.version}` : ""),
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    description,
    url: absolute(paths[lang].car(car.slug)),
    image: car.images.map((i) => absolute(`${i.base}-${Math.max(...i.widths)}.webp`)),
    category: tr(cats.find((c) => c.key === car.category)?.label, lang) || car.category,
  };
  if (car.specs.seats) json.seatingCapacity = car.specs.seats;
  if (car.specs.doors) json.numberOfDoors = car.specs.doors;
  if (car.specs.fuel) json.fuelType = car.specs.fuel;
  if (car.specs.transmission) json.vehicleTransmission = car.specs.transmission;
  if (car.year) json.vehicleModelDate = String(car.year);
  // offers SOLO se il prezzo è visibile (il JSON pubblico contiene prezzi solo con «Mostra prezzo» attivo)
  if (p) {
    json.offers = {
      "@type": "Offer", priceCurrency: "EUR", price: p.amount, // nessuna «availability»: il sito non mostra disponibilità
      priceSpecification: { "@type": "UnitPriceSpecification", price: p.amount, priceCurrency: "EUR", unitCode: p.unit === "day" ? "DAY" : p.unit === "week" ? "WEE" : "MON" },
      seller: { "@id": `${site.domain}/#business` },
    };
  }
  return json;
}
