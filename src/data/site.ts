/**
 * UNICA FONTE DI VERITÀ per i dati aziendali.
 * Ogni componente legge da qui: telefono, WhatsApp, indirizzo, orari, social.
 */
export const site = {
  name: "Sulcis Rent",
  legalName: "Sulcis Rent – Autonoleggio",
  domain: "https://sulcisrent.it",
  phone: {
    display: "331 390 6076",
    e164: "+393313906076",
    tel: "tel:+393313906076",
  },
  whatsapp: {
    number: "393313906076",
    base: "https://wa.me/393313906076",
  },
  address: {
    street: "Località Santa Lucia",
    postalCode: "09010",
    city: "San Giovanni Suergiu",
    province: "SU",
    region: "Sardegna",
    country: "IT",
  },
  hours: { label: "Aperto 24 ore su 24", short: "h24", schema: "Mo-Su 00:00-24:00" },
  google: {
    rating: 5.0,
    ratingLabel: "5,0",
    reviewCount: 10,
    reviewsUrl: "", // TODO cliente: link diretto alle recensioni della scheda Google Business
  },
  social: { instagram: "https://www.instagram.com/sulcis_rent/" },
  logo: {
    src: "/brand/logo.jpg",
    // TODO: impostare a true quando public/brand/logo.jpg (o la versione HD/SVG) è presente nel repo
    available: false,
    width: 600,
    height: 600,
  },
  vat: "", // TODO cliente: P.IVA
  email: "", // TODO cliente: email (opzionale)
  credit: { label: "MTDEVSTUDIO", url: "https://mtdevstudio.it" },
} as const;

export type Site = typeof site;
