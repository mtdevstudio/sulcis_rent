import { FleetPage } from "@/components/pages/FleetPage";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata({
  lang: "it",
  title: "La flotta · Noleggio auto in Sardegna · Sulcis Rent",
  description: "Citycar, utilitarie, SUV, 7 e 9 posti, furgoni: tutte le auto a noleggio di Sulcis Rent. Prenoti su WhatsApp o per telefono, aperti h24.",
  path: "/flotta/",
  altPath: "/en/fleet/",
});
export default function Page() { return <FleetPage lang="it" />; }
