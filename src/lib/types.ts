/**
 * Contratto dei dati PUBBLICI (identico a /data/*.json generati dall'API PHP).
 * Vedi docs/api.md. Nessun campo interno (targa, note, stato) esiste in questi tipi.
 */
export type Lang = "it" | "en" | "pl" | "pt" | "fr" | "es";
/** Testo localizzato: l'italiano è obbligatorio, le altre lingue cadono su inglese e poi italiano. */
export type L10n = { it: string; en?: string; pl?: string; pt?: string; fr?: string; es?: string };

export type CarImageData = {
  /** percorso senza suffisso: le varianti sono `${base}-${w}.webp` */
  base: string;
  widths: number[];
  w: number;
  h: number;
  alt: L10n;
};

export type Fuel = "benzina" | "diesel" | "gpl" | "metano" | "ibrida" | "ibrida-plugin" | "elettrica";
export type Transmission = "manuale" | "automatico";
export type Drive = "anteriore" | "posteriore" | "4x4";
export type Badge = "new" | "popular" | "offer" | "latest";

export type CarSpecs = Partial<{
  fuel: Fuel;
  transmission: Transmission;
  seats: number;
  doors: number;
  luggageLarge: number;
  luggageSmall: number;
  luggageLiters: number;
  engineCc: number;
  powerCv: number;
  powerKw: number;
  drive: Drive;
  consumption: string;
  euro: string;
  rangeKm: number;
  chargeTime: string;
  cargoM3: number;
  payloadKg: number;
  cargoLength: string;
  license: string;
}>;

export type CarRental = Partial<{
  priceDay: number;
  priceWeek: number;
  priceMonth: number;
  priceNote: L10n;
  kmPerDay: number | "unlimited";
  minAge: number;
  minLicenseYears: number;
  deposit: number | "on_request";
  creditCard: boolean;
  delivery: Partial<{ home: boolean; airport: boolean; port: boolean; note: L10n }>;
  insurance: L10n;
}>;

export type PublicCar = {
  id: number | string;
  slug: string;
  brand: string;
  model: string;
  version?: string;
  category: string;
  year?: number;
  color?: { name: string; hex?: string };
  specs: CarSpecs;
  features: string[];
  rental: CarRental;
  content: { short?: L10n; long?: L10n; highlights?: L10n[] };
  perfectFor: string[];
  badge?: Badge;
  whatsappMessage?: L10n;
  seo?: { title?: L10n; description?: L10n };
  featured: boolean;
  order: number;
  images: CarImageData[];
  updatedAt?: string;
};

export type CatalogItem = { key: string; label: L10n; icon?: string };

export type FleetData = {
  version: string;
  categories: CatalogItem[];
  features: CatalogItem[];
  tags: CatalogItem[];
  cars: PublicCar[];
};

export type Review = { author: string; text: string; rating: number; date: string; source: "Google"; url?: string };
export type ReviewsData = { version: string; reviews: Review[] };

export type FaqItem = { q: L10n; a: L10n };
export type FaqData = { version: string; items: FaqItem[] };

export type SettingsData = {
  version: string;
  phoneDisplay?: string;
  phoneE164?: string;
  whatsappNumber?: string;
  whatsappMessage?: L10n;
  address?: { street: string; postalCode: string; city: string; province: string; region: string };
  hours?: L10n;
  instagram?: string;
  facebook?: string;
  googleReviewsUrl?: string;
  vat?: string;
  email?: string;
  /** Zone di consegna confermate dal titolare (admin → Impostazioni). Vuoto = nessuna promessa di consegna. */
  deliveryAreas?: L10n[];
};
