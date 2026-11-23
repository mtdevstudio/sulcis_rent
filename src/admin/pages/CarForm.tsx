"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm, type Path } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { PublicCar } from "@/lib/types";
import { CarCard } from "@/components/car/CarCard";
import { ContactModalProvider } from "@/components/site/ContactModal";
import { LangProvider } from "@/components/site/LangContext";
import { api, ApiError, fmtDate, statusLabel, type AdminCar, type AdminPhoto, type CarStatus } from "../api";
import { ALink, setDirty } from "../AdminApp";
import { useCatalog } from "../useCatalog";
import { Btn, ChipsMulti, Field, Input, L10nInput, NumberInput, PageHeader, RichText, Section, Select, Spinner, StatusBadge, Switch, Textarea } from "../ui";
import { PhotoManager } from "./PhotoManager";

/* ---------- schema client (specchio del server, che resta l'autorità) ---------- */
const l10n = (max: number) => z.object({ it: z.string().max(max).optional(), en: z.string().max(max).optional() }).nullable().optional();
const int = (min: number, max: number) => z.number().int().min(min, `minimo ${min}`).max(max, `massimo ${max}`).nullable().optional();
const schema = z.object({
  brand: z.string().max(60), model: z.string().max(80), version: z.string().max(80),
  slug: z.string().max(90).regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, "solo minuscole, numeri e trattini"),
  category: z.string(), year: int(1950, 2100), colorName: z.string().max(40), colorHex: z.string().regex(/^$|^#[0-9a-fA-F]{6}$/, "colore #RRGGBB"),
  plate: z.string().max(16).regex(/^[A-Za-z0-9 -]*$/, "solo lettere, numeri, spazi e trattini"),
  status: z.enum(["draft", "published", "hidden"]), featured: z.boolean(), badge: z.string(),
  specs: z.object({
    fuel: z.string(), transmission: z.string(), seats: int(1, 60), doors: int(1, 9), luggageLarge: int(0, 30), luggageSmall: int(0, 30), luggageLiters: int(0, 20000),
    engineCc: int(0, 10000), powerCv: int(0, 2000), powerKw: int(0, 1500), drive: z.string(), consumption: z.string().max(40), euro: z.string().max(20),
    rangeKm: int(0, 3000), chargeTime: z.string().max(40), cargoM3: z.number().min(0).max(100).nullable().optional(), payloadKg: int(0, 20000), cargoLength: z.string().max(40), license: z.string().max(20),
  }),
  features: z.array(z.string()),
  rental: z.object({
    priceDay: z.number().min(0).nullable().optional(), priceWeek: z.number().min(0).nullable().optional(), priceMonth: z.number().min(0).nullable().optional(), showPrice: z.boolean(),
    priceNote: l10n(160), kmPerDay: int(0, 10000), kmUnlimited: z.boolean(), minAge: int(16, 99), minLicenseYears: int(0, 60),
    deposit: z.number().min(0).nullable().optional(), depositOnRequest: z.boolean(), creditCard: z.enum(["", "yes", "no"]),
    delivery: z.object({ home: z.boolean(), airport: z.boolean(), port: z.boolean(), note: l10n(200) }), insurance: l10n(200), hidden: z.array(z.string()),
  }),
  content: z.object({ short: l10n(200), long: z.object({ it: z.string().optional(), en: z.string().optional() }), highlights: z.array(l10n(80)) }),
  perfectFor: z.array(z.string()), whatsappMessage: l10n(500), seo: z.object({ title: l10n(70), description: l10n(170) }), internalNotes: z.string().max(5000),
});
type FV = z.infer<typeof schema>;

