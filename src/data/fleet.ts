import type { FleetData, PublicCar } from "@/lib/types";
import { categories, features, tags } from "./catalog";

/**
 * FLOTTA DI PARTENZA (snapshot del build).
 * In produzione il sito legge /data/fleet.json, generato dal pannello /admin a ogni salvataggio.
 * Questo file serve solo come primo render e come fallback se il JSON non esiste.
 *
 * ⚠️ TODO sostituire con flotta reale: le 6 auto qui sotto sono SEGNAPOSTO verosimili,
 * non la flotta di Sulcis Rent. Niente prezzi: compare «Chiedi il prezzo».
 */
const img = (slug: string, alt: string, n = 1) =>
  Array.from({ length: n }, (_, i) => ({
    base: `/images/placeholder/cars/${slug}${i ? `-${i + 1}` : ""}`,
    widths: [640, 1280],
    w: 1280,
    h: 960,
    alt: { it: `${alt} – vista ${i + 1}`, en: `${alt} – view ${i + 1}` },
  }));

const cars: PublicCar[] = [
  {
    id: "ph-1", slug: "fiat-panda", brand: "Fiat", model: "Panda", category: "citycar", // TODO sostituire con flotta reale
    specs: { fuel: "benzina", transmission: "manuale", seats: 5, doors: 5, luggageLarge: 1, luggageSmall: 1 },
    features: ["aria-condizionata", "bluetooth", "usb"],
    rental: {},
    content: {
      short: { it: "Piccola fuori, comoda dentro: parcheggia ovunque, da Calasetta a Iglesias.", en: "Small outside, roomy inside: parks anywhere, from Calasetta to Iglesias." },
      long: { it: "<p>La citycar per muoversi tra paesi, spiagge e centri storici senza pensieri.</p>", en: "<p>The city car for moving between villages, beaches and old towns without a worry.</p>" },
      highlights: [{ it: "Agile nei centri storici", en: "Nimble in old towns" }, { it: "Facile da parcheggiare", en: "Easy to park" }],
    },
    perfectFor: ["coppie", "citta", "isole-minori"], featured: true, order: 1,
    images: img("fiat-panda", "Fiat Panda", 3),
  },
  {
    id: "ph-2", slug: "renault-clio", brand: "Renault", model: "Clio", category: "utilitaria", // TODO sostituire con flotta reale
    specs: { fuel: "benzina", transmission: "manuale", seats: 5, doors: 5, luggageLarge: 1, luggageSmall: 2 },
    features: ["aria-condizionata", "bluetooth", "android-auto", "carplay", "sensori-parcheggio"],
    rental: {},
    content: {
      short: { it: "L'utilitaria giusta per la costa: spazio per due valigie e la strada di Nebida.", en: "The right compact for the coast: room for two suitcases and the Nebida road." },
      highlights: [{ it: "Smartphone sullo schermo", en: "Phone on the screen" }],
    },
    perfectFor: ["coppie", "famiglie"], featured: true, order: 2,
    images: img("renault-clio", "Renault Clio", 2),
  },
  {
    id: "ph-3", slug: "jeep-renegade", brand: "Jeep", model: "Renegade", category: "suv-compatto", // TODO sostituire con flotta reale
    specs: { fuel: "diesel", transmission: "manuale", seats: 5, doors: 5, luggageLarge: 2, luggageSmall: 1 },
    features: ["clima-automatico", "bluetooth", "navigatore", "cruise-control", "cerchi-lega"],
    rental: {},
    content: {
      short: { it: "Seduta alta e carattere: per le strade bianche verso le calette.", en: "High seating and character: for the gravel roads down to the coves." },
    },
    perfectFor: ["famiglie", "sterrati"], featured: true, order: 3,
    images: img("jeep-renegade", "Jeep Renegade", 2),
  },
  {
    id: "ph-4", slug: "dacia-duster", brand: "Dacia", model: "Duster", category: "suv", // TODO sostituire con flotta reale
    specs: { fuel: "gpl", transmission: "manuale", seats: 5, doors: 5, luggageLarge: 2, luggageSmall: 2 },
    features: ["aria-condizionata", "bluetooth", "barre-portatutto", "sensori-parcheggio"],
    rental: {},
    content: { short: { it: "Spazio vero e bagagliaio generoso, per chi si porta dietro tutto.", en: "Real space and a generous boot, for those who bring everything." } },
    perfectFor: ["famiglie", "sterrati", "gruppi"], featured: false, order: 4,
    images: img("dacia-duster", "Dacia Duster", 2),
  },
  {
    id: "ph-5", slug: "ford-tourneo-custom", brand: "Ford", model: "Tourneo Custom", category: "9-posti", // TODO sostituire con flotta reale
    specs: { fuel: "diesel", transmission: "manuale", seats: 9, doors: 4, luggageLarge: 4, luggageSmall: 4 },
    features: ["aria-condizionata", "bluetooth", "sensori-parcheggio", "isofix"],
    rental: {},
    content: { short: { it: "Nove posti, un solo viaggio: la comitiva arriva insieme a Porto Pino.", en: "Nine seats, one trip: the whole group reaches Porto Pino together." } },
    perfectFor: ["gruppi", "famiglie"], featured: false, order: 5,
    images: img("ford-tourneo-custom", "Ford Tourneo Custom", 2),
  },
  {
    id: "ph-6", slug: "fiat-ducato", brand: "Fiat", model: "Ducato", category: "furgone", // TODO sostituire con flotta reale
    specs: { fuel: "diesel", transmission: "manuale", seats: 3, doors: 4 },
    features: ["aria-condizionata", "bluetooth", "presa-12v"],
    rental: {},
    content: { short: { it: "Per traslochi, lavoro e tutto quello che non entra in macchina.", en: "For moving house, work and everything that won't fit in a car." } },
    perfectFor: ["traslochi", "lavoro"], featured: false, order: 6,
    images: img("fiat-ducato", "Fiat Ducato", 2),
  },
];

export const fleetSeed: FleetData = { version: "build", categories, features, tags, cars };
