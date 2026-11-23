// Post-build: controlli di sicurezza sull'export statico.
// 1) nessun segreto nel bundle JS/HTML; 2) presenza dei file PHP/.htaccess attesi.
import fs from "node:fs";
import path from "node:path";
const OUT = "out";
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(OUT).filter((f) => /\.(js|html|json|txt|css)$/.test(f));
const patterns = [/SETUP_TOKEN/, /IP_HASH_SALT/, /DB_PASS/, /pin_hash/, /\$argon2id\$/, /\$2y\$1\d\$/, /FTP_PASSWORD/, /TELEGRAM_BOT_TOKEN/, /SMTP_PASS/, /BEGIN (RSA|OPENSSH) PRIVATE KEY/];
let bad = 0;
for (const f of files) {
  if (f.startsWith(path.join(OUT, "api")) ) continue; // sorgenti PHP: verificati a parte (nessun segreto, solo nomi costanti)
  const s = fs.readFileSync(f, "utf8");
  for (const p of patterns) if (p.test(s)) { console.error(`✗ possibile segreto (${p}) in ${f}`); bad++; }
}
for (const must of [".htaccess", "api/.htaccess", "media/.htaccess", "data/.htaccess", "car.php", "sitemap.php"]) {
  if (!fs.existsSync(path.join(OUT, must))) console.warn(`! manca ${must} nell'export (atteso per il deploy PHP)`);
}
if (fs.existsSync(path.join(OUT, "api/config.php"))) { console.error("✗ api/config.php NON deve finire nell'export"); bad++; }
if (bad) { console.error(`postbuild: ${bad} problemi`); process.exit(1); }
console.log(`postbuild: ${files.length} file controllati, nessun segreto nel bundle ✓`);
