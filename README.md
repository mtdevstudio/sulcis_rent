# Sulcis Rent – Autonoleggio · sito + pannello admin

Sito di **Sulcis Rent** (San Giovanni Suergiu, Sud Sardegna) con un pannello su `/admin` dove lo staff gestisce da solo la flotta. Il sito **mostra** le auto, ma **non** permette di prenotare e non mostra disponibilità: ogni «Prenota» apre un modale con WhatsApp e chiamata.

## Indice

1. [Architettura](#1-architettura)
2. [Requisiti dell'hosting (checklist)](#2-requisiti-dellhosting-checklist-da-controllare-prima-di-comprare)
3. [Sviluppo in locale](#3-sviluppo-in-locale)
4. [Modificare i contenuti](#4-modificare-i-contenuti)
5. [Deploy](#5-deploy)
6. [Primo avvio: setup monouso](#6-primo-avvio-setup-monouso-e-primo-titolare)
7. [PIN: cambio, reset, utenti bloccati](#7-pin-cambio-reset-utenti-bloccati)
8. [Pulizia automatica (cron)](#8-pulizia-automatica-cron)
9. [Backup e ripristino](#9-backup-e-ripristino)
10. [Auto nuove e SEO](#10-auto-nuove-e-seo-perché-carphp)
11. [Sicurezza: checklist con stato](#11-sicurezza-checklist-con-stato)
12. [Passare a Next.js server](#12-passare-a-nextjs-server-plesk-con-nodejs)
13. [Elenco dei TODO cliente](#13-elenco-dei-todo-cliente)
14. [Crediti](#14-crediti)

---

## 1. Architettura

```
Stesso dominio (sulcisrent.it), stesso hosting — identico su Aruba e su Plesk:

/                  → sito pubblico: Next.js con output 'export' (HTML/CSS/JS statici)
/admin/            → pannello admin: pagine statiche React (stesso export) che chiamano l'API
/api/*.php         → API PHP 8.1+ (PDO, nessun framework)
/flotta/{slug}/    → car.php: scheda auto con meta SEO e JSON-LD sempre aggiornati
/sitemap.xml       → sitemap.php
/data/*.json       → JSON PUBBLICI rigenerati dall'API a ogni salvataggio (solo campi pubblici)
/media/cars/{id}/  → foto caricate, già ricodificate in WebP (640/1280/2048), senza EXIF/GPS
MySQL / MariaDB    → dati
cartella privata   → server/ (logica PHP), database/ (migrazioni), config.php, logs/
```

- **Niente server Node sempre acceso.** Il build gira in locale o su GitHub Actions; sull'hosting arrivano solo file statici e PHP.
- **Modifiche subito visibili.** Il primo render della pagina usa i dati inclusi nel build. Poi il sito legge `/data/version.json` (senza cache) e i JSON con `?v=` (stale-while-revalidate, nessun flash).
- **Logica di dominio separata dalle pagine.** Sta in `server/lib/` (`Cars`, `Publisher`, `Auth`, `RateLimit`, `Images`…). Gli endpoint in `public/api/` sono sottili. Il contratto è documentato in [`docs/api.md`](docs/api.md).

Mappa delle cartelle principali:

| Cartella | Contenuto |
|---|---|
| `src/app/(it)`, `src/app/(en)/en` | pagine pubbliche IT/EN |
| `src/app/(admin)/admin` | pannello admin |
| `src/components/` | sezioni, card, modale contatti, trama (pattern sardi), motion |
| `src/data/` | dati di partenza (`site.ts`, `fleet.ts`, `places.ts`, `faq.ts`, `reviews.ts`, `catalog.ts`) |
| `public/api/`, `public/car.php`, `public/sitemap.php`, `public/.htaccess` | finiscono nella document root |
| `server/` | logica PHP privata (+ `config.example.php`, CLI) |
| `database/migrations/` | SQL versionato |
| `tests/php` (PHPUnit), `tests/e2e` (Playwright) | test di sicurezza ed end-to-end |
| `docker-compose.yml`, `docker/` | ambiente locale Apache + PHP 8.1 + MariaDB |

## 2. Requisiti dell'hosting (checklist da controllare prima di comprare)

| Requisito | Perché | Come verificarlo |
|---|---|---|
| ☐ **PHP ≥ 8.1** | API | pannello hosting → versione PHP |
| ☐ estensioni `pdo_mysql`, `mbstring`, `fileinfo`, `zip` | DB, testo, controllo del tipo reale delle foto, backup | la pagina di setup le verifica |
| ☐ `imagick` **oppure** `gd` con supporto **WebP** | ricodifica delle foto | idem (Imagick con HEIC accetta anche le foto iPhone; altrimenti il browser le converte) |
| ☐ `sodium` o `openssl` | crittografia/random | idem |
| ☐ Argon2id in `password_hash` | hash dei PIN (altrimenti bcrypt cost 12, automatico) | idem |
| ☐ **MySQL 5.7+ / MariaDB 10.3+** | dati | pannello DB |
| ☐ `.htaccess` con `mod_rewrite` e `mod_headers` | rewrite di scheda auto e sitemap, header di sicurezza | standard su Aruba Linux e Plesk/Apache |
| ☐ **HTTPS** (Let's Encrypt) | cookie `__Host-` Secure | pannello hosting |
| ☐ `upload_max_filesize ≥ 16M`, `post_max_size ≥ 20M` | foto fino a 15 MB | il browser comprime comunque prima dell'upload (di solito 1–3 MB) |
| ☐ cron jobs *(facoltativo)* | pulizia del cestino | su Aruba solo su alcuni piani: in alternativa cron a URL o pulizia «pigra» al login ([§8](#8-pulizia-automatica-cron)) |
| ☐ cartella fuori dalla document root *(consigliato)* | `config.php` e codice PHP privati | se non c'è, si usa `_private/` protetta da `.htaccess` |
| ☐ FTP**S** o **SFTP** | deploy cifrato | pannello hosting |

## 3. Sviluppo in locale

```bash
npm install
```

```bash
npm run dev
```

`npm run dev` avvia il sito su http://localhost:3000. Senza API mostra la flotta di esempio presente in `src/data/fleet.ts`.

**Ambiente completo «come Aruba/Plesk»** (Apache + PHP 8.1 + MariaDB):

```bash
npm run build
```

```bash
docker compose up -d --build
```

```bash
npm run docker:refresh
```

`docker:refresh` riaggancia `out/` al container e rigenera i JSON; va rilanciato dopo ogni `npm run build`. Poi apri http://localhost:8080/api/setup.php: il token è in `docker/config.local.php`. Il sito è su http://localhost:8080 e l'admin su http://localhost:8080/admin/.

Dati demo (le 6 auto segnaposto caricate tramite l'API, solo in locale o staging):

```bash
npx tsx scripts/seed-demo.ts http://localhost:8080 1 <PIN>
```

**Test:**

```bash
composer install
```

```bash
npm run test:php
```

```bash
npm run test:e2e
```

- `test:php`: 50 test di sicurezza PHPUnit contro l'ambiente Docker.
- `test:e2e`: test Playwright, cioè il flusso completo admin → sito e la verifica «nessuna prenotazione».
- ⚠️ I test **azzerano le auto** del DB locale.

## 4. Modificare i contenuti

### Dal pannello (nessun codice)

`https://sulcisrent.it/admin/` permette di gestire:

- **auto**: crea, modifica, foto dal telefono, pubblica/nascondi, duplica, cestino, ordine;
- **recensioni** e **FAQ**;
- **impostazioni**, solo per il titolare: telefono, WhatsApp, messaggio standard, indirizzo, orari, social, P.IVA, categorie, dotazioni e tag.

Le modifiche sono online subito. Guida per lo staff: [`docs/guida-admin.md`](docs/guida-admin.md).

### Dai file (valori di partenza / fallback del build)

| Cosa | Dove |
|---|---|
| Telefono, WhatsApp, indirizzo, orari, social (fallback) | `src/data/site.ts`: unica fonte di verità nel codice |
| Flotta di partenza (segnaposto) | `src/data/fleet.ts` |
| Mete della sezione «Sardegna» (Sulcis + resto dell'isola, testi) | `src/data/places.ts` (`places`, `islandPlaces`) |
| Categorie / dotazioni / tag iniziali | `src/data/catalog.ts` → `npx tsx scripts/gen-seed-sql.ts` rigenera `database/migrations/002_seed.sql` |
| Testi dell'interfaccia IT/EN | `src/lib/i18n.ts` |
| Foto delle mete | sostituisci i file in `public/images/placeholder/places/` mantenendo i nomi: `{slug}-640.webp`, `-1280.webp`, `-1920.webp` |
| Foto hero | `public/images/placeholder/places/hero-costa-1920.webp` |
| Immagine Open Graph | `public/og.png` (1200×630) |
| **Logo** | metti il file in `public/brand/` (es. `logo.svg`), poi in `src/data/site.ts` aggiorna `logo.src`, `width`, `height` e imposta `available: true`. Il componente `<Logo />` si aggiorna ovunque |
| Favicon | `public/icon.svg`, `public/apple-icon.png` (oggi segnaposto: da rifare con la «S» del logo) |
| Colori | `src/app/globals.css` (variabili CSS) → `tailwind.config.ts` |

## 5. Deploy

### 5.1 GitHub Actions (consigliato, identico per Aruba e Plesk)

A ogni push su `main`, `.github/workflows/deploy.yml` esegue:

1. build statico;
2. `composer install --no-dev` (per PHPMailer);
3. upload via **FTPS/SFTP** con `lftp`.

L'upload **non tocca mai** `media/`, `data/*.json` e `config.php`; cancella solo i file obsoleti dentro `_next/`.

Secrets (Settings → Secrets and variables → Actions):

| Secret | Esempio |
|---|---|
| `FTP_HOST` | `ftp.sulcisrent.it` |
| `FTP_USER` / `FTP_PASSWORD` | credenziali FTP |
| `FTP_PATH` | Aruba: `/www.sulcisrent.it` · Plesk: `/httpdocs` |
| `FTP_PRIVATE_PATH` *(facoltativo)* | `/sulcis-private` (fuori dalla document root). Se vuoto: `<FTP_PATH>/_private` |
| `FTP_PROTOCOL` *(facoltativo)* | `ftps` (default), `sftp` o `ftp` |

Variabile facoltativa `DATA_SNAPSHOT_URL=https://sulcisrent.it`: con questa, le pagine auto pre-renderizzate nascono dalla flotta live.

Il workflow `ci.yml` esegue build, PHPUnit e Playwright su ogni pull request.

### 5.2 Aruba (hosting Linux condiviso) passo passo

1. **Pannello Aruba → Hosting Linux → PHP**: scegli PHP 8.1 o superiore. Nelle impostazioni PHP alza `upload_max_filesize` a 16M e `post_max_size` a 20M, se disponibili.
2. **Database → MySQL**: crea il database. Annota host, nome, utente e password; su Aruba l'utente ha già solo i permessi sul suo DB.
3. **HTTPS**: attiva il certificato SSL (Let's Encrypt / DV incluso).
4. **Cartella privata**: via FTP crea `sulcis-private/` **accanto** a `www.sulcisrent.it/`, se il piano lo consente. Se non puoi uscire dalla document root, usa `www.sulcisrent.it/_private/`, già protetta da `.htaccess`.
5. Copia `server/config.example.php` in `<privata>/config.php` e compilalo:
   - DB;
   - `ip_hash_salt` e `setup_token`, valori casuali lunghi;
   - `allowed_origins`: `https://sulcisrent.it` e `https://www.sulcisrent.it`;
   - `site_url`;
   - `notify` (Telegram o SMTP Aruba: `smtps.aruba.it`, porta 465, `ssl`).
6. Esegui il deploy (§5.1, oppure caricamento manuale come al §5.4).
7. Apri `https://sulcisrent.it/api/setup.php`, inserisci il token e crea il titolare ([§6](#6-primo-avvio-setup-monouso-e-primo-titolare)).
8. **Cron** *(se il piano lo offre)*, Pannello → Cron: `https://sulcisrent.it/api/cron.php?token=<cron_token>` una volta al giorno. Altrimenti niente: la pulizia avviene al login ([§8](#8-pulizia-automatica-cron)).

### 5.3 Plesk passo passo

1. **Domini → sulcisrent.it → PHP**: versione 8.1+ in modalità FPM servito da Apache, così il `.htaccess` funziona. Imposta `upload_max_filesize=16M` e `post_max_size=20M`.
2. **Database → Aggiungi database**: crea il DB e un utente dedicato. Permessi: `SELECT, INSERT, UPDATE, DELETE` più `CREATE, ALTER, INDEX, REFERENCES, DROP` (servono solo per le migrazioni; dopo il setup si possono togliere `CREATE/ALTER/DROP`).
3. **SSL/TLS → Let's Encrypt**, e attiva «Reindirizza da HTTP a HTTPS».
4. **File manager**: crea `/sulcis-private/` (fuori da `httpdocs`) e mettici `config.php` compilato come al §5.2.
5. Deploy (§5.1 con `FTP_PATH=/httpdocs` e `FTP_PRIVATE_PATH=/sulcis-private`).
6. Setup: `https://sulcisrent.it/api/setup.php`, oppure via SSH:

   ```bash
   php /var/www/vhosts/sulcisrent.it/sulcis-private/server/cli/create-owner.php "Nome"
   ```

7. **Operazioni pianificate (cron)**:

   ```bash
   php /var/www/vhosts/sulcisrent.it/sulcis-private/server/cli/purge.php
   ```

   una volta al giorno.

### 5.4 Caricamento manuale via FTP (senza GitHub)

1. In locale:

   ```bash
   npm ci && npm run build && composer install --no-dev
   ```

2. Carica il **contenuto** di `out/` nella document root. **Non** sovrascrivere `media/` e `data/` se esistono già.
3. Carica `server/` e `database/` nella cartella privata. Il `config.php` lo crei a mano, solo la prima volta.
4. I file da caricare sono: `.htaccess`, `api/`, `car.php`, `sitemap.php`, `_next/`, le pagine, `images/`, `og.png`, `robots.txt`. Se il client FTP nasconde i file che iniziano con il punto, attiva «mostra file nascosti».

## 6. Primo avvio: setup monouso e primo titolare

- **Senza SSH (Aruba)**: `https://sulcisrent.it/api/setup.php`.
  - Mostra la checklist dei requisiti.
  - Chiede il `setup_token` di `config.php`, il nome del titolare e il PIN (due volte).
  - Applica le migrazioni, crea il titolare, genera i JSON e scrive `setup.lock`.
  - Da quel momento risponde **404**: si autodisabilita, anche se esiste già un titolare.
- **Con SSH**:

  ```bash
  php <privata>/server/cli/create-owner.php "Nome"
  ```

- Aggiornamenti futuri del database: con SSH lancia il comando qui sotto; senza SSH caricali via FTP e chiedi allo sviluppatore.

  ```bash
  php <privata>/server/cli/migrate.php
  ```

- Non esiste registrazione pubblica. Gli utenti staff li crea il titolare da **Utenti e sessioni**.

## 7. PIN: cambio, reset, utenti bloccati

- **Cambio del proprio PIN**: admin → «Il mio PIN». Serve il PIN attuale; tutte le altre sessioni di quell'utente vengono chiuse.
- **PIN di uno staff dimenticato**: il titolare va in Utenti → «Reset PIN». Le sessioni di quell'utente si chiudono e il blocco viene rimosso.
- **PIN del titolare dimenticato**: serve l'accesso al server.
  - Con SSH:

    ```bash
    SR_PIN=<nuovo> php <privata>/server/cli/reset-pin.php "Nome titolare"
    ```

  - Senza SSH: phpMyAdmin → tabella `admin_users` → imposta `pin_hash` con un hash generato in locale:

    ```bash
    php -r "echo password_hash('NUOVOPIN', PASSWORD_BCRYPT, ['cost'=>12]);"
    ```

- **Qualcuno è bloccato** («Troppi tentativi, riprova tra 15 minuti»):
  - aspettare (15 min → 1 h → 24 h se si ripete);
  - oppure il titolare usa Utenti → «Sblocca» (blocco per utente);
  - con SSH (rimuove anche i blocchi globali e per IP):

    ```bash
    php <privata>/server/cli/unlock.php
    ```

  - senza SSH: phpMyAdmin → svuota la tabella `auth_locks`.
- **Blocco globale** (oltre 20 errori in un'ora da qualsiasi IP): login chiuso per un'ora per tutti, con notifica Telegram/email. È voluto: un PIN numerico ha poche combinazioni, quindi un attacco distribuito va fermato.

## 8. Pulizia automatica (cron)

Svuota il cestino (auto più vecchie di 30 giorni, con le foto), le sessioni scadute e i vecchi tentativi di login. Tre strade, tutte equivalenti:

1. **Cron CLI** (Plesk, VPS):

   ```bash
   php <privata>/server/cli/purge.php
   ```

2. **Cron a URL** (alcuni piani Aruba): `https://sulcisrent.it/api/cron.php?token=<cron_token>`. Il token va impostato in `config.php` e deve avere almeno 32 caratteri.
3. **Nessun cron**: la pulizia parte da sola al login admin, al massimo una volta ogni 6 ore.

## 9. Backup e ripristino

- **Backup**: admin → Backup → «Scarica backup» (solo titolare). Lo ZIP contiene:
  - `database.sql` (tutte le tabelle, senza sessioni e tentativi);
  - `media/` (foto);
  - `data/` (JSON).

  Conservalo fuori dal sito: contiene gli hash dei PIN.
- **Ripristino**:
  1. phpMyAdmin → database → Importa → `database.sql`. Ricrea le tabelle.
  2. Carica via FTP le cartelle `media/` e `data/` dello ZIP nella document root.
  3. Accedi all'admin e salva una qualsiasi modifica (o lancia `migrate.php`): i JSON pubblici vengono rigenerati.

## 10. Auto nuove e SEO: perché `car.php`

Le pagine `/flotta/{slug}/` esistenti al momento del build sono pre-renderizzate. Per quelle aggiunte **dopo** ho scelto la regola `.htaccess` + **`car.php`**, non il rebuild:

- **Subito indicizzabili.** `car.php` legge `/data/fleet.json` (nessuna query) e prende l'HTML pre-renderizzato dell'auto, o la shell esportata. Poi inietta title, description, canonical, hreflang, Open Graph, Twitter e JSON-LD `Product/Car`. `offers` compare solo se il prezzo è visibile.
- **Meta sempre allineati.** Anche le auto già esistenti passano da `car.php`, quindi una descrizione modificata aggiorna subito i meta.
- **Nessuna dipendenza esterna.** Niente GitHub Action da attendere, niente credenziali FTP salvate altrove, niente build che fallisce mentre lo staff è in piazzale. Il rebuild resta disponibile: `deploy.yml` accetta `repository_dispatch` di tipo `rebuild` e `workflow_dispatch`.

Le regole SEO sono identiche in `src/lib/seo.ts` e `server/lib/Seo.php`: se ne cambi una, aggiorna anche l'altra.

## 11. Sicurezza: checklist con stato

✅ = implementato e coperto da test automatici · ☑️ = implementato · ⚠️ = parziale o da configurare

**PIN**

| | Punto | Dove |
|---|---|---|
| ✅ | PIN numerico ≥ 8 cifre (configurabile, mai < 8). Rifiutati sequenze, ripetizioni, motivi, date, meno di 3 cifre diverse | `Pin::policyError` · test `testOwnerCreatesStaffWithPinPolicy` |
| ✅ | Solo hash: Argon2id (fallback bcrypt 12), `password_verify`, rehash automatico. Mai in chiaro in DB, log o config | `Pin::hash` · test `testChangePin…` (verifica `$argon2id$`) |
| ✅ | Utenti multipli `owner`/`staff`, ogni azione registrata a nome di chi la fa | `admin_users`, `audit_log` |
| ☑️ | Login: prima si sceglie il nome, poi si inserisce il PIN (un solo hash verificato, rate limit per utente preciso) | `Login.tsx`, `login.php` |
| ✅ | Primo titolare da setup monouso (token, si autodisabilita) o da CLI. Nessuna registrazione pubblica | `api/setup.php` · test `testPrivateFilesAreNotReachable` |
| ✅ | Cambio PIN con il PIN attuale; invalida le altre sessioni | test `testChangePinRequiresCurrentAndRevokesOtherSessions` |

**Verifica e brute force**

| | Punto | Dove |
|---|---|---|
| ✅ | Verifica solo lato server; il frontend non conosce il PIN | test `testWrongPin…` |
| ✅ | 5 errori in 15 minuti per IP **e** per utente → blocco con backoff 15 min → 1 h → 24 h, persistente in MySQL | test `testSixthWrongPinFromSameIpIsBlocked`, `testSameUserFromManyIpsIsBlocked`, `testBackoffGrowsTo1hThen24h` |
| ✅ | Globale: oltre 20 errori in un'ora → login bloccato un'ora per tutti + notifica | test `testGlobalLockAfterMoreThan20FailuresInAnHour` |
| ✅ | IP salvati come HMAC-SHA256 con sale segreto. `X-Forwarded-For` letto solo da proxy in `trusted_proxies` | test `testIpIsStoredHashedNotInClear` |
| ✅ | Messaggio generico «PIN non valido» e ritardo uniforme di circa 500 ms anche in caso di successo e di utente inesistente | test `testWrongPinGenericMessageAndUniformDelay` |
| ⚠️ | Notifiche Telegram/SMTP per blocco globale e nuovo dispositivo: helper pronto, **credenziali da inserire** in `config.php` | `Notify.php` |

**Sessione**

| | Punto | Dove |
|---|---|---|
| ✅ | Token 256 bit `random_bytes(32)`, in DB solo SHA-256, tabella `admin_sessions` (niente sessioni PHP su file) | test `testSessionCookieFlags` |
| ✅ | Cookie `__Host-sr_admin`: HttpOnly, Secure, SameSite=Strict, Path=/, nessun Domain | idem |
| ✅ | 8 ore a scorrimento, 7 giorni in assoluto; logout = riga cancellata | test `testExpiredAndRevokedSessionsAre401` |
| ✅ | «Sessioni attive» e «Disconnetti tutti» per il titolare | idem |
| ✅ | `requireAuth($role)` all'inizio di **ogni** endpoint: 401 senza sessione, 403 per lo staff nelle aree del titolare | test `testEveryAdminEndpointWithoutSessionIs401` (28 endpoint), `testStaffIsForbiddenOnOwnerAreas` |
| ✅ | CSRF: SameSite=Strict + controllo Origin/Referer + token double submit legato alla sessione | test `testCsrfAndOriginChecks` |

**Database, API, filesystem**

| | Punto | Dove |
|---|---|---|
| ✅ | Solo prepared statement PDO, `EMULATE_PREPARES=false` | `Db.php` · test `testSqlInjectionAttemptsHaveNoEffect` |
| ⚠️ | Utente MySQL con permessi minimi: **da configurare sull'hosting** (vedi §5.3) | — |
| ✅ | `config.php` fuori dalla document root, o in `_private/` con `Require all denied`; mai nel repo (`config.example.php`) | test `testPrivateFilesAreNotReachable` |
| ✅ | JSON pubblici con **whitelist** dei campi: niente targa, note, bozze, auto nascoste o nel cestino | test `testPublicJsonNeverLeaksPrivateFieldsDraftsOrHidden` |
| ✅ | Tabelle di sicurezza mai esposte; nessun endpoint pubblico in scrittura | idem |

**Upload delle foto**

| | Punto | Dove |
|---|---|---|
| ✅ | Tipo reale (`finfo`) + `getimagesize`; JPEG/PNG/WebP, HEIC solo con Imagick che lo supporta | test `testUploadRejectsPhpDisguisedAsJpeg` |
| ☑️ | Massimo 15 MB (controllato anche lato PHP), massimo 60 MP, massimo 30 foto per auto | `Images.php` |
| ✅ | Ricodifica sempre in WebP 640/1280/2048, EXIF e GPS rimossi, nomi UUID | test `testStoredPhotosAreReencodedWebpWithoutExifOrGps` |
| ✅ | `/media` serve solo immagini: PHP e script non eseguibili | test `testManuallyPlacedPhpInMediaIsNotExecuted` |
| ☑️ | Compressione nel browser prima dell'upload (`browser-image-compression`), HEIC→JPEG con `heic2any` se il server non lo gestisce | `PhotoManager.tsx` |

**Resto**

| | Punto | Dove |
|---|---|---|
| ✅ | `/admin` con `noindex` (meta + `X-Robots-Tag`), escluso da robots.txt e sitemap | test `testCarPhpInjectsSeo…` |
| ⚠️ | Header di sicurezza su tutto il sito: HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, CSP. La CSP usa `'unsafe-inline'` sugli script, necessario per i payload inline dell'export statico di Next; restano `object-src 'none'`, `frame-ancestors 'none'`, `connect-src 'self'` e nessun punto in cui il visitatore può iniettare HTML | `public/.htaccess` |
| ✅ | API: `display_errors` off, log su file privato, risposte JSON generiche | `bootstrap.php` · test `testPrivateFilesAreNotReachable` |
| ✅ | Validazione con schema esplicito per ogni endpoint (chiavi sconosciute rifiutate), oltre a Zod nel form | test `testUnknownFieldsAndRichTextAreSanitized` |
| ✅ | Testo ricco sanificato lato server (whitelist DOM) | idem |
| ✅ | Audit log di creazioni, modifiche, eliminazioni e login, visibile al titolare | `Audit.php`, admin → Registro |
| ✅ | Nessun segreto nel bundle JS: `scripts/postbuild.mjs` fallisce il build se ne trova | `npm run build` |

**Risultati attuali**:
- PHPUnit: 50 test, 301 asserzioni, tutti superati.
- Playwright: 4 test superati (flusso admin → sito, nessuna prenotazione, login da mobile).
- Lighthouse mobile (Apache locale): home 88–93 / 100 / 100 / 100 (ultima misura 93), scheda auto 95 / 100 / 100 / 92. Il 92 della SEO sulla scheda è dovuto al canonical, che in locale punta a sulcisrent.it.

## 12. Passare a Next.js server (Plesk con Node.js)

Il pannello e il sito parlano solo con l'API descritta in [`docs/api.md`](docs/api.md). Per passare a Next in modalità server:

1. Togli `output: 'export'`.
2. Implementa gli stessi endpoint come Route Handlers (`src/app/api/.../route.ts`) riusando lo schema DB e le regole di `server/lib/*`.
3. Mantieni i JSON pubblici, oppure sostituiscili con ISR.

I componenti dell'admin non cambiano.

## 13. Elenco dei TODO cliente

Dati mancanti, tutti segnati nel codice con `// TODO` (cerca `TODO` in `src/`):

| Dove | Cosa serve |
|---|---|
| `src/data/fleet.ts` | **flotta reale**: le 6 auto sono segnaposto. Meglio caricarle dal pannello |
| `public/brand/` + `src/data/site.ts` (`logo.available`) | **logo** HD o SVG; poi ricampionare i colori in `src/app/globals.css` |
| `public/icon.svg`, `public/apple-icon.png` | favicon dalla «S» del logo |
| `public/images/placeholder/places/*` | **foto reali** di località e hero (stessi nomi file) |
| `public/og.png` | immagine Open Graph definitiva |
| `src/data/site.ts` → `vat`, `email`, `google.reviewsUrl` | P.IVA, email (facoltativa), link alle recensioni Google (o da Impostazioni) |
| `src/data/faq.ts` / admin → FAQ | risposte reali: documenti, età minima, cauzione, chilometraggio, consegna |
| admin → Recensioni | recensioni **reali** copiate da Google (oggi c'è solo il badge 5,0 ★) |
| `src/lib/i18n.ts` | grafia sarda da verificare: «Beni benìu» (benvenuto) e «Ajò» (dai, andiamo) |
| `src/lib/i18n.ts` | revisione madrelingua dei testi inglesi |
| `src/components/pages/LegalPage.tsx` | testi di privacy e cookie validati da un consulente |
| `src/data/places.ts` | distanze e tempi di percorrenza: non inseriti, servono dati del cliente |
| admin → Impostazioni → «Zone di consegna» | **confermare se consegnate fuori sede** (es. aeroporti di Cagliari, Olbia, Alghero). Finché il campo è vuoto il sito invita solo a scrivere, senza promettere consegne |
| `server/config.php` → `notify` | credenziali Telegram o SMTP per le notifiche di sicurezza |
| `src/lib/track.ts` | GA4 / Meta Pixel: l'helper `trackContact` è pronto, gli script non sono caricati |

## 14. Crediti

- Confini della Sardegna e dei comuni del Sulcis Iglesiente: ISTAT via [openpolis/geojson-italy](https://github.com/openpolis/geojson-italy), licenza **CC BY 4.0** (`scripts/build-map.mjs`).
- Font: Archivo e Hanken Grotesk (SIL Open Font License), self-hosted da `next/font`.
- Sito realizzato da [MTDEVSTUDIO](https://mtdevstudio.it).
