"use client";
import Link from "next/link";
import { site } from "@/data/site";
import { useContact } from "@/lib/contact";
import { paths, t } from "@/lib/i18n";
import { TramaBand } from "@/components/trama/Trama";
import { useLang } from "./LangContext";

export function Footer() {
  const lang = useLang();
  const d = t(lang);
  const c = useContact();
  return (
    <footer className="relative overflow-hidden bg-sand pb-24 md:pb-10">
      <TramaBand fg="rent-magenta" cell={8} />
      <div className="px-[1.5vw] pt-12">
        <p className="display select-none whitespace-nowrap text-center text-[21vw] leading-[0.8] text-trachite" aria-hidden style={{ fontVariationSettings: '"wdth" 62, "wght" 900' }}>
          Sulcis <span className="text-magenta">Rent</span>
        </p>
      </div>
      <div className="wrap mt-10 grid gap-8 border-t-filo border-trachite pt-8 text-sm md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="font-semibold">{site.legalName}</p>
          <p className="text-stone">{c.address.street}, {c.address.postalCode} {c.address.city} ({c.address.province})</p>
          <p className="mt-1 text-stone">{d.footer.vat} {c.vat || "—"} {/* TODO cliente: P.IVA */}</p>
        </div>
        <nav className="md:col-span-4" aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li><a href={c.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-magenta-deep">Instagram</a></li>
            <li><a href={c.tel} className="hover:text-magenta-deep">{c.phoneDisplay}</a></li>
            <li><Link href={paths[lang].privacy} className="hover:text-magenta-deep">{d.footer.privacy}</Link></li>
            <li><Link href={paths[lang].cookie} className="hover:text-magenta-deep">{d.footer.cookie}</Link></li>
            <li><Link href={paths[lang].credits} className="hover:text-magenta-deep">{d.footer.credits}</Link></li>
          </ul>
        </nav>
        <div className="text-stone md:col-span-4 md:text-right">
          <p>© {new Date().getFullYear()} {site.name}. {d.footer.rights}.</p>
          <p className="mt-1">{d.footer.made} <a href={site.credit.url} target="_blank" rel="noopener" className="font-semibold text-trachite underline underline-offset-4">{site.credit.label}</a></p>
        </div>
      </div>
    </footer>
  );
}
