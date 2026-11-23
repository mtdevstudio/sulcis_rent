import credits from "@/data/photo-credits.json";
import { SiteShell } from "@/components/site/SiteShell";

type Credit = { title: string; creator: string; creatorUrl: string | null; license: string; licenseUrl: string | null; source: string };

/** Crediti delle foto di ESEMPIO (licenze libere via Openverse). Da rimuovere quando arrivano le foto reali. */
export function CreditsPage() {
  const list = Object.entries(credits as Record<string, Credit>);
  return (
    <SiteShell lang="it" altHref="/en/">
      <article className="wrap max-w-4xl pb-section pt-32">
        <h1 className="display text-d-l">Crediti foto</h1>
        <p className="mt-4 max-w-prose text-lead">
          Le foto di questo sito sono <strong>immagini di esempio</strong> con licenza libera, usate in attesa delle foto reali.
          Le auto ritratte sono modelli d&apos;esempio, non la flotta di Sulcis Rent.
        </p>
        <div data-hero-end />
        <ul className="mt-10 divide-y divide-sand-300 border-y border-sand-300 text-sm">
          {list.map(([slug, c]) => (
            <li key={slug} className="grid gap-1 py-3 md:grid-cols-[10rem_1fr]">
              <span className="font-mono text-xs text-stone">{slug}</span>
              <span>
                <a href={c.source} target="_blank" rel="noopener nofollow" className="underline underline-offset-2">{c.title || "Senza titolo"}</a>
                {" — "}{c.creatorUrl ? <a href={c.creatorUrl} target="_blank" rel="noopener nofollow" className="underline underline-offset-2">{c.creator}</a> : c.creator}
                {" · "}{c.licenseUrl ? <a href={c.licenseUrl} target="_blank" rel="noopener nofollow" className="underline underline-offset-2">{c.license}</a> : c.license}
              </span>
            </li>
          ))}
        </ul>
      </article>
    </SiteShell>
  );
}
