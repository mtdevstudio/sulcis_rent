import type { Viewport } from "next";
import { notFound } from "next/navigation";
import { fontDisplay, fontText } from "@/lib/fonts";
import { headScript } from "@/lib/headScript";
import { FOREIGN, isLang } from "@/lib/i18n";
import "../../globals.css";

export const viewport: Viewport = { themeColor: "#F3EDE2", width: "device-width", initialScale: 1 };
export const dynamicParams = false;
export const generateStaticParams = () => FOREIGN.map((lang) => ({ lang }));

/** Root layout delle lingue straniere: /en/, /fr/, /es/, /pt/, /pl/ (l'italiano vive alla radice). */
export default async function IntlLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang === "it") notFound();
  return (
    <html lang={lang} className={`${fontDisplay.variable} ${fontText.variable}`} data-has-pl="" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: headScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
