"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, ApiError, type Catalog, type CatalogItem } from "../api";
import { useAdmin } from "../AdminApp";
import { invalidateCatalog } from "../useCatalog";
import { Btn, Field, Input, L10nInput, PageHeader, Section, Spinner } from "../ui";

type Contact = { phoneDisplay: string; phoneE164: string; whatsappNumber: string; whatsappMessage?: { it?: string; en?: string } | null; address: { street: string; postalCode: string; city: string; province: string; region: string };
  hours?: { it?: string; en?: string } | null; deliveryAreas?: { it?: string; en?: string }[]; instagram?: string; facebook?: string; googleReviewsUrl?: string; vat?: string; email?: string };

function CatalogList({ title, items, onChange }: { title: string; items: CatalogItem[]; onChange: (x: CatalogItem[]) => void }) {
  const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const [n, setN] = useState("");
  return (
    <div>
      <p className="mb-2 font-semibold">{title}</p>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={it.key} className="grid gap-2 border-filo border-sand-300 bg-white p-2 sm:grid-cols-[1fr_1fr_auto]">
            <label className="sr-only" htmlFor={`${title}-${it.key}-it`}>Nome italiano</label>
            <Input id={`${title}-${it.key}-it`} value={it.label.it} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, label: { ...x.label, it: e.target.value } } : x)))} />
            <label className="sr-only" htmlFor={`${title}-${it.key}-en`}>Nome inglese</label>
            <Input id={`${title}-${it.key}-en`} placeholder="EN" value={it.label.en ?? ""} onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, label: { ...x.label, en: e.target.value } } : x)))} />
            <div className="flex gap-1">
              {"active" in it && <Btn size="sm" variant="ghost" onClick={() => onChange(items.map((x, j) => (j === i ? { ...x, active: x.active === false } : x)))}>{it.active === false ? "Riattiva" : "Disattiva"}</Btn>}
              <Btn size="sm" variant="ghost" onClick={() => confirm(`Togliere «${it.label.it}»? Le auto che la usano non la mostreranno più.`) && onChange(items.filter((_, j) => j !== i))} aria-label={`Rimuovi ${it.label.it}`}>✕</Btn>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <label className="sr-only" htmlFor={`${title}-new`}>Nuova voce</label>
        <Input id={`${title}-new`} placeholder="Nuova voce…" value={n} onChange={(e) => setN(e.target.value)} />
        <Btn variant="ghost" onClick={() => { const k = slug(n); if (!k || items.some((x) => x.key === k)) return toast.error("Nome vuoto o già presente"); onChange([...items, { key: k, label: { it: n.trim() }, ...(title === "Categorie" ? { active: true } : {}) }]); setN(""); }}>Aggiungi</Btn>
      </div>
    </div>
  );
}

