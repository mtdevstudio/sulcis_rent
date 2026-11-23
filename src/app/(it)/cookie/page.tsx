import { LegalPage, legalTitle } from "@/components/pages/LegalPage";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata({ lang: "it", title: `${legalTitle("cookie", "it")} · Sulcis Rent`, description: "Informativa cookie di Sulcis Rent – Autonoleggio.", path: "/cookie/", altPath: "/en/cookie/" });
export default function Page() { return <LegalPage kind="cookie" lang="it" />; }
