import type { ReviewsData } from "@/lib/types";

/**
 * Recensioni: VUOTO di proposito. ⚠️ Mai recensioni inventate.
 * Si aggiungono dal pannello /admin → Recensioni (solo recensioni reali copiate da Google).
 * Struttura: { author, text, rating, date, source: 'Google', url? }
 */
export const reviewsSeed: ReviewsData = { version: "build", reviews: [] };