export function Settings() {
  const { me } = useAdmin();
  const [c, setC] = useState<Contact | null>(null);
  const [cat, setCat] = useState<Catalog | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => { api<{ contact: Contact; catalog: Catalog }>("GET", "admin/settings.php").then((r) => { setC(r.contact); setCat(r.catalog); }).catch((e) => toast.error(e.message)); }, []);
  if (me.user.role !== "owner") return <p>Sezione riservata al titolare.</p>;
  if (!c || !cat) return <Spinner />;
  const set = (k: keyof Contact, v: unknown) => setC({ ...c, [k]: v });
  const saveContact = async () => {
    const body = { ...c, deliveryAreas: (c.deliveryAreas ?? []).filter((a) => (a.it ?? "").trim()).map((a) => ({ it: a.it!.trim(), ...(a.en?.trim() ? { en: a.en.trim() } : {}) })) };
    try { const r = await api<{ contact: Contact }>("PUT", "admin/settings.php", body); setC(r.contact); setErrors({}); toast.success("Contatti aggiornati sul sito"); }
    catch (e) { setErrors((e as ApiError).fields); toast.error((e as Error).message); }
  };
  const saveCatalog = async () => {
    try { const r = await api<{ catalog: Catalog }>("PUT", "admin/catalog.php", cat); setCat(r.catalog); invalidateCatalog(); toast.success("Catalogo aggiornato"); }
    catch (e) { toast.error((e as Error).message); }
  };
  return (
    <>
      <PageHeader title="Impostazioni" />
      <div className="space-y-4">
        <Section title="Contatti e WhatsApp" subtitle="Usati in tutto il sito (sostituiscono quelli del build)">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Telefono (come si legge)" error={errors.phoneDisplay}>{(id) => <Input id={id} inputMode="tel" value={c.phoneDisplay} onChange={(e) => set("phoneDisplay", e.target.value)} />}</Field>
            <Field label="Telefono internazionale" hint="+393313906076" error={errors.phoneE164}>{(id) => <Input id={id} inputMode="tel" value={c.phoneE164} onChange={(e) => set("phoneE164", e.target.value)} />}</Field>
            <Field label="Numero WhatsApp" hint="393313906076 (senza +)" error={errors.whatsappNumber}>{(id) => <Input id={id} inputMode="numeric" value={c.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} />}</Field>
          </div>
          <L10nInput label="Messaggio WhatsApp standard" multiline max={500} value={c.whatsappMessage ?? null} onChange={(v) => set("whatsappMessage", v)} />
          <div className="grid gap-4 md:grid-cols-5">
            {(["street", "postalCode", "city", "province", "region"] as const).map((k) => (
              <Field key={k} label={{ street: "Indirizzo", postalCode: "CAP", city: "Comune", province: "Prov.", region: "Regione" }[k]} error={errors[`address.${k}`]} className={k === "street" ? "md:col-span-2" : ""}>
                {(id) => <Input id={id} value={c.address[k]} onChange={(e) => set("address", { ...c.address, [k]: e.target.value })} />}
              </Field>
            ))}
          </div>
          <L10nInput label="Orari" max={120} value={c.hours ?? null} onChange={(v) => set("hours", v)} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Zone di consegna confermate (una per riga, italiano)" hint="Es. Aeroporto di Olbia. Lascia vuoto se non consegnate fuori sede: il sito non prometterà consegne." error={errors.deliveryAreas}>
              {(id) => <textarea id={id} className="block min-h-[7rem] w-full border-filo border-trachite bg-white p-3" value={(c.deliveryAreas ?? []).map((a) => a.it ?? "").join("\n")}
                onChange={(e) => { const it = e.target.value.split("\n"); set("deliveryAreas", it.map((x, i) => ({ it: x, en: c.deliveryAreas?.[i]?.en ?? "" }))); }} />}
            </Field>
            <Field label="Le stesse zone in inglese (una per riga, facoltativo)">
              {(id) => <textarea id={id} className="block min-h-[7rem] w-full border-filo border-trachite bg-white p-3" value={(c.deliveryAreas ?? []).map((a) => a.en ?? "").join("\n")}
                onChange={(e) => { const en = e.target.value.split("\n"); set("deliveryAreas", (c.deliveryAreas ?? []).map((a, i) => ({ ...a, en: en[i] ?? "" }))); }} />}
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Instagram" error={errors.instagram}>{(id) => <Input id={id} type="url" value={c.instagram ?? ""} onChange={(e) => set("instagram", e.target.value)} />}</Field>
            <Field label="Facebook" error={errors.facebook}>{(id) => <Input id={id} type="url" value={c.facebook ?? ""} onChange={(e) => set("facebook", e.target.value)} />}</Field>
            <Field label="Link recensioni Google" error={errors.googleReviewsUrl}>{(id) => <Input id={id} type="url" value={c.googleReviewsUrl ?? ""} onChange={(e) => set("googleReviewsUrl", e.target.value)} />}</Field>
            <Field label="P.IVA" error={errors.vat}>{(id) => <Input id={id} value={c.vat ?? ""} onChange={(e) => set("vat", e.target.value)} />}</Field>
            <Field label="Email (facoltativa)" error={errors.email}>{(id) => <Input id={id} type="email" value={c.email ?? ""} onChange={(e) => set("email", e.target.value)} />}</Field>
          </div>
          <Btn onClick={saveContact}>Salva contatti</Btn>
        </Section>
        <Section title="Categorie, dotazioni e tag" open={false} subtitle="Le voci che lo staff trova nel form auto">
          <CatalogList title="Categorie" items={cat.categories} onChange={(x) => setCat({ ...cat, categories: x })} />
          <CatalogList title="Dotazioni" items={cat.features} onChange={(x) => setCat({ ...cat, features: x })} />
          <CatalogList title="«Perfetta per…»" items={cat.tags} onChange={(x) => setCat({ ...cat, tags: x })} />
          <Btn onClick={saveCatalog}>Salva catalogo</Btn>
        </Section>
      </div>
    </>
  );
}
