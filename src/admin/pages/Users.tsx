"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api, ApiError, fmtDate } from "../api";
import { useAdmin } from "../AdminApp";
import { Btn, Card, Confirm, Field, Input, PageHeader, Spinner } from "../ui";

type U = { id: number; name: string; role: "owner" | "staff"; active: boolean; color: string | null; createdAt: string; lastLoginAt: string | null; locked: boolean };
type S = { id: number; userId: number; name: string; createdAt: string; lastSeenAt: string; expiresAt: string; userAgent: string | null; current: boolean };
const device = (ua: string | null) => !ua ? "sconosciuto" : /iPhone|iPad/.test(ua) ? "iPhone/iPad" : /Android/.test(ua) ? "Android" : /Mac OS/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : "Browser";

export function Users() {
  const { me } = useAdmin();
  const [users, setUsers] = useState<U[] | null>(null);
  const [sessions, setSessions] = useState<S[] | null>(null);
  const [min, setMin] = useState(8);
  const [nu, setNu] = useState({ name: "", pin: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [reset, setReset] = useState<U | null>(null);
  const [pin, setPin] = useState("");
  const [allOut, setAllOut] = useState(false);
  const load = useCallback(async () => {
    try {
      const [u, s] = await Promise.all([api<{ users: U[]; pinMinLength: number }>("GET", "admin/users.php"), api<{ sessions: S[] }>("GET", "admin/sessions.php")]);
      setUsers(u.users); setMin(u.pinMinLength); setSessions(s.sessions);
    } catch (e) { toast.error((e as Error).message); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  if (me.user.role !== "owner") return <p>Sezione riservata al titolare.</p>;

  const act = async (u: U, action: string, extra: object = {}) => {
    try { await api("PUT", `admin/users.php?id=${u.id}`, { action, ...extra }); toast.success("Fatto"); void load(); return true; }
    catch (e) { toast.error((e as Error).message); return false; }
  };
  const create = async () => {
    try { await api("POST", "admin/users.php", nu); toast.success(`Utente ${nu.name} creato. Comunicagli il PIN di persona.`); setNu({ name: "", pin: "" }); setErrs({}); void load(); }
    catch (e) { setErrs((e as ApiError).fields); toast.error((e as Error).message); }
  };

  return (
    <>
      <PageHeader title="Utenti e sessioni" />
      {!users || !sessions ? <Spinner /> : (
        <div className="space-y-6">
          <Card>
            <h2 className="display text-2xl" style={{ fontVariationSettings: '"wdth" 75, "wght" 800' }}>Utenti</h2>
            <ul className="mt-3 divide-y divide-sand-300">
              {users.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white" style={{ background: u.color || "rgb(var(--sulcis-blue))" }} aria-hidden>{u.name.slice(0, 2).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{u.name} <span className="text-xs font-normal text-stone">· {u.role === "owner" ? "titolare" : "staff"}{!u.active ? " · disattivato" : ""}{u.locked ? " · bloccato" : ""}</span></p>
                    <p className="text-xs text-stone">Ultimo accesso: {fmtDate(u.lastLoginAt)}</p>
                  </div>
                  {u.role === "staff" && (
                    <div className="flex flex-wrap gap-1">
                      {u.locked && <Btn size="sm" variant="blue" onClick={() => act(u, "unlock")}>Sblocca</Btn>}
                      <Btn size="sm" variant="ghost" onClick={() => { setReset(u); setPin(""); }}>Reset PIN</Btn>
                      <Btn size="sm" variant="ghost" onClick={() => act(u, u.active ? "deactivate" : "activate")}>{u.active ? "Disattiva" : "Riattiva"}</Btn>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-3 border-t border-sand-300 pt-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <Field label="Nome nuovo staff" error={errs.name}>{(id) => <Input id={id} value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} />}</Field>
              <Field label={`PIN iniziale (≥ ${min} cifre)`} error={errs.pin} hint="Niente sequenze, ripetizioni o date">{(id) => <Input id={id} type="password" inputMode="numeric" autoComplete="new-password" value={nu.pin} onChange={(e) => setNu({ ...nu, pin: e.target.value.replace(/\D/g, "") })} />}</Field>
              <Btn onClick={create} disabled={!nu.name || nu.pin.length < min}>Crea utente</Btn>
            </div>
          </Card>
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="display text-2xl" style={{ fontVariationSettings: '"wdth" 75, "wght" 800' }}>Sessioni attive</h2>
              <Btn variant="danger" size="sm" onClick={() => setAllOut(true)}>Disconnetti tutti</Btn>
            </div>
            <ul className="mt-3 divide-y divide-sand-300">
              {sessions.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span><strong>{s.name}</strong> · {device(s.userAgent)}{s.current ? " · questa sessione" : ""}<br /><span className="text-xs text-stone">Attiva {fmtDate(s.lastSeenAt)} · scade {fmtDate(s.expiresAt)}</span></span>
                  {!s.current && <Btn size="sm" variant="ghost" onClick={async () => { try { await api("DELETE", `admin/sessions.php?id=${s.id}`); toast.success("Sessione chiusa"); void load(); } catch (e) { toast.error((e as Error).message); } }}>Disconnetti</Btn>}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
      <Confirm open={!!reset} title={`Nuovo PIN per ${reset?.name ?? ""}`} confirmLabel="Imposta PIN" confirmDisabled={pin.length < min}
        body="Le sue sessioni verranno chiuse. Comunicagli il nuovo PIN di persona." onCancel={() => setReset(null)}
        onConfirm={async () => { if (reset && (await act(reset, "reset_pin", { pin }))) setReset(null); }}>
        <div className="mt-4"><label htmlFor="rp" className="mb-1 block text-sm font-semibold">Nuovo PIN</label><Input id="rp" type="password" inputMode="numeric" autoComplete="new-password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} /></div>
      </Confirm>
      <Confirm open={allOut} danger title="Disconnettere tutti?" confirmLabel="Disconnetti tutti" body="Tutti gli altri dispositivi (anche i tuoi) dovranno rifare il login. La tua sessione attuale resta aperta."
        onCancel={() => setAllOut(false)} onConfirm={async () => { try { const r = await api<{ revoked: number }>("DELETE", "admin/sessions.php?all=1"); toast.success(`${r.revoked} sessioni chiuse`); void load(); } catch (e) { toast.error((e as Error).message); } setAllOut(false); }} />
    </>
  );
}
