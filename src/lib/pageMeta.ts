import type { Lang } from "./types";

/** Title e description SEO delle pagine principali, per lingua. // TODO revisione madrelingua */
export const META: Record<Lang, { home: [string, string]; fleet: [string, string] }> = {
  it: {
    home: ["Sulcis Rent – Noleggio auto in Sardegna · Autonoleggio a San Giovanni Suergiu", "Noleggio auto in Sardegna: citycar, SUV, 9 posti e furgoni per girare Sant'Antioco, Carloforte, Alghero, la Costa Smeralda e tutta l'isola. Aperti h24, prenoti su WhatsApp."],
    fleet: ["La flotta · Noleggio auto in Sardegna · Sulcis Rent", "Citycar, utilitarie, SUV, 7 e 9 posti, furgoni: tutte le auto a noleggio di Sulcis Rent. Prenoti su WhatsApp o per telefono, aperti h24."],
  },
  en: {
    home: ["Sulcis Rent – Car rental in Sardinia", "Car rental in Sardinia: city cars, SUVs, 9-seaters and vans to explore Sant'Antioco, Carloforte, Alghero, the Costa Smeralda and the whole island. Open 24/7, book on WhatsApp."],
    fleet: ["The fleet · Car rental in Sardinia · Sulcis Rent", "City cars, compacts, SUVs, 7 and 9 seaters, vans: every Sulcis Rent car. Book on WhatsApp or by phone, open 24/7."],
  },
  fr: {
    home: ["Sulcis Rent – Location de voitures en Sardaigne", "Location de voitures en Sardaigne : citadines, SUV, 9 places et utilitaires pour découvrir Sant'Antioco, Carloforte, Alghero, la Costa Smeralda et toute l'île. Ouvert 24 h/24, réservation sur WhatsApp."],
    fleet: ["La flotte · Location de voitures en Sardaigne · Sulcis Rent", "Citadines, compactes, SUV, 7 et 9 places, utilitaires : toutes les voitures Sulcis Rent. Réservation sur WhatsApp ou par téléphone, ouvert 24 h/24."],
  },
  es: {
    home: ["Sulcis Rent – Alquiler de coches en Cerdeña", "Alquiler de coches en Cerdeña: urbanos, SUV, 9 plazas y furgonetas para recorrer Sant'Antioco, Carloforte, Alghero, la Costa Esmeralda y toda la isla. Abierto 24 h, reserva por WhatsApp."],
    fleet: ["La flota · Alquiler de coches en Cerdeña · Sulcis Rent", "Urbanos, compactos, SUV, 7 y 9 plazas, furgonetas: todos los coches de Sulcis Rent. Reserva por WhatsApp o por teléfono, abierto 24 h."],
  },
  pt: {
    home: ["Sulcis Rent – Aluguer de carros na Sardenha", "Aluguer de carros na Sardenha: citadinos, SUV, 9 lugares e carrinhas para explorar Sant'Antioco, Carloforte, Alghero, a Costa Smeralda e toda a ilha. Aberto 24h, reserva no WhatsApp."],
    fleet: ["A frota · Aluguer de carros na Sardenha · Sulcis Rent", "Citadinos, utilitários, SUV, 7 e 9 lugares, carrinhas: todos os carros da Sulcis Rent. Reserva no WhatsApp ou por telefone, aberto 24h."],
  },
  pl: {
    home: ["Sulcis Rent – Wynajem samochodów na Sardynii", "Wynajem samochodów na Sardynii: auta miejskie, SUV-y, 9-osobowe i dostawcze, by zwiedzić Sant'Antioco, Carloforte, Alghero, Costa Smeralda i całą wyspę. Czynne 24/7, rezerwacja przez WhatsApp."],
    fleet: ["Flota · Wynajem samochodów na Sardynii · Sulcis Rent", "Auta miejskie, kompaktowe, SUV-y, 7- i 9-osobowe, dostawcze: wszystkie samochody Sulcis Rent. Rezerwacja przez WhatsApp lub telefonicznie, czynne 24/7."],
  },
};
