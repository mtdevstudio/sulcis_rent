"use client";
import type { Lang } from "@/lib/types";
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

export function SiteShell({ lang, altHref, children, preloader = false }: { lang: Lang; altHref?: string; children: React.ReactNode; preloader?: boolean }) {
  return (
    <LangProvider lang={lang}>
      <ContactModalProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-trachite focus:px-4 focus:py-3 focus:text-sand">
          {lang === "it" ? "Vai al contenuto" : "Skip to content"}
        </a>
        <MapSymbols />
        {preloader && <Preloader />}
        <Header altHref={altHref} />
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
