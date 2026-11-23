import { HomePage } from "@/components/pages/HomePage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  lang: "it",
  title: "Sulcis Rent – Noleggio auto a San Giovanni Suergiu · Autonoleggio Sulcis e Sardegna",
  description: "Autonoleggio nel Sulcis Iglesiente: noleggio auto a San Giovanni Suergiu per girare Sant'Antioco, Carloforte e tutta la Sardegna. Aperti h24, prenoti su WhatsApp.",
  path: "/",
  altPath: "/en/",
});
export default function Page() { return <HomePage lang="it" />; }
