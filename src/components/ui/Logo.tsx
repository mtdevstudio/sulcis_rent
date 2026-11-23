import Image from "next/image";
import { site } from "@/data/site";

/**
 * <Logo /> — unico punto da cambiare quando arriva il logo HD o SVG.
 * 1. Metti il file in public/brand/ (es. logo.svg)
 * 2. Aggiorna site.logo.src / width / height e imposta available: true
 * Finché il file non c'è, mostra un segnaposto tipografico (NON è il logo).
 */
export function Logo({ className = "", tone = "color" }: { className?: string; tone?: "color" | "light" }) {
  if (site.logo.available) {
    return (
      <Image src={site.logo.src} alt={site.legalName} width={site.logo.width} height={site.logo.height} className={className} priority />
    );
  }
  return (
    <span className={`inline-flex flex-col leading-none ${className}`} aria-label={site.legalName} role="img">
      <span className="display text-[1.6em]" style={{ fontVariationSettings: '"wdth" 70, "wght" 900' }}>
        <span className={tone === "light" ? "text-sand" : "text-blue"}>Sulcis</span>{" "}
        <span className="text-magenta">Rent</span>
      </span>
      <span className={`eyebrow mt-1 text-[0.55em] ${tone === "light" ? "text-sand" : "text-blue"}`}>Autonoleggio</span>
    </span>
  );
}
