import { CarPage } from "@/components/pages/CarPage";

/**
 * Shell per le auto aggiunte DOPO il build: api/car.php serve questo HTML su /flotta/{slug}/
 * iniettando title, meta, Open Graph e JSON-LD dell'auto.
 */
// Nessun noindex/canonical qui: finirebbero nel payload React e verrebbero reinseriti dopo l'idratazione.
// La shell diretta (/shell/...) è esclusa con X-Robots-Tag (.htaccess) e robots.txt; car.php inietta i meta dell'auto.
export const metadata = { title: "Sulcis Rent – Autonoleggio" };
export default function Page() { return <CarPage lang="it" />; }
