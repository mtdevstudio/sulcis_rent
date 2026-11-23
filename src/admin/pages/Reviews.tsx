"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api, ApiError } from "../api";
import { Btn, Card, Confirm, Empty, Field, Input, PageHeader, Spinner, Switch, Textarea } from "../ui";

type R = { id: number; author: string; text: string; rating: number; date: string; url: string | null; published: boolean; sortOrder: number };
const blank = { author: "", text: "", rating: 5, date: new Date().toISOString().slice(0, 10), url: "", published: true };

export function Reviews() {
  const [list, setList] = useState<R[] | null>(null);
  const [edit, setEdit] = useState<(typeof blank & { id?: number }) | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [del, setDel] = useState<R | null>(null);
  const load = useCallback(() => api<{ reviews: R[] }>("GET", "admin/reviews.php").then((r) => setList(r.reviews)).catch((e) => toast.error(e.message)), []);
  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    if (!edit) return;
    const body = { author: edit.author, text: edit.text, rating: edit.rating, date: edit.date, url: edit.url || null, published: edit.published };
    try {
      if (edit.id) await api("PUT", `admin/reviews.php?id=${edit.id}`, body); else await api("POST", "admin/reviews.php", body);
      toast.success("Recensione salvata"); setEdit(null); setErrors({}); void load();
    } catch (e) { setErrors((e as ApiError).fields); toast.error((e as Error).message); }
  };

  return (
    <>
      <PageHeader title="Recensioni"><Btn onClick={() => { setEdit({ ...blank }); setErrors({}); }}>+ Aggiungi recensione</Btn></PageHeader>
      {edit && (
        <Card className="mb-6">
          <p role="note" className="mb-4 border-l-4 border-ochre bg-[#fff6ec] p-3 text-sm font-semibold">⚠ Inserisci solo recensioni reali copiate da Google, con autore, testo e data originali.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Autore *" error={errors.author}>{(id) => <Input id={id} value={edit.author} onChange={(e) => setEdit({ ...edit, author: e.target.value })} />}</Field>
            <Field label="Data *" error={errors.date}>{(id) => <Input id={id} type="date" value={edit.date} onChange={(e) => setEdit({ ...edit, date: e.target.value })} />}</Field>
            <Field label="Testo *" error={errors.text} className="md:col-span-2">{(id) => <Textarea id={id} value={edit.text} onChange={(e) => setEdit({ ...edit, text: e.target.value })} />}</Field>
            <fieldset><legend className="mb-1.5 text-sm font-semibold">Stelle *</legend>
              <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-pressed={edit.rating === n} aria-label={`${n} stelle`} onClick={() => setEdit({ ...edit, rating: n })} className={`h-12 w-12 border-filo border-trachite text-xl ${n <= edit.rating ? "bg-magenta text-white" : "bg-white"}`}>★</button>)}</div>
            </fieldset>
            <Field label="Link alla recensione su Google" error={errors.url}>{(id) => <Input id={id} type="url" value={edit.url} onChange={(e) => setEdit({ ...edit, url: e.target.value })} placeholder="https://…" />}</Field>
            <Switch label="Mostra sul sito" checked={edit.published} onChange={(x) => setEdit({ ...edit, published: x })} />
          </div>
          <div className="mt-4 flex gap-2"><Btn onClick={save}>Salva</Btn><Btn variant="ghost" onClick={() => setEdit(null)}>Annulla</Btn></div>
        </Card>
      )}
      {!list ? <Spinner /> : list.length === 0 ? <Empty title="Nessuna recensione: sul sito compare solo il badge 5,0 ★ con il link a Google." /> : (
        <ul className="space-y-2">{list.map((r) => (
          <li key={r.id} className="border-filo border-trachite bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><strong>{r.author}</strong><span className="text-sm text-magenta">{"★".repeat(r.rating)}</span></div>
            <p className="mt-2 line-clamp-3 text-sm">{r.text}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone">{r.date} · {r.published ? "visibile" : "nascosta"}
              <span className="ml-auto flex gap-2"><Btn size="sm" variant="ghost" onClick={() => { setEdit({ ...r, url: r.url ?? "" }); setErrors({}); }}>Modifica</Btn><Btn size="sm" variant="ghost" onClick={() => setDel(r)}>Elimina</Btn></span>
            </div>
          </li>))}</ul>
      )}
      <Confirm open={!!del} danger title="Eliminare la recensione?" confirmLabel="Elimina" body={del ? `Recensione di ${del.author}.` : ""} onCancel={() => setDel(null)}
        onConfirm={async () => { if (!del) return; try { await api("DELETE", `admin/reviews.php?id=${del.id}`); toast.success("Eliminata"); void load(); } catch (e) { toast.error((e as Error).message); } setDel(null); }} />
    </>
  );
}
