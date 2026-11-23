import type { Viewport } from "next";
import { fontDisplay, fontText } from "@/lib/fonts";
import { headScript } from "@/lib/headScript";
import "../globals.css";

export const viewport: Viewport = { themeColor: "#F3EDE2", width: "device-width", initialScale: 1 };

export default function ItLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${fontDisplay.variable} ${fontText.variable}`} data-has-pl="" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: headScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
