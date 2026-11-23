import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

// Home in costruzione: le sezioni arrivano dopo l'approvazione del design system.
export default function Home() {
  return (
    <main className="wrap flex min-h-screen flex-col items-start justify-center gap-6">
      <Logo className="text-4xl" />
      <Link href="/design-system/" className="eyebrow underline underline-offset-4">Design system «Trama» →</Link>
    </main>
  );
}
