# Contratto API · Sulcis Rent

L'API è il **confine** tra interfaccia e logica di dominio. Oggi è PHP 8.1 in `public/api/*.php` e la logica sta in `server/lib/*` (classi `Cars`, `Publisher`, `Auth`…). Se un domani si passa a Next.js in modalità server (Plesk con Node), basta reimplementare **questi endpoint con lo stesso contratto**: pannello admin e sito pubblico non cambiano.

## Convenzioni

- Stesso dominio del sito: `https://sulcisrent.it/api/…`. Nessun CORS.
- Richieste e risposte in JSON UTF-8 (`Content-Type: application/json`). Il corpo deve essere un **oggetto**.
- Gli errori hanno sempre la forma `{ "error": "messaggio generico", "fields"?: { "campo": "motivo" } }`.

| Codice | Significato |
|---|---|
| 400 | JSON non valido |
| 401 | Nessuna sessione, oppure sessione scaduta o revocata |
| 403 | Ruolo insufficiente, oppure CSRF / Origin non validi |
| 404 | Non trovato |
| 405 | Metodo non consentito |
| 413 | Payload o file troppo grande |
| 415 | Tipo di file o formato non supportato |
| 422 | Validazione fallita (`fields`) |
| 429 | Troppi tentativi |
| 500 | Errore interno (messaggio generico, dettagli solo nel log privato) |

- **Chiavi sconosciute rifiutate** (422): ogni endpoint ha uno schema esplicito.
- **Autenticazione**: cookie `__Host-sr_admin` (HttpOnly, Secure, SameSite=Strict). In DB c'è solo lo SHA-256 del token. Scadenza: 8 ore di inattività, 7 giorni in assoluto.
- **CSRF**: su `POST/PUT/PATCH/DELETE` servono tutte e tre le condizioni:
  - header `Origin` (o `Referer`) tra quelli consentiti in `config.php` (`allowed_origins`);
  - header `X-CSRF-Token` uguale al cookie `__Host-sr_csrf` (double submit);
  - SHA-256 del token uguale a quello salvato nella sessione.
- **Ruoli**: `staff` gestisce auto, foto, recensioni, FAQ e cestino. `owner` ha tutto lo staff più impostazioni, catalogo, utenti, sessioni, registro e backup.
- Dopo **ogni scrittura** il server rigenera i JSON pubblici in `/data/`.

## Endpoint pubblici (sola lettura, nessuna scrittura)

| Metodo | Percorso | Risposta |
|---|---|---|
| GET | `/data/version.json` | `{ v, at }` · `no-store` |
| GET | `/data/fleet.json?v=` | `FleetData` (vedi `src/lib/types.ts`): solo auto **pubblicate** e non nel cestino, con whitelist dei campi |
| GET | `/data/reviews.json?v=` | `{ version, reviews: Review[] }` (solo pubblicate) |
| GET | `/data/faq.json?v=` | `{ version, items: { q, a }[] }` |
| GET | `/data/settings.json?v=` | contatti pubblici (telefono, WhatsApp, indirizzo, orari, social, P.IVA) |
| GET | `/flotta/{slug}/` · `/en/fleet/{slug}/` | HTML con meta SEO e JSON-LD (`car.php`) · 404 se l'auto non è pubblicata |
| GET | `/sitemap.xml` | sitemap dinamica (`sitemap.php`) |
| GET | `/api/auth/users.php` | `{ users: { id, name, color }[] }`: solo gli utenti attivi, per la schermata «Chi sei?» |

I JSON pubblici **non contengono mai**: targa, note interne, stato, bozze, auto nascoste o nel cestino, `updatedBy`, prezzi con «Mostra prezzo» spento, condizioni nascoste per singolo campo.

## Autenticazione

| Metodo | Percorso | Corpo | Risposta |
|---|---|---|---|
| POST | `/api/auth/login.php` | `{ userId: int, pin: "cifre" }` | `{ user: { id, name, role }, csrf }` + cookie. Errori: 401 «PIN non valido», 429 «Troppi tentativi, riprova tra N minuti», 403 se l'Origin è estraneo |
| POST | `/api/auth/logout.php` | `{}` | `{ ok }`: la sessione viene cancellata dal DB |
| GET | `/api/auth/me.php` | — | `{ user, capabilities: { imagick, heic, webp, maxBytes, serverMaxUpload }, pinMinLength }` |
| POST | `/api/auth/change-pin.php` | `{ current, next }` | `{ ok, revokedSessions }`: chiude tutte le altre sessioni dell'utente |

Login: risposta con ritardo uniforme di circa 500 ms, sia in caso di successo sia di errore. Limiti:
- 5 tentativi falliti in 15 minuti per IP;
- 5 tentativi falliti in 15 minuti per utente;
- oltre 20 fallimenti in un'ora a livello globale: login bloccato per un'ora.

Il blocco cresce a ogni recidiva: 15 min, poi 1 h, poi 24 h.

## Admin · auto (`staff`)

| Metodo | Percorso | Corpo / query | Risposta |
|---|---|---|---|
| GET | `/api/admin/cars.php` | `?status=draft\|published\|hidden&category=&q=&trash=1` | `{ cars: CarRow[] }` |
| GET | `/api/admin/cars.php?id=` | — | `{ car: AdminCar }` |
| POST | `/api/admin/cars.php` | `CarInput` (anche incompleta, va in bozza) | 201 `{ car }` |
| PUT | `/api/admin/cars.php?id=` | `CarInput` parziale (le chiavi inviate sostituiscono quelle esistenti) | `{ car }` · 422 se `status=published` senza marca, modello, categoria o foto |
| DELETE | `/api/admin/cars.php?id=` | — | `{ ok }`: soft delete (cestino 30 giorni) |
| POST | `/api/admin/car-actions.php` | `{ id, action: publish\|hide\|draft\|duplicate\|restore\|purge\|feature\|unfeature }` | `{ car }` (`null` per purge) |
| POST | `/api/admin/cars-order.php` | `{ ids: int[] }` | `{ ok }` |
| GET | `/api/admin/preview.php?id=` | — | `{ car: PublicCar, status, catalog }`: anteprima anche per bozze e auto nascoste |
| GET | `/api/admin/dashboard.php` | — | `{ counts: { published, draft, hidden, trash }, recent: […] }` |
| GET | `/api/admin/catalog.php` | — | `{ catalog: { categories, features, tags } }` |
| PUT | `/api/admin/catalog.php` | catalogo completo (**solo owner**) | `{ catalog }` |

