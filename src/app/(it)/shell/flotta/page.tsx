import { CarPage } from "@/components/pages/CarPage";
import { pageMetadata } from "@/lib/metadata";

/**
 * Shell per le auto aggiunte DOPO il build: api/car.php serve questo HTML su /flotta/{slug}/
 * iniettando title, meta, Open Graph e JSON-LD dell'auto (e togliendo il noindex qui sotto).
 */
export const metadata = pageMetadata({ lang: "it", title: "Sulcis Rent", description: "", path: "/flotta/", noindex: true });
export default function Page() { return <CarPage lang="it" />; }
