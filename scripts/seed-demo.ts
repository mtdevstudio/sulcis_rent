/**
 * Carica le 6 auto SEGNAPOSTO di src/data/fleet.ts nel database TRAMITE L'API (come farebbe lo staff),
 * con le foto segnaposto. Utile in locale/staging per vedere il sistema completo.
 * Uso: npx tsx scripts/seed-demo.ts http://localhost:8080 <userId> <PIN>
 * ⚠️ Non usarlo in produzione: sono auto di esempio, non la flotta reale.
 */
import fs from "node:fs";
import { fleetSeed } from "../src/data/fleet";

const [base = "http://localhost:8080", userId = "1", pin = ""] = process.argv.slice(2);
let cookie = "";
let csrf = "";
async function call(method: string, path: string, body?: unknown, form?: FormData) {
  const r = await fetch(base + "/api/" + path, {
    method,
    headers: { Origin: base, Cookie: cookie, ...(csrf ? { "X-CSRF-Token": csrf } : {}), ...(body ? { "Content-Type": "application/json" } : {}) },
    body: form ?? (body ? JSON.stringify(body) : undefined),
  });
  const set = r.headers.getSetCookie?.() ?? [];
  if (set.length) cookie = set.map((c) => c.split(";")[0]).join("; ");
  const j = await r.json();
  if (!r.ok) throw new Error(`${method} ${path}: ${r.status} ${JSON.stringify(j)}`);
  return j;
}
(async () => {
  const login = await call("POST", "auth/login.php", { userId: Number(userId), pin });
  csrf = login.csrf;
  for (const c of fleetSeed.cars) {
    const { car } = await call("POST", "admin/cars.php", {
      brand: c.brand, model: c.model, category: c.category, specs: c.specs, features: c.features,
      content: c.content, perfectFor: c.perfectFor, featured: c.featured, internalNotes: "DEMO: auto segnaposto, sostituire con la flotta reale",
    });
    for (const img of c.images) {
      const file = `public${img.base}-1280.webp`;
      const fd = new FormData();
      fd.append("car_id", String(car.id));
      fd.append("file", new Blob([fs.readFileSync(file)], { type: "image/webp" }), "foto.webp");
      await call("POST", "admin/photos.php", undefined, fd);
    }
    await call("POST", "admin/car-actions.php", { id: car.id, action: "publish" });
    console.log("✓", c.brand, c.model);
  }
})().catch((e) => { console.error(e); process.exit(1); });
