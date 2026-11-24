import { HomePage } from "@/components/pages/HomePage";
import { alternatesOf, paths } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { META } from "@/lib/pageMeta";
import type { Lang } from "@/lib/types";

type P = { params: Promise<{ lang: string }> };
export async function generateMetadata({ params }: P) {
  const lang = (await params).lang as Lang;
  return pageMetadata({ lang, title: META[lang].home[0], description: META[lang].home[1], path: paths[lang].home, alternates: alternatesOf((p) => p.home) });
}
export default async function Page({ params }: P) { return <HomePage lang={(await params).lang as Lang} />; }