const empty: FV = {
  brand: "", model: "", version: "", slug: "", category: "", year: null, colorName: "", colorHex: "", plate: "", status: "draft", featured: false, badge: "",
  specs: { fuel: "", transmission: "", seats: null, doors: null, luggageLarge: null, luggageSmall: null, luggageLiters: null, engineCc: null, powerCv: null, powerKw: null, drive: "", consumption: "", euro: "", rangeKm: null, chargeTime: "", cargoM3: null, payloadKg: null, cargoLength: "", license: "" },
  features: [],
  rental: { priceDay: null, priceWeek: null, priceMonth: null, showPrice: false, priceNote: null, kmPerDay: null, kmUnlimited: false, minAge: null, minLicenseYears: null, deposit: null, depositOnRequest: false, creditCard: "", delivery: { home: false, airport: false, port: false, note: null }, insurance: null, hidden: [] },
  content: { short: null, long: { it: "", en: "" }, highlights: [null, null, null] }, perfectFor: [], whatsappMessage: null, seo: { title: null, description: null }, internalNotes: "",
};

function fromCar(c: AdminCar): FV {
  const s = c.specs as Record<string, unknown>; const r = c.rental as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v : ""); const num = (v: unknown) => (typeof v === "number" ? v : null);
  const hl = (c.content.highlights ?? []) as FV["content"]["highlights"];
  return {
    brand: c.brand, model: c.model, version: c.version ?? "", slug: c.slug, category: c.category ?? "", year: c.year, colorName: c.color?.name ?? "", colorHex: c.color?.hex ?? "",
    plate: c.plate ?? "", status: c.status, featured: c.featured, badge: c.badge ?? "",
    specs: Object.fromEntries(Object.entries(empty.specs).map(([k, v]) => [k, typeof v === "string" ? str(s[k]) : num(s[k])])) as FV["specs"],
    features: c.features ?? [],
    rental: {
      priceDay: num(r.priceDay), priceWeek: num(r.priceWeek), priceMonth: num(r.priceMonth), showPrice: !!r.showPrice, priceNote: (r.priceNote as FV["rental"]["priceNote"]) ?? null,
      kmPerDay: num(r.kmPerDay), kmUnlimited: !!r.kmUnlimited, minAge: num(r.minAge), minLicenseYears: num(r.minLicenseYears), deposit: num(r.deposit), depositOnRequest: !!r.depositOnRequest,
      creditCard: r.creditCard === true ? "yes" : r.creditCard === false ? "no" : "",
      delivery: { home: !!(r.delivery as Record<string, unknown>)?.home, airport: !!(r.delivery as Record<string, unknown>)?.airport, port: !!(r.delivery as Record<string, unknown>)?.port, note: ((r.delivery as Record<string, unknown>)?.note as FV["rental"]["priceNote"]) ?? null },
      insurance: (r.insurance as FV["rental"]["insurance"]) ?? null, hidden: (r.hidden as string[]) ?? [],
    },
    content: { short: (c.content.short as FV["content"]["short"]) ?? null, long: { it: c.content.long?.it ?? "", en: c.content.long?.en ?? "" }, highlights: [hl[0] ?? null, hl[1] ?? null, hl[2] ?? null] },
    perfectFor: c.perfectFor ?? [], whatsappMessage: (c.whatsappMessage as FV["whatsappMessage"]) ?? null,
    seo: { title: (c.seo?.title as FV["seo"]["title"]) ?? null, description: (c.seo?.description as FV["seo"]["description"]) ?? null }, internalNotes: c.internalNotes ?? "",
  };
}

const clean = (v: unknown): unknown => {
  if (v === "" || v === undefined) return null;
  if (Array.isArray(v)) return v.map(clean).filter((x) => x !== null);
  if (v && typeof v === "object") {
    const o = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)]).filter(([, x]) => x !== null));
    return Object.keys(o).length ? o : null;
  }
  return v;
};
function toPayload(v: FV) {
  return {
    brand: v.brand, model: v.model, version: v.version || null, slug: v.slug || null, category: v.category || null, year: v.year ?? null,
    color: clean({ name: v.colorName, hex: v.colorHex }), plate: v.plate || null, status: v.status, featured: v.featured, badge: v.badge || null,
    specs: clean(v.specs) ?? {}, features: v.features,
    rental: { ...((clean({ ...v.rental, creditCard: undefined }) as object) ?? {}), showPrice: v.rental.showPrice, kmUnlimited: v.rental.kmUnlimited, depositOnRequest: v.rental.depositOnRequest, ...(v.rental.creditCard ? { creditCard: v.rental.creditCard === "yes" } : {}) },
    content: clean({ short: v.content.short, long: v.content.long, highlights: v.content.highlights }) ?? {},
    perfectFor: v.perfectFor, whatsappMessage: clean(v.whatsappMessage), seo: clean(v.seo), internalNotes: v.internalNotes || null,
  };
}
const slugify = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

