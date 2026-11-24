"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LANGS, paths, t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { lockScroll, scrollToHash } from "@/lib/motion";
import { Logo } from "@/components/ui/Logo";
import { Nodo } from "@/components/ui/icons";
import { useContactModal } from "./ContactModal";
import { useLang } from "./LangContext";

/** Header fisso: trasparente sull'hero, sabbia dopo; si nasconde scendendo e ricompare risalendo. */
export function Header({ alternates }: { alternates?: Partial<Record<Lang, string>> }) {
  const lang = useLang();
  const d = t(lang);
  const openModal = useContactModal();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const home = paths[lang].home;

  useEffect(() => {
    let last = scrollY;
    const on = () => {
      const y = scrollY;
      setScrolled(y > 40);
      if (y > 400 && y > last + 4) setHidden(true);
      else if (y < last - 4 || y < 400) setHidden(false);
      last = y;
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  useEffect(() => { lockScroll(menu); }, [menu]);

  const links = [
    { href: paths[lang].fleet, label: d.nav.fleet, page: true },
    { href: "#sardegna", label: d.nav.territory },
    { href: "#come-funziona", label: d.nav.how },
    { href: "#faq", label: d.nav.faq },
    { href: "#contatti", label: d.nav.contacts },
  ];
  const go = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (!hash.startsWith("#")) { setMenu(false); return; }
    if (location.pathname === home) { e.preventDefault(); setMenu(false); scrollToHash(hash); history.replaceState(null, "", hash); }
  };
  const hrefOf = (l: { href: string }) => (l.href.startsWith("#") ? `${home}${l.href}` : l.href);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-nav transition-[transform,background-color,border-color] duration-base ease-trama ${
          hidden && !menu ? "-translate-y-full" : ""
        } ${scrolled || menu ? "border-b-filo border-trachite bg-sand" : "border-b-filo border-transparent bg-sand/80 backdrop-blur-sm"}`}
      >
        <div className="wrap flex h-16 items-center justify-between gap-4 md:h-20">
          <Link href={home} aria-label="Sulcis Rent – home" className="shrink-0"><Logo className="text-[15px] md:text-lg" /></Link>
          <nav aria-label="Principale" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {links.map((l) => (
                <li key={l.href}><a href={hrefOf(l)} onClick={(e) => go(e, l.href)} className="eyebrow py-2 hover:text-magenta-deep">{l.label}</a></li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            {alternates && (
              <div className="relative" onKeyDown={(e) => { if (e.key === "Escape") setLangOpen(false); }}>
                <button type="button" onClick={() => setLangOpen((o) => !o)} aria-expanded={langOpen} aria-haspopup="true" aria-label={`${d.langSwitch}: ${LANGS.find((l) => l.code === lang)?.name}`}
                  className="eyebrow flex h-11 min-w-11 items-center gap-1 border-filo border-trachite px-2 hover:bg-trachite hover:text-sand">
                  {lang.toUpperCase()}<span aria-hidden className="text-[9px]">▾</span>
                </button>
                {langOpen && (
                  <ul className="absolute right-0 top-12 z-[60] min-w-[10rem] border-filo border-trachite bg-sand py-1 shadow-lg">
                    {LANGS.map((l) => (
                      <li key={l.code}>
                        <a
                          href={alternates[l.code] ?? paths[l.code].home}
                          hrefLang={l.code}
                          lang={l.code}
                          aria-current={l.code === lang ? "true" : undefined}
                          onClick={() => { document.cookie = `sr_lang=${l.code}; path=/; max-age=31536000; samesite=lax`; }}
                          className={`flex items-center justify-between gap-4 px-3 py-2.5 text-sm hover:bg-sand-200 ${l.code === lang ? "font-bold" : ""}`}
                        >
                          {l.name}<span className="eyebrow text-stone">{l.code.toUpperCase()}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <button type="button" onClick={() => openModal()} data-cursor={d.bookCursor} className="eyebrow hidden h-11 items-center gap-2 bg-magenta px-5 text-white hover:bg-magenta-deep sm:flex">
              <Nodo className="h-2 w-2" />{d.nav.book}
            </button>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center border-filo border-trachite lg:hidden"
              aria-expanded={menu}
              aria-controls="menu-mobile"
              aria-label={menu ? d.close : "Menu"}
              onClick={() => setMenu((m) => !m)}
            >
              <span className="relative block h-3 w-5" aria-hidden>
                <span className={`absolute left-0 top-0 h-[2px] w-5 bg-trachite transition-transform ${menu ? "translate-y-[5px] rotate-45" : ""}`} />
                <span className={`absolute bottom-0 left-0 h-[2px] w-5 bg-trachite transition-transform ${menu ? "-translate-y-[5px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </header>
      {menu && (
        <div id="menu-mobile" className="fixed inset-0 z-[49] flex flex-col bg-sand pt-20 lg:hidden">
          <nav aria-label="Menu mobile" className="wrap flex-1 overflow-auto">
            <ul className="divide-y divide-sand-300 border-y border-sand-300">
              {links.map((l, i) => (
                <li key={l.href}>
                  <a href={hrefOf(l)} onClick={(e) => go(e, l.href)} className="flex items-baseline justify-between py-4">
                    <span className="display text-[clamp(2.5rem,12vw,4rem)] leading-none">{l.label}</span>
                    <span className="eyebrow text-magenta-deep">0{i + 1}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="wrap pb-8 pt-6">
            <button type="button" onClick={() => { setMenu(false); openModal(); }} className="eyebrow flex h-16 w-full items-center justify-center gap-3 bg-magenta text-white"><Nodo className="h-2.5 w-2.5" />{d.ajo}</button>
          </div>
        </div>
      )}
    </>
  );
}
