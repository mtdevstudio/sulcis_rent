import type { FaqData } from "@/lib/types";

/** FAQ di partenza. // TODO cliente: risposte reali (si modificano da /admin → FAQ). */
const todo = { it: "Risposta in arrivo: nel frattempo scrivici su WhatsApp, ti rispondiamo subito.", en: "Answer coming soon: in the meantime message us on WhatsApp, we reply right away." };
export const faqSeed: FaqData = {
  version: "build",
  items: [
    { q: { it: "Quali documenti servono per noleggiare?", en: "Which documents do I need to rent?" }, a: todo }, // TODO cliente
    { q: { it: "Qual è l'età minima del conducente?", en: "What is the minimum driver age?" }, a: todo }, // TODO cliente
    { q: { it: "È prevista una cauzione?", en: "Is there a security deposit?" }, a: todo }, // TODO cliente
    { q: { it: "Il chilometraggio è illimitato?", en: "Is mileage unlimited?" }, a: todo }, // TODO cliente
    { q: { it: "Consegnate l'auto in aeroporto o al porto (Cagliari, Olbia, Alghero…)?", en: "Do you deliver the car to airports or ports (Cagliari, Olbia, Alghero…)?" }, a: todo }, // TODO cliente: confermare le zone di consegna
    { q: { it: "Posso girare tutta la Sardegna con l'auto?", en: "Can I drive all over Sardinia with the car?" }, a: todo }, // TODO cliente
  ],
};
