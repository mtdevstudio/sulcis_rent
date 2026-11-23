// Scarica FOTO DI ESEMPIO con licenza libera (Openverse: CC0, PDM, CC BY, CC BY-SA) per vedere
// come uscirà il sito. Le salva IN LOCALE (nessun hotlink) con gli stessi nomi dei segnaposto e
// registra autore/licenza in src/data/photo-credits.json (mostrati nella pagina «Crediti foto»).
// ⚠️ Da sostituire con le foto reali del cliente (e della sua flotta) prima del lancio.
// Uso: node scripts/fetch-sample-photos.mjs [slug…]   (senza argomenti: tutte)
import fs from "node:fs";
import sharp from "sharp";
import { execFileSync } from "node:child_process";

// curl invece di fetch: più affidabile dietro proxy aziendali/di sandbox
function get(url) {
  try {
    const out = execFileSync("curl", ["-s", "-m", "40", "-A", UA, "-w", "\n%{http_code}", url], { maxBuffer: 64 * 1024 * 1024 });
    const nl = out.lastIndexOf(10);
    return { status: Number(out.subarray(nl + 1).toString()), body: out.subarray(0, nl) };
  } catch { return { status: 0, body: Buffer.alloc(0) }; }
}

const UA = "SulcisRentPreview/1.0 (sample photos for site preview)";
const PLACES = "public/images/placeholder/places";
const CARS = "public/images/placeholder/cars";
const CREDITS = "src/data/photo-credits.json";
const OK = new Set(["cc0", "pdm", "by", "by-sa"]);

// query → { file base, cartella, larghezze, scelta (indice tra i risultati validi) }
const jobs = [
  // mete
  ["hero-costa", "Sardinia coast sea cliffs", PLACES, [640, 1280, 1920]],
  ["cagliari", "Cagliari Poetto beach", PLACES], ["chia", "Chia beach Sardinia", PLACES], ["villasimius", "Villasimius beach", PLACES],
  ["costa-rei", "Costa Rei Sardinia beach", PLACES], ["costa-verde", "Piscinas dunes Sardinia", PLACES], ["sinis", "Is Arutas beach", PLACES],
  ["bosa", "Bosa Sardinia", PLACES], ["alghero", "Alghero Sardinia", PLACES], ["stintino", "La Pelosa Stintino", PLACES],
  ["olbia", "Costa Smeralda beach", PLACES], ["cala-gonone", "Cala Gonone", PLACES], ["orgosolo", "Orgosolo murales", PLACES],
  ["sant-antioco", "Sant'Antioco Sardinia", PLACES], ["calasetta", "Calasetta", PLACES], ["carloforte", "Carloforte", PLACES],
  ["porto-pino", "Porto Pino dunes", PLACES], ["masua", "Pan di Zucchero Masua", PLACES], ["porto-flavia", "Porto Flavia", PLACES],
  ["nebida", "Nebida Sardinia", PLACES], ["iglesias", "Iglesias Sardinia", PLACES], ["carbonia", "Carbonia Sardinia", PLACES],
  ["tratalias", "Tratalias", PLACES], ["punta-trettu", "kitesurf Sardinia lagoon", PLACES], ["maladroxia", "Maladroxia", PLACES],
  // auto (foto di esempio del modello, non della flotta)
  ["fiat-panda", "Fiat Panda 2012", CARS, [640, 1280], 0], ["fiat-panda-2", "Fiat Panda 2012", CARS, [640, 1280], 1], ["fiat-panda-3", "Fiat Panda interior", CARS, [640, 1280], 0],
  ["renault-clio", "Renault Clio 2020", CARS, [640, 1280], 0], ["renault-clio-2", "Renault Clio 2020", CARS, [640, 1280], 1],
  ["jeep-renegade", "Jeep Renegade", CARS, [640, 1280], 0], ["jeep-renegade-2", "Jeep Renegade", CARS, [640, 1280], 1],
  ["dacia-duster", "Dacia Duster 2018", CARS, [640, 1280], 0], ["dacia-duster-2", "Dacia Duster 2018", CARS, [640, 1280], 1],
  ["ford-tourneo-custom", "Ford Tourneo Custom", CARS, [640, 1280], 0], ["ford-tourneo-custom-2", "Ford Tourneo Custom", CARS, [640, 1280], 1],
  ["fiat-ducato", "Fiat Ducato van", CARS, [640, 1280], 0], ["fiat-ducato-2", "Fiat Ducato van", CARS, [640, 1280], 1],
];

