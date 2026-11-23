import { HomePage } from "@/components/pages/HomePage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  lang: "en",
  title: "Sulcis Rent – Car rental in San Giovanni Suergiu · Sulcis and Sardinia",
  description: "Car rental in Sulcis Iglesiente, Sardinia: explore Sant'Antioco, Carloforte and the whole island. Open 24/7, book on WhatsApp.",
  path: "/en/",
  altPath: "/",
});
export default function Page() { return <HomePage lang="en" />; }
