import { CarPage } from "@/components/pages/CarPage";
import type { Lang } from "@/lib/types";

/** Shell per le auto aggiunte dopo il build (car.php inietta i meta). Nessun noindex qui: vedi la shell italiana. */
export const metadata = { title: "Sulcis Rent" };
export default async function Page({ params }: { params: Promise<{ lang: string }> }) { return <CarPage lang={(await params).lang as Lang} />; }
