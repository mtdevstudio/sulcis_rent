"use client";
import { site } from "@/data/site";
import { useSettingsData } from "./data";
import { tr } from "./i18n";
import type { Lang, L10n } from "./types";

/** Contatti effettivi: settings.json (admin) con fallback su site.ts. */
export function useContact() {
  const s = useSettingsData();
  const e164 = s.phoneE164 || site.phone.e164;
  const waNumber = (s.whatsappNumber || site.whatsapp.number).replace(/\D/g, "");
  return {
    phoneDisplay: s.phoneDisplay || site.phone.display,
    tel: `tel:${e164}`,
    waNumber,
    waLink: (message: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`,
    defaultMessage: s.whatsappMessage as L10n | undefined,
    address: s.address || site.address,
    instagram: s.instagram || site.social.instagram,
    facebook: s.facebook || "",
    googleReviewsUrl: s.googleReviewsUrl || site.google.reviewsUrl,
    vat: s.vat || site.vat,
    email: s.email || site.email,
    hours: (lang: Lang) => tr(s.hours, lang),
  };
}
