import type { Metadata } from "next";
import { site } from "@/data/site";
import type { Lang } from "./types";

export const OG_LOCALE: Record<Lang, string> = { it: "it_IT", en: "en_GB", fr: "fr_FR", es: "es_ES", pt: "pt_PT", pl: "pl_PL" };

/** Metadata di pagina con hreflang per tutte le lingue (x-default = italiano). */
export function pageMetadata({ lang, title, description, path, alternates, noindex }: {
  lang: Lang; title: string; description: string; path: string; alternates?: Partial<Record<Lang, string>>; noindex?: boolean;
}): Metadata {
  return {
    metadataBase: new URL(site.domain),
    title,
    description,
    alternates: {
      canonical: path,
      languages: alternates ? { ...alternates, "x-default": alternates.it ?? path } : undefined,
    },
    openGraph: {
      type: "website", url: path, title, description, siteName: site.legalName, locale: OG_LOCALE[lang],
      images: [{ url: "/og.png", width: 1200, height: 630, alt: site.legalName }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
    robots: noindex ? { index: false, follow: false } : undefined,
    icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: "/apple-icon.png" },
  };
}
