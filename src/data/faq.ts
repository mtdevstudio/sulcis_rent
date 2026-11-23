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
    { q: { it: "Potete consegnare l'auto al porto o in hotel?", en: "Can you deliver the car to the port or hotel?" }, a: todo }, // TODO cliente
  ],
};