/** Anteprima card: stessa mappatura del server (solo campi pubblici). */
function previewCar(v: FV, photos: AdminPhoto[]): PublicCar {
  const r = v.rental;
  const rental: PublicCar["rental"] = {};
  if (r.showPrice && !r.hidden.includes("price")) { if (r.priceDay != null) rental.priceDay = r.priceDay; if (r.priceWeek != null) rental.priceWeek = r.priceWeek; if (r.priceMonth != null) rental.priceMonth = r.priceMonth; }
  const specs = Object.fromEntries(Object.entries(v.specs).filter(([, x]) => x !== "" && x != null)) as PublicCar["specs"];
  return {
    id: 0, slug: v.slug || "anteprima", brand: v.brand || "Marca", model: v.model || "Modello", category: v.category, specs, features: v.features, rental,
    content: { short: v.content.short?.it ? { it: v.content.short.it, en: v.content.short.en } : undefined }, perfectFor: v.perfectFor, badge: (v.badge || undefined) as PublicCar["badge"],
    featured: v.featured, order: 0, images: photos.map((p, i) => ({ base: p.base, widths: p.widths, w: p.w, h: p.h, alt: { it: p.alt.it || `${v.brand} ${v.model} – vista ${i + 1}` } })),
  };
}

const STEPS = ["Identità", "Foto", "Tecnica", "Dotazioni", "Noleggio", "Contenuti", "Pubblicazione"];

