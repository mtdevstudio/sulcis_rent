// Genera una PREVIEW NAVIGABILE del sito pubblico in un unico file HTML autosufficiente
// (CSS, font e immagini inline, link interni a hash, JS vanilla per animazioni e modale).
// Serve solo per mostrare il sito senza hosting: il sito vero è l'export Next + API PHP.
// Uso: npm run build && node scripts/build-preview-page.mjs  → docs/preview/sito-navigabile.html
import fs from "node:fs";
import path from "node:path";

const OUT = "out";
const read = (p) => fs.readFileSync(path.join(OUT, p), "utf8");
const b64 = (file, mime) => `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`;

// ---------- immagini → data URI (variante 1280 per contenere il peso) ----------
const imgCache = new Map();
function dataImg(url) {
  if (imgCache.has(url)) return imgCache.get(url);
  let rel = url.replace(/^\//, "");
  const m = rel.match(/^(.*)-(\d+)\.webp$/);
  if (m) {
    const cand = `${m[1]}-1280.webp`;
    if (fs.existsSync(path.join("public", cand))) rel = cand;
  }
  const file = path.join("public", rel);
  const uri = fs.existsSync(file) ? b64(file, "image/webp") : url;
  imgCache.set(url, uri);
  return uri;
}

function transform(html) {
  return html
    .replace(/<script(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/\s(?:srcset|srcSet)="[^"]*"/g, "")
    .replace(/(src|href)="(\/images\/[^"]+\.webp)"/g, (_, a, u) => `${a}="${dataImg(u)}"`)
    .replace(/href="\/flotta\/([a-z0-9-]+)\/"/g, 'href="#auto-$1"')
    .replace(/href="\/#([a-z-]+)"/g, 'href="#$1"')
    .replace(/href="\/privacy\/"/g, 'href="#privacy"')
    .replace(/href="\/cookie\/"/g, 'href="#cookie"')
    .replace(/href="\/en\/[^"]*"/g, 'href="#home" data-en=""')
    .replace(/href="\/"/g, 'href="#home"')
    .replace(/href="\/admin\/?"/g, 'href="#home"');
}
const mainOf = (html) => (html.match(/<main id="main">([\s\S]*?)<\/main>/) || [])[1] ?? "";

// ---------- pagine ----------
const home = read("index.html");
const htmlTag = home.match(/<html[^>]*>/)[0].replace(/data-has-pl="[^"]*"/, 'data-has-pl=""');
let body = home.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];
const slugs = fs.readdirSync(path.join(OUT, "flotta")).filter((s) => fs.existsSync(path.join(OUT, "flotta", s, "index.html")));
const views = [`<div data-view="home">${mainOf(home)}</div>`];
for (const s of slugs) views.push(`<div data-view="auto-${s}" hidden>${mainOf(read(`flotta/${s}/index.html`))}</div>`);
for (const s of ["privacy", "cookie"]) views.push(`<div data-view="${s}" hidden>${mainOf(read(`${s}/index.html`))}</div>`);
body = body.replace(/<main id="main">[\s\S]*?<\/main>/, `<main id="main">${views.join("")}</main>`);
body = transform(body);

// ---------- CSS con font inline ----------
const cssFile = fs.readdirSync(path.join(OUT, "_next/static/chunks")).find((f) => f.endsWith(".css"));
let css = read(`_next/static/chunks/${cssFile}`).replace(/url\(\.\.\/media\/([^)]+\.woff2)\)/g, (_, f) => `url(${b64(path.join(OUT, "_next/static/media", f), "font/woff2")})`);

const extraCss = `
.rv-w>span{transition:transform .9s cubic-bezier(.16,1,.3,1)}
[data-view][hidden]{display:none!important}
.pv-toast{position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:300;background:rgb(var(--trachite));color:rgb(var(--sand));padding:.75rem 1rem;font:600 14px/1.3 var(--font-text),sans-serif;max-width:90vw}
.pv-badge{position:fixed;left:12px;bottom:12px;z-index:65;background:rgb(var(--trachite));color:rgb(var(--sand));font:600 11px/1.2 var(--font-text),sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:.5rem .7rem;opacity:.9}
@media (max-width:767px){.pv-badge{display:none}}
`;

const headScript = `(function(){var d=document.documentElement;var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;if(!rm)d.classList.add('motion');try{if(!rm&&!sessionStorage.getItem('sr_pl'))d.setAttribute('data-pl','on')}catch(e){}})();`;
const heroImg = dataImg("/images/placeholder/places/hero-costa-1920.webp");
const js = fs.readFileSync("scripts/preview-runtime.js", "utf8").replace("__HERO_IMG__", heroImg);

const page = `<!DOCTYPE html>
${htmlTag}
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Sulcis Rent – Preview del sito</title>
<style>${css}${extraCss}</style>
<script>${headScript}</script>
</head>
<body>${body}
<div class="pv-badge" aria-hidden="true">Preview · foto e auto segnaposto</div>
<script>${js}</script>
</body>
</html>`;
fs.mkdirSync("docs/preview", { recursive: true });
fs.writeFileSync("docs/preview/sito-navigabile.html", page);
console.log(`ok: docs/preview/sito-navigabile.html (${(page.length / 1024).toFixed(0)} KB, ${slugs.length} schede auto)`);
