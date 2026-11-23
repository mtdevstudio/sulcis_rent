import type { Lang, PublicCar } from "./types";
import { fuelLabel, transmissionLabel } from "@/data/catalog";

export const carName = (c: PublicCar) => `${c.brand} ${c.model}`;
export const hasPrice = (c: PublicCar) => typeof c.rental.priceDay === "number" || typeof c.rental.priceWeek === "number" || typeof c.rental.priceMonth === "number";
export const euro = (n: number, lang: Lang) => new Intl.NumberFormat(lang === "it" ? "it-IT" : "en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

/** Prima tariffa disponibile per la card («da 35 €/giorno»). Il JSON pubblico contiene prezzi SOLO se «Mostra prezzo» è attivo. */
export function priceFrom(c: PublicCar): { amount: number; unit: "day" | "week" | "month" } | null {
  const r = c.rental;
  if (typeof r.priceDay === "number") return { amount: r.priceDay, unit: "day" };
  if (typeof r.priceWeek === "number") return { amount: r.priceWeek, unit: "week" };
  if (typeof r.priceMonth === "number") return { amount: r.priceMonth, unit: "month" };
  return null;
}

/** Le 3 specifiche iconiche della card, solo se compilate. */
export function keySpecs(c: PublicCar, lang: Lang) {
  const out: { icon: "seats" | "gear" | "fuel"; label: string }[] = [];
  if (c.specs.seats) out.push({ icon: "seats", label: `${c.specs.seats} ${lang === "it" ? "posti" : "seats"}` });
  if (c.specs.transmission) out.push({ icon: "gear", label: transmissionLabel[c.specs.transmission]?.[lang] ?? c.specs.transmission });
  if (c.specs.fuel) out.push({ icon: "fuel", label: fuelLabel[c.specs.fuel]?.[lang] ?? c.specs.fuel });
  return out;
}
