import type { Metadata } from "next";
import { Trama, TramaBand, type TramaColor } from "@/components/trama/Trama";
import type { MotifName } from "@/components/trama/motifs";
import { RevealFrame } from "@/components/trama/RevealFrame";
import { Button } from "@/components/ui/Button";
import { BadgeGoogle, BadgeOpen } from "@/components/ui/Badge";
import { Chip } from "@/components/ui/Chip";
import { SectionHead } from "@/components/ui/SectionHead";
import { Logo } from "@/components/ui/Logo";
import { IconArrow, IconFuel, IconGear, IconPhone, IconSeats, IconWhatsApp, Nodo } from "@/components/ui/icons";
import { site } from "@/data/site";

export const metadata: Metadata = { title: "Design system «Trama»", robots: { index: false, follow: false } };

/* ---------- dati della tavola ---------- */
type Swatch = { name: string; token: string; hex: string; role: string; text: "light" | "dark"; checks: string[] };
const palette: { group: string; items: Swatch[] }[] = [
  {
    group: "Brand: dal logo",
    items: [
      { name: "Blu Sulcis", token: "sulcis-blue", hex: "#1A6FA3", role: "Primario · mare profondo", text: "light", checks: ["Bianco 5.5 AA", "Su sabbia 4.7 AA"] },
      { name: "Blu profondo", token: "sulcis-blue-deep", hex: "#0F4C75", role: "Hover · testo piccolo blu", text: "light", checks: ["Bianco 9.1 AAA", "Su sabbia 7.8 AAA"] },
      { name: "Magenta Rent", token: "rent-magenta", hex: "#D11F6E", role: "Accento · CTA · energia", text: "light", checks: ["Bianco 5.1 AA", "Su sabbia 4.4 solo ≥24px"] },
      { name: "Magenta profondo", token: "rent-magenta-deep", hex: "#B0185B", role: "Hover CTA · link", text: "light", checks: ["Bianco 6.7 AA", "Su sabbia 5.8 AA"] },
    ],
  },
  {
    group: "Territorio",
    items: [
      { name: "Sabbia", token: "sand", hex: "#F3EDE2", role: "Fondo principale · calcare", text: "dark", checks: ["Trachite 14.8 AAA"] },
      { name: "Sabbia 200", token: "sand-200", hex: "#E8DFCF", role: "Fondo alternato", text: "dark", checks: ["Trachite 13.1 AAA"] },
      { name: "Sabbia 300", token: "sand-300", hex: "#D6CAB6", role: "Fili, divisori", text: "dark", checks: ["Non per testo"] },
      { name: "Pietra", token: "stone", hex: "#5E554E", role: "Testo secondario", text: "light", checks: ["Su sabbia 6.2 AA"] },
      { name: "Trachite", token: "trachite", hex: "#1E1A17", role: "Testo · sezioni d'impatto", text: "light", checks: ["Sabbia 14.8 AAA"] },
    ],
  },
  {
    group: "Accenti rari",
    items: [
      { name: "Turchese", token: "turquoise", hex: "#3FB8AF", role: "Acqua bassa · solo su trachite", text: "dark", checks: ["Su trachite 7.2 AAA", "Mai su sabbia"] },
      { name: "Ocra miniera", token: "ochre", hex: "#C9772F", role: "Solo pannello notte", text: "dark", checks: ["Su trachite 5.1 AA"] },
      { name: "Ocra profonda", token: "ochre-deep", hex: "#8E4A1C", role: "Ocra come testo su sabbia", text: "light", checks: ["Su sabbia 5.7 AA"] },
    ],
  },
];

