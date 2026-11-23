import type { CatalogItem } from "@/lib/types";

/** Valori iniziali di categorie, dotazioni e tag. In produzione arrivano da /data/fleet.json (gestiti da Impostazioni). */
export const categories: CatalogItem[] = [
  { key: "citycar", label: { it: "Citycar", en: "City car" } },
  { key: "utilitaria", label: { it: "Utilitaria", en: "Compact" } },
  { key: "berlina", label: { it: "Berlina", en: "Sedan" } },
  { key: "station-wagon", label: { it: "Station wagon", en: "Estate" } },
  { key: "suv", label: { it: "SUV", en: "SUV" } },
  { key: "suv-compatto", label: { it: "SUV compatto", en: "Compact SUV" } },
  { key: "monovolume", label: { it: "Monovolume", en: "MPV" } },
  { key: "7-posti", label: { it: "7 posti", en: "7 seats" } },
  { key: "9-posti", label: { it: "9 posti", en: "9 seats" } },
  { key: "furgone", label: { it: "Furgone", en: "Van" } },
  { key: "cabrio", label: { it: "Cabrio", en: "Convertible" } },
  { key: "elettrica", label: { it: "Elettrica", en: "Electric" } },
];

export const features: CatalogItem[] = [
  { key: "aria-condizionata", label: { it: "Aria condizionata", en: "Air conditioning" }, icon: "snow" },
  { key: "clima-automatico", label: { it: "Climatizzatore automatico", en: "Automatic climate control" }, icon: "snow" },
  { key: "bluetooth", label: { it: "Bluetooth", en: "Bluetooth" }, icon: "bluetooth" },
  { key: "carplay", label: { it: "Apple CarPlay", en: "Apple CarPlay" }, icon: "phone" },
  { key: "android-auto", label: { it: "Android Auto", en: "Android Auto" }, icon: "phone" },
  { key: "navigatore", label: { it: "Navigatore", en: "Navigation" }, icon: "map" },
  { key: "sensori-parcheggio", label: { it: "Sensori di parcheggio", en: "Parking sensors" }, icon: "sensor" },
  { key: "retrocamera", label: { it: "Retrocamera", en: "Rear camera" }, icon: "camera" },
  { key: "cruise-control", label: { it: "Cruise control", en: "Cruise control" }, icon: "gauge" },
  { key: "start-stop", label: { it: "Start&Stop", en: "Start&Stop" }, icon: "power" },
  { key: "cerchi-lega", label: { it: "Cerchi in lega", en: "Alloy wheels" }, icon: "wheel" },
  { key: "tetto-apribile", label: { it: "Tetto apribile", en: "Sunroof" }, icon: "sun" },
  { key: "gancio-traino", label: { it: "Gancio traino", en: "Tow hitch" }, icon: "hook" },
  { key: "barre-portatutto", label: { it: "Barre portatutto", en: "Roof bars" }, icon: "bars" },
  { key: "isofix", label: { it: "Isofix", en: "Isofix" }, icon: "child" },
  { key: "seggiolino", label: { it: "Seggiolino bimbo su richiesta", en: "Child seat on request" }, icon: "child" },
  { key: "invernali", label: { it: "Catene / gomme invernali", en: "Snow chains / winter tyres" }, icon: "snow" },
  { key: "usb", label: { it: "Porta USB", en: "USB port" }, icon: "plug" },
  { key: "presa-12v", label: { it: "Presa 12V", en: "12V socket" }, icon: "plug" },
];

export const tags: CatalogItem[] = [
  { key: "coppie", label: { it: "Coppie", en: "Couples" } },
  { key: "famiglie", label: { it: "Famiglie", en: "Families" } },
  { key: "gruppi", label: { it: "Gruppi", en: "Groups" } },
  { key: "isole-minori", label: { it: "Isole minori", en: "Small islands" } },
  { key: "citta", label: { it: "Città", en: "City" } },
  { key: "sterrati", label: { it: "Strade sterrate", en: "Dirt roads" } },
  { key: "traslochi", label: { it: "Traslochi", en: "Moving house" } },
  { key: "lavoro", label: { it: "Lavoro", en: "Work" } },
];

export const fuelLabel: Record<string, { it: string; en: string }> = {
  benzina: { it: "Benzina", en: "Petrol" }, diesel: { it: "Diesel", en: "Diesel" }, gpl: { it: "GPL", en: "LPG" },
  metano: { it: "Metano", en: "CNG" }, ibrida: { it: "Ibrida", en: "Hybrid" }, "ibrida-plugin": { it: "Ibrida plug-in", en: "Plug-in hybrid" },
  elettrica: { it: "Elettrica", en: "Electric" },
};
export const transmissionLabel: Record<string, { it: string; en: string }> = {
  manuale: { it: "Manuale", en: "Manual" }, automatico: { it: "Automatico", en: "Automatic" },
};
export const driveLabel: Record<string, { it: string; en: string }> = {
  anteriore: { it: "Trazione anteriore", en: "Front-wheel drive" }, posteriore: { it: "Trazione posteriore", en: "Rear-wheel drive" }, "4x4": { it: "4x4", en: "4x4" },
};
export const badgeLabel: Record<string, { it: string; en: string }> = {
  new: { it: "Nuova", en: "New" }, popular: { it: "Più richiesta", en: "Most requested" }, offer: { it: "Offerta", en: "Offer" }, latest: { it: "Ultima arrivata", en: "Just arrived" },
};
