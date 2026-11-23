import type { Metadata } from "next";
import { fontDisplay, fontText } from "@/lib/fonts";
import { Trama } from "@/components/trama/Trama";
import "./globals.css";

export const metadata: Metadata = { title: "Pagina non trovata · Sulcis Rent", robots: { index: false } };

/** 404 globale (export statico → 404.html, servita anche da car.php per auto inesistenti). */
export default function GlobalNotFound() {
  return (
    <html lang="it" className={`${fontDisplay.variable} ${fontText.variable}`}>
      <body className="bg-sand">
        <main className="relative flex min-h-screen flex-col justify-center overflow-hidden px-gutter">
          <div className="absolute inset-x-0 top-0 h-24 opacity-90" aria-hidden><Trama motif="rombo" fg="rent-magenta" cell={10} /></div>
          <p className="eyebrow text-magenta-deep">Errore 404</p>
          <h1 className="display mt-4 text-[clamp(4rem,22vw,20rem)] leading-[0.8]" style={{ fontVariationSettings: '"wdth" 62, "wght" 900' }}>Strada<br />sbagliata</h1>
          <p className="mt-6 max-w-prose text-lead">Questa pagina non esiste (o l&apos;auto non è più disponibile). Torna alla home o scrivici: ti rimettiamo sulla rotta giusta.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/" className="eyebrow inline-flex h-14 items-center bg-trachite px-6 text-sand">Torna alla home</a>
            <a href="https://wa.me/393313906076" className="eyebrow inline-flex h-14 items-center bg-magenta px-6 text-white" aria-label="Scrivici su WhatsApp (si apre WhatsApp)">WhatsApp</a>
          </div>
          <p className="mt-6 text-sm text-stone">Page not found — <a className="underline" href="/en/">English home</a></p>
        </main>
      </body>
    </html>
  );
}
