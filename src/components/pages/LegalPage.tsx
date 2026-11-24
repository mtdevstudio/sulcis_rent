import type { Lang } from "@/lib/types";
import { alternatesOf } from "@/lib/i18n";
import { site } from "@/data/site";
import { SiteShell } from "@/components/site/SiteShell";

/**
 * Pagine legali: struttura e testo SEGNAPOSTO in 6 lingue.
 * // TODO cliente: testi definitivi validati da un consulente privacy (poi tradotti).
 */
type Doc = { title: string; note: string; sections: [string, string][] };
const A = `${site.legalName}, ${site.address.street}, ${site.address.postalCode} ${site.address.city} (${site.address.province})`;

const privacy: Record<Lang, Doc> = {
  it: { title: "Privacy policy", note: "Testo segnaposto, da completare con il cliente.", sections: [
    ["Titolare del trattamento", `${A}. P.IVA: // TODO cliente. Contatti: ${site.phone.display}.`],
    ["Dati trattati", "Il sito non raccoglie dati tramite moduli. Se ci contatti su WhatsApp o per telefono, trattiamo i dati che ci fornisci (nome, numero, messaggio) solo per rispondere alla tua richiesta di noleggio."],
    ["Mappa e servizi di terze parti", "La mappa di Google si carica solo se clicchi «Carica la mappa». WhatsApp è un servizio di Meta Platforms, regolato dalla sua informativa."],
    ["Statistiche", "Al momento il sito non usa strumenti di analisi né pixel pubblicitari."],
    ["Diritti dell'interessato", "Puoi chiedere accesso, rettifica o cancellazione dei tuoi dati contattandoci (artt. 15–22 GDPR)."],
  ] },
  en: { title: "Privacy policy", note: "Placeholder text, to be completed.", sections: [
    ["Data controller", `${A}, Italy. VAT: // TODO. Contact: ${site.phone.display}.`],
    ["Data we process", "The website collects no data through forms. If you contact us on WhatsApp or by phone, we process the data you give us only to answer your rental request."],
    ["Maps and third parties", "Google Maps loads only if you click “Load the map”. WhatsApp is a Meta Platforms service governed by its own policy."],
    ["Analytics", "The website currently uses no analytics or advertising pixels."],
    ["Your rights", "You can request access, correction or deletion of your data by contacting us (GDPR arts. 15–22)."],
  ] },
  fr: { title: "Politique de confidentialité", note: "Texte provisoire, à compléter.", sections: [
    ["Responsable du traitement", `${A}, Italie. TVA : // TODO. Contact : ${site.phone.display}.`],
    ["Données traitées", "Le site ne collecte aucune donnée via des formulaires. Si tu nous contactes sur WhatsApp ou par téléphone, nous traitons les données fournies uniquement pour répondre à ta demande de location."],
    ["Carte et services tiers", "Google Maps ne se charge que si tu cliques sur « Charger la carte ». WhatsApp est un service de Meta Platforms régi par sa propre politique."],
    ["Statistiques", "Le site n'utilise actuellement aucun outil d'analyse ni pixel publicitaire."],
    ["Tes droits", "Tu peux demander l'accès, la rectification ou l'effacement de tes données en nous contactant (art. 15–22 RGPD)."],
  ] },
  es: { title: "Política de privacidad", note: "Texto provisional, pendiente de completar.", sections: [
    ["Responsable del tratamiento", `${A}, Italia. NIF/IVA: // TODO. Contacto: ${site.phone.display}.`],
    ["Datos tratados", "La web no recoge datos mediante formularios. Si nos contactas por WhatsApp o por teléfono, tratamos los datos que nos facilitas solo para responder a tu solicitud de alquiler."],
    ["Mapa y servicios de terceros", "Google Maps solo se carga si pulsas «Cargar el mapa». WhatsApp es un servicio de Meta Platforms regulado por su propia política."],
    ["Estadísticas", "Actualmente la web no utiliza herramientas de análisis ni píxeles publicitarios."],
    ["Tus derechos", "Puedes solicitar el acceso, la rectificación o la supresión de tus datos contactándonos (arts. 15–22 RGPD)."],
  ] },
  pt: { title: "Política de privacidade", note: "Texto provisório, a completar.", sections: [
    ["Responsável pelo tratamento", `${A}, Itália. NIF/IVA: // TODO. Contacto: ${site.phone.display}.`],
    ["Dados tratados", "O site não recolhe dados através de formulários. Se nos contactares por WhatsApp ou telefone, tratamos os dados fornecidos apenas para responder ao teu pedido de aluguer."],
    ["Mapa e serviços de terceiros", "O Google Maps só é carregado se clicares em «Carregar o mapa». O WhatsApp é um serviço da Meta Platforms regido pela sua própria política."],
    ["Estatísticas", "Atualmente o site não usa ferramentas de análise nem pixels publicitários."],
    ["Os teus direitos", "Podes pedir o acesso, a retificação ou o apagamento dos teus dados contactando-nos (arts. 15–22 RGPD)."],
  ] },
  pl: { title: "Polityka prywatności", note: "Tekst tymczasowy, do uzupełnienia.", sections: [
    ["Administrator danych", `${A}, Włochy. NIP/VAT: // TODO. Kontakt: ${site.phone.display}.`],
    ["Przetwarzane dane", "Strona nie zbiera danych przez formularze. Jeśli kontaktujesz się z nami przez WhatsApp lub telefonicznie, przetwarzamy podane dane wyłącznie w celu odpowiedzi na zapytanie o wynajem."],
    ["Mapa i usługi zewnętrzne", "Mapa Google wczytuje się tylko po kliknięciu „Wczytaj mapę”. WhatsApp to usługa Meta Platforms podlegająca jej własnej polityce."],
    ["Statystyki", "Strona nie korzysta obecnie z narzędzi analitycznych ani pikseli reklamowych."],
    ["Twoje prawa", "Możesz zażądać dostępu do danych, ich sprostowania lub usunięcia, kontaktując się z nami (art. 15–22 RODO)."],
  ] },
};