`CarInput` (tutti i campi facoltativi; schema completo in `server/lib/Cars.php::schema()`):

```jsonc
{
  "brand": "Fiat", "model": "Panda", "version": "1.2 Lounge", "slug": "fiat-panda", "category": "citycar",
  "year": 2023, "color": { "name": "Bianco", "hex": "#FFFFFF" }, "plate": "AB123CD",
  "status": "draft", "featured": false, "badge": "new",
  "specs": { "fuel": "benzina", "transmission": "manuale", "seats": 5, "doors": 5, "luggageLarge": 1, "luggageSmall": 1, "luggageLiters": 225,
             "engineCc": 1242, "powerCv": 69, "powerKw": 51, "drive": "anteriore", "consumption": "5,2 l/100 km", "euro": "Euro 6d",
             "rangeKm": null, "chargeTime": null, "cargoM3": null, "payloadKg": null, "cargoLength": null, "license": null },
  "features": ["aria-condizionata", "bluetooth"],
  "rental": { "priceDay": 35, "priceWeek": 210, "priceMonth": null, "showPrice": true, "priceNote": { "it": "Varia in base alla stagione" },
              "kmPerDay": 200, "kmUnlimited": false, "minAge": 21, "minLicenseYears": 1, "deposit": 300, "depositOnRequest": false,
              "creditCard": true, "delivery": { "home": true, "airport": false, "port": true, "note": { "it": "Carloforte, Sant'Antioco" } },
              "insurance": { "it": "RCA e furto/incendio" }, "hidden": ["deposit"] },
  "content": { "short": { "it": "…", "en": "…" }, "long": { "it": "<p>…</p>" }, "highlights": [{ "it": "Consumi bassissimi" }] },
  "perfectFor": ["coppie", "citta"], "whatsappMessage": { "it": "…" },
  "seo": { "title": { "it": "…" }, "description": { "it": "…" } },
  "internalNotes": "tagliando a marzo"
}
```

Il testo ricco (`content.long`, risposte delle FAQ) viene **sanificato lato server** con una whitelist: `p, br, strong, b, em, i, ul, ol, li, a[href http(s)/mailto/tel]`.

## Admin · foto (`staff`)

| Metodo | Percorso | Corpo | Risposta |
|---|---|---|---|
| POST | `/api/admin/photos.php` | multipart: `car_id`, `file` (JPEG/PNG/WebP, HEIC se il server ha Imagick con HEIC), max 15 MB | 201 `{ photo: { id, uuid, base, widths, w, h, alt } }` |
| PATCH | `/api/admin/photos.php` | `{ carId, order?: int[], alts?: { id, alt: { it, en } }[] }` | `{ photos }` |
| DELETE | `/api/admin/photos.php?id=` | — | `{ ok }` · 422 se è l'ultima foto di un'auto pubblicata |

Cosa succede a ogni foto caricata:
- il tipo reale viene verificato con `finfo` e `getimagesize`;
- l'immagine viene ricodificata in WebP 640, 1280 e 2048 px (senza ingrandire oltre l'originale);
- l'EXIF viene rimosso, compresa la posizione GPS;
- il nome del file è un UUID generato dal server;
- i file si trovano in `/media/cars/{id}/{uuid}-{w}.webp`.

## Admin · contenuti

| Metodo | Percorso | Ruolo | Note |
|---|---|---|---|
| GET/POST/PUT/DELETE | `/api/admin/reviews.php[?id=]` | staff | `{ author, text, rating 1–5, date AAAA-MM-GG, url?, published? }`. Solo recensioni reali da Google |
| GET/POST/PUT/DELETE/PATCH | `/api/admin/faq.php[?id=]` | staff | `{ question: { it, en? }, answer: { it, en? }, published? }`. Il riordino è `PATCH { ids }` |
| GET/PUT | `/api/admin/settings.php` | **owner** | contatti (`Catalog::contactSchema()`) |
| GET/POST/PUT | `/api/admin/users.php[?id=]` | **owner** | `POST { name, pin, color? }` crea uno staff. `PUT { action: activate\|deactivate\|rename\|reset_pin\|unlock\|color, … }` |
| GET/DELETE | `/api/admin/sessions.php[?id=\|?all=1]` | **owner** | elenco delle sessioni attive, revoca singola o «Disconnetti tutti» (tranne la sessione corrente) |
| GET | `/api/admin/audit.php?page=` | **owner** | registro attività, 50 righe per pagina |
| GET | `/api/admin/backup.php` | **owner** | ZIP con `database.sql`, `media/`, `data/` e `LEGGIMI.txt` |

## Servizio

| Metodo | Percorso | Note |
|---|---|---|
| GET/POST | `/api/setup.php` | pagina HTML monouso: migrazioni e primo owner, protetta da `setup_token`. Dopo l'uso risponde 404 |
| GET | `/api/cron.php?token=` | pulizia (cestino oltre 30 giorni, sessioni scadute, vecchi tentativi). Token di almeno 32 caratteri in `config.php`; senza token valido risponde 404 |
