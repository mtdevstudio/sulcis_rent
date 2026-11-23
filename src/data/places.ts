import type { L10n } from "@/lib/types";

/**
 * Località del territorio (sezione Territorio + marquee).
 * Foto: segnaposto in public/images/placeholder/places/{slug}.jpg — TODO cliente: sostituire con foto reali.
 * Nessun dato su distanze o tempi: // TODO se servono, chiederli al cliente.
 */
export type Zone = "sud" | "ovest" | "nord" | "est" | "sulcis";
export type Place = { slug: string; name: string; area: L10n; line: L10n; night?: boolean; zone?: Zone };

export const places: Place[] = [
  { slug: "sant-antioco", name: "Sant'Antioco", area: { it: "Isola di Sant'Antioco", en: "Sant'Antioco island" },
    line: { it: "Si arriva su un ponte, si resta per il mare.", en: "You arrive over a bridge, you stay for the sea." } },
  { slug: "calasetta", name: "Calasetta", area: { it: "Isola di Sant'Antioco", en: "Sant'Antioco island" },
    line: { it: "Case bianche, vento di maestrale e il traghetto per San Pietro.", en: "White houses, mistral wind and the ferry to San Pietro." } },
  { slug: "carloforte", name: "Carloforte", area: { it: "Isola di San Pietro", en: "San Pietro island" },
    line: { it: "Un'isola nell'isola. Si parla tabarchino, si guarda il tramonto.", en: "An island within the island. They speak Tabarchino, you watch the sunset." } },
  { slug: "porto-pino", name: "Porto Pino", area: { it: "Dune e pineta", en: "Dunes and pinewood" },
    line: { it: "Dune bianche come neve e acqua che non sembra vera.", en: "Snow-white dunes and water that doesn't look real." } },
  { slug: "masua", name: "Masua", area: { it: "Pan di Zucchero", en: "Pan di Zucchero" },
    line: { it: "Il Pan di Zucchero esce dal mare. Fermati, guarda.", en: "Pan di Zucchero rises out of the sea. Stop, look." } },
  { slug: "porto-flavia", name: "Porto Flavia", area: { it: "Iglesiente minerario", en: "Mining Iglesiente" }, night: true,
    line: { it: "Un porto scavato nella roccia, sospeso sul mare. Qui il Sulcis racconta la miniera.", en: "A harbour carved into the rock, hanging over the sea. Here the Sulcis tells its mining story." } },
  { slug: "nebida", name: "Nebida", area: { it: "Costa dell'Iglesiente", en: "Iglesiente coast" },
    line: { it: "La strada costiera più bella da guidare con il finestrino giù.", en: "The coastal road made for driving with the window down." } },
  { slug: "iglesias", name: "Iglesias", area: { it: "Città mineraria", en: "Mining town" },
    line: { it: "Chiese, vicoli e la storia delle miniere a ogni angolo.", en: "Churches, alleys and mining history around every corner." } },
  { slug: "carbonia", name: "Carbonia", area: { it: "Città di fondazione", en: "Founded town" },
    line: { it: "Una città nata dal carbone, oggi tutta da scoprire.", en: "A town born from coal, now waiting to be discovered." } },
  { slug: "tratalias", name: "Tratalias", area: { it: "Borgo medievale", en: "Medieval village" },
    line: { it: "Un borgo antico e una chiesa romanica, a due passi da noi.", en: "An old village and a Romanesque church, right next door." } },
  { slug: "punta-trettu", name: "Punta Trettu", area: { it: "Laguna", en: "Lagoon" },
    line: { it: "Acqua bassa, vento costante, kite all'orizzonte.", en: "Shallow water, steady wind, kites on the horizon." } },
  { slug: "maladroxia", name: "Maladroxia", area: { it: "Isola di Sant'Antioco", en: "Sant'Antioco island" },
    line: { it: "Una caletta raccolta, con il borgo che scende fino all'acqua.", en: "A small cove, with the village running down to the water." } },
];

/**
 * Tutta l'isola: mete raggiungibili in auto partendo da San Giovanni Suergiu (sezione «Tutta la Sardegna»).
 * Nessuna promessa di consegna qui: le zone di consegna reali si gestiscono da /admin → Impostazioni
 * (campo «Zone di consegna»). // TODO cliente: confermare se consegnate in aeroporti/porti (Cagliari, Olbia, Alghero…)
 */
export type IslandPlace = { slug: string; name: string; area: L10n; line: L10n; zone: Zone };

export const islandPlaces: IslandPlace[] = [
  { slug: "cagliari", zone: "sud", name: "Cagliari", area: { it: "Sud", en: "South" },
    line: { it: "Quartieri storici, il Poetto e i fenicotteri dello stagno di Molentargius.", en: "Historic quarters, Poetto beach and the flamingos of Molentargius." } },
  { slug: "chia", zone: "sud", name: "Chia", area: { it: "Costa sud", en: "South coast" },
    line: { it: "Torri, dune e acqua trasparente.", en: "Towers, dunes and crystal-clear water." } },
  { slug: "villasimius", zone: "sud", name: "Villasimius", area: { it: "Sud-est", en: "South-east" },
    line: { it: "Spiagge bianche e mare da cartolina.", en: "White beaches and postcard sea." } },
  { slug: "costa-verde", zone: "ovest", name: "Costa Verde", area: { it: "Ovest", en: "West" },
    line: { it: "Dune altissime e costa selvaggia, a nord dell'Iglesiente.", en: "Towering dunes and wild coast, north of the Iglesiente." } },
  { slug: "sinis", zone: "ovest", name: "Sinis", area: { it: "Oristanese", en: "Oristano area" },
    line: { it: "Spiagge di chicchi di quarzo e le rovine di Tharros.", en: "Quartz-grain beaches and the ruins of Tharros." } },
  { slug: "bosa", zone: "ovest", name: "Bosa", area: { it: "Planargia", en: "Planargia" },
    line: { it: "Case colorate lungo il fiume Temo.", en: "Colourful houses along the Temo river." } },
  { slug: "alghero", zone: "nord", name: "Alghero", area: { it: "Nord-ovest", en: "North-west" },
    line: { it: "Bastioni sul mare e un accento catalano.", en: "Ramparts on the sea and a Catalan accent." } },
  { slug: "stintino", zone: "nord", name: "Stintino", area: { it: "Nord-ovest", en: "North-west" },
    line: { it: "La Pelosa e un mare che sembra dipinto.", en: "La Pelosa and a sea that looks painted." } },
  { slug: "olbia", zone: "nord", name: "Olbia", area: { it: "Nord-est · Costa Smeralda", en: "North-east · Costa Smeralda" },
    line: { it: "La porta del nord-est e della Costa Smeralda.", en: "Gateway to the north-east and the Costa Smeralda." } },
  { slug: "cala-gonone", zone: "est", name: "Cala Gonone", area: { it: "Golfo di Orosei", en: "Gulf of Orosei" },
    line: { it: "Calette da raggiungere a piedi o in barca.", en: "Coves to reach on foot or by boat." } },
  { slug: "orgosolo", zone: "est", name: "Orgosolo", area: { it: "Barbagia", en: "Barbagia" },
    line: { it: "I murales e il cuore montano dell'isola.", en: "The murals and the mountain heart of the island." } },
  { slug: "costa-rei", zone: "est", name: "Costa Rei", area: { it: "Sud-est", en: "South-east" },
    line: { it: "Chilometri di sabbia chiara sul mare aperto.", en: "Miles of pale sand on the open sea." } },
];
