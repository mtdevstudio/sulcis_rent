// Prebuild: congela i dati pubblici per il primo render.
// Se DATA_SNAPSHOT_URL è impostato (es. https://sulcisrent.it) scarica /data/*.json dal sito live,
// così le pagine /flotta/[slug] pre-renderizzate rispecchiano la flotta reale. Altrimenti usa i seed in src/data/.
import fs from "node:fs";
const base = process.env.DATA_SNAPSHOT_URL?.replace(/\/$/, "");
const out = "src/data/snapshot.generated.ts";
const fallback = `// GENERATO da scripts/snapshot.mjs — nessun DATA_SNAPSHOT_URL: uso dei seed locali.
export { fleetSeed as fleetSnapshot } from "./fleet";
export { reviewsSeed as reviewsSnapshot } from "./reviews";
export { faqSeed as faqSnapshot } from "./faq";
export const settingsSnapshot = { version: "build" } as import("@/lib/types").SettingsData;
`;
async function get(name) {
  const r = await fetch(`${base}/data/${name}.json`, { headers: { accept: "application/json" } });
  if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
  return r.json();
}
if (!base) {
  fs.writeFileSync(out, fallback);
  console.log("[snapshot] seed locali");
} else {
  try {
    const [fleet, reviews, faq, settings] = await Promise.all(["fleet", "reviews", "faq", "settings"].map(get));
    fs.writeFileSync(out, `// GENERATO da scripts/snapshot.mjs da ${base} il ${new Date().toISOString()}
import type { FleetData, ReviewsData, FaqData, SettingsData } from "@/lib/types";
export const fleetSnapshot: FleetData = ${JSON.stringify(fleet)};
export const reviewsSnapshot: ReviewsData = ${JSON.stringify(reviews)};
export const faqSnapshot: FaqData = ${JSON.stringify(faq)};
export const settingsSnapshot: SettingsData = ${JSON.stringify(settings)};
`);
    console.log(`[snapshot] dati live da ${base}: ${fleet.cars.length} auto`);
  } catch (e) {
    console.warn(`[snapshot] impossibile leggere ${base} (${e.message}): uso i seed locali`);
    fs.writeFileSync(out, fallback);
  }
}
