import { LegalPage, legalTitle } from "@/components/pages/LegalPage";
import { alternatesOf } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata({ lang: "it", title: `${legalTitle("cookie", "it")} · Sulcis Rent`, description: "Informativa cookie di Sulcis Rent – Autonoleggio.", path: "/cookie/", alternates: alternatesOf((p) => p.cookie) });
export default function Page() { return <LegalPage kind="cookie" lang="it" />; }
