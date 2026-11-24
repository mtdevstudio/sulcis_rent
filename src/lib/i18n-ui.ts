import type { Lang } from "./types";

/** Stringhe brevi di interfaccia e regole SEO per lingua. Speculare in server/lib/Seo.php (seoTitle/seoDesc). */
type UI = {
  locale: string; manifesto: string; reviews: string; mapTitle: string; heroH1: string; filterCat: string;
  description: string; tapSkip: string; callShort: string; seatsWord: string;
  seoTitle: (name: string, cat: string) => string; seoDesc: (name: string) => string;
};

const c = (cat: string) => (cat ? ` · ${cat}` : "");
export const ui: Record<Lang, UI> = {
  it: { locale: "it-IT", manifesto: "Manifesto", reviews: "recensioni", mapTitle: "Mappa: Sulcis Rent a San Giovanni Suergiu", heroH1: "noleggio auto in Sardegna, sede a San Giovanni Suergiu",
    filterCat: "Filtra per categoria", description: "Descrizione", tapSkip: "Tocca per saltare", callShort: "Chiama", seatsWord: "posti",
    seoTitle: (n, k) => `Noleggio ${n}${c(k)} in Sardegna`, seoDesc: (n) => `${n} a noleggio in Sardegna. Scrivici su WhatsApp per disponibilità e prezzo: siamo aperti h24.` },
  en: { locale: "en-GB", manifesto: "Manifesto", reviews: "reviews", mapTitle: "Map: Sulcis Rent in San Giovanni Suergiu", heroH1: "car rental in Sardinia, based in San Giovanni Suergiu",
    filterCat: "Filter by category", description: "Description", tapSkip: "Tap to skip", callShort: "Call", seatsWord: "seats",
    seoTitle: (n, k) => `Rent a ${n}${c(k)} in Sardinia`, seoDesc: (n) => `${n} for rent in Sardinia. Message us on WhatsApp for availability and price: open 24/7.` },
  fr: { locale: "fr-FR", manifesto: "Manifeste", reviews: "avis", mapTitle: "Carte : Sulcis Rent à San Giovanni Suergiu", heroH1: "location de voitures en Sardaigne, agence à San Giovanni Suergiu",
    filterCat: "Filtrer par catégorie", description: "Description", tapSkip: "Touchez pour passer", callShort: "Appeler", seatsWord: "places",
    seoTitle: (n, k) => `Location ${n}${c(k)} en Sardaigne`, seoDesc: (n) => `${n} à louer en Sardaigne. Écris-nous sur WhatsApp pour la disponibilité et le prix : ouvert 24 h/24.` },
  es: { locale: "es-ES", manifesto: "Manifiesto", reviews: "opiniones", mapTitle: "Mapa: Sulcis Rent en San Giovanni Suergiu", heroH1: "alquiler de coches en Cerdeña, sede en San Giovanni Suergiu",
    filterCat: "Filtrar por categoría", description: "Descripción", tapSkip: "Toca para saltar", callShort: "Llamar", seatsWord: "plazas",
    seoTitle: (n, k) => `Alquiler ${n}${c(k)} en Cerdeña`, seoDesc: (n) => `${n} de alquiler en Cerdeña. Escríbenos por WhatsApp para disponibilidad y precio: abiertos 24 h.` },
  pt: { locale: "pt-PT", manifesto: "Manifesto", reviews: "avaliações", mapTitle: "Mapa: Sulcis Rent em San Giovanni Suergiu", heroH1: "aluguer de carros na Sardenha, sede em San Giovanni Suergiu",
    filterCat: "Filtrar por categoria", description: "Descrição", tapSkip: "Toca para saltar", callShort: "Ligar", seatsWord: "lugares",
    seoTitle: (n, k) => `Aluguer ${n}${c(k)} na Sardenha`, seoDesc: (n) => `${n} para alugar na Sardenha. Escreve-nos no WhatsApp para disponibilidade e preço: abertos 24h.` },
  pl: { locale: "pl-PL", manifesto: "Manifest", reviews: "opinii", mapTitle: "Mapa: Sulcis Rent w San Giovanni Suergiu", heroH1: "wynajem samochodów na Sardynii, biuro w San Giovanni Suergiu",
    filterCat: "Filtruj według kategorii", description: "Opis", tapSkip: "Dotknij, aby pominąć", callShort: "Zadzwoń", seatsWord: "miejsc",
    seoTitle: (n, k) => `Wynajem ${n}${c(k)} na Sardynii`, seoDesc: (n) => `${n} do wynajęcia na Sardynii. Napisz do nas na WhatsApp w sprawie dostępności i ceny: czynne 24/7.` },
};
