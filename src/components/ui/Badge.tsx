import { site } from "@/data/site";
import { IconStar } from "./icons";

type Tone = "sand" | "dark" | "blue";
const tones: Record<Tone, string> = {
  sand: "bg-sand text-trachite border-trachite",
  dark: "bg-trachite text-sand border-trachite",
  blue: "bg-blue text-white border-blue",
};

/** Badge «Aperto h24» con battito magenta (fermo con reduced-motion). */
export function BadgeOpen({ tone = "sand" }: { tone?: Tone }) {
  return (
    <span className={`inline-flex h-9 items-center gap-2.5 border-filo px-3.5 eyebrow ${tones[tone]}`}>
      <span className="relative flex h-2.5 w-2.5" aria-hidden>
        <span className="absolute inset-0 animate-ping bg-magenta opacity-60 motion-reduce:hidden" />
        <span className="relative h-2.5 w-2.5 bg-magenta" />
      </span>
      Aperto h24
    </span>
  );
}

/** Badge rating Google: solo il dato reale da site.ts. */
export function BadgeGoogle({ tone = "sand", href }: { tone?: Tone; href?: string }) {
  const inner = (
    <>
      <span className="font-display text-lg leading-none" style={{ fontVariationSettings: '"wdth" 75, "wght" 800' }}>
        {site.google.ratingLabel}
      </span>
      <span className="flex text-magenta" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => <IconStar key={i} className="h-3.5 w-3.5" />)}
      </span>
      <span>Google</span>
    </>
  );
  const cls = `inline-flex h-9 items-center gap-2.5 border-filo px-3.5 eyebrow ${tones[tone]}`;
  const label = `Valutazione ${site.google.ratingLabel} su 5 su Google, ${site.google.reviewCount} recensioni`;
  return href ? (
    <a href={href} className={`${cls} hover:bg-trachite hover:text-sand transition-colors`} aria-label={label} target="_blank" rel="noopener noreferrer">{inner}</a>
  ) : (
    <span className={cls} role="img" aria-label={label}>{inner}</span>
  );
}
