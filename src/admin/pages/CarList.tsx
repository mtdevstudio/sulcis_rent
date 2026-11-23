"use client";
import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api, ApiError, fmtDate, type CarRow, type CarStatus } from "../api";
import { ALink } from "../AdminApp";
import { useCatalog } from "../useCatalog";
import { Btn, Confirm, Empty, Input, PageHeader, Select, Spinner, StatusBadge } from "../ui";

function Thumb({ cover, name }: { cover: string | null; name: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return cover ? <img src={`${cover}-640.webp`} alt="" className="h-16 w-20 shrink-0 object-cover" loading="lazy" /> : <span className="grid h-16 w-20 shrink-0 place-items-center bg-sand-200 text-[10px] text-stone" aria-label={`${name}: nessuna foto`}>senza foto</span>;
}

function Row({ car, catLabel, onAction, sortable }: { car: CarRow; catLabel: string; onAction: (a: string, c: CarRow) => void; sortable: boolean }) {
  const s = useSortable({ id: car.id, disabled: !sortable });
  const name = `${car.brand} ${car.model}`.trim() || "(senza nome)";
  return (
    <li ref={s.setNodeRef} style={{ transform: CSS.Transform.toString(s.transform), transition: s.transition }} className={`border-filo border-trachite bg-white ${s.isDragging ? "relative z-10 shadow-lg" : ""}`}>
      <div className="flex items-center gap-3 p-3">
        {sortable && (
          <button type="button" {...s.attributes} {...s.listeners} className="grid h-12 w-8 shrink-0 cursor-grab touch-none place-items-center text-stone" aria-label={`Trascina per riordinare ${name}`}>⋮⋮</button>
        )}
        <Thumb cover={car.cover} name={name} />
        <div className="min-w-0 flex-1">
          <ALink href={`/admin/auto/modifica/?id=${car.id}`} className="block truncate font-semibold hover:underline">{name}{car.version ? <span className="font-normal text-stone"> · {car.version}</span> : null}</ALink>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone">
            <StatusBadge status={car.status} />
            {car.featured && <span className="eyebrow bg-magenta px-2 py-1 text-white">In home</span>}
            <span>{catLabel || "senza categoria"}</span>
            {car.plate && <span className="hidden md:inline">· {car.plate}</span>}
            <span className="hidden md:inline">· {car.photoCount} foto · {fmtDate(car.updatedAt)}{car.updatedBy ? ` da ${car.updatedBy}` : ""}</span>
          </div>
        </div>
        <div className="hidden shrink-0 gap-1 md:flex">
          <Btn size="sm" variant={car.status === "published" ? "ghost" : "blue"} onClick={() => onAction(car.status === "published" ? "hide" : "publish", car)}>{car.status === "published" ? "Nascondi" : "Pubblica"}</Btn>
          <Btn size="sm" variant="ghost" onClick={() => onAction("duplicate", car)}>Duplica</Btn>
          <ALink href={`/admin/anteprima/?id=${car.id}`} className="eyebrow inline-flex h-10 items-center border-filo border-trachite px-3">Anteprima</ALink>
          <Btn size="sm" variant="ghost" onClick={() => onAction("delete", car)} aria-label={`Elimina ${name}`}>✕</Btn>
        </div>
      </div>
      <div className="grid grid-cols-4 border-t border-sand-300 md:hidden">
        <button type="button" className="h-12 text-xs font-bold uppercase" onClick={() => onAction(car.status === "published" ? "hide" : "publish", car)}>{car.status === "published" ? "Nascondi" : "Pubblica"}</button>
        <ALink href={`/admin/auto/modifica/?id=${car.id}`} className="grid h-12 place-items-center border-l border-sand-300 text-xs font-bold uppercase">Modifica</ALink>
        <button type="button" className="h-12 border-l border-sand-300 text-xs font-bold uppercase" onClick={() => onAction("duplicate", car)}>Duplica</button>
        <button type="button" className="h-12 border-l border-sand-300 text-xs font-bold uppercase text-[#9F1239]" onClick={() => onAction("delete", car)}>Elimina</button>
      </div>
    </li>
  );
}

export function CarList() {
  const sp = useSearchParams();
  const catalog = useCatalog();
  const [cars, setCars] = useState<CarRow[] | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>(sp.get("status") ?? "");
  const [cat, setCat] = useState("");
  const [del, setDel] = useState<CarRow | null>(null);

  const load = useCallback(async () => {
    try { setCars((await api<{ cars: CarRow[] }>("GET", "admin/cars.php")).cars); } catch (e) { toast.error((e as Error).message); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const catLabel = (k: string | null) => catalog?.categories.find((c) => c.key === k)?.label.it ?? k ?? "";
  const filtered = useMemo(() => (cars ?? []).filter((c) =>
    (!status || c.status === status) && (!cat || c.category === cat) &&
    (!q || `${c.brand} ${c.model} ${c.version ?? ""} ${c.plate ?? ""}`.toLowerCase().includes(q.toLowerCase()))), [cars, status, cat, q]);
  const sortable = !q && !status && !cat;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const onDragEnd = async (e: DragEndEvent) => {
    if (!cars || !e.over || e.active.id === e.over.id) return;
    const next = arrayMove(cars, cars.findIndex((c) => c.id === e.active.id), cars.findIndex((c) => c.id === e.over!.id));
    setCars(next);
    try { await api("POST", "admin/cars-order.php", { ids: next.map((c) => c.id) }); toast.success("Ordine salvato"); } catch (err) { toast.error((err as Error).message); void load(); }
  };

  const action = async (a: string, c: CarRow) => {
    if (a === "delete") { setDel(c); return; }
    try {
      await api("POST", "admin/car-actions.php", { id: c.id, action: a });
      toast.success({ publish: "Pubblicata: è già sul sito", hide: "Nascosta dal sito", duplicate: "Copia creata in bozza" }[a] ?? "Fatto");
      void load();
    } catch (e) {
      const err = e as ApiError;
      toast.error(err.message + (Object.keys(err.fields).length ? `: ${Object.values(err.fields).join(", ")}` : ""));
    }
  };
  const confirmDelete = async () => {
    if (!del) return;
    try { await api("DELETE", `admin/cars.php?id=${del.id}`); toast.success("Spostata nel cestino (recuperabile per 30 giorni)"); setDel(null); void load(); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <>
      <PageHeader title="Auto">
        <ALink href="/admin/auto/modifica/" className="inline-flex h-12 items-center gap-2 bg-magenta px-5 text-sm font-bold uppercase tracking-wider text-white hover:bg-magenta-deep">+ Aggiungi auto</ALink>
      </PageHeader>
      <div className="mb-4 grid gap-2 md:grid-cols-[1fr_auto_auto]">
        <label className="sr-only" htmlFor="search">Cerca</label>
        <Input id="search" type="search" placeholder="Cerca per marca, modello, targa…" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="sr-only" htmlFor="fs">Stato</label>
        <Select id="fs" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tutti gli stati</option><option value="published">Pubblicate</option><option value="draft">Bozze</option><option value="hidden">Nascoste</option>
        </Select>
        <label className="sr-only" htmlFor="fc">Categoria</label>
        <Select id="fc" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">Tutte le categorie</option>
          {catalog?.categories.map((c) => <option key={c.key} value={c.key}>{c.label.it}</option>)}
        </Select>
      </div>
      {!cars ? <Spinner /> : filtered.length === 0 ? (
        <Empty title={cars.length ? "Nessuna auto con questi filtri" : "Ancora nessuna auto"}>
          {!cars.length && <ALink href="/admin/auto/modifica/" className="eyebrow inline-flex h-12 items-center bg-magenta px-5 text-white">Aggiungi la prima auto</ALink>}
        </Empty>
      ) : (
        <>
          <p className="mb-2 text-xs text-stone">{sortable ? "Trascina ⋮⋮ per cambiare l'ordine sul sito." : "Togli ricerca e filtri per riordinare."}</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={filtered.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">{filtered.map((c) => <Row key={c.id} car={c} catLabel={catLabel(c.category)} onAction={action} sortable={sortable} />)}</ul>
            </SortableContext>
          </DndContext>
        </>
      )}
      <Confirm open={!!del} danger title="Spostare nel cestino?" confirmLabel={del ? `Elimina ${del.brand} ${del.model}`.trim() : "Elimina"}
        body={<>Stai per eliminare <strong className="text-trachite">{del ? `${del.brand} ${del.model}` : ""}</strong>{del?.plate ? ` (${del.plate})` : ""}. Sparisce subito dal sito; potrai ripristinarla dal Cestino per 30 giorni.</>}
        onConfirm={confirmDelete} onCancel={() => setDel(null)} />
    </>
  );
}
export type { CarStatus };
