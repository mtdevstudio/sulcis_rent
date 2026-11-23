"use client";
import { useState } from "react";
import { useContact } from "@/lib/contact";
import { t } from "@/lib/i18n";
import { trackContact } from "@/lib/track";
import { useLang } from "@/components/site/LangContext";
import { SardiniaMap } from "@/components/site/SardiniaMap";
import { SectionHead } from "@/components/ui/SectionHead";
import { IconArrow, IconPhone, IconWhatsApp } from "@/components/ui/icons";

/** Contatti / Dove siamo. La mappa Google si carica SOLO al click (privacy + performance). */
export function Contacts() {
  const lang = useLang();
  const d = t(lang);
  const c = useContact();
  const [map, setMap] = useState(false);
  const a = c.address;
  const query = encodeURIComponent(`Sulcis Rent Autonoleggio, ${a.street}, ${a.postalCode} ${a.city} ${a.province}`);
  return (
    <section id="contatti" className="scroll-mt-20 bg-trachite py-section text-sand" aria-labelledby="contatti-title">
      <div className="wrap">
        <SectionHead index="08" label={d.nav.contacts} tone="dark" />
        <h2 id="contatti-title" className="display mt-10 text-d-l">{d.contactsTitle}</h2>
        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-5">
            <div>
              <h3 className="eyebrow text-magenta-light">{d.address}</h3>
              <address className="mt-3 text-lead not-italic">{a.street}<br />{a.postalCode} {a.city} ({a.province}), {a.region}</address>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${query}`} target="_blank" rel="noopener noreferrer" className="eyebrow mt-3 inline-flex items-center gap-2 underline-offset-4 hover:underline">{d.directions}<IconArrow className="h-4 w-4" /></a>
            </div>
            <div>
              <h3 className="eyebrow text-magenta-light">{d.phone}</h3>
              <a href={c.tel} onClick={() => trackContact("call")} className="display mt-2 block text-[clamp(2.25rem,6vw,3.5rem)] leading-none" style={{ fontVariationSettings: '"wdth" 75, "wght" 800' }} aria-label={`${d.call}: ${c.phoneDisplay}`}>{c.phoneDisplay}</a>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href={c.waLink(d.waGeneric)} target="_blank" rel="noopener noreferrer" onClick={() => trackContact("whatsapp")} aria-label={`${d.whatsapp} (si apre WhatsApp)`} className="eyebrow inline-flex h-14 items-center gap-2 bg-magenta px-6 text-white hover:bg-magenta-deep"><IconWhatsApp />WhatsApp</a>
                <a href={c.tel} onClick={() => trackContact("call")} aria-label={`${d.call}: ${c.phoneDisplay}`} className="eyebrow inline-flex h-14 items-center gap-2 border-filo border-sand px-6 hover:bg-sand hover:text-trachite"><IconPhone />{d.call}</a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="eyebrow text-magenta-light">{d.hours}</h3>
                <p className="mt-2 text-lead">{c.hours(lang) || d.hoursValue}</p>
              </div>
              <div>
                <h3 className="eyebrow text-magenta-light">Social</h3>
                <ul className="mt-2 space-y-1">
                  <li><a href={c.instagram} target="_blank" rel="noopener noreferrer" className="text-lead underline-offset-4 hover:underline">Instagram</a></li>
                  {c.facebook && <li><a href={c.facebook} target="_blank" rel="noopener noreferrer" className="text-lead underline-offset-4 hover:underline">Facebook</a></li>}
                </ul>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden border-filo border-sand/30 bg-trachite-800 md:aspect-[16/10]">
              {map ? (
                <iframe
                  title={lang === "it" ? "Mappa: Sulcis Rent a San Giovanni Suergiu" : "Map: Sulcis Rent in San Giovanni Suergiu"}
                  src={`https://www.google.com/maps?q=${query}&output=embed`}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="absolute inset-0 grid grid-cols-2 items-center gap-4 p-6">
                  <SardiniaMap tone="dark" className="h-full max-h-[90%] w-auto justify-self-center" />
                  <div>
                    <button type="button" onClick={() => setMap(true)} className="eyebrow inline-flex h-14 items-center gap-2 bg-sand px-6 text-trachite hover:bg-white">{d.loadMap}</button>
                    <p className="mt-3 text-xs text-sand/70">{d.mapNote}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
