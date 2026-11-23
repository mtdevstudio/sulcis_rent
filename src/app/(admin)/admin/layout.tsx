import { fontDisplay, fontText } from "@/lib/fonts";
import "../../globals.css";
export const metadata = { title: "Sulcis Rent · Admin", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="it" className={`${fontDisplay.variable} ${fontText.variable}`}><body>{children}</body></html>);
}
