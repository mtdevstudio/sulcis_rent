import { CarPage, carPageMetadata, carStaticParams } from "@/components/pages/CarPage";

export const dynamicParams = false;
export const generateStaticParams = carStaticParams;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { return carPageMetadata("it", (await params).slug); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { return <CarPage lang="it" slug={(await params).slug} />; }
