"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Trama } from "@/components/trama/Trama";
import { api, ApiError } from "./api";

type U = { id: number; name: string; color: string | null };

/**
 * Login: 1) tocchi il tuo nome  2) tastierino grande per il PIN (usabile con una mano).
 * Il PIN va solo al server: nessun controllo lato client oltre alla lunghezza minima.
 */
export function Login({ onSuccess }: { onSuccess: () => void }) {
  const [users, setUsers] = useState<U[] | null>(null);
  const [user, setUser] = useState<U | null>(null);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const live = useRef<HTMLParagraphElement>(null);
  const MIN = 8, MAX = 16;

  useEffect(() => {
    api<{ users: U[] }>("GET", "auth/users.php").then((r) => { setUsers(r.users); if (r.users.length === 1) setUser(r.users[0]); }).catch(() => setUsers([]));
  }, []);

  const submit = useCallback(async () => {
    if (!user || pin.length < MIN || busy) return;
    setBusy(true); setError("");
    try {
      await api("POST", "auth/login.php", { userId: user.id, pin });
      onSuccess();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Errore di connessione";
      setError(msg); setPin(""); setShake(true); setTimeout(() => setShake(false), 450);
    } finally { setBusy(false); }
  }, [user, pin, busy, onSuccess]);

  const press = useCallback((d: string) => { setError(""); setPin((p) => (p.length < MAX ? p + d : p)); }, []);
  const back = useCallback(() => setPin((p) => p.slice(0, -1)), []);

  useEffect(() => {
    if (!user) return;
    const k = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") back();
      else if (e.key === "Enter") void submit();
      else if (e.key === "Escape") { setUser(null); setPin(""); }
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [user, press, back, submit]);

  return (
    <main className="flex min-h-[100svh] flex-col bg-sand">
      <div className="relative h-24 overflow-hidden bg-blue md:h-32" aria-hidden><Trama motif="rombo" fg="sulcis-blue-deep" cell={14} /></div>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-5 pb-6">
        <div className="relative z-[1] -mt-8 self-start bg-sand px-3 pt-3"><Logo className="text-xl" /></div>
        <h1 className="display mt-6 text-4xl" style={{ fontVariationSettings: '"wdth" 70, "wght" 850' }}>Area riservata</h1>

        {!user ? (
          <section aria-labelledby="who" className="mt-6">
            <h2 id="who" className="text-lead font-semibold">Chi sei?</h2>
            {users === null ? <p className="mt-4 text-stone">Caricamento…</p> : users.length === 0 ? (
              <p className="mt-4 text-stone">Nessun utente configurato. Completa il setup iniziale.</p>
            ) : (
              <ul className="mt-4 grid grid-cols-2 gap-3">
                {users.map((u) => (
                  <li key={u.id}>
                    <button type="button" onClick={() => setUser(u)} className="flex w-full flex-col items-center gap-2 border-filo border-trachite bg-white p-4 hover:bg-sand-200">
                      <span className="grid h-16 w-16 place-items-center rounded-full text-2xl font-bold text-white" style={{ background: u.color || "rgb(var(--sulcis-blue))" }} aria-hidden>
                        {u.name.split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase()}
                      </span>
                      <span className="font-semibold">{u.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <section aria-labelledby="pin-t" className="mt-6 flex flex-1 flex-col">
            <div className="flex items-center justify-between">
              <h2 id="pin-t" className="text-lead font-semibold">Ciao {user.name}, inserisci il PIN</h2>
              {users && users.length > 1 && <button type="button" className="text-sm underline" onClick={() => { setUser(null); setPin(""); setError(""); }}>Cambia</button>}
            </div>
            <div className={`mt-5 flex h-8 items-center justify-center gap-2 ${shake ? "animate-[shake_.4s]" : ""}`} aria-hidden>
              {Array.from({ length: Math.max(MIN, pin.length) }).map((_, i) => (
                <span key={i} className={`h-3.5 w-3.5 rotate-45 ${i < pin.length ? "bg-trachite" : "border-filo border-trachite"}`} />
              ))}
            </div>
            <p className="sr-only" aria-live="polite">{pin.length} cifre inserite</p>
            <p ref={live} role="alert" className={`mt-2 min-h-[1.5rem] text-center text-sm font-semibold ${error ? "text-[#9F1239]" : "text-stone"}`}>
              {error || (pin.length > 0 && pin.length < MIN ? `Almeno ${MIN} cifre` : "")}
            </p>
            <div className="mt-auto grid grid-cols-3 gap-2 pt-4" role="group" aria-label="Tastierino numerico">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <button key={d} type="button" onClick={() => press(d)} disabled={busy} className="h-16 border-filo border-trachite bg-white text-2xl font-semibold active:bg-trachite active:text-sand md:h-[4.5rem]">{d}</button>
              ))}
              <button type="button" onClick={back} disabled={busy || !pin} className="h-16 border-filo border-trachite bg-sand-200 text-lg font-semibold md:h-[4.5rem]" aria-label="Cancella ultima cifra">⌫</button>
              <button type="button" onClick={() => press("0")} disabled={busy} className="h-16 border-filo border-trachite bg-white text-2xl font-semibold active:bg-trachite active:text-sand md:h-[4.5rem]">0</button>
              <button type="button" onClick={submit} disabled={busy || pin.length < MIN} className="h-16 bg-magenta text-sm font-bold uppercase tracking-wider text-white disabled:opacity-40 md:h-[4.5rem]">
                {busy ? "…" : "Entra"}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
