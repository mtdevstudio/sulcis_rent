"use client";
import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { api, uploadPhoto, type AdminPhoto } from "../api";
import { useAdmin } from "../AdminApp";
import { Btn, Confirm } from "../ui";

type Job = { key: string; name: string; progress: number; status: "prep" | "up" | "error"; error?: string; file: File };

/** Prepara il file nel browser: HEIC→JPEG se il server non lo gestisce, poi compressione (veloce col 4G). */
async function prepare(file: File, serverHeic: boolean): Promise<{ blob: Blob; name: string }> {
  let f: Blob = file;
  let name = file.name.replace(/\.[^.]+$/, "") || "foto";
  const isHeic = /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
  if (isHeic && !serverHeic) {
    const heic2any = (await import("heic2any")).default;
    const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    f = Array.isArray(out) ? out[0] : out;
  }
  if (!isHeic || !serverHeic) {
    const imageCompression = (await import("browser-image-compression")).default;
    f = await imageCompression(f as File, { maxWidthOrHeight: 2560, maxSizeMB: 4, initialQuality: 0.86, fileType: "image/jpeg", useWebWorker: false });
    name += ".jpg";
  } else name += ".heic";
  return { blob: f, name };
}

function Tile({ p, i, carName, onAlt, onDelete }: { p: AdminPhoto; i: number; carName: string; onAlt: (id: number, alt: string) => void; onDelete: (p: AdminPhoto) => void }) {
  const s = useSortable({ id: p.id });
  const [alt, setAlt] = useState(p.alt.it ?? "");
  return (
    <li ref={s.setNodeRef} style={{ transform: CSS.Transform.toString(s.transform), transition: s.transition }} className={`border-filo border-trachite bg-white ${s.isDragging ? "relative z-10 shadow-xl" : ""}`}>
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${p.base}-640.webp`} alt="" className="aspect-[4/3] w-full object-cover" />
        {i === 0 && <span className="eyebrow absolute left-2 top-2 bg-magenta px-2 py-1 text-white">Copertina</span>}
        <button type="button" {...s.attributes} {...s.listeners} className="absolute right-2 top-2 grid h-11 w-11 cursor-grab touch-none place-items-center bg-sand/90 text-lg" aria-label={`Trascina per spostare la foto ${i + 1}`}>⠿</button>
      </div>
      <div className="space-y-2 p-2">
        <label className="block text-xs font-semibold" htmlFor={`alt-${p.id}`}>Testo alternativo</label>
        <input id={`alt-${p.id}`} className="h-10 w-full border-filo border-sand-300 px-2 text-sm" maxLength={160} value={alt} placeholder={`${carName} – vista ${i + 1}`}
          onChange={(e) => setAlt(e.target.value)} onBlur={() => { if ((p.alt.it ?? "") !== alt) onAlt(p.id, alt); }} />
        <button type="button" onClick={() => onDelete(p)} className="h-10 w-full text-xs font-bold uppercase text-[#9F1239] hover:bg-[#fff1f3]">Elimina foto</button>
      </div>
    </li>
  );
}

export function PhotoManager({ carId, photos, setPhotos, carName, ensureCar }: {
  carId: number | null; photos: AdminPhoto[]; setPhotos: (p: AdminPhoto[]) => void; carName: string; ensureCar: () => Promise<number | null>;
}) {
  const { me } = useAdmin();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [drag, setDrag] = useState(false);
  const [del, setDel] = useState<AdminPhoto | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  const update = (key: string, patch: Partial<Job>) => setJobs((js) => js.map((j) => (j.key === key ? { ...j, ...patch } : j)));

  const run = async (job: Job, id: number) => {
    try {
      update(job.key, { status: "prep", progress: 0, error: undefined });
      const { blob, name } = await prepare(job.file, me.capabilities.heic);
      if (blob.size > me.capabilities.maxBytes) throw new Error("Foto troppo grande anche dopo la compressione (max 15 MB)");
      update(job.key, { status: "up" });
      const { photo } = await uploadPhoto(id, blob, name, (pr) => update(job.key, { progress: pr }));
      setPhotos([...photosRef.current, photo]);
      setJobs((js) => js.filter((j) => j.key !== job.key));
    } catch (e) {
      update(job.key, { status: "error", error: (e as Error).message });
    }
  };

  const add = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    if (!list.length) return;
    const id = carId ?? (await ensureCar());
    if (!id) return;
    const newJobs = list.map((file) => ({ key: Math.random().toString(36).slice(2), name: file.name, progress: 0, status: "prep" as const, file }));
    setJobs((js) => [...js, ...newJobs]);
    for (const j of newJobs) await run(j, id); // una alla volta: più stabile col 4G
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const onDragEnd = async (e: DragEndEvent) => {
    if (!carId || !e.over || e.active.id === e.over.id) return;
    const next = arrayMove(photos, photos.findIndex((p) => p.id === e.active.id), photos.findIndex((p) => p.id === e.over!.id));
    setPhotos(next);
    try { await api("PATCH", "admin/photos.php", { carId, order: next.map((p) => p.id) }); toast.success("Ordine foto salvato"); } catch (err) { toast.error((err as Error).message); }
  };
  const onAlt = async (id: number, alt: string) => {
    if (!carId) return;
    try {
      const r = await api<{ photos: AdminPhoto[] }>("PATCH", "admin/photos.php", { carId, alts: [{ id, alt: { it: alt } }] });
      setPhotos(r.photos); toast.success("Testo alternativo salvato");
    } catch (e) { toast.error((e as Error).message); }
  };
  const confirmDelete = async () => {
    if (!del) return;
    try { await api("DELETE", `admin/photos.php?id=${del.id}`); setPhotos(photos.filter((p) => p.id !== del.id)); toast.success("Foto eliminata"); }
    catch (e) { toast.error((e as Error).message); }
    setDel(null);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); void add(e.dataTransfer.files); }}
        className={`border-filo border-dashed p-5 text-center ${drag ? "border-magenta bg-[#fdf0f5]" : "border-trachite bg-sand"}`}
      >
        <p className="font-semibold">Trascina qui le foto oppure</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Btn variant="primary" size="lg" onClick={() => camRef.current?.click()}>📷 Scatta foto</Btn>
          <Btn variant="ghost" size="lg" onClick={() => fileRef.current?.click()}>Scegli dalla galleria</Btn>
        </div>
        <input ref={camRef} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { if (e.target.files) void add(e.target.files); e.target.value = ""; }} />
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" multiple className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { if (e.target.files) void add(e.target.files); e.target.value = ""; }} />
        <p className="mt-3 text-xs text-stone">JPEG, PNG, WebP{me.capabilities.heic ? ", HEIC" : " (le HEIC dell'iPhone vengono convertite qui)"} · max 15 MB · la posizione GPS viene rimossa. {carId ? "" : "Alla prima foto la bozza viene salvata in automatico."}</p>
      </div>

      {jobs.length > 0 && (
        <ul className="mt-3 space-y-2" aria-live="polite">
          {jobs.map((j) => (
            <li key={j.key} className="border-filo border-trachite bg-white p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate">{j.name}</span>
                <span className="shrink-0 text-xs text-stone">{j.status === "prep" ? "Preparazione…" : j.status === "up" ? `${j.progress}%` : "Errore"}</span>
              </div>
              <div className="mt-2 h-2 bg-sand-200" role="progressbar" aria-valuenow={j.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Caricamento ${j.name}`}>
                <div className={`h-full transition-[width] ${j.status === "error" ? "bg-[#9F1239]" : "bg-blue"}`} style={{ width: `${j.status === "error" ? 100 : j.progress}%` }} />
              </div>
              {j.status === "error" && (
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span role="alert" className="text-xs font-semibold text-[#9F1239]">{j.error}</span>
                  <span className="flex gap-1">
                    <Btn size="sm" variant="ghost" onClick={async () => { const id = carId ?? (await ensureCar()); if (id) void run(j, id); }}>Riprova</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => setJobs((js) => js.filter((x) => x.key !== j.key))}>Scarta</Btn>
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {photos.length > 0 && (
        <>
          <p className="mt-4 text-xs text-stone">Trascina ⠿ per riordinare: la prima foto è la copertina.</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
              <ul className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3">
                {photos.map((p, i) => <Tile key={p.id} p={p} i={i} carName={carName} onAlt={onAlt} onDelete={setDel} />)}
              </ul>
            </SortableContext>
          </DndContext>
        </>
      )}
      <Confirm open={!!del} danger title="Eliminare questa foto?" confirmLabel="Elimina foto" body="La foto viene cancellata dal server e dal sito." onConfirm={confirmDelete} onCancel={() => setDel(null)} />
    </div>
  );
}
