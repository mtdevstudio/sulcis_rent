import { LegalPage, legalTitle } from "@/components/pages/LegalPage";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata({ lang: "en", title: `${legalTitle("privacy", "en")} · Sulcis Rent`, description: "Sulcis Rent privacy policy.", path: "/en/privacy/", altPath: "/privacy/" });
export default function Page() { return <LegalPage kind="privacy" lang="en" />; }
