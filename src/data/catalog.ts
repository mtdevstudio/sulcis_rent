import type { CatalogItem, L10n } from "@/lib/types";

/**
 * Valori iniziali di categorie, dotazioni e tag (6 lingue). In produzione arrivano da /data/fleet.json
 * (gestiti da Impostazioni, IT/EN: le altre lingue usano queste traduzioni se la chiave coincide, altrimenti l'inglese).
 * // TODO revisione madrelingua PL/PT/FR/ES
 */
const L = (it: string, en: string, fr: string, es: string, pt: string, pl: string): L10n => ({ it, en, fr, es, pt, pl });

export const categories: CatalogItem[] = [
  { key: "citycar", label: L("Citycar", "City car", "Citadine", "Urbano", "Citadino", "Miejskie") },
  { key: "utilitaria", label: L("Utilitaria", "Compact", "Compacte", "Compacto", "Utilitário", "Kompakt") },
  { key: "berlina", label: L("Berlina", "Sedan", "Berline", "Berlina", "Berlina", "Sedan") },
  { key: "station-wagon", label: L("Station wagon", "Estate", "Break", "Familiar", "Carrinha", "Kombi") },
  { key: "suv", label: L("SUV", "SUV", "SUV", "SUV", "SUV", "SUV") },
  { key: "suv-compatto", label: L("SUV compatto", "Compact SUV", "SUV compact", "SUV compacto", "SUV compacto", "Kompaktowy SUV") },
  { key: "monovolume", label: L("Monovolume", "MPV", "Monospace", "Monovolumen", "Monovolume", "Minivan") },
  { key: "7-posti", label: L("7 posti", "7 seats", "7 places", "7 plazas", "7 lugares", "7 miejsc") },
  { key: "9-posti", label: L("9 posti", "9 seats", "9 places", "9 plazas", "9 lugares", "9 miejsc") },
  { key: "furgone", label: L("Furgone", "Van", "Utilitaire", "Furgoneta", "Carrinha de carga", "Dostawczy") },
  { key: "cabrio", label: L("Cabrio", "Convertible", "Cabriolet", "Descapotable", "Descapotável", "Kabriolet") },
  { key: "elettrica", label: L("Elettrica", "Electric", "Électrique", "Eléctrico", "Elétrico", "Elektryczny") },
];

export const features: CatalogItem[] = [
  { key: "aria-condizionata", label: L("Aria condizionata", "Air conditioning", "Climatisation", "Aire acondicionado", "Ar condicionado", "Klimatyzacja"), icon: "snow" },
  { key: "clima-automatico", label: L("Climatizzatore automatico", "Automatic climate control", "Climatisation automatique", "Climatizador automático", "Climatização automática", "Klimatyzacja automatyczna"), icon: "snow" },
  { key: "bluetooth", label: L("Bluetooth", "Bluetooth", "Bluetooth", "Bluetooth", "Bluetooth", "Bluetooth"), icon: "bluetooth" },
  { key: "carplay", label: L("Apple CarPlay", "Apple CarPlay", "Apple CarPlay", "Apple CarPlay", "Apple CarPlay", "Apple CarPlay"), icon: "phone" },
  { key: "android-auto", label: L("Android Auto", "Android Auto", "Android Auto", "Android Auto", "Android Auto", "Android Auto"), icon: "phone" },
  { key: "navigatore", label: L("Navigatore", "Navigation", "GPS", "Navegador", "GPS", "Nawigacja"), icon: "map" },
  { key: "sensori-parcheggio", label: L("Sensori di parcheggio", "Parking sensors", "Radar de recul", "Sensores de aparcamiento", "Sensores de estacionamento", "Czujniki parkowania"), icon: "sensor" },
  { key: "retrocamera", label: L("Retrocamera", "Rear camera", "Caméra de recul", "Cámara trasera", "Câmara traseira", "Kamera cofania"), icon: "camera" },
  { key: "cruise-control", label: L("Cruise control", "Cruise control", "Régulateur de vitesse", "Control de crucero", "Cruise control", "Tempomat"), icon: "gauge" },
  { key: "start-stop", label: L("Start&Stop", "Start&Stop", "Start&Stop", "Start&Stop", "Start&Stop", "Start&Stop"), icon: "power" },
  { key: "cerchi-lega", label: L("Cerchi in lega", "Alloy wheels", "Jantes alliage", "Llantas de aleación", "Jantes de liga leve", "Felgi aluminiowe"), icon: "wheel" },
  { key: "tetto-apribile", label: L("Tetto apribile", "Sunroof", "Toit ouvrant", "Techo solar", "Teto de abrir", "Szyberdach"), icon: "sun" },
  { key: "gancio-traino", label: L("Gancio traino", "Tow hitch", "Attelage", "Enganche", "Engate de reboque", "Hak holowniczy"), icon: "hook" },
  { key: "barre-portatutto", label: L("Barre portatutto", "Roof bars", "Barres de toit", "Barras de techo", "Barras de tejadilho", "Relingi dachowe"), icon: "bars" },
  { key: "isofix", label: L("Isofix", "Isofix", "Isofix", "Isofix", "Isofix", "Isofix"), icon: "child" },
  { key: "seggiolino", label: L("Seggiolino bimbo su richiesta", "Child seat on request", "Siège enfant sur demande", "Silla infantil bajo petición", "Cadeira de criança a pedido", "Fotelik dziecięcy na życzenie"), icon: "child" },
  { key: "invernali", label: L("Catene / gomme invernali", "Snow chains / winter tyres", "Chaînes / pneus hiver", "Cadenas / neumáticos de invierno", "Correntes / pneus de inverno", "Łańcuchy / opony zimowe"), icon: "snow" },
  { key: "usb", label: L("Porta USB", "USB port", "Prise USB", "Puerto USB", "Porta USB", "Gniazdo USB"), icon: "plug" },
  { key: "presa-12v", label: L("Presa 12V", "12V socket", "Prise 12 V", "Toma de 12 V", "Tomada 12 V", "Gniazdo 12 V"), icon: "plug" },
];