const overrides = fs.existsSync("scripts/sample-photos.overrides.json") ? JSON.parse(fs.readFileSync("scripts/sample-photos.overrides.json", "utf8")) : {};
const only = process.argv.slice(2);
const credits = fs.existsSync(CREDITS) ? JSON.parse(fs.readFileSync(CREDITS, "utf8")) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cache = new Map();

async function search(q) {
  if (cache.has(q)) return cache.get(q);
  // prima Wikimedia Commons (download affidabile), poi tutte le fonti
  const src = process.env.SR_PHOTO_SOURCE ?? "wikimedia";
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license_type=commercial,modification&page_size=20&mature=false${src ? `&source=${src}` : ""}`;
  for (let i = 0; i < 4; i++) {
    const r = get(url);
    if (r.status === 429 || r.status === 0) { await sleep(8000 * (i + 1)); continue; }
    if (r.status !== 200) throw new Error(`openverse ${r.status}`);
    const res = JSON.parse(r.body.toString()).results.filter((x) => OK.has(x.license) && (x.width ?? 0) >= 900 && (x.width ?? 0) > (x.height ?? 1) * 1.15);
    cache.set(q, res);
    return res;
  }
  throw new Error("rate limit");
}

for (const [slug, q0, dir, widths = [640, 1280, 1920], pick0 = 0] of jobs) {
  if (only.length && !only.includes(slug)) continue;
  const q = overrides[slug]?.q ?? q0;
  const pick = overrides[slug]?.pick ?? pick0;
  try {
    const res = await search(q);
    const it = res[pick] ?? res[0];
    if (!it) { console.warn("✗ nessun risultato:", slug, q); continue; }
    let img;
    // Wikimedia: miniatura da 1280 px (larghezza standard) invece dell'originale (più leggera)
    const m = it.url.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(\w)\/(\w\w)\/([^/]+)$/);
    const dl = m && !/\.(svg|tif|tiff)$/i.test(m[3]) ? `https://upload.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${m[2]}/${m[3]}/1280px-${m[3]}` : it.url;
    for (let i = 0; i < 5; i++) {
      img = get(dl);
      if (img.status !== 429 && img.status !== 0) break;
      await sleep(5000 * (i + 1));
    }
    if (img.status !== 200 && m) { img = get(dl.replace("/1280px-", "/960px-")); }
    if (img.status !== 200 && m) { img = get(it.url); }
    if (img.status !== 200) { console.warn("✗ download", slug, img.status); continue; }
    const buf = img.body;
    for (const w of widths) {
      await sharp(buf).rotate().resize({ width: w, height: Math.round((w * 3) / 4), fit: "cover", position: "attention" }).webp({ quality: 74 }).toFile(`${dir}/${slug}-${w}.webp`);
    }
    if (dir === PLACES) await sharp(buf).rotate().resize({ width: 1920, height: 1280, fit: "cover" }).jpeg({ quality: 78, mozjpeg: true }).toFile(`${dir}/${slug}.jpg`);
    credits[slug] = { title: it.title, creator: it.creator ?? "sconosciuto", creatorUrl: it.creator_url ?? null, license: `${it.license === "pdm" ? "Public Domain Mark" : it.license.toUpperCase()} ${it.license_version ?? ""}`.trim(), licenseUrl: it.license_url, source: it.foreign_landing_url ?? it.url, query: q };
    console.log("✓", slug, "—", it.title?.slice(0, 50), `(${it.license} · ${it.creator ?? "?"})`);
    await sleep(2500);
  } catch (e) {
    console.warn("✗", slug, e.message);
    await sleep(3000);
  }
}
fs.writeFileSync(CREDITS, JSON.stringify(credits, null, 2));
console.log("crediti:", Object.keys(credits).length);
