"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Toaster, toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { api, onUnauthorized, type Me } from "./api";
import { Login } from "./Login";
import { Spinner } from "./ui";

type Ctx = { me: Me; refresh: () => Promise<void>; logout: () => Promise<void> };
const AdminCtx = createContext<Ctx | null>(null);
export const useAdmin = () => useContext(AdminCtx)!;

/* ---------- modifiche non salvate ---------- */
let dirty = false;
export function setDirty(v: boolean) { dirty = v; }
export function confirmLeave() { return !dirty || confirm("Hai modifiche non salvate. Uscire senza salvare?"); }

/** Link interno che rispetta l'avviso «modifiche non salvate». */
export function ALink({ href, children, className, ...p }: { href: string; children: ReactNode; className?: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return <Link href={href} className={className} onClick={(e) => { if (!confirmLeave()) e.preventDefault(); else setDirty(false); }} {...p}>{children}</Link>;
}

const NAV = [
  { href: "/admin/", label: "Dashboard", icon: "◆" },
  { href: "/admin/auto/", label: "Auto", icon: "▣" },
  { href: "/admin/recensioni/", label: "Recensioni", icon: "★" },
  { href: "/admin/faq/", label: "FAQ", icon: "?" },
  { href: "/admin/cestino/", label: "Cestino", icon: "⌫" },
  { href: "/admin/impostazioni/", label: "Impostazioni", icon: "⚙", owner: true },
  { href: "/admin/utenti/", label: "Utenti e sessioni", icon: "☺", owner: true },
  { href: "/admin/registro/", label: "Registro attività", icon: "≡", owner: true },
  { href: "/admin/backup/", label: "Backup", icon: "⇩", owner: true },
  { href: "/admin/profilo/", label: "Il mio PIN", icon: "✱" },
];

export function AdminApp({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [state, setState] = useState<"loading" | "in" | "out">("loading");
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const refresh = useCallback(async () => {
    try { const m = await api<Me>("GET", "auth/me.php"); setMe(m); setState("in"); }
    catch { setMe(null); setState("out"); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => onUnauthorized(() => { setDirty(false); setMe(null); setState("out"); toast.error("Sessione scaduta: accedi di nuovo"); }), []);
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    addEventListener("beforeunload", h);
    return () => removeEventListener("beforeunload", h);
  }, []);
  useEffect(() => setMenu(false), [pathname]);

  const logout = useCallback(async () => {
    if (!confirmLeave()) return;
    try { await api("POST", "auth/logout.php", {}); } catch { /* già fuori */ }
    setDirty(false); setMe(null); setState("out"); router.push("/admin/");
  }, [router]);

  if (state === "loading") return <div className="grid min-h-screen place-items-center bg-sand"><Spinner /></div>;
  if (state === "out" || !me) return (<><Login onSuccess={refresh} /><Toaster position="top-center" richColors /></>);

  const nav = NAV.filter((n) => !n.owner || me.user.role === "owner");
  const active = (href: string) => (href === "/admin/" ? pathname === "/admin" || pathname === "/admin/" : pathname.startsWith(href.replace(/\/$/, "")));

  return (
    <AdminCtx.Provider value={{ me, refresh, logout }}>
      <div className="min-h-screen bg-sand pb-24 lg:pb-0 lg:pl-64">
        {/* sidebar desktop */}
        <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r-filo border-trachite bg-white lg:flex">
          <div className="border-b-filo border-trachite p-5"><Logo className="text-lg" /><p className="eyebrow mt-2 text-stone">Area riservata</p></div>
          <nav aria-label="Admin" className="flex-1 overflow-auto p-3">
            <ul className="space-y-1">
              {nav.map((n) => (
                <li key={n.href}><ALink href={n.href} aria-current={active(n.href) ? "page" : undefined}
                  className={`flex h-11 items-center gap-3 px-3 text-sm font-semibold ${active(n.href) ? "bg-trachite text-sand" : "hover:bg-sand-200"}`}><span aria-hidden className="w-4 text-center">{n.icon}</span>{n.label}</ALink></li>
              ))}
            </ul>
          </nav>
          <div className="border-t-filo border-trachite p-4 text-sm">
            <p className="font-semibold">{me.user.name}</p>
            <p className="text-xs text-stone">{me.user.role === "owner" ? "Titolare" : "Staff"}</p>
            <div className="mt-3 flex gap-2">
              <a href="/" target="_blank" rel="noopener" className="eyebrow flex h-10 flex-1 items-center justify-center border-filo border-trachite">Sito ↗</a>
              <button type="button" onClick={logout} className="eyebrow h-10 flex-1 bg-trachite text-sand">Esci</button>
            </div>
          </div>
        </aside>

        {/* header mobile */}
        <header className="sticky top-0 z-nav flex h-14 items-center justify-between border-b-filo border-trachite bg-sand px-4 lg:hidden">
          <Logo className="text-sm" />
          <span className="text-xs font-semibold text-stone">{me.user.name}</span>
        </header>

        <main id="main" className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</main>

        {/* barra in basso mobile: azioni a portata di pollice */}
        <nav aria-label="Admin mobile" className="fixed inset-x-0 bottom-0 z-sticky grid grid-cols-4 border-t-filo border-trachite bg-white lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          <ALink href="/admin/" className={`flex h-16 flex-col items-center justify-center text-xs font-semibold ${active("/admin/") ? "text-magenta-deep" : ""}`}><span aria-hidden className="text-lg">◆</span>Home</ALink>
          <ALink href="/admin/auto/" className={`flex h-16 flex-col items-center justify-center text-xs font-semibold ${active("/admin/auto/") && !pathname.includes("modifica") ? "text-magenta-deep" : ""}`}><span aria-hidden className="text-lg">▣</span>Auto</ALink>
          <ALink href="/admin/auto/modifica/" className="flex h-16 flex-col items-center justify-center bg-magenta text-xs font-bold text-white"><span aria-hidden className="text-2xl leading-none">+</span>Aggiungi</ALink>
          <button type="button" onClick={() => setMenu(true)} aria-expanded={menu} className="flex h-16 flex-col items-center justify-center text-xs font-semibold"><span aria-hidden className="text-lg">≡</span>Altro</button>
        </nav>
        {menu && (
          <div className="fixed inset-0 z-modal flex items-end bg-trachite/60 lg:hidden" onClick={() => setMenu(false)} role="presentation">
            <div role="dialog" aria-modal="true" aria-label="Menu" className="w-full bg-sand p-4 pb-8" onClick={(e) => e.stopPropagation()}>
              <ul className="grid grid-cols-2 gap-2">
                {nav.map((n) => <li key={n.href}><ALink href={n.href} className="flex h-14 items-center gap-2 border-filo border-trachite bg-white px-3 text-sm font-semibold"><span aria-hidden>{n.icon}</span>{n.label}</ALink></li>)}
                <li><a href="/" target="_blank" rel="noopener" className="flex h-14 items-center gap-2 border-filo border-trachite bg-white px-3 text-sm font-semibold">↗ Vedi il sito</a></li>
                <li><button type="button" onClick={logout} className="flex h-14 w-full items-center gap-2 bg-trachite px-3 text-sm font-semibold text-sand">⏻ Esci</button></li>
              </ul>
            </div>
          </div>
        )}
      </div>
      <Toaster position="top-center" richColors closeButton />
    </AdminCtx.Provider>
  );
}
