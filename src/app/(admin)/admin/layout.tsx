import type { Metadata, Viewport } from "next";
import { fontDisplay, fontText } from "@/lib/fonts";
import { AdminApp } from "@/admin/AdminApp";
import "../../globals.css";

export const metadata: Metadata = { title: "Sulcis Rent · Area riservata", robots: { index: false, follow: false, nocache: true } };
export const viewport: Viewport = { themeColor: "#1A6FA3", width: "device-width", initialScale: 1 };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${fontDisplay.variable} ${fontText.variable}`}>
      <body className="bg-sand"><AdminApp>{children}</AdminApp></body>
    </html>
  );
}