export function CarForm() {
  const sp = useSearchParams();
  const router = useRouter();
  const catalog = useCatalog();
  const idParam = sp.get("id");
  const [carId, setCarId] = useState<number | null>(idParam ? Number(idParam) : null);
  const [car, setCar] = useState<AdminCar | null>(null);
  const [photos, setPhotos] = useState<AdminPhoto[]>([]);
  const [loading, setLoading] = useState(!!idParam);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!idParam);
  const [step, setStep] = useState(0);
  const form = useForm<FV>({ resolver: zodResolver(schema), defaultValues: empty, mode: "onBlur" });
  const { register, control, watch, setValue, reset, handleSubmit, setError, formState } = form;
  const v = watch();

  useEffect(() => { setDirty(formState.isDirty); return () => setDirty(false); }, [formState.isDirty]);

  const load = useCallback(async (id: number) => {
    try {
      const r = await api<{ car: AdminCar }>("GET", `admin/cars.php?id=${id}`);
      setCar(r.car); setPhotos(r.car.photos); reset(fromCar(r.car));
    } catch (e) { toast.error((e as Error).message); router.push("/admin/auto/"); }
    finally { setLoading(false); }
  }, [reset, router]);
  useEffect(() => { if (carId) void load(carId); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // slug automatico da marca + modello finché non lo modifichi a mano
  useEffect(() => { if (!slugTouched) setValue("slug", slugify(`${v.brand} ${v.model}`)); }, [v.brand, v.model, slugTouched, setValue]);

  const applyServerErrors = (e: ApiError) => {
    const map: Record<string, Path<FV>> = { brand: "brand", model: "model", category: "category", slug: "slug", plate: "plate", year: "year" };
    Object.entries(e.fields).forEach(([k, msg]) => { const key = map[k] ?? (k.replace(/\.(\d+)$/, "") as Path<FV>); try { setError(key, { message: msg }); } catch { /* campo non mappato */ } });
  };

  const save = async (values: FV, statusOverride?: CarStatus): Promise<AdminCar | null> => {
    setSaving(true);
    const body = toPayload({ ...values, status: statusOverride ?? values.status });
    try {
      const r = carId ? await api<{ car: AdminCar }>("PUT", `admin/cars.php?id=${carId}`, body) : await api<{ car: AdminCar }>("POST", "admin/cars.php", { ...body, status: body.status === "published" ? "draft" : body.status });
      setCar(r.car); setPhotos(r.car.photos); reset(fromCar(r.car)); setSlugTouched(true);
      if (!carId) { setCarId(r.car.id); history.replaceState(null, "", `/admin/auto/modifica/?id=${r.car.id}`); }
      toast.success(r.car.status === "published" ? "Salvata: le modifiche sono già sul sito" : "Salvata");
      return r.car;
    } catch (e) {
      const err = e as ApiError;
      applyServerErrors(err);
      toast.error(err.message + (Object.keys(err.fields).length ? ` — ${Object.entries(err.fields).map(([k, m]) => `${k}: ${m}`).join("; ")}` : ""));
      return null;
    } finally { setSaving(false); }
  };

  const onSubmit = handleSubmit((vals) => save(vals), () => toast.error("Controlla i campi evidenziati"));
  const ensureCar = async () => { const c = await save(form.getValues()); return c?.id ?? null; };
  const carName = `${v.brand} ${v.model}`.trim() || "Auto";

  const cats = catalog?.categories ?? [];
  const featureOpts = (catalog?.features ?? []).map((f) => ({ key: f.key, label: f.label.it }));
  const tagOpts = (catalog?.tags ?? []).map((f) => ({ key: f.key, label: f.label.it }));
  const isVan = v.category === "furgone";
  const isEv = v.category === "elettrica" || v.specs.fuel === "elettrica";
  const err = formState.errors;
  const hiddenToggle = (key: string) => (
    <label className="flex items-center gap-2 text-xs text-stone">
      <input type="checkbox" className="h-4 w-4" checked={!v.rental.hidden.includes(key)} onChange={(e) => setValue("rental.hidden", e.target.checked ? v.rental.hidden.filter((x) => x !== key) : [...v.rental.hidden, key], { shouldDirty: true })} />
      mostra sul sito
    </label>
  );
  const publishMissing = useMemo(() => [!v.brand && "marca", !v.model && "modello", !v.category && "categoria", !photos.length && "almeno una foto"].filter(Boolean) as string[], [v.brand, v.model, v.category, photos.length]);
  const shown = (i: number) => (step === i ? "" : "max-md:hidden");

  if (loading) return <Spinner />;

  return (
    <form onSubmit={onSubmit} noValidate>
      <PageHeader title={carId ? carName : "Nuova auto"} back={<ALink href="/admin/auto/" className="eyebrow mb-2 inline-block text-stone hover:text-trachite">← Tutte le auto</ALink>}>
        {car && <StatusBadge status={car.status} />}
        {carId && <ALink href={`/admin/anteprima/?id=${carId}`} className="eyebrow inline-flex h-12 items-center border-filo border-trachite px-4">Anteprima</ALink>}
      </PageHeader>
      {car && <p className="-mt-4 mb-5 text-xs text-stone">Creata {fmtDate(car.createdAt)} · modificata {fmtDate(car.updatedAt)}{car.updatedBy ? ` da ${car.updatedBy.name}` : ""}</p>}

      {/* step mobile */}
      <nav aria-label="Passi" className="-mx-4 mb-4 flex gap-1 overflow-x-auto px-4 md:hidden">
        {STEPS.map((s, i) => (
          <button key={s} type="button" onClick={() => setStep(i)} aria-current={step === i ? "step" : undefined}
            className={`h-10 shrink-0 px-3 text-xs font-bold uppercase ${step === i ? "bg-trachite text-sand" : "border-filo border-sand-300 bg-white"}`}>{i + 1}. {s}</button>
        ))}
      </nav>

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <div className={shown(0)}>
            <Section title="Identità" subtitle="Marca, modello e categoria servono per pubblicare">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Marca *" error={err.brand?.message}>{(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!err.brand} {...register("brand")} autoCapitalize="words" />}</Field>
                <Field label="Modello *" error={err.model?.message}>{(id, d) => <Input id={id} aria-describedby={d} aria-invalid={!!err.model} {...register("model")} />}</Field>
                <Field label="Versione / allestimento" hint="Es. 1.2 Lounge">{(id) => <Input id={id} {...register("version")} />}</Field>
                <Field label="Categoria *" error={err.category?.message}>{(id) => (
                  <Select id={id} aria-invalid={!!err.category} {...register("category")}>
                    <option value="">— scegli —</option>
                    {cats.filter((c) => c.active !== false || c.key === v.category).map((c) => <option key={c.key} value={c.key}>{c.label.it}</option>)}
                  </Select>
                )}</Field>
                <Field label="Indirizzo della pagina (slug)" hint={`sulcisrent.it/flotta/${v.slug || "…"}/`} error={err.slug?.message}>{(id, d) => (
                  <Input id={id} aria-describedby={d} aria-invalid={!!err.slug} {...register("slug", { onChange: () => setSlugTouched(true) })} autoCapitalize="none" />
                )}</Field>
                <Field label="Anno di immatricolazione" error={err.year?.message}>{(id) => <Controller control={control} name="year" render={({ field }) => <NumberInput id={id} value={field.value} onChange={field.onChange} maxLength={4} />} />}</Field>
                <Field label="Colore">{(id) => <Input id={id} {...register("colorName")} placeholder="Es. Bianco ghiaccio" />}</Field>
                <Field label="Swatch colore" error={err.colorHex?.message}>{(id) => (
                  <div className="flex gap-2"><input type="color" aria-label="Scegli colore" className="h-12 w-14 border-filo border-trachite" value={v.colorHex || "#ffffff"} onChange={(e) => setValue("colorHex", e.target.value, { shouldDirty: true })} /><Input id={id} {...register("colorHex")} placeholder="#RRGGBB" /></div>
                )}</Field>
                <Field label="Targa (solo interna, mai sul sito)" error={err.plate?.message}>{(id) => <Input id={id} {...register("plate")} autoCapitalize="characters" className="uppercase" />}</Field>
              </div>
            </Section>
          </div>

          <div className={shown(1)}>
            <Section title="Foto" subtitle="Almeno una per pubblicare · la prima è la copertina" badge={<span className="eyebrow text-stone">{photos.length}</span>}>
              <PhotoManager carId={carId} photos={photos} setPhotos={setPhotos} carName={carName} ensureCar={ensureCar} />
            </Section>
          </div>

          <div className={shown(2)}>
            <Section title="Caratteristiche tecniche" open={!carId || !!v.specs.seats}>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <Field label="Alimentazione">{(id) => <Select id={id} {...register("specs.fuel")}><option value="">—</option>{[["benzina", "Benzina"], ["diesel", "Diesel"], ["gpl", "GPL"], ["metano", "Metano"], ["ibrida", "Ibrida"], ["ibrida-plugin", "Ibrida plug-in"], ["elettrica", "Elettrica"]].map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select>}</Field>
                <Field label="Cambio">{(id) => <Select id={id} {...register("specs.transmission")}><option value="">—</option><option value="manuale">Manuale</option><option value="automatico">Automatico</option></Select>}</Field>
                <Field label="Trazione">{(id) => <Select id={id} {...register("specs.drive")}><option value="">—</option><option value="anteriore">Anteriore</option><option value="posteriore">Posteriore</option><option value="4x4">4x4</option></Select>}</Field>
                {([["seats", "Posti"], ["doors", "Porte"], ["luggageLarge", "Valigie grandi"], ["luggageSmall", "Valigie piccole"], ["luggageLiters", "Bagagliaio (litri)"], ["engineCc", "Cilindrata (cc)"], ["powerCv", "Potenza (CV)"], ["powerKw", "Potenza (kW)"]] as const).map(([k, l]) => (
                  <Field key={k} label={l} error={err.specs?.[k]?.message}>{(id) => <Controller control={control} name={`specs.${k}`} render={({ field }) => <NumberInput id={id} value={field.value} onChange={field.onChange} />} />}</Field>
                ))}
                <Field label="Consumo medio" hint="Es. 5,2 l/100 km">{(id) => <Input id={id} {...register("specs.consumption")} />}</Field>
                <Field label="Classe Euro">{(id) => <Input id={id} {...register("specs.euro")} placeholder="Euro 6d" />}</Field>
              </div>
              {isEv && (
                <div className="grid gap-4 border-t border-sand-300 pt-4 sm:grid-cols-2">
                  <p className="eyebrow sm:col-span-2">Elettrica</p>
                  <Field label="Autonomia (km)">{(id) => <Controller control={control} name="specs.rangeKm" render={({ field }) => <NumberInput id={id} value={field.value} onChange={field.onChange} />} />}</Field>
                  <Field label="Tempo di ricarica">{(id) => <Input id={id} {...register("specs.chargeTime")} placeholder="Es. 30 min (DC 10–80%)" />}</Field>
                </div>
              )}
              {isVan && (
                <div className="grid gap-4 border-t border-sand-300 pt-4 sm:grid-cols-2">
                  <p className="eyebrow sm:col-span-2">Furgone</p>
                  <Field label="Volume di carico (m³)">{(id) => <Controller control={control} name="specs.cargoM3" render={({ field }) => <NumberInput id={id} decimal value={field.value} onChange={field.onChange} />} />}</Field>
                  <Field label="Portata (kg)">{(id) => <Controller control={control} name="specs.payloadKg" render={({ field }) => <NumberInput id={id} value={field.value} onChange={field.onChange} />} />}</Field>
                  <Field label="Lunghezza del vano">{(id) => <Input id={id} {...register("specs.cargoLength")} placeholder="Es. 3,1 m" />}</Field>
                  <Field label="Patente richiesta">{(id) => <Input id={id} {...register("specs.license")} placeholder="B" />}</Field>
                </div>
              )}
            </Section>
          </div>

          <div className={shown(3)}>
            <Section title="Dotazioni" open={!carId || v.features.length > 0} badge={<span className="eyebrow text-stone">{v.features.length}</span>}>
              <ChipsMulti label="Seleziona le dotazioni presenti" options={featureOpts} value={v.features} onChange={(x) => setValue("features", x, { shouldDirty: true })} />
            </Section>
          </div>

          <div className={shown(4)}>
            <Section title="Condizioni di noleggio" subtitle="Tutto facoltativo · per ogni voce scegli se mostrarla">
              <div className="border-filo border-sand-300 p-4">
                <Switch label="Mostra prezzo sul sito" hint="Se spento compare «Chiedi il prezzo»" checked={v.rental.showPrice} onChange={(x) => setValue("rental.showPrice", x, { shouldDirty: true })} />
                <div className="mt-2 grid gap-4 sm:grid-cols-3">
                  {([["priceDay", "A partire da · giorno (€)"], ["priceWeek", "· settimana (€)"], ["priceMonth", "· mese (€)"]] as const).map(([k, l]) => (
                    <Field key={k} label={l}>{(id) => <Controller control={control} name={`rental.${k}`} render={({ field }) => <NumberInput id={id} decimal value={field.value} onChange={field.onChange} />} />}</Field>
                  ))}
                </div>
                <div className="mt-4"><Controller control={control} name="rental.priceNote" render={({ field }) => <L10nInput label="Nota prezzo" value={field.value} onChange={field.onChange} max={160} hint="Es. Varia in base alla stagione" />} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border-filo border-sand-300 p-4">
                  <div className="flex items-center justify-between"><p className="font-semibold">Chilometri</p>{hiddenToggle("km")}</div>
                  <Switch label="Chilometraggio illimitato" checked={v.rental.kmUnlimited} onChange={(x) => setValue("rental.kmUnlimited", x, { shouldDirty: true })} />
                  {!v.rental.kmUnlimited && <Field label="Km inclusi al giorno">{(id) => <Controller control={control} name="rental.kmPerDay" render={({ field }) => <NumberInput id={id} value={field.value} onChange={field.onChange} />} />}</Field>}
                </div>
                <div className="border-filo border-sand-300 p-4">
                  <div className="flex items-center justify-between"><p className="font-semibold">Cauzione</p>{hiddenToggle("deposit")}</div>
                  <Switch label="Su richiesta" checked={v.rental.depositOnRequest} onChange={(x) => setValue("rental.depositOnRequest", x, { shouldDirty: true })} />
                  {!v.rental.depositOnRequest && <Field label="Importo (€)">{(id) => <Controller control={control} name="rental.deposit" render={({ field }) => <NumberInput id={id} decimal value={field.value} onChange={field.onChange} />} />}</Field>}
                </div>
                <div className="border-filo border-sand-300 p-4">
                  <div className="flex items-center justify-between"><p className="font-semibold">Età minima</p>{hiddenToggle("minAge")}</div>
                  <Field label="Anni" error={err.rental?.minAge?.message}>{(id) => <Controller control={control} name="rental.minAge" render={({ field }) => <NumberInput id={id} value={field.value} onChange={field.onChange} />} />}</Field>
                </div>
                <div className="border-filo border-sand-300 p-4">
                  <div className="flex items-center justify-between"><p className="font-semibold">Patente da almeno</p>{hiddenToggle("minLicenseYears")}</div>
                  <Field label="Anni">{(id) => <Controller control={control} name="rental.minLicenseYears" render={({ field }) => <NumberInput id={id} value={field.value} onChange={field.onChange} />} />}</Field>
                </div>
                <div className="border-filo border-sand-300 p-4">
                  <div className="flex items-center justify-between"><p className="font-semibold">Carta di credito</p>{hiddenToggle("creditCard")}</div>
                  <Field label="Richiesta?">{(id) => <Select id={id} {...register("rental.creditCard")}><option value="">Non indicato</option><option value="yes">Sì, richiesta</option><option value="no">No, non richiesta</option></Select>}</Field>
                </div>
                <div className="border-filo border-sand-300 p-4">
                  <div className="flex items-center justify-between"><p className="font-semibold">Consegna</p>{hiddenToggle("delivery")}</div>
                  {([["home", "A domicilio"], ["airport", "In aeroporto"], ["port", "Al porto"]] as const).map(([k, l]) => (
                    <Switch key={k} label={l} checked={v.rental.delivery[k]} onChange={(x) => setValue(`rental.delivery.${k}`, x, { shouldDirty: true })} />
                  ))}
                  <Controller control={control} name="rental.delivery.note" render={({ field }) => <L10nInput label="Nota consegna" value={field.value} onChange={field.onChange} max={200} hint="Es. Carloforte, Sant'Antioco…" />} />
                </div>
              </div>
              <div className="flex items-start gap-4"><div className="flex-1"><Controller control={control} name="rental.insurance" render={({ field }) => <L10nInput label="Assicurazioni incluse" value={field.value} onChange={field.onChange} max={200} />} /></div><div className="pt-1">{hiddenToggle("insurance")}</div></div>
            </Section>
          </div>

          <div className={shown(5)}>
            <Section title="Contenuti" subtitle="Italiano e inglese">
              <Controller control={control} name="content.short" render={({ field }) => <L10nInput label="Descrizione breve" value={field.value} onChange={field.onChange} max={200} hint="Max ~160 caratteri: card e meta description" />} />
              <div className="grid gap-4 md:grid-cols-2">
                <Controller control={control} name="content.long.it" render={({ field }) => <RichText label="Descrizione lunga (italiano)" value={field.value ?? ""} onChange={(h) => field.onChange(h)} />} />
                <Controller control={control} name="content.long.en" render={({ field }) => <RichText label="Descrizione lunga (inglese)" value={field.value ?? ""} onChange={(h) => field.onChange(h)} />} />
              </div>
              <ChipsMulti label="Perfetta per…" options={tagOpts} value={v.perfectFor} onChange={(x) => setValue("perfectFor", x, { shouldDirty: true })} />
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold">Punti di forza (fino a 3 righe brevi)</legend>
                {[0, 1, 2].map((i) => <Controller key={i} control={control} name={`content.highlights.${i}`} render={({ field }) => <L10nInput label={`Punto ${i + 1}`} value={field.value} onChange={field.onChange} max={80} hint={i === 0 ? "Es. Consumi bassissimi" : undefined} />} />)}
              </fieldset>
              <Field label="Badge">{(id) => <Select id={id} {...register("badge")}><option value="">Nessuno</option><option value="new">Nuova</option><option value="popular">Più richiesta</option><option value="offer">Offerta</option><option value="latest">Ultima arrivata</option></Select>}</Field>
              <Controller control={control} name="whatsappMessage" render={({ field }) => <L10nInput label="Messaggio WhatsApp personalizzato" value={field.value} onChange={field.onChange} max={500} multiline hint={`Se vuoto: «Ciao Sulcis Rent! Vorrei informazioni per noleggiare la ${carName}. Mi dite disponibilità e prezzo?»`} />} />
              <div className="border-t border-sand-300 pt-4">
                <p className="eyebrow mb-3">SEO (precompilato in automatico se vuoto)</p>
                <Controller control={control} name="seo.title" render={({ field }) => <L10nInput label="Meta title" value={field.value} onChange={field.onChange} max={70} hint={`Automatico: «Noleggio ${carName} · … a San Giovanni Suergiu»`} />} />
                <div className="mt-4"><Controller control={control} name="seo.description" render={({ field }) => <L10nInput label="Meta description" value={field.value} onChange={field.onChange} max={170} multiline hint="Automatico: la descrizione breve" />} /></div>
              </div>
            </Section>
          </div>

          <div className={shown(6)}>
            <Section title="Pubblicazione">
              <Field label="Stato">{(id) => (
                <Select id={id} {...register("status")}>
                  {(["draft", "published", "hidden"] as const).map((s) => <option key={s} value={s}>{statusLabel[s]}{s === "hidden" ? " (non visibile, non eliminata)" : ""}</option>)}
                </Select>
              )}</Field>
              {v.status === "published" && publishMissing.length > 0 && <p role="alert" className="text-sm font-semibold text-[#9F1239]">Per pubblicare manca: {publishMissing.join(", ")}.</p>}
              <Switch label="In evidenza in home" checked={v.featured} onChange={(x) => setValue("featured", x, { shouldDirty: true })} />
              <Field label="Note interne (mai pubbliche)">{(id) => <Textarea id={id} {...register("internalNotes")} placeholder="Es. tagliando a marzo, graffio portiera dx…" />}</Field>
              <p className="text-xs text-stone">L&apos;ordine sul sito si cambia trascinando le righe nella lista auto.</p>
            </Section>
          </div>
        </div>

        <aside className="max-xl:hidden">
          <div className="sticky top-6 space-y-3">
            <p className="eyebrow">Anteprima card</p>
            <LangProvider lang="it"><ContactModalProvider><CarCard car={previewCar(v, photos)} categories={cats.map((c) => ({ key: c.key, label: c.label }))} preview /></ContactModalProvider></LangProvider>
          </div>
        </aside>
      </div>

      {/* barra salvataggio (sticky) */}
      <div className="sticky bottom-16 z-sticky -mx-4 mt-6 flex items-center gap-2 border-t-filo border-trachite bg-sand/95 px-4 py-3 backdrop-blur lg:bottom-0 md:-mx-8 md:px-8">
        <div className="flex gap-2 md:hidden">
          <Btn variant="ghost" size="md" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} aria-label="Passo precedente">←</Btn>
          <Btn variant="ghost" size="md" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1} aria-label="Passo successivo">→</Btn>
        </div>
        <span className="hidden text-sm text-stone md:block">{formState.isDirty ? "Modifiche non salvate" : "Tutto salvato"}</span>
        <div className="ml-auto flex gap-2">
          {car?.status !== "published" && carId && (
            <Btn variant="blue" size="md" disabled={saving || publishMissing.length > 0} onClick={() => handleSubmit((vals) => save(vals, "published"))()} title={publishMissing.length ? `Manca: ${publishMissing.join(", ")}` : undefined}>Pubblica</Btn>
          )}
          <Btn type="submit" variant="primary" size="md" disabled={saving}>{saving ? "Salvo…" : carId ? "Salva" : "Salva bozza"}</Btn>
        </div>
      </div>
    </form>
  );
}
