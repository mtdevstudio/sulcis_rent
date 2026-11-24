"use client";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";
import { useRouteSignal } from "@/lib/viewTransition";
import { ContactDock } from "./ContactDock";
import { ContactModalProvider } from "./ContactModal";
import { Cursor } from "./Cursor";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { LangProvider } from "./LangContext";
import { MotionDirector } from "./MotionDirector";
import { Preloader } from "./Preloader";
import { MapSymbols } from "./SardiniaMap";

function RouteSignal() { useRouteSignal(); return null; }

export function SiteShell({ lang, alternates, children, preloader = false }: { lang: Lang; alternates?: Partial<Record<Lang, string>>; children: React.ReactNode; preloader?: boolean }) {
  return (
    <LangProvider lang={lang}>
      <ContactModalProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-trachite focus:px-4 focus:py-3 focus:text-sand">
          {t(lang).skip}
        </a>
        <MapSymbols />
        {preloader && <Preloader />}
        <Header alternates={alternates} />
        <main id="main">{children}</main>
        <Footer />
        <ContactDock />
        <Cursor />
        <MotionDirector />
        <RouteSignal />
      </ContactModalProvider>
    </LangProvider>
  );
}
