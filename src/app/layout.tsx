import type { Metadata, Viewport } from "next";
import { fontDisplay, fontText } from "@/lib/fonts";
import { site } from "@/data/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: { default: "Sulcis Rent – Autonoleggio a San Giovanni Suergiu · Sud Sardegna", template: "%s · Sulcis Rent" },
  description: "Noleggio auto a San Giovanni Suergiu, nel Sulcis Iglesiente. Aperti 24 ore su 24: scrivici su WhatsApp o chiamaci.",
};

export const viewport: Viewport = { themeColor: "#F3EDE2" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${fontDisplay.variable} ${fontText.variable}`}>
      <body>{children}</body>
    </html>
  );
}
