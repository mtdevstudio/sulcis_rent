import type { Metadata } from "next";
import { site } from "@/data/site";
import type { Lang } from "./types";

export function pageMetadata({ lang, title, description, path, altPath, noindex }: { lang: Lang; title: string; description: string; path: string; altPath?: string; noindex?: boolean }): Metadata {
  return {
    metadataBase: new URL(site.domain),
    title,
    description,
    alternates: {
      canonical: path,
      languages: altPath ? (lang === "it" ? { it: path, en: altPath, "x-default": path } : { en: path, it: altPath, "x-default": altPath }) : undefined,
    },
    openGraph: {
      type: "website", url: path, title, description, siteName: site.legalName, locale: lang === "it" ? "it_IT" : "en_GB",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: site.legalName }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
    robots: noindex ? { index: false, follow: false } : undefined,
    icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: "/apple-icon.png" },
  };
}
