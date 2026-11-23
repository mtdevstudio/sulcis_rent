import type { Lang } from "@/lib/types";
import { paths } from "@/lib/i18n";
import { site } from "@/data/site";
import { SiteShell } from "@/components/site/SiteShell";

/** Pagine legali: struttura e testo SEGNAPOSTO. // TODO cliente: testi definitivi validati da un consulente privacy. */
const content = {
  privacy: {
    it: { title: "Privacy policy", sections: [
      ["Titolare del trattamento", `${site.legalName}, ${site.address.street}, ${site.address.postalCode} ${site.address.city} (${site.address.province}). P.IVA: // TODO cliente. Contatti: ${site.phone.display}.`],
      ["Dati trattati", "Il sito non raccoglie dati tramite moduli. Se ci contatti su WhatsApp o per telefono, tratteremo i dati che ci fornisci (nome, numero, messaggio) solo per rispondere alla tua richiesta di noleggio. // TODO cliente: completare."],
      ["Mappa e servizi di terze parti", "La mappa di Google viene caricata solo se clicchi «Carica la mappa». WhatsApp è un servizio di Meta Platforms: l'uso è regolato dalla sua informativa."],
      ["Statistiche", "Al momento il sito non usa strumenti di analisi né pixel pubblicitari. // TODO aggiornare se si attivano GA4 o Meta Pixel."],
      ["Diritti dell'interessato", "Puoi chiedere accesso, rettifica o cancellazione dei tuoi dati contattandoci. // TODO cliente: testo completo ai sensi del GDPR (artt. 13-22)."],
    ] },
    en: { title: "Privacy policy", sections: [
      ["Data controller", `${site.legalName}, ${site.address.street}, ${site.address.postalCode} ${site.address.city} (${site.address.province}), Italy. VAT: // TODO. Contact: ${site.phone.display}.`],
      ["Data we process", "The website collects no data through forms. If you contact us on WhatsApp or by phone, we process the data you give us only to answer your rental request. // TODO."],
      ["Maps and third parties", "Google Maps loads only if you click “Load the map”. WhatsApp is a Meta Platforms service governed by its own policy."],
      ["Analytics", "The website currently uses no analytics or advertising pixels. // TODO update if GA4 or Meta Pixel are enabled."],
      ["Your rights", "You can request access, correction or deletion of your data by contacting us. // TODO full GDPR text."],
    ] },
  },
  cookie: {
    it: { title: "Cookie policy", sections: [
      ["Cookie tecnici", "Il sito usa solo memorizzazione tecnica nel browser (sessionStorage) per non ripetere l'animazione iniziale. Nessun cookie di profilazione."],
      ["Cookie di terze parti", "Google Maps può impostare cookie solo dopo che hai scelto di caricare la mappa."],
      ["Area riservata", "L'area /admin usa cookie tecnici di sessione, necessari solo al personale autorizzato."],
      ["Gestione", "Puoi cancellare cookie e dati del sito dalle impostazioni del browser. // TODO cliente: completare."],
    ] },
    en: { title: "Cookie policy", sections: [
      ["Technical storage", "The website only uses technical browser storage (sessionStorage) to avoid repeating the intro animation. No profiling cookies."],
      ["Third-party cookies", "Google Maps may set cookies only after you choose to load the map."],
      ["Staff area", "The /admin area uses technical session cookies, for authorised staff only."],
      ["Managing cookies", "You can delete cookies and site data from your browser settings. // TODO."],
    ] },
  },
};

export function legalTitle(kind: "privacy" | "cookie", lang: Lang) { return content[kind][lang].title; }

export function LegalPage({ kind, lang }: { kind: "privacy" | "cookie"; lang: Lang }) {
  const c = content[kind][lang];
  const other = lang === "it" ? "en" : "it";
  return (
    <SiteShell lang={lang} altHref={paths[other][kind]}>
      <article className="wrap max-w-4xl pb-section pt-32">
        <h1 className="display text-d-l">{c.title}</h1>
        <p className="mt-4 bg-ochre/20 p-3 text-sm">{lang === "it" ? "Testo segnaposto, da completare con il cliente." : "Placeholder text, to be completed."}</p>
        <div data-hero-end />
        {c.sections.map(([h, p]) => (
          <section key={h} className="mt-10">
            <h2 className="display text-d-s">{h}</h2>
            <p className="mt-3 max-w-prose text-lead">{p}</p>
          </section>
        ))}
      </article>
    </SiteShell>
  );
}
