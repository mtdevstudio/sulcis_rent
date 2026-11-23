// Genera src/data/sardinia-map.ts dai confini ISTAT (openpolis/geojson-italy, CC BY 4.0).
// Uso: node scripts/build-map.mjs <regions.geojson> <municipalities_R20.geojson>
import fs from "node:fs";
const [regPath, munPath] = process.argv.slice(2);
const reg = JSON.parse(fs.readFileSync(regPath, "utf8"));
const mun = JSON.parse(fs.readFileSync(munPath, "utf8"));
const sard = reg.features.find((f) => String(f.properties.reg_istat_code_num ?? f.properties.reg_istat_code) === "20" || /sardegna/i.test(f.properties.reg_name));
const SULCIS = ["Buggerru","Calasetta","Carbonia","Carloforte","Domusnovas","Fluminimaggiore","Giba","Gonnesa","Iglesias","Masainas","Musei","Narcao","Nuxis","Perdaxius","Piscinas","Portoscuso","San Giovanni Suergiu","Santadi","Sant'Anna Arresi","Sant'Antioco","Tratalias","Villamassargia","Villaperuccio"];
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’`]/g, "'").toLowerCase();
const sulcis = mun.features.filter((f) => SULCIS.map(norm).includes(norm(f.properties.name)));
if (sulcis.length !== SULCIS.length) console.warn("comuni trovati", sulcis.length, sulcis.map(f=>f.properties.name));
const [minX, minY, maxX, maxY] = [8.10, 38.84, 9.86, 41.33];
const k = Math.cos((40 * Math.PI) / 180);
const W = 400; const scale = W / ((maxX - minX) * k); const H = Math.round((maxY - minY) * scale);
const P = ([lon, lat]) => [((lon - minX) * k) * scale, (maxY - lat) * scale];
function dp(pts, eps) {
  if (pts.length < 3) return pts;
  let dmax = 0, idx = 0; const [a, b] = [pts[0], pts[pts.length - 1]];
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i]; const dx = b[0] - a[0], dy = b[1] - a[1];
    const d = Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / (Math.hypot(dx, dy) || 1);
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax > eps) return [...dp(pts.slice(0, idx + 1), eps).slice(0, -1), ...dp(pts.slice(idx), eps)];
  return [a, b];
}
const polys = (g) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates);
function toPath(features, eps, minArea) {
  let d = "";
  for (const f of features) for (const poly of polys(f.geometry)) {
    const raw = poly[0].map(P).slice(0, -1); const mid = Math.floor(raw.length / 2);
    const ring = [...dp(raw.slice(0, mid + 1), eps).slice(0, -1), ...dp([...raw.slice(mid), raw[0]], eps).slice(0, -1)];
    let area = 0; for (let i = 0; i < ring.length; i++) { const [x1, y1] = ring[i], [x2, y2] = ring[(i + 1) % ring.length]; area += x1 * y2 - x2 * y1; }
    if (Math.abs(area / 2) < minArea || ring.length < 3) continue;
    d += "M" + ring.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z";
  }
  return d;
}
const outline = toPath([sard], 0.6, 4);
const sulcisPath = toPath(sulcis, 0.5, 1);
const pt = (lon, lat) => P([lon, lat]).map((v) => +v.toFixed(1));
const points = {
  "san-giovanni-suergiu": pt(8.5225, 39.1105),
  "sant-antioco": pt(8.4547, 39.0700), calasetta: pt(8.3683, 39.1067), carloforte: pt(8.3092, 39.1450),
  "porto-pino": pt(8.5950, 38.9650), masua: pt(8.4170, 39.3330), "porto-flavia": pt(8.3990, 39.3360),
  nebida: pt(8.4290, 39.3050), iglesias: pt(8.5370, 39.3110), carbonia: pt(8.5220, 39.1670),
  tratalias: pt(8.5780, 39.1030), "punta-trettu": pt(8.5080, 39.0560), maladroxia: pt(8.4380, 39.0110),
  // resto della Sardegna (sezione «Tutta l'isola»)
  cagliari: pt(9.1100, 39.2230), chia: pt(8.8850, 38.8950), villasimius: pt(9.5200, 39.1420),
  "costa-verde": pt(8.4500, 39.5600), sinis: pt(8.4400, 39.9100), bosa: pt(8.4980, 40.2980),
  alghero: pt(8.3190, 40.5590), stintino: pt(8.2250, 40.9400), olbia: pt(9.5000, 40.9230),
  "costa-smeralda": pt(9.5450, 41.1000), "cala-gonone": pt(9.6290, 40.2810), orgosolo: pt(9.3540, 40.2050), "costa-rei": pt(9.5700, 39.2550),
};
const out = `// GENERATO da scripts/build-map.mjs — non modificare a mano.
// Confini: ISTAT via openpolis/geojson-italy (CC BY 4.0). Proiezione equirettangolare semplificata.
export const sardiniaMap = {
  viewBox: "0 0 ${W} ${H}",
  width: ${W},
  height: ${H},
  outline: "${outline}",
  sulcis: "${sulcisPath}",
  points: ${JSON.stringify(points)} as Record<string, [number, number]>,
};
`;
fs.writeFileSync("src/data/sardinia-map.ts", out);
console.log("ok", W, H, outline.length, sulcisPath.length);
