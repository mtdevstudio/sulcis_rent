import { LegalPage, legalTitle } from "@/components/pages/LegalPage";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata({ lang: "it", title: `${legalTitle("privacy", "it")} · Sulcis Rent`, description: "Informativa privacy di Sulcis Rent – Autonoleggio.", path: "/privacy/", altPath: "/en/privacy/" });
export default function Page() { return <LegalPage kind="privacy" lang="it" />; }