const typeScale = [
  { cls: "text-d-xxl", name: "d-xxl", spec: "clamp(4.5rem, 25.5vw, 34rem) · lh .80", use: "Hero, footer: una parola a tutta larghezza", sample: "Sulcis" },
  { cls: "text-d-xl", name: "d-xl", spec: "clamp(3.75rem, 15vw, 18rem) · lh .82", use: "Pannelli località (qui ridotto)", sample: "Carloforte" },
  { cls: "text-d-l", name: "d-l", spec: "clamp(2.75rem, 8.5vw, 9.5rem) · lh .86", use: "Manifesto, step", sample: "Ti diamo il Sulcis" },
  { cls: "text-d-m", name: "d-m", spec: "clamp(2.25rem, 5.2vw, 5.5rem) · lh .90", use: "Titoli di sezione", sample: "La flotta" },
  { cls: "text-d-s", name: "d-s", spec: "clamp(1.625rem, 2.6vw, 2.5rem) · lh .95", use: "Nomi auto, FAQ", sample: "Citycar" },
];

const motifBoard: { motif: MotifName; fg: TramaColor; bg: TramaColor; cell: number; label: string }[] = [
  { motif: "rombo", fg: "rent-magenta", bg: "sand", cell: 14, label: "Rombo · magenta / sabbia" },
  { motif: "rombo", fg: "sand", bg: "sulcis-blue", cell: 14, label: "Rombo · sabbia / blu" },
  { motif: "occhio", fg: "sulcis-blue", bg: "sand-200", cell: 16, label: "Occhio · blu / sabbia 200" },
  { motif: "occhio", fg: "ochre", bg: "trachite", cell: 16, label: "Occhio · ocra / trachite (notte)" },
  { motif: "pibiones", fg: "trachite", bg: "sand", cell: 14, label: "Pibiones · trachite / sabbia" },
  { motif: "pibiones", fg: "rent-magenta", bg: "trachite", cell: 14, label: "Pibiones · magenta / trachite" },
  { motif: "scala", fg: "sand", bg: "rent-magenta", cell: 12, label: "Scala · sabbia / magenta" },
  { motif: "denti", fg: "sulcis-blue", bg: "sand", cell: 14, label: "Denti · blu / sabbia" },
];

