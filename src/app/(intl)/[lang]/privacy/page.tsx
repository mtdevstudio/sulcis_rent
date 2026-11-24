import { LegalPage, legalTitle } from "@/components/pages/LegalPage";
import { alternatesOf, paths } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import type { Lang } from "@/lib/types";

type P = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: P) {
  const lang = (await params).lang as Lang;
  return pageMetadata({ lang, title: `${legalTitle("privacy", lang)} · Sulcis Rent`, description: "Sulcis Rent – privacy", path: paths[lang].privacy, alternates: alternatesOf((p) => p.privacy) });
}
export default async function Page({ params }: P) { return <LegalPage kind="privacy" lang={(await params).lang as Lang} />; }
