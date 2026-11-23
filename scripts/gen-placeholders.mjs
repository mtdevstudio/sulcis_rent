// Genera foto SEGNAPOSTO (non foto reali) in public/images/placeholder/.
// Sostituirle con foto vere mantenendo gli stessi nomi file.
import sharp from "sharp";
import fs from "node:fs";
const OUT = "public/images/placeholder";
fs.mkdirSync(`${OUT}/places`, { recursive: true });
fs.mkdirSync(`${OUT}/cars`, { recursive: true });

const C = { blue: "#1A6FA3", deep: "#0F4C75", mag: "#D11F6E", sand: "#F3EDE2", sand2: "#E8DFCF", tra: "#1E1A17", tur: "#3FB8AF", ochre: "#C9772F" };
const places = {
  "sant-antioco": [C.deep, C.tur, C.sand], calasetta: [C.blue, C.tur, C.sand], carloforte: [C.deep, C.blue, C.mag],
  "porto-pino": [C.tur, C.blue, C.sand], masua: [C.deep, C.tur, C.sand2], "porto-flavia": [C.tra, "#2B2521", C.ochre],
  nebida: [C.blue, C.deep, C.sand], iglesias: [C.sand2, C.ochre, C.tra], carbonia: [C.sand2, "#B9A98F", C.tra],
  tratalias: [C.sand2, C.ochre, C.blue], "punta-trettu": [C.tur, C.blue, C.mag], maladroxia: [C.blue, C.tur, C.sand],
  "hero-costa": [C.deep, C.tur, C.sand],
};
const label = (t, x, y, col) => `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="3" fill="${col}" opacity=".75">${t}</text>`;

for (const [slug, [a, b, c]] of Object.entries(places)) {
  const W = 1920, H = 1280;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <path d="M0 ${H * 0.62} C ${W * 0.25} ${H * 0.5}, ${W * 0.45} ${H * 0.72}, ${W * 0.7} ${H * 0.58} S ${W} ${H * 0.55}, ${W} ${H * 0.55} V ${H} H 0Z" fill="${c}" opacity=".9"/>
  <path d="M0 ${H * 0.78} C ${W * 0.3} ${H * 0.68}, ${W * 0.55} ${H * 0.9}, ${W} ${H * 0.72} V ${H} H 0Z" fill="${a}" opacity=".55"/>
  <path d="M-40 ${H * 0.92} C ${W * 0.3} ${H * 0.74}, ${W * 0.6} ${H * 1.05}, ${W + 40} ${H * 0.8}" stroke="${C.sand}" stroke-width="18" fill="none" opacity=".8"/>
  ${label(`FOTO SEGNAPOSTO · ${slug.toUpperCase().replace(/-/g, " ")}`, 48, 70, slug === "iglesias" || slug === "carbonia" || slug === "tratalias" ? C.tra : C.sand)}
</svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 78, mozjpeg: true }).toFile(`${OUT}/places/${slug}.jpg`);
  for (const w of [640, 1280, 1920]) await sharp(Buffer.from(svg)).resize(w).webp({ quality: 72 }).toFile(`${OUT}/places/${slug}-${w}.webp`);
}

// Sagome auto geometriche (non foto): hatch, suv, van.
const shapes = {
  hatch: "M140 560 L230 430 Q260 390 320 385 L640 380 Q700 380 760 430 L880 520 Q960 530 1000 560 L1010 640 L140 640 Z",
  suv: "M130 560 L190 400 Q210 350 280 345 L700 340 Q760 340 800 390 L880 480 Q980 495 1020 530 L1030 640 L130 640 Z",
  van: "M120 600 L130 300 Q135 260 190 258 L760 255 Q820 255 850 300 L960 450 Q1030 470 1040 520 L1045 640 L120 640 Z",
};
const cars = {
  "fiat-panda": ["hatch", C.blue], "renault-clio": ["hatch", C.mag], "jeep-renegade": ["suv", C.blue],
  "dacia-duster": ["suv", C.mag], "ford-tourneo-custom": ["van", C.blue], "fiat-ducato": ["van", C.mag],
};
for (const [slug, [shape, bg]] of Object.entries(cars)) {
  for (let v = 1; v <= 3; v++) {
    const W = 1280, H = 960;
    const flip = v === 2 ? `transform="translate(${W} 0) scale(-1 1)"` : "";
    const bgc = v === 3 ? C.sand2 : bg;
    const ink = v === 3 ? C.tra : C.sand;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${bgc}"/>
    <g transform="translate(70 80)"><g ${flip}>
      <path d="${shapes[shape]}" fill="${C.tra}"/>
      <path d="${shapes[shape]}" fill="none" stroke="${ink}" stroke-width="3" opacity=".25"/>
      <circle cx="320" cy="645" r="78" fill="${C.tra}" stroke="${ink}" stroke-width="10"/><circle cx="320" cy="645" r="26" fill="${ink}"/>
      <circle cx="830" cy="645" r="78" fill="${C.tra}" stroke="${ink}" stroke-width="10"/><circle cx="830" cy="645" r="26" fill="${ink}"/>
    </g></g>
    <rect x="0" y="${H - 120}" width="${W}" height="6" fill="${ink}" opacity=".3"/>
    ${label(`FOTO SEGNAPOSTO · ${slug.toUpperCase().replace(/-/g, " ")} · VISTA ${v}`, 48, 72, ink)}
  </svg>`;
    const name = v === 1 ? slug : `${slug}-${v}`;
    for (const w of [640, 1280]) await sharp(Buffer.from(svg)).resize(w).webp({ quality: 74 }).toFile(`${OUT}/cars/${name}-${w}.webp`);
  }
}
// Open Graph brandizzata
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="${C.sand}"/>
<rect y="530" width="1200" height="100" fill="${C.mag}"/>
<text x="60" y="330" font-family="Arial Narrow, Arial, sans-serif" font-weight="900" font-size="210" fill="${C.tra}" letter-spacing="-4">SULCIS RENT</text>
<text x="64" y="410" font-family="Arial, sans-serif" font-size="38" fill="${C.blue}">Autonoleggio · San Giovanni Suergiu · Sud Sardegna</text>
<text x="64" y="595" font-family="Arial, sans-serif" font-weight="700" font-size="34" fill="#fff" letter-spacing="3">APERTO H24 · WHATSAPP 331 390 6076</text></svg>`;
await sharp(Buffer.from(og)).png().toFile("public/og.png");
console.log("placeholder generati");
