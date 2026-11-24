import { CarPage, carPageMetadata, carStaticParams } from "@/components/pages/CarPage";
import type { Lang } from "@/lib/types";

type P = { params: Promise<{ lang: string; slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = carStaticParams;
export async function generateMetadata({ params }: P) { const { lang, slug } = await params; return carPageMetadata(lang as Lang, slug); }
export default async function Page({ params }: P) { const { lang, slug } = await params; return <CarPage lang={lang as Lang} slug={slug} />; }
