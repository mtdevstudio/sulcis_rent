import type { L10n } from "@/lib/types";

/**
 * Località del territorio (sezione Territorio + marquee).
 * Foto: segnaposto in public/images/placeholder/places/{slug}.jpg — TODO cliente: sostituire con foto reali.
 * Nessun dato su distanze o tempi: // TODO se servono, chiederli al cliente.
 */
export type Place = { slug: string; name: string; area: L10n; line: L10n; night?: boolean };

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
