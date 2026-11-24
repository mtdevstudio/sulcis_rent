import { FleetPage } from "@/components/pages/FleetPage";
import { alternatesOf } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { META } from "@/lib/pageMeta";

export const metadata = pageMetadata({ lang: "it", title: META.it.fleet[0], description: META.it.fleet[1], path: "/flotta/", alternates: alternatesOf((p) => p.fleet) });
export default function Page() { return <FleetPage lang="it" />; }
