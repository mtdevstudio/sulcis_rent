/**
 * trackContact — pronto per GA4 / Meta Pixel, ma NON carica script di terze parti.
 * Quando configuri GA4 (gtag) o Meta Pixel (fbq), gli eventi partono da soli.
 */
type W = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };

export function trackContact(channel: "whatsapp" | "call", carSlug?: string) {
  if (typeof window === "undefined") return;
  const w = window as W;
  const payload = { channel, car: carSlug ?? null };
  w.dataLayer?.push({ event: "contact_click", ...payload });
  w.gtag?.("event", "contact_click", payload);
  w.fbq?.("track", "Contact", payload);
  if (process.env.NODE_ENV !== "production") console.info("[trackContact]", payload);
}
