"use client";
import { useEffect, useState } from "react";
import { api, fmtDate } from "../api";
import { ALink, useAdmin } from "../AdminApp";
import { Card, PageHeader, Spinner } from "../ui";

type D = { counts: { published: number; draft: number; hidden: number; trash: number }; recent: { action: string; entity: string; entityId: string | null; at: string; user: string | null; label: string | null }[] };
const actionLabel: Record<string, string> = { create: "ha creato", update: "ha modificato", delete: "ha cestinato", restore: "ha ripristinato", status: "ha cambiato stato a", duplicate: "ha duplicato", photo_add: "ha aggiunto foto a", photo_delete: "ha tolto una foto da", photo_update: "ha riordinato le foto di", featured: "ha cambiato «in evidenza» per", reorder: "ha riordinato", purge: "ha eliminato definitivamente" };
const entityLabel: Record<string, string> = { car: "auto", review: "una recensione", faq: "una FAQ", settings: "le impostazioni" };

export function Dashboard() {
  const { me } = useAdmin();
  const [d, setD] = useState<D | null>(null);
  useEffect(() => { api<D>("GET", "admin/dashboard.php").then(setD).catch(() => {}); }, []);
  return (
    <>
      <PageHeader title={`Ciao ${me.user.name}`}>
        <ALink href="/admin/auto/modifica/" className="inline-flex h-14 items-center gap-2 bg-magenta px-6 font-bold uppercase tracking-wider text-white hover:bg-magenta-deep">+ Aggiungi auto</ALink>
      </PageHeader>
      {!d ? <Spinner /> : (
        <>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[["Pubblicate", d.counts.published, "published", "bg-blue text-white"], ["Bozze", d.counts.draft, "draft", "bg-white"], ["Nascoste", d.counts.hidden, "hidden", "bg-trachite text-sand"], ["Nel cestino", d.counts.trash, "trash", "bg-sand-200"]].map(([l, n, k, c]) => (
              <li key={k as string}>
                <ALink href={k === "trash" ? "/admin/cestino/" : `/admin/auto/?status=${k}`} className={`block border-filo border-trachite p-4 ${c}`}>
                  <span className="display block text-5xl leading-none" style={{ fontVariationSettings: '"wdth" 62, "wght" 900' }}>{n as number}</span>
                  <span className="eyebrow mt-2 block">{l as string}</span>
                </ALink>
              </li>
            ))}
          </ul>
          <Card className="mt-6">
            <h2 className="display text-2xl" style={{ fontVariationSettings: '"wdth" 75, "wght" 800' }}>Ultime modifiche</h2>
            {d.recent.length === 0 ? <p className="mt-3 text-stone">Ancora nessuna modifica.</p> : (
              <ul className="mt-3 divide-y divide-sand-300">
                {d.recent.map((r, i) => (
                  <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm">
                    <span><strong>{r.user ?? "Sistema"}</strong> {actionLabel[r.action] ?? r.action} {r.entity === "car" ? (r.label ? <ALink className="underline" href={`/admin/auto/modifica/?id=${r.entityId}`}>{r.label}</ALink> : "un'auto") : entityLabel[r.entity] ?? r.entity}</span>
                    <span className="text-xs text-stone">{fmtDate(r.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </>
  );
}
