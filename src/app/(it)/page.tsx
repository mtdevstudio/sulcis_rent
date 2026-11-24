import { HomePage } from "@/components/pages/HomePage";
import { alternatesOf } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { META } from "@/lib/pageMeta";

export const metadata = pageMetadata({ lang: "it", title: META.it.home[0], description: META.it.home[1], path: "/", alternates: alternatesOf((p) => p.home) });
export default function Page() { return <HomePage lang="it" />; }