/* ---------- pagina ---------- */
export default function DesignSystemPage() {
  return (
    <main className="overflow-x-clip">

      {/* COPERTINA */}
      <header className="relative bg-sand pt-10">
        <div className="wrap flex items-center justify-between">
          <Logo className="text-xl" />
          <span className="eyebrow text-stone">Design system v0.1 · noindex</span>
        </div>
        <h1 className="display mt-10 select-none px-[1vw] text-d-xxl leading-[0.78] text-trachite">
          Trama<span className="text-magenta">.</span>
        </h1>
        <div className="wrap grid gap-6 pb-16 pt-6 md:grid-cols-12">
          <p className="text-lead md:col-span-6">
            Il linguaggio visivo di Sulcis Rent. Tipografia gigante e ferma, la tessitura sarda
            ridotta a pura geometria, due colori dal logo e la terra del Sulcis intorno.
          </p>
          <p className="text-sm text-stone md:col-span-4 md:col-start-9">
            I titoli usano assi fissi (larghezza 72, peso 850): nessuna deformazione legata allo scroll,
            per non affaticare la vista né creare rischi per chi è sensibile al movimento.
          </p>
        </div>
        <TramaBand fg="rent-magenta" bg="sand" cell={8} />
      </header>

      {/* 01 COLORI */}
      <section className="bg-sand py-section" aria-labelledby="ds-colori">
        <div className="wrap">
          <SectionHead index="01" label="Colore" />
          <h2 id="ds-colori" className="display mt-8 text-d-m">Mare, calcare, trachite</h2>
          <p className="mt-4 max-w-prose text-stone">
            Blu e magenta escono dal logo e restano i protagonisti. Il resto viene dal territorio. Turchese e ocra sono
            accenti rarissimi: il turchese mai su sabbia, l&apos;ocra solo nel momento «notte» delle miniere.
          </p>
          <p className="mt-3 max-w-prose text-xs text-ochre-deep">
            ⚠ TODO cliente: i valori del brand vengono dal brief (logo a bassa risoluzione). Vanno ricampionati da
            public/brand/logo HD, che non è ancora nel repository.
          </p>
          <div className="mt-12 space-y-12">
            {palette.map((g) => (
              <div key={g.group}>
                <h3 className="eyebrow mb-4 text-stone">{g.group}</h3>
                <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {g.items.map((s) => (
                    <li key={s.token} className="border-filo border-trachite">
                      <div
                        className={`flex h-36 flex-col justify-between p-3 ${s.text === "light" ? "text-white" : "text-trachite"}`}
                        style={{ background: `rgb(var(--${s.token}))` }}
                      >
                        <span className="eyebrow">{s.hex}</span>
                        <span className="display text-3xl" style={{ fontVariationSettings: '"wdth" 70, "wght" 850' }}>Aa</span>
                      </div>
                      <div className="space-y-1 bg-sand p-3">
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-xs text-stone">{s.role}</p>
                        <p className="font-mono text-[11px] text-stone">--{s.token}</p>
                        <ul className="flex flex-wrap gap-1 pt-1">
                          {s.checks.map((c) => (
                            <li key={c} className="bg-sand-200 px-1.5 py-0.5 text-[11px] font-semibold">{c}</li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {/* proporzioni d'uso */}
          <div className="mt-12">
            <h3 className="eyebrow mb-3 text-stone">Proporzione d&apos;uso sull&apos;intero sito</h3>
            <div className="flex h-12 w-full border-filo border-trachite" aria-label="Sabbia 55%, trachite 18%, blu 14%, magenta 10%, ocra e turchese 3%" role="img">
              <span className="bg-sand" style={{ width: "55%" }} />
              <span className="bg-trachite" style={{ width: "18%" }} />
              <span className="bg-blue" style={{ width: "14%" }} />
              <span className="bg-magenta" style={{ width: "10%" }} />
              <span className="bg-ochre" style={{ width: "1.5%" }} />
              <span className="bg-turquoise" style={{ width: "1.5%" }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-stone"><span>Sabbia 55</span><span>Trachite 18 · Blu 14 · Magenta 10 · Ocra/Turchese 3</span></div>
          </div>
        </div>
      </section>

      {/* 02 TIPOGRAFIA */}
      <section className="bg-trachite py-section text-sand" aria-labelledby="ds-type">
        <div className="wrap">
          <SectionHead index="02" label="Tipografia" tone="dark" />
          <div className="mt-8 grid gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="eyebrow text-magenta">Display · Archivo variable</p>
              <h2 id="ds-type" className="display mt-3 text-d-l">Un font,<br />due assi</h2>
            </div>
            <div className="space-y-4 text-sand/80 md:col-span-5 md:pt-10">
              <p>
                <strong className="text-sand">Archivo</strong> con assi <code className="text-turquoise">wdth 62–125</code> e{" "}
                <code className="text-turquoise">wght 100–900</code>. Nel condensato nero ha il taglio delle gothic da insegna e
                da targa industriale, la voce più vicina all&apos;Iglesiente minerario. È anche l&apos;unico grotesk con un asse
                larghezza abbastanza ampio da «stirarsi» davvero senza deformarsi.
              </p>
              <p className="text-sm">
                Scartati: <em>Anybody</em> (più stretto, ma gli ink trap a 900 lo rendono «gaming»), <em>Saira</em> (squadrato
                da motorsport, cliché autonoleggio), <em>Science Gothic</em> (largo anche al minimo, non regge i titoli a tutta
                larghezza), <em>Roboto Flex</em> (neutro, file pesante).
              </p>
              <p className="text-sm">
                Testo: <strong className="text-sand">Hanken Grotesk</strong> variable, 400 / 600 / 700. Entrambi via next/font
                (self-hosted, preload, fallback con metriche corrette: niente CLS).
              </p>
            </div>
          </div>

          {/* assi */}
          <div className="mt-16 grid gap-px border-filo border-sand/20 bg-sand/20 md:grid-cols-3">
            {[
              { w: 110, g: 460, k: "Largo", d: "wdth 110 · wght 460: per sottotitoli e contrasti" },
              { w: 72, g: 850, k: "Titoli", d: "wdth 72 · wght 850: tutti i titoli del sito" },
              { w: 62, g: 900, k: "Compresso", d: "wdth 62 · wght 900: numeri e parole a tutta larghezza" },
            ].map((a) => (
              <div key={a.k} className="bg-trachite p-6">
                <p className="eyebrow text-magenta">{a.k}</p>
                <p className="display mt-4 text-[clamp(2.5rem,5.2vw,4.75rem)] leading-[0.85]" style={{ fontVariationSettings: `"wdth" ${a.w}, "wght" ${a.g}` }}>
                  Nebida
                </p>
                <p className="mt-3 font-mono text-xs text-sand/60">{a.d}</p>
              </div>
            ))}
          </div>

          {/* larghezze */}
          <div className="mt-10 space-y-1 overflow-hidden">
            {[62, 75, 90, 105, 125].map((w) => (
              <div key={w} className="flex items-baseline gap-4 border-b border-sand/10">
                <span className="w-16 shrink-0 font-mono text-xs text-sand/50">wdth {w}</span>
                <span className="display whitespace-nowrap text-[clamp(2rem,5vw,4.5rem)] leading-none" style={{ fontVariationSettings: `"wdth" ${w}, "wght" 800` }}>
                  Sant&apos;Antioco · Ajò
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* scala */}
      <section className="bg-sand py-section" aria-labelledby="ds-scale">
        <div className="wrap">
          <SectionHead index="02b" label="Scala tipografica" />
          <h2 id="ds-scale" className="sr-only">Scala tipografica</h2>
          <div className="mt-10 divide-y divide-sand-300">
            {typeScale.map((t) => (
              <div key={t.name} className="grid gap-4 py-6 md:grid-cols-12">
                <div className="md:col-span-3">
                  <p className="font-mono text-sm font-semibold">{t.name}</p>
                  <p className="font-mono text-xs text-stone">{t.spec}</p>
                  <p className="mt-1 text-xs text-stone">{t.use}</p>
                </div>
                <p className={`display overflow-hidden whitespace-nowrap md:col-span-9 ${t.name === "d-xxl" ? "text-[clamp(3.5rem,14vw,18rem)] leading-[0.8]" : t.name === "d-xl" ? "text-[clamp(3rem,9vw,11rem)] leading-[0.82]" : t.cls}`}>
                  {t.sample}
                </p>
              </div>
            ))}
            <div className="grid gap-4 py-6 md:grid-cols-12">
              <div className="md:col-span-3">
                <p className="font-mono text-sm font-semibold">lead · base · sm · xs</p>
                <p className="font-mono text-xs text-stone">Hanken Grotesk 19–24 / 17 / 15 / 13 px</p>
              </div>
              <div className="space-y-3 md:col-span-6">
                <p className="text-lead">Il sud-ovest della Sardegna, alla tua velocità. Scegli l&apos;auto, scrivici e parti.</p>
                <p className="text-base">Noleggio auto a San Giovanni Suergiu, nel cuore del Sulcis Iglesiente. Da qui Sant&apos;Antioco, Calasetta e Porto Pino sono lì, oltre il parabrezza.</p>
                <p className="text-sm text-stone">Testo secondario in Pietra, 6.2:1 su sabbia.</p>
                <p className="text-xs text-stone">Note e didascalie.</p>
                <p className="eyebrow">Eyebrow · 12px · +16% tracking · 600</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03 SPAZIO E MOTION */}
      <section className="bg-sand-200 py-section" aria-labelledby="ds-space">
        <div className="wrap">
          <SectionHead index="03" label="Spazio, forma, movimento" />
          <h2 id="ds-space" className="display mt-8 text-d-m">Netto. Tagliato. Al gradino.</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="border-filo border-trachite bg-sand p-6">
              <p className="eyebrow text-magenta">Spaziatura</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li><code className="font-mono">--gutter</code>: clamp(16px, 3.2vw, 44px)</li>
                <li><code className="font-mono">--section-y</code>: clamp(80px, 13vw, 208px)</li>
                <li><code className="font-mono">--u</code>: cella trama, clamp(14px, 2.2vw, 28px)</li>
                <li>Base Tailwind 4px · contenuto max 88rem · prosa max 38rem</li>
                <li>Griglia 4 colonne sotto 768, 12 da 768</li>
              </ul>
              <div className="mt-5 flex items-end gap-2" aria-hidden>
                {[4, 8, 12, 16, 24, 32, 48, 64].map((n) => <span key={n} className="bg-blue" style={{ width: 12, height: n }} />)}
              </div>
            </div>
            <div className="border-filo border-trachite bg-sand p-6">
              <p className="eyebrow text-magenta">Forma</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li><strong>Raggio 0</strong> ovunque: card, bottoni, modale. Il tessuto si taglia, non si arrotonda.</li>
                <li>Unica eccezione <strong>rounded-full</strong>: cursore custom e pulsante WhatsApp flottante.</li>
                <li><strong>Niente ombre.</strong> La profondità nasce da campiture piene e dal «filo» (bordo 1.5px trachite).</li>
                <li>La diagonale a 45° è la firma: rombi, nodi, reveal.</li>
              </ul>
            </div>
            <div className="border-filo border-trachite bg-sand p-6">
              <p className="eyebrow text-magenta">Movimento</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li><code className="font-mono">ease-trama</code> cubic-bezier(.77,0,.18,1): stacchi decisi (wipe, reveal)</li>
                <li><code className="font-mono">ease-out</code> cubic-bezier(.16,1,.3,1): entrate di testo</li>
                <li>Durate 180 · 400 · 800 ms; reveal di righe 900 ms, stagger 60 ms</li>
                <li>Lenis lerp 0.1 · GSAP + ScrollTrigger caricati dopo l&apos;LCP</li>
                <li>Reduced motion: solo fade 200 ms, niente pin, parallax o assi</li>
              </ul>
              <svg viewBox="0 0 200 80" className="mt-5 w-full" aria-hidden>
                <path d="M10 70 C 164 70, 46 10, 190 10" stroke="rgb(var(--rent-magenta))" strokeWidth="3" fill="none" />
                <path d="M10 70 C 42 10, 70 10, 190 10" stroke="rgb(var(--sulcis-blue))" strokeWidth="3" fill="none" strokeDasharray="5 5" />
              </svg>
              <p className="text-xs text-stone">— trama · - - out</p>
            </div>
          </div>
        </div>
      </section>

      {/* 04 COMPONENTI */}
      <section className="bg-sand py-section" aria-labelledby="ds-comp">
        <div className="wrap">
          <SectionHead index="04" label="Componenti base" />
          <h2 id="ds-comp" className="display mt-8 text-d-m">Pezzi del telaio</h2>

          <h3 className="eyebrow mt-12 text-stone">Bottoni · hover: la campitura scorre da sinistra, il nodo ruota</h3>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant="magenta" size="xl" nodo>Ajò, si parte</Button>
            <Button variant="blue" size="lg" icon={<IconArrow />}>Guarda la flotta</Button>
            <Button variant="dark" size="lg" icon={<IconWhatsApp />}>WhatsApp</Button>
            <Button variant="outline" size="md">Chiedi il prezzo</Button>
            <span className="relative inline-block bg-blue p-3"><Button variant="sand" size="md" icon={<IconPhone />}>Chiama</Button></span>
          </div>
          <p className="mt-2 text-xs text-stone">«Ajò» = «dai, andiamo». TODO verificare grafia con cliente. Ogni CTA di prenotazione apre il modale contatti.</p>

          <h3 className="eyebrow mt-12 text-stone">Badge e filtri</h3>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <BadgeOpen />
            <BadgeGoogle />
            <span className="bg-trachite p-2"><BadgeOpen tone="dark" /></span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip active count={6}>Tutte</Chip>
            <Chip count={1}>Citycar</Chip>
            <Chip count={2}>Utilitaria</Chip>
            <Chip count={1}>SUV</Chip>
            <Chip count={1}>7/9 posti</Chip>
            <Chip count={1}>Furgoni</Chip>
          </div>
          <p className="mt-2 text-xs text-stone">Conteggi d&apos;esempio: in produzione vengono da src/data/fleet.ts.</p>

          <div className="mt-14 grid gap-10 lg:grid-cols-12">
            {/* card auto */}
            <div className="lg:col-span-5">
              <h3 className="eyebrow mb-4 text-stone">Card auto · cursore «Guarda»</h3>
              <article className="group border-filo border-trachite bg-sand">
                <div className="relative aspect-[4/3] overflow-hidden bg-blue">
                  <Trama motif="pibiones" fg="sand" cell={12} opacity={0.35} className="transition-transform duration-slow ease-trama group-hover:scale-110" />
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="eyebrow border-filo border-sand/60 px-3 py-2 text-sand">Foto auto scontornata</span>
                  </div>
                  <span className="eyebrow absolute left-3 top-3 bg-sand px-2 py-1">Citycar</span>
                </div>
                <div className="p-5">
                  <div className="flex items-end justify-between gap-4">
                    <h4 className="display text-d-s">Auto d&apos;esempio</h4>
                    <span className="text-sm font-semibold text-magenta-deep">Chiedi il prezzo</span>
                  </div>
                  <ul className="mt-4 grid grid-cols-3 border-t-filo border-trachite pt-4 text-sm">
                    <li className="flex items-center gap-2"><IconSeats />5 posti</li>
                    <li className="flex items-center gap-2"><IconGear />Manuale</li>
                    <li className="flex items-center gap-2"><IconFuel />Benzina</li>
                  </ul>
                  <Button variant="magenta" size="md" className="mt-5 w-full" nodo>Voglio questa auto</Button>
                </div>
              </article>
            </div>

            {/* modale */}
            <div className="lg:col-span-7">
              <h3 className="eyebrow mb-4 text-stone">Modale «Prenota con noi» · focus trap, Esc, nessuna data</h3>
              <div className="relative overflow-hidden bg-trachite/70 p-4 md:p-10">
                <Trama motif="rombo" fg="trachite" bg="trachite-800" cell={10} opacity={0.6} />
                <div role="dialog" aria-label="Anteprima modale" className="relative bg-sand">
                  <div className="relative h-3 overflow-hidden"><Trama motif="scala" fg="sand" bg="rent-magenta" cell={3} /></div>
                  <div className="p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow text-magenta-deep">Auto d&apos;esempio</p>
                        <p className="display mt-2 text-d-m">Prenota con noi</p>
                      </div>
                      <span className="grid h-11 w-11 place-items-center border-filo border-trachite text-xl" aria-hidden>×</span>
                    </div>
                    <p className="mt-3 text-stone">Disponibilità e preventivo in pochi minuti. Siamo aperti h24.</p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <Button variant="magenta" size="xl" icon={<IconWhatsApp className="h-6 w-6" />}>Scrivici su WhatsApp</Button>
                      <Button variant="dark" size="xl" icon={<IconPhone className="h-6 w-6" />}>Chiamaci</Button>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t-filo border-trachite pt-4">
                      <span className="display text-3xl" style={{ fontVariationSettings: '"wdth" 75, "wght" 800' }}>{site.phone.display}</span>
                      <span className="eyebrow border-filo border-trachite px-3 py-2">Copia</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* contatto persistente */}
          <div className="mt-14 grid gap-10 md:grid-cols-2">
            <div>
              <h3 className="eyebrow mb-4 text-stone">Mobile · barra sticky dopo l&apos;hero</h3>
              <div className="mx-auto max-w-[360px] border-filo border-trachite">
                <div className="h-28 bg-sand-200" />
                <div className="grid grid-cols-2">
                  <span className="flex h-16 items-center justify-center gap-2 bg-magenta font-bold uppercase tracking-wider text-white"><IconWhatsApp />WhatsApp</span>
                  <span className="flex h-16 items-center justify-center gap-2 bg-trachite font-bold uppercase tracking-wider text-sand"><IconPhone />Chiama</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="eyebrow mb-4 text-stone">Desktop · WhatsApp flottante + cursore</h3>
              <div className="relative h-48 border-filo border-trachite bg-sand-200">
                <span className="absolute left-10 top-10 grid h-24 w-24 place-items-center rounded-full bg-magenta eyebrow text-white">Guarda</span>
                <span className="absolute left-40 top-16 grid h-24 w-24 place-items-center rounded-full bg-trachite eyebrow text-sand">Prenota</span>
                <span className="absolute bottom-4 right-4 grid h-14 w-14 place-items-center rounded-full bg-magenta text-white" aria-hidden><IconWhatsApp className="h-7 w-7" /></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 05 TRAMA */}
      <section className="bg-trachite py-section text-sand" aria-labelledby="ds-trama">
        <div className="wrap">
          <SectionHead index="05" label="Trama · il motivo sardo" tone="dark" />
          <div className="mt-8 grid gap-8 md:grid-cols-12">
            <h2 id="ds-trama" className="display text-d-l md:col-span-7">Il telaio,<br />non il souvenir</h2>
            <ul className="space-y-3 text-sand/80 md:col-span-5 md:pt-6">
              <li className="flex gap-3"><Nodo className="mt-1.5 h-2.5 w-2.5 shrink-0 text-magenta" /><span>Ogni motivo è una griglia di celle quadrate, come i punti di un telaio. Niente curve, niente ornamento.</span></li>
              <li className="flex gap-3"><Nodo className="mt-1.5 h-2.5 w-2.5 shrink-0 text-magenta" /><span><strong className="text-sand">Al massimo due colori per volta</strong>: il motivo e il fondo. L&apos;API del componente accetta solo fg + bg.</span></li>
              <li className="flex gap-3"><Nodo className="mt-1.5 h-2.5 w-2.5 shrink-0 text-magenta" /><span><strong className="text-sand">Sempre grande</strong>: cella minima 10px. Se non si legge come geometria, non si usa.</span></li>
              <li className="flex gap-3"><Nodo className="mt-1.5 h-2.5 w-2.5 shrink-0 text-magenta" /><span>Funzioni, non decori: fondi d&apos;impatto, divisori, maschere di reveal, preloader.</span></li>
              <li className="flex gap-3"><Nodo className="mt-1.5 h-2.5 w-2.5 shrink-0 text-magenta" /><span>SVG statico server-side, un solo path per tile: zero JS e peso irrilevante.</span></li>
            </ul>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-4">
            {motifBoard.map((m) => (
              <figure key={m.label}>
                <div className="relative aspect-square overflow-hidden border-filo border-sand/20">
                  <Trama motif={m.motif} fg={m.fg} bg={m.bg} cell={m.cell} />
                </div>
                <figcaption className="mt-2 text-xs text-sand/70">{m.label}</figcaption>
              </figure>
            ))}
          </div>

          {/* applicazioni */}
          <h3 className="eyebrow mt-16 text-sand/60">Applicazioni</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <figure>
              <div className="relative flex aspect-[4/3] items-end overflow-hidden bg-magenta p-5">
                <Trama motif="rombo" fg="rent-magenta-deep" cell={18} />
                <p className="display relative text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.85] text-white">Ajò!</p>
              </div>
              <figcaption className="mt-2 text-xs text-sand/70">Fondo d&apos;impatto tono su tono: magenta + magenta profondo (2 colori)</figcaption>
            </figure>
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2"><TramaBand fg="sulcis-blue" cell={12} /></div>
              </div>
              <figcaption className="mt-2 text-xs text-sand/70">Divisore di sezione «denti»: blu su sabbia</figcaption>
            </figure>
            <figure>
              <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-sand">
                <div className="relative h-28 w-28 overflow-hidden" style={{ clipPath: "polygon(50% 0,100% 50%,50% 100%,0 50%)" }}>
                  <Trama motif="pibiones" fg="sand" bg="sulcis-blue" cell={10} />
                </div>
              </div>
              <figcaption className="mt-2 text-xs text-sand/70">Texture del preloader: pibiones dentro il rombo</figcaption>
            </figure>
          </div>

          {/* no */}
          <div className="mt-10 grid gap-3 border-t border-sand/20 pt-6 text-sm text-sand/70 md:grid-cols-3">
            <p><span className="font-bold text-magenta">No</span> · tre o più colori nello stesso motivo</p>
            <p><span className="font-bold text-magenta">No</span> · motivi piccoli usati come «carta da parati» o bordino folk</p>
            <p><span className="font-bold text-magenta">No</span> · pavoncelle, cavallini, figure: solo geometria</p>
          </div>
        </div>
      </section>

      {/* 06 HERO REVEAL */}
      <section className="bg-sand py-section" aria-labelledby="ds-hero">
        <div className="wrap">
          <SectionHead index="06" label="Hero · reveal a rombi" />
          <h2 id="ds-hero" className="display mt-8 text-d-m">Il Sulcis si apre a rombi</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[0.12, 0.5, 1].map((p) => (
              <figure key={p} className="border-filo border-trachite">
                <RevealFrame progress={p} />
                <figcaption className="border-t-filo border-trachite p-3 text-xs">Scroll {Math.round(p * 100)}%</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8 grid gap-6 text-sm md:grid-cols-3">
            <p><strong>Griglia grossa.</strong> Su desktop 6×4 più le righe sfalsate (≤ 35 rombi), su mobile 4×7 (≈ 32). Tutti in un solo clipPath SVG: nessun canvas e nessuna immagine extra.</p>
            <p><strong>Solo transform.</strong> GSAP anima la scala di ogni rombo dal centro verso i bordi, legata allo scroll (scrub). Sotto c&apos;è una foto della strada costiera (AVIF, priority); il titolo SULCIS passa da trachite a sabbia dove la foto si scopre.</p>
            <p><strong>Fallback statico.</strong> Con prefers-reduced-motion, o con <code>navigator.connection.saveData</code> / effectiveType 2g–3g, i rombi non si animano: l&apos;hero mostra direttamente il fotogramma 100% e GSAP non viene caricato per l&apos;hero.</p>
          </div>
        </div>
      </section>

      {/* 07 NOTTE */}
      <section className="relative overflow-hidden bg-trachite py-section text-sand" aria-labelledby="ds-notte">
        <Trama motif="occhio" fg="ochre" cell={22} opacity={0.12} />
        <div className="wrap relative">
          <SectionHead index="07" label="L'unico momento notte · pannello Iglesiente" tone="dark" />
          <p id="ds-notte" className="display mt-10 text-d-xl text-ochre">Porto Flavia</p>
          <p className="mt-6 max-w-prose text-lead text-sand/85">
            Nello scroll orizzontale del Territorio, un solo pannello si spegne: trachite, ocra e la geometria
            «occhio» a bassa intensità. Il resto del sito resta in pieno sole.
          </p>
          <p className="mt-3 text-xs text-sand/50">Copy e foto definitivi nella fase sezioni. Nessun dato su distanze o tempi.</p>
        </div>
      </section>

      <footer className="bg-sand py-10">
        <div className="wrap flex flex-wrap items-center justify-between gap-4 text-xs text-stone">
          <span>Sulcis Rent · Design system «Trama» v0.1</span>
          <span>Sito realizzato da <a className="underline" href={site.credit.url}>{site.credit.label}</a></span>
        </div>
      </footer>
    </main>
  );
}
