import { LegalPage, legalTitle } from "@/components/pages/LegalPage";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata({ lang: "en", title: `${legalTitle("cookie", "en")} · Sulcis Rent`, description: "Sulcis Rent cookie policy.", path: "/en/cookie/", altPath: "/cookie/" });
export default function Page() { return <LegalPage kind="cookie" lang="en" />; }