const cookie: Record<Lang, Doc> = {
  it: { title: "Cookie policy", note: "Testo segnaposto, da completare con il cliente.", sections: [
    ["Cookie tecnici", "Il sito usa solo memorizzazione tecnica: la lingua scelta e il fatto di aver già visto l'animazione iniziale. Nessun cookie di profilazione."],
    ["Cookie di terze parti", "Google Maps può impostare cookie solo dopo che hai scelto di caricare la mappa."],
    ["Area riservata", "L'area /admin usa cookie tecnici di sessione, necessari solo al personale autorizzato."],
  ] },
  en: { title: "Cookie policy", note: "Placeholder text, to be completed.", sections: [
    ["Technical storage", "The website only uses technical storage: your chosen language and whether you have already seen the intro animation. No profiling cookies."],
    ["Third-party cookies", "Google Maps may set cookies only after you choose to load the map."],
    ["Staff area", "The /admin area uses technical session cookies, for authorised staff only."],
  ] },
  fr: { title: "Politique des cookies", note: "Texte provisoire, à compléter.", sections: [
    ["Stockage technique", "Le site utilise uniquement un stockage technique : la langue choisie et le fait d'avoir déjà vu l'animation d'accueil. Aucun cookie de profilage."],
    ["Cookies tiers", "Google Maps peut déposer des cookies uniquement après que tu as choisi de charger la carte."],
    ["Espace réservé", "L'espace /admin utilise des cookies techniques de session, réservés au personnel autorisé."],
  ] },
  es: { title: "Política de cookies", note: "Texto provisional, pendiente de completar.", sections: [
    ["Almacenamiento técnico", "La web solo usa almacenamiento técnico: el idioma elegido y si ya has visto la animación inicial. Ninguna cookie de perfilado."],
    ["Cookies de terceros", "Google Maps solo puede instalar cookies después de que elijas cargar el mapa."],
    ["Área reservada", "El área /admin usa cookies técnicas de sesión, solo para el personal autorizado."],
  ] },
  pt: { title: "Política de cookies", note: "Texto provisório, a completar.", sections: [
    ["Armazenamento técnico", "O site usa apenas armazenamento técnico: o idioma escolhido e se já viste a animação inicial. Nenhum cookie de perfil."],
    ["Cookies de terceiros", "O Google Maps só pode definir cookies depois de escolheres carregar o mapa."],
    ["Área reservada", "A área /admin usa cookies técnicos de sessão, apenas para o pessoal autorizado."],
  ] },
  pl: { title: "Polityka cookies", note: "Tekst tymczasowy, do uzupełnienia.", sections: [
    ["Pamięć techniczna", "Strona używa wyłącznie pamięci technicznej: wybranego języka i informacji, czy animacja powitalna była już wyświetlona. Brak cookies profilujących."],
    ["Cookies zewnętrzne", "Google Maps może zapisywać cookies dopiero po wczytaniu mapy przez użytkownika."],
    ["Strefa zastrzeżona", "Strefa /admin używa technicznych cookies sesyjnych, wyłącznie dla upoważnionego personelu."],
  ] },
};

const docs = { privacy, cookie };

export function legalTitle(kind: "privacy" | "cookie", lang: Lang) { return docs[kind][lang].title; }

export function LegalPage({ kind, lang }: { kind: "privacy" | "cookie"; lang: Lang }) {
  const c = docs[kind][lang];
  return (
    <SiteShell lang={lang} alternates={alternatesOf((p) => p[kind])}>
      <article className="wrap max-w-4xl pb-section pt-32">
        <h1 className="display text-d-l">{c.title}</h1>
        <p className="mt-4 bg-ochre/20 p-3 text-sm">{c.note}</p>
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
