import { FleetPage } from "@/components/pages/FleetPage";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata({
  lang: "en",
  title: "The fleet · Car rental in Sardinia · Sulcis Rent",
  description: "City cars, compacts, SUVs, 7 and 9 seaters, vans: every Sulcis Rent car. Book on WhatsApp or by phone, open 24/7.",
  path: "/en/fleet/",
  altPath: "/flotta/",
});
export default function Page() { return <FleetPage lang="en" />; }
