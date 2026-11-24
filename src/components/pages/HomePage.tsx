import type { Lang } from "@/lib/types";
import { localBusinessJsonLd } from "@/lib/seo";
import { alternatesOf } from "@/lib/i18n";
import { SiteShell } from "@/components/site/SiteShell";
import { Hero } from "@/components/sections/Hero";
import { Manifesto } from "@/components/sections/Manifesto";
import { Marquee } from "@/components/sections/Marquee";
import { Fleet } from "@/components/sections/Fleet";
import { Sardinia } from "@/components/sections/Sardinia";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Why } from "@/components/sections/Why";
import { Reviews } from "@/components/sections/Reviews";
import { Faq } from "@/components/sections/Faq";
import { Contacts } from "@/components/sections/Contacts";

export function HomePage({ lang }: { lang: Lang }) {
  return (
    <SiteShell lang={lang} alternates={alternatesOf((p) => p.home)} preloader>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd(lang)) }} />
      <Hero />
      <Manifesto lang={lang} />
      <Marquee />
      <Fleet />
      <Sardinia />
      <HowItWorks lang={lang} />
      <Why lang={lang} />
      <Reviews />
      <Faq />
      <Contacts />
    </SiteShell>
  );
}
