import { CreditsPage } from "@/components/pages/CreditsPage";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata({ lang: "it", title: "Crediti foto · Sulcis Rent", description: "Crediti delle immagini usate nel sito.", path: "/crediti-foto/", noindex: true });
export default function Page() { return <CreditsPage />; }
