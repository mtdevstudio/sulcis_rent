import { FleetPage } from "@/components/pages/FleetPage";
import { alternatesOf, paths } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { META } from "@/lib/pageMeta";
import type { Lang } from "@/lib/types";

type P = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: P) {
  const lang = (await params).lang as Lang;
  return pageMetadata({ lang, title: META[lang].fleet[0], description: META[lang].fleet[1], path: paths[lang].fleet, alternates: alternatesOf((p) => p.fleet) });
}
export default async function Page({ params }: P) { return <FleetPage lang={(await params).lang as Lang} />; }
