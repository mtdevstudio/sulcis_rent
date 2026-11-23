// Genera database/migrations/002_seed.sql dai dati iniziali del frontend (catalogo, FAQ, impostazioni).
// Uso: npx tsx scripts/gen-seed-sql.ts
import fs from "node:fs";
import { categories, features, tags } from "../src/data/catalog";
import { faqSeed } from "../src/data/faq";
import { site } from "../src/data/site";

const q = (s: string) => `'${s.replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
const j = (v: unknown) => q(JSON.stringify(v));
const settings: Record<string, unknown> = {
  catalog: { categories: categories.map((c) => ({ ...c, active: true })), features, tags },
  contact: {
    phoneDisplay: site.phone.display, phoneE164: site.phone.e164, whatsappNumber: site.whatsapp.number,
    whatsappMessage: { it: "Ciao Sulcis Rent! Vorrei informazioni per noleggiare un'auto. Mi dite disponibilità e prezzo?", en: "Hi Sulcis Rent! I'd like information about renting a car. Could you tell me availability and price?" },
    address: { street: site.address.street, postalCode: site.address.postalCode, city: site.address.city, province: site.address.province, region: site.address.region },
    hours: { it: "Aperto 24 ore su 24", en: "Open 24 hours a day" },
    instagram: site.social.instagram, facebook: "", googleReviewsUrl: "", vat: "", email: "",
  },
};
let sql = "-- GENERATO da scripts/gen-seed-sql.ts — dati iniziali (catalogo, contatti, FAQ segnaposto)\n";
for (const [k, v] of Object.entries(settings)) sql += `INSERT IGNORE INTO settings (name, value, updated_at) VALUES (${q(k)}, ${j(v)}, UTC_TIMESTAMP());\n`;
faqSeed.items.forEach((f, i) => {
  sql += `INSERT INTO faq (question_it, answer_it, question_en, answer_en, published, sort_order, created_at, updated_at) SELECT ${q(f.q.it)}, ${q(f.a.it)}, ${q(f.q.en ?? "")}, ${q(f.a.en ?? "")}, 1, ${i + 1}, UTC_TIMESTAMP(), UTC_TIMESTAMP() FROM DUAL WHERE (SELECT COUNT(*) FROM faq) < ${i + 1};\n`;
});
fs.writeFileSync("database/migrations/002_seed.sql", sql);
console.log("ok");
