import { HomePage } from "@/components/pages/HomePage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  lang: "en",
  title: "Sulcis Rent – Car rental in San Giovanni Suergiu · South Sardinia",
  description: "Car rental in Sulcis Iglesiente, South-West Sardinia: close to Sant'Antioco, Carloforte and Porto Pino. Open 24/7, book on WhatsApp.",
  path: "/en/",
  altPath: "/",
});
export default function Page() { return <HomePage lang="en" />; }
