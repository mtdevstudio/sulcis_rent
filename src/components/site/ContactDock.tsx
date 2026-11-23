"use client";
import { useEffect, useState } from "react";
import { useContact } from "@/lib/contact";
import { t } from "@/lib/i18n";
import { trackContact } from "@/lib/track";
import { IconPhone, IconWhatsApp } from "@/components/ui/icons";
import { useLang } from "./LangContext";

/**
 * Contatto sempre a un tap:
 * - mobile: barra sticky in basso (WhatsApp / Chiama) che compare dopo l'hero;
 * - desktop: pulsante WhatsApp flottante, discreto.
 * L'hero (o la testata di pagina) espone [data-hero-end] come sentinella.
 */
export function ContactDock() {
  const lang = useLang();
  const d = t(lang);
  const c = useContact();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.querySelector("[data-hero-end]");
    if (!sentinel) { setVisible(true); return; }
    let raf = 0;
    const check = () => { raf = 0; setVisible(sentinel.getBoundingClientRect().top < 0); };
    const on = () => { if (!raf) raf = requestAnimationFrame(check); };
    check();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => { removeEventListener("scroll", on); removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, []);

  const wa = c.waLink(d.waGeneric);
  return (
    <>
      <div
        className={`fixed inset-x-0 bottom-0 z-sticky grid grid-cols-2 border-t-filo border-trachite transition-transform duration-base ease-trama md:hidden ${visible ? "translate-y-0" : "translate-y-full"}`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)", background: "rgb(var(--trachite))" }}
        aria-hidden={!visible}
      >
        <a href={wa} target="_blank" rel="noopener noreferrer" tabIndex={visible ? 0 : -1} onClick={() => trackContact("whatsapp")}
          aria-label={`${d.whatsapp} (si apre WhatsApp)`} className="flex h-16 items-center justify-center gap-2 bg-magenta font-bold uppercase tracking-wider text-white">
          <IconWhatsApp className="h-6 w-6" />WhatsApp
        </a>
        <a href={c.tel} tabIndex={visible ? 0 : -1} onClick={() => trackContact("call")} aria-label={`${d.call}: ${c.phoneDisplay}`}
          className="flex h-16 items-center justify-center gap-2 bg-trachite font-bold uppercase tracking-wider text-sand">
          <IconPhone className="h-6 w-6" />{lang === "it" ? "Chiama" : "Call"}
        </a>
      </div>
      <a
        href={wa} target="_blank" rel="noopener noreferrer" onClick={() => trackContact("whatsapp")}
        aria-label={`${d.whatsapp} (si apre WhatsApp)`}
        className={`group fixed bottom-6 right-6 z-sticky hidden h-14 items-center gap-0 overflow-hidden rounded-full bg-magenta text-white shadow-[0_0_0_4px_rgb(var(--sand))] transition-all duration-base ease-trama hover:bg-magenta-deep md:flex ${visible ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
      >
        <span className="grid h-14 w-14 place-items-center"><IconWhatsApp className="h-7 w-7" /></span>
        <span className="eyebrow max-w-0 overflow-hidden whitespace-nowrap transition-[max-width,padding] duration-base ease-trama group-hover:max-w-[12rem] group-hover:pr-5 group-focus-visible:max-w-[12rem] group-focus-visible:pr-5">WhatsApp</span>
      </a>
    </>
  );
}
