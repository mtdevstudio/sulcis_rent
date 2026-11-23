"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../api";
import { Btn, Card, Confirm, Empty, L10nInput, PageHeader, RichText, Spinner, Switch } from "../ui";

type F = { id: number; question: { it?: string; en?: string }; answer: { it?: string; en?: string }; published: boolean; sortOrder: number };
type E = { id?: number; question: { it?: string; en?: string }; answer: { it?: string; en?: string }; published: boolean };

export function Faq() {
  const [list, setList] = useState<F[] | null>(null);
  const [edit, setEdit] = useState<E | null>(null);
  const [del, setDel] = useState<F | null>(null);
  const load = useCallback(() => api<{ faq: F[] }>("GET", "admin/faq.php").then((r) => setList(r.faq)).catch((e) => toast.error(e.message)), []);
  useEffect(() => { void load(); }, [load]);
  const save = async () => {
    if (!edit) return;
    const body = { question: edit.question, answer: edit.answer, published: edit.published };
    try { if (edit.id) await api("PUT", `admin/faq.php?id=${edit.id}`, body); else await api("POST", "admin/faq.php", body); toast.success("Salvata"); setEdit(null); void load(); }
    catch (e) { toast.error((e as Error).message); }
  };
  const move = async (i: number, dir: -1 | 1) => {
    if (!list) return;
    const next = [...list]; const j = i + dir; if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]]; setList(next);
    try { await api("PATCH", "admin/faq.php", { ids: next.map((f) => f.id) }); } catch (e) { toast.error((e as Error).message); void load(); }
  };
  return (
    <>
      <PageHeader title="FAQ"><Btn onClick={() => setEdit({ question: {}, answer: {}, published: true })}>+ Aggiungi domanda</Btn></PageHeader>
      {edit && (
        <Card className="mb-6 space-y-4">
          <L10nInput label="Domanda" required value={edit.question} onChange={(q) => setEdit({ ...edit, question: q })} max={300} />
          <div className="grid gap-4 md:grid-cols-2">
            <RichText label="Risposta (italiano) *" value={edit.answer.it ?? ""} onChange={(h) => setEdit({ ...edit, answer: { ...edit.answer, it: h } })} />
            <RichText label="Risposta (inglese)" value={edit.answer.en ?? ""} onChange={(h) => setEdit({ ...edit, answer: { ...edit.answer, en: h } })} />
          </div>
          <Switch label="Mostra sul sito" checked={edit.published} onChange={(x) => setEdit({ ...edit, published: x })} />
          <div className="flex gap-2"><Btn onClick={save}>Salva</Btn><Btn variant="ghost" onClick={() => setEdit(null)}>Annulla</Btn></div>
        </Card>
      )}
      {!list ? <Spinner /> : list.length === 0 ? <Empty title="Nessuna domanda" /> : (
        <ol className="space-y-2">{list.map((f, i) => (
          <li key={f.id} className="flex items-start gap-2 border-filo border-trachite bg-white p-3">
            <div className="flex flex-col">
              <button type="button" className="h-9 w-9 border-filo border-sand-300" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Sposta su">↑</button>
              <button type="button" className="h-9 w-9 border-filo border-sand-300" onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label="Sposta giù">↓</button>
            </div>
            <div className="min-w-0 flex-1"><p className="font-semibold">{f.question.it}</p><p className="text-xs text-stone">{f.published ? "visibile" : "nascosta"}{f.question.en ? " · EN ✓" : " · EN mancante"}</p></div>
            <div className="flex gap-1"><Btn size="sm" variant="ghost" onClick={() => setEdit({ id: f.id, question: f.question, answer: f.answer, published: f.published })}>Modifica</Btn><Btn size="sm" variant="ghost" onClick={() => setDel(f)} aria-label="Elimina">✕</Btn></div>
          </li>))}</ol>
      )}
      <Confirm open={!!del} danger title="Eliminare la domanda?" confirmLabel="Elimina" body={del?.question.it} onCancel={() => setDel(null)}
        onConfirm={async () => { if (!del) return; try { await api("DELETE", `admin/faq.php?id=${del.id}`); toast.success("Eliminata"); void load(); } catch (e) { toast.error((e as Error).message); } setDel(null); }} />
    </>
  );
}
