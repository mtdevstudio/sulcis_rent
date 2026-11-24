import { site } from "@/data/site";
import { IconStar } from "./icons";

type Tone = "sand" | "dark" | "blue";
const tones: Record<Tone, string> = {
  sand: "bg-sand text-trachite border-trachite",
  dark: "bg-trachite text-sand border-trachite",
  blue: "bg-blue text-white border-blue",
};

/** Badge «Aperto h24» con battito magenta (fermo con reduced-motion). */
export function BadgeOpen({ tone = "sand", label = "Aperto h24" }: { tone?: Tone; label?: string }) {
  return (
    <span className={`inline-flex h-9 items-center gap-2.5 border-filo px-3.5 eyebrow ${tones[tone]}`}>
      <span className="relative flex h-2.5 w-2.5" aria-hidden>
        <span className="absolute inset-0 animate-ping bg-magenta opacity-60 motion-reduce:hidden" />
        <span className="relative h-2.5 w-2.5 bg-magenta" />
      </span>
      {label}
    </span>
  );
}

/** Badge rating Google: solo il dato reale da site.ts. */
const G: Record<string, (r: string, n: number) => string> = {
  it: (r, n) => `Valutazione ${r} su 5 su Google, ${n} recensioni`,
  en: (r, n) => `Rated ${r} out of 5 on Google, ${n} reviews`,
  fr: (r, n) => `Note de ${r} sur 5 sur Google, ${n} avis`,
  es: (r, n) => `Valoración de ${r} sobre 5 en Google, ${n} reseñas`,
  pt: (r, n) => `Avaliação de ${r} em 5 no Google, ${n} avaliações`,
  pl: (r, n) => `Ocena ${r} na 5 w Google, ${n} opinii`,
};

export function BadgeGoogle({ tone = "sand", href, lang = "it" }: { tone?: Tone; href?: string; lang?: string }) {
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
  const label = (G[lang] ?? G.it)(site.google.ratingLabel, site.google.reviewCount);
  return href ? (
    <a href={href} className={`${cls} hover:bg-trachite hover:text-sand transition-colors`} aria-label={label} target="_blank" rel="noopener noreferrer">{inner}</a>
  ) : (
    <span className={cls} role="img" aria-label={label}>{inner}</span>
  );
}
