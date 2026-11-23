"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useContact } from "@/lib/contact";
import { useFleet } from "@/lib/data";
import { t, tr } from "@/lib/i18n";
import { lockScroll } from "@/lib/motion";
import { trackContact } from "@/lib/track";
import type { PublicCar } from "@/lib/types";
import { Trama } from "@/components/trama/Trama";
import { IconPhone, IconWhatsApp } from "@/components/ui/icons";
import { useLang } from "./LangContext";

/**
 * ContactModal — UNICO punto di «prenotazione»: solo WhatsApp e chiamata.
 * Nessuna data, nessuna disponibilità, nessun form.
 */
type OpenArgs = { carSlug?: string; car?: PublicCar };
const Ctx = createContext<(a?: OpenArgs) => void>(() => {});

export function useContactModal(carSlug?: string) {
  const open = useContext(Ctx);
  return useCallback((car?: PublicCar) => open({ carSlug, car }), [open, carSlug]);
}

export function ContactModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ open: boolean; carSlug?: string; car?: PublicCar }>({ open: false });
  const lastFocus = useRef<HTMLElement | null>(null);
  const open = useCallback((a?: OpenArgs) => {
    lastFocus.current = document.activeElement as HTMLElement;
    setState({ open: true, carSlug: a?.carSlug ?? a?.car?.slug, car: a?.car });
  }, []);
  const close = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
    requestAnimationFrame(() => lastFocus.current?.focus());
  }, []);
  return (
    <Ctx.Provider value={open}>
      {children}
      {state.open && <Dialog carSlug={state.carSlug} carOverride={state.car} onClose={close} />}
    </Ctx.Provider>
  );
}

function Dialog({ carSlug, carOverride, onClose }: { carSlug?: string; carOverride?: PublicCar; onClose: () => void }) {
  const lang = useLang();
  const d = t(lang);
  const c = useContact();
  const fleet = useFleet();
  const ref = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const car = carOverride ?? (carSlug ? fleet.cars.find((x) => x.slug === carSlug) : undefined);
  const carName = car ? `${car.brand} ${car.model}` : "";

  const message = useMemo(() => {
    if (car?.whatsappMessage && tr(car.whatsappMessage, lang)) return tr(car.whatsappMessage, lang);
    if (car) return d.waCar(carName);
    return tr(c.defaultMessage, lang) || d.waGeneric;
  }, [car, carName, c.defaultMessage, d, lang]);

  useEffect(() => {
    lockScroll(true);
    const node = ref.current!;
    const focusables = () => Array.from(node.querySelectorAll<HTMLElement>("a[href],button:not([disabled])"));
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      if (e.key === "Tab") {
        const f = focusables(); if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); lockScroll(false); };
  }, [onClose]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(c.phoneDisplay.replace(/\s/g, "")); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* noop */ }
  };

  return (
    <div className="fixed inset-0 z-modal flex items-end justify-center sm:items-center" role="presentation">
      <button type="button" aria-label={d.close} tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default bg-trachite/75 backdrop-blur-[2px] motion-safe:animate-[fadeIn_.25s_ease-out]" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cm-title"
        aria-describedby="cm-sub"
        className="relative w-full max-w-xl bg-sand motion-safe:animate-[sheetIn_.45s_cubic-bezier(.16,1,.3,1)] sm:mx-4"
      >
        <div className="relative h-3 overflow-hidden" aria-hidden><Trama motif="scala" fg="sand" bg="rent-magenta" cell={3} /></div>
        <div className="p-6 pb-8 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              {car && <p className="eyebrow text-magenta-deep">{carName}{car.version ? ` · ${car.version}` : ""}</p>}
              <h2 id="cm-title" className="display mt-2 text-d-m">{d.modalTitle}</h2>
            </div>
            <button type="button" onClick={onClose} aria-label={d.close} className="grid h-12 w-12 shrink-0 place-items-center border-filo border-trachite text-2xl leading-none hover:bg-trachite hover:text-sand">×</button>
          </div>
          <p id="cm-sub" className="mt-3 text-stone">{d.modalSub}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href={c.waLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackContact("whatsapp", car?.slug)}
              aria-label={`${d.whatsapp}${carName ? ` – ${carName}` : ""} (si apre WhatsApp)`}
              className="group relative flex h-16 items-center justify-center gap-3 overflow-hidden bg-magenta px-6 font-bold uppercase tracking-[0.08em] text-white transition-colors before:absolute before:inset-0 before:-z-0 before:origin-left before:scale-x-0 before:bg-magenta-deep before:transition-transform before:duration-base before:ease-trama hover:before:scale-x-100 md:h-[4.5rem]"
            >
              <IconWhatsApp className="relative h-6 w-6" /><span className="relative">WhatsApp</span>
            </a>
            <a
              href={c.tel}
              onClick={() => trackContact("call", car?.slug)}
              aria-label={`${d.call}: ${c.phoneDisplay}`}
              className="group relative flex h-16 items-center justify-center gap-3 overflow-hidden bg-trachite px-6 font-bold uppercase tracking-[0.08em] text-sand before:absolute before:inset-0 before:origin-left before:scale-x-0 before:bg-blue before:transition-transform before:duration-base before:ease-trama hover:before:scale-x-100 md:h-[4.5rem]"
            >
              <IconPhone className="relative h-6 w-6" /><span className="relative">{d.call}</span>
            </a>
          </div>
          <div className="mt-6 flex items-center justify-between gap-3 border-t-filo border-trachite pt-4">
            <a href={c.tel} className="display text-[clamp(1.9rem,7vw,2.6rem)] leading-none" style={{ fontVariationSettings: '"wdth" 75, "wght" 800' }} onClick={() => trackContact("call", car?.slug)}>
              {c.phoneDisplay}
            </a>
            <button type="button" onClick={copy} className="eyebrow h-11 border-filo border-trachite px-4 hover:bg-trachite hover:text-sand" aria-live="polite">
              {copied ? d.copied : d.copy}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
