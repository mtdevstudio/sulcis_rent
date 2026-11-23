"use client";
import Link from "next/link";
import { useRef } from "react";
import { badgeLabel, categories as baseCats } from "@/data/catalog";
import { carName, euro, keySpecs, priceFrom } from "@/lib/car";
import { paths, t, tr } from "@/lib/i18n";
import type { CatalogItem, PublicCar } from "@/lib/types";
import { useTransitionNavigate } from "@/lib/viewTransition";
import { useContactModal } from "@/components/site/ContactModal";
import { useLang } from "@/components/site/LangContext";
import { Trama } from "@/components/trama/Trama";
import { IconFuel, IconGear, IconSeats, Nodo } from "@/components/ui/icons";
import { CarImage } from "./CarImage";

const icons = { seats: IconSeats, gear: IconGear, fuel: IconFuel };

export function CarCard({ car, categories = baseCats, index = 0, preview = false }: { car: PublicCar; categories?: CatalogItem[]; index?: number; preview?: boolean }) {
  const lang = useLang();
  const d = t(lang);
  const open = useContactModal(car.slug);
  const nav = useTransitionNavigate();
  const imgRef = useRef<HTMLDivElement>(null);
  const href = paths[lang].car(car.slug);
  const cat = categories.find((c) => c.key === car.category);
  const price = priceFrom(car);
  const specs = keySpecs(car, lang);
  const unit = price ? { day: d.perDay, week: d.perWeek, month: d.perMonth }[price.unit] : "";
  const tone = index % 3 === 1 ? "bg-magenta" : "bg-blue";

  const go = (e: React.MouseEvent) => {
    if (preview || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    nav(href, () => {
      document.querySelectorAll<HTMLElement>("[style*='car-hero']").forEach((el) => (el.style.viewTransitionName = "none"));
      if (imgRef.current) imgRef.current.style.viewTransitionName = "car-hero";
    });
  };

  return (
    <article className="group relative flex flex-col border-filo border-trachite bg-sand">
      <Link href={href} onClick={go} data-cursor={d.look} className="relative block aspect-[4/3] overflow-hidden" aria-label={`${carName(car)} – ${tr(cat?.label, lang)}`} tabIndex={preview ? -1 : 0}>
        <div ref={imgRef} className={`absolute inset-0 ${tone}`}>
          <Trama motif="pibiones" fg="sand" cell={12} opacity={0.3} className="transition-transform duration-slow ease-trama group-hover:scale-110" />
          <CarImage image={car.images[0]} lang={lang} className="relative h-full w-full object-cover transition-transform duration-slow ease-trama group-hover:scale-[1.04]" />
        </div>
        <span className="eyebrow absolute left-3 top-3 bg-sand px-2 py-1">{tr(cat?.label, lang) || car.category}</span>
        {car.badge && <span className="eyebrow absolute right-3 top-3 bg-trachite px-2 py-1 text-sand">{badgeLabel[car.badge]?.[lang]}</span>}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="display text-d-s">
            <Link href={href} onClick={go} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none" tabIndex={-1}>{carName(car)}</Link>
          </h3>
          {price ? (
            <p className="shrink-0 text-right text-sm"><span className="text-stone">{d.from} </span><strong className="text-lg">{euro(price.amount, lang)}</strong><span className="text-stone">{unit}</span></p>
          ) : (
            <p className="shrink-0 pt-1 text-sm font-semibold text-magenta-deep">{d.askPrice}</p>
          )}
        </div>
        {car.content.short && <p className="mt-2 line-clamp-2 text-sm text-stone">{tr(car.content.short, lang)}</p>}
        {specs.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t-filo border-trachite pt-4 text-sm">
            {specs.map((s) => { const I = icons[s.icon]; return <li key={s.icon} className="flex items-center gap-2"><I />{s.label}</li>; })}
          </ul>
        )}
        <div className="mt-auto pt-5">
          <button
            type="button"
            onClick={() => open(car)}
            data-cursor={d.bookCursor}
            className="relative z-[1] flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden bg-magenta text-sm font-bold uppercase tracking-[0.08em] text-white before:absolute before:inset-0 before:origin-left before:scale-x-0 before:bg-magenta-deep before:transition-transform before:duration-base before:ease-trama hover:before:scale-x-100"
          >
            <Nodo className="relative h-2.5 w-2.5" /><span className="relative">{d.want}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
