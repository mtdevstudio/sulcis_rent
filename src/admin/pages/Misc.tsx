"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api, ApiError, fmtDate, type CarRow } from "../api";
import { useAdmin } from "../AdminApp";
import { Btn, Card, Confirm, Empty, Field, Input, PageHeader, Spinner } from "../ui";

export function Audit() {
  const { me } = useAdmin();
  const [page, setPage] = useState(1);
  const [d, setD] = useState<{ entries: { id: number; action: string; entity: string; entityId: string | null; diff: unknown; at: string; user: string | null }[]; hasMore: boolean } | null>(null);
  useEffect(() => { api<typeof d>("GET", `admin/audit.php?page=${page}`).then(setD).catch((e) => toast.error(e.message)); }, [page]);
  if (me.user.role !== "owner") return <p>Sezione riservata al titolare.</p>;
  return (
    <>
      <PageHeader title="Registro attività" />
      {!d ? <Spinner /> : (
        <Card>
          <ul className="divide-y divide-sand-300">
            {d.entries.map((e) => (
              <li key={e.id} className="py-3 text-sm">
                <div className="flex flex-wrap justify-between gap-2"><span><strong>{e.user ?? "Sistema"}</strong> · {e.action} · {e.entity}{e.entityId ? ` #${e.entityId}` : ""}</span><span className="text-xs text-stone">{fmtDate(e.at)}</span></div>
                {e.diff != null && <details className="mt-1"><summary className="cursor-pointer text-xs text-stone">dettagli</summary><pre className="mt-1 max-h-60 overflow-auto bg-sand-200 p-2 text-[11px]">{JSON.stringify(e.diff, null, 2)}</pre></details>}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between"><Btn variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>← Più recenti</Btn><Btn variant="ghost" size="sm" disabled={!d.hasMore} onClick={() => setPage(page + 1)}>Più vecchie →</Btn></div>
        </Card>
      )}
    </>
  );
}

export function Backup() {
  const { me } = useAdmin();
  if (me.user.role !== "owner") return <p>Sezione riservata al titolare.</p>;
  return (
    <>
      <PageHeader title="Backup" />
      <Card>
        <p className="max-w-prose">Scarica un archivio ZIP con il <strong>database</strong> (auto, recensioni, FAQ, impostazioni, utenti) e tutte le <strong>foto</strong>. Conservalo in un posto sicuro (non nella cartella del sito): contiene gli hash dei PIN.</p>
        <a href="/api/admin/backup.php" download className="mt-5 inline-flex h-14 items-center gap-2 bg-magenta px-6 font-bold uppercase tracking-wider text-white hover:bg-magenta-deep">⇩ Scarica backup</a>
        <p className="mt-3 text-xs text-stone">Il ripristino è spiegato nel README (sezione «Backup e ripristino»).</p>
      </Card>
    </>
  );
}

export function Trash() {
  const [cars, setCars] = useState<CarRow[] | null>(null);
  const [purge, setPurge] = useState<CarRow | null>(null);
  const load = useCallback(() => api<{ cars: CarRow[] }>("GET", "admin/cars.php?trash=1").then((r) => setCars(r.cars)).catch((e) => toast.error(e.message)), []);
  useEffect(() => { void load(); }, [load]);
  const daysLeft = (d: string | null) => d ? Math.max(0, 30 - Math.floor((Date.now() - new Date(d.replace(" ", "T") + "Z").getTime()) / 86400000)) : 30;
  return (
    <>
      <PageHeader title="Cestino" />
      <p className="mb-4 text-sm text-stone">Le auto eliminate restano qui 30 giorni, poi vengono cancellate definitivamente con le foto.</p>
      {!cars ? <Spinner /> : cars.length === 0 ? <Empty title="Il cestino è vuoto" /> : (
        <ul className="space-y-2">{cars.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-3 border-filo border-trachite bg-white p-3">
            <div className="min-w-0 flex-1"><p className="font-semibold">{c.brand} {c.model}</p><p className="text-xs text-stone">Eliminata {fmtDate(c.deletedAt)} · ancora {daysLeft(c.deletedAt)} giorni</p></div>
            <Btn size="sm" variant="blue" onClick={async () => { try { await api("POST", "admin/car-actions.php", { id: c.id, action: "restore" }); toast.success("Ripristinata"); void load(); } catch (e) { toast.error((e as Error).message); } }}>Ripristina</Btn>
            <Btn size="sm" variant="ghost" onClick={() => setPurge(c)}>Elimina per sempre</Btn>
          </li>))}</ul>
      )}
      <Confirm open={!!purge} danger title="Eliminare per sempre?" confirmLabel="Elimina definitivamente" body={purge ? `${purge.brand} ${purge.model} e tutte le sue foto verranno cancellate. Non si può annullare.` : ""}
        onCancel={() => setPurge(null)} onConfirm={async () => { if (!purge) return; try { await api("POST", "admin/car-actions.php", { id: purge.id, action: "purge" }); toast.success("Eliminata definitivamente"); void load(); } catch (e) { toast.error((e as Error).message); } setPurge(null); }} />
    </>
  );
}

export function Profile() {
  const { me } = useAdmin();
  const [f, setF] = useState({ current: "", next: "", again: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const save = async () => {
    if (f.next !== f.again) { setErrs({ again: "I due PIN non coincidono" }); return; }
    try { const r = await api<{ revokedSessions: number }>("POST", "auth/change-pin.php", { current: f.current, next: f.next }); toast.success(`PIN cambiato. Disconnessi ${r.revokedSessions} altri dispositivi.`); setF({ current: "", next: "", again: "" }); setErrs({}); }
    catch (e) { const err = e as ApiError; setErrs(err.status === 401 ? { current: err.message } : err.fields); toast.error(err.message); }
  };
  const num = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value.replace(/\D/g, "") });
  return (
    <>
      <PageHeader title="Il mio PIN" />
      <Card className="max-w-md space-y-4">
        <p className="text-sm text-stone">Almeno {me.pinMinLength} cifre, niente sequenze (12345678), ripetizioni o date. Cambiandolo, gli altri tuoi dispositivi vengono disconnessi.</p>
        <Field label="PIN attuale" error={errs.current}>{(id) => <Input id={id} type="password" inputMode="numeric" autoComplete="current-password" value={f.current} onChange={num("current")} />}</Field>
        <Field label="Nuovo PIN" error={errs.next}>{(id) => <Input id={id} type="password" inputMode="numeric" autoComplete="new-password" value={f.next} onChange={num("next")} />}</Field>
        <Field label="Ripeti il nuovo PIN" error={errs.again}>{(id) => <Input id={id} type="password" inputMode="numeric" autoComplete="new-password" value={f.again} onChange={num("again")} />}</Field>
        <Btn onClick={save} disabled={!f.current || f.next.length < me.pinMinLength}>Cambia PIN</Btn>
      </Card>
    </>
  );
}
