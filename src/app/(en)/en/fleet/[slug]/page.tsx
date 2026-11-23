import { CarPage, carPageMetadata, carStaticParams } from "@/components/pages/CarPage";

export const dynamicParams = false;
export const generateStaticParams = carStaticParams;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { return carPageMetadata("en", (await params).slug); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { return <CarPage lang="en" slug={(await params).slug} />; }
