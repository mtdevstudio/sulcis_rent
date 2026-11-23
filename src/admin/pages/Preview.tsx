"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { CatalogItem, PublicCar } from "@/lib/types";
import { CarDetail } from "@/components/car/CarDetail";
import { ContactModalProvider } from "@/components/site/ContactModal";
import { LangProvider } from "@/components/site/LangContext";
import { api, statusLabel, type CarStatus } from "../api";
import { ALink } from "../AdminApp";
import { Spinner } from "../ui";

/** Anteprima della scheda pubblica (anche bozze e nascoste): dati dall'endpoint protetto preview.php. */
export function Preview() {
  const id = useSearchParams().get("id");
  const [lang, setLang] = useState<"it" | "en">("it");
  const [d, setD] = useState<{ car: PublicCar; status: CarStatus; catalog: { categories: CatalogItem[]; features: CatalogItem[]; tags: CatalogItem[] } } | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => { if (id) api<typeof d>("GET", `admin/preview.php?id=${id}`).then(setD).catch((e) => setErr(e.message)); }, [id]);
  if (err) return <p role="alert">{err}</p>;
  if (!d) return <Spinner />;
  return (
    <div className="-mx-4 -my-6 md:-mx-8 md:-my-10">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-filo border-trachite bg-white px-4 py-3">
        <ALink href={`/admin/auto/modifica/?id=${id}`} className="eyebrow">← Torna alla modifica</ALink>
        <span className="text-sm">Stato: <strong>{statusLabel[d.status]}</strong></span>
        <div className="flex border-filo border-trachite text-xs font-bold" role="group" aria-label="Lingua anteprima">
          {(["it", "en"] as const).map((l) => <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)} className={`h-9 px-3 uppercase ${lang === l ? "bg-trachite text-sand" : ""}`}>{l}</button>)}
        </div>
      </div>
      <div className="bg-sand">
        <LangProvider lang={lang}><ContactModalProvider><CarDetail car={d.car} preview catalog={d.catalog} /></ContactModalProvider></LangProvider>
      </div>
    </div>
  );
}