export const tags: CatalogItem[] = [
  { key: "coppie", label: L("Coppie", "Couples", "Couples", "Parejas", "Casais", "Pary") },
  { key: "famiglie", label: L("Famiglie", "Families", "Familles", "Familias", "Famílias", "Rodziny") },
  { key: "gruppi", label: L("Gruppi", "Groups", "Groupes", "Grupos", "Grupos", "Grupy") },
  { key: "isole-minori", label: L("Isole minori", "Small islands", "Petites îles", "Islas menores", "Ilhas menores", "Małe wyspy") },
  { key: "citta", label: L("Città", "City", "Ville", "Ciudad", "Cidade", "Miasto") },
  { key: "sterrati", label: L("Strade sterrate", "Dirt roads", "Pistes", "Caminos de tierra", "Estradas de terra", "Drogi gruntowe") },
  { key: "traslochi", label: L("Traslochi", "Moving house", "Déménagements", "Mudanzas", "Mudanças", "Przeprowadzki") },
  { key: "lavoro", label: L("Lavoro", "Work", "Travail", "Trabajo", "Trabalho", "Praca") },
];

export const fuelLabel: Record<string, L10n> = {
  benzina: L("Benzina", "Petrol", "Essence", "Gasolina", "Gasolina", "Benzyna"),
  diesel: L("Diesel", "Diesel", "Diesel", "Diésel", "Gasóleo", "Diesel"),
  gpl: L("GPL", "LPG", "GPL", "GLP", "GPL", "LPG"),
  metano: L("Metano", "CNG", "GNV", "GNC", "GNC", "CNG"),
  ibrida: L("Ibrida", "Hybrid", "Hybride", "Híbrido", "Híbrido", "Hybryda"),
  "ibrida-plugin": L("Ibrida plug-in", "Plug-in hybrid", "Hybride rechargeable", "Híbrido enchufable", "Híbrido plug-in", "Hybryda plug-in"),
  elettrica: L("Elettrica", "Electric", "Électrique", "Eléctrico", "Elétrico", "Elektryczny"),
};
export const transmissionLabel: Record<string, L10n> = {
  manuale: L("Manuale", "Manual", "Manuelle", "Manual", "Manual", "Manualna"),
  automatico: L("Automatico", "Automatic", "Automatique", "Automático", "Automática", "Automatyczna"),
};
export const driveLabel: Record<string, L10n> = {
  anteriore: L("Trazione anteriore", "Front-wheel drive", "Traction avant", "Tracción delantera", "Tração dianteira", "Napęd na przód"),
  posteriore: L("Trazione posteriore", "Rear-wheel drive", "Propulsion", "Tracción trasera", "Tração traseira", "Napęd na tył"),
  "4x4": L("4x4", "4x4", "4x4", "4x4", "4x4", "4x4"),
};
export const badgeLabel: Record<string, L10n> = {
  new: L("Nuova", "New", "Nouveau", "Nuevo", "Novo", "Nowość"),
  popular: L("Più richiesta", "Most requested", "La plus demandée", "La más pedida", "O mais pedido", "Najpopularniejsze"),
  offer: L("Offerta", "Offer", "Offre", "Oferta", "Oferta", "Oferta"),
  latest: L("Ultima arrivata", "Just arrived", "Dernière arrivée", "Recién llegado", "Acabado de chegar", "Właśnie dotarło"),
};

/** Traduzione di un'etichetta del catalogo per chiave (per le lingue non gestite dall'admin). */
const ALL_ITEMS = [...categories, ...features, ...tags];
export const catalogFallback = (key: string): L10n | undefined => ALL_ITEMS.find((x) => x.key === key)?.label;

/**
 * Etichetta di una voce del catalogo nella lingua richiesta.
 * IT/EN arrivano dall'admin (fleet.json); per FR/ES/PT/PL si usa la traduzione qui sopra se la chiave esiste.
 */
export function catLabel(item: CatalogItem | undefined, lang: import("@/lib/types").Lang): string {
  if (!item) return "";
  const fb = catalogFallback(item.key);
  if (lang === "it") return item.label.it;
  if (lang === "en") return item.label.en || fb?.en || item.label.it;
  return item.label[lang] || fb?.[lang] || item.label.en || item.label.it;
}
