## Jacopo Peca Web

Next.js storefront e admin per jacopopeca.com.

Funzionalita principali:

- storefront con fallback su catalogo statico
- checkout Stripe server-side quando esiste un runtime Node
- fallback checkout Stripe client-side per il deploy statico attualmente in produzione
- CRUD admin prodotti via Prisma
- Basic Auth su `/admin` e `/api/admin`
- doppia modalita build: `standalone` per runtime Node, `export` per deploy statico

## Stato infrastruttura verificato

Stato reale verificato via AWS CLI il 2026-03-23:

- account AWS: `089081311517`
- IAM user disponibile: `github-deployer`
- hosted zone Route53: `jacopopeca.com`
- dominio live `jacopopeca.com` e `www.jacopopeca.com` puntano alla distribuzione CloudFront `E1WY7YHVG6PVEF`
- la distribuzione CloudFront serve anche `staging.jacopopeca.com`
- origin CloudFront attuale: bucket website S3 `staging.jacopopeca.com.s3-website.eu-central-1.amazonaws.com`
- al momento non esistono cache behavior separati per `/api/*`, quindi il sito live e ancora distribuito come static export

Conseguenza pratica:

- modifiche grafiche e contenuti pubblici richiedono deploy statico per comparire su `jacopopeca.com`
- il path runtime Node/standalone esiste nel repo ma non e ancora il percorso live attivo

## Avvio locale

Tutti i comandi qui sotto vanno eseguiti da `web/`.

Sviluppo:

```bash
npm run dev
```

Generazione client Prisma:

```bash
npm run db:generate
```

Seed catalogo nel database:

```bash
npm run db:seed
```

Build runtime standalone:

```bash
npm run build
```

Build statica compatibile con l'infrastruttura live attuale:

```bash
npm run build:static
```

La build statica usa `web/scripts/build-static.mjs`, che esclude temporaneamente middleware, admin e API routes dal build export e poi ripristina tutto.

## Variabili ambiente

Vedi `.env.example`.

Variabili principali per runtime Node:

- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Note:

- se `DATABASE_URL` manca, lo storefront degrada al catalogo statico
- se `ADMIN_EMAIL` o `ADMIN_PASSWORD` mancano, `/admin` e `/api/admin` rispondono con `503`
- per il deploy statico live e comunque necessario `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, perche il carrello usa il fallback client-side verso Stripe Checkout

## Modalita deploy

### Deploy live attuale: statico su S3 + CloudFront

Questo e il percorso da usare oggi per pubblicare modifiche storefront su `jacopopeca.com`.

Dal root del repo:

```bash
./ops/deploy-live-static.sh
```

Lo script:

- esegue `npm run db:generate`
- esegue `npm run build:static`
- sincronizza `web/out/` su `s3://staging.jacopopeca.com/`
- preserva gli asset legacy sotto `wp-content/` gia presenti nel bucket
- crea una invalidation CloudFront su `E1WY7YHVG6PVEF`

Default correnti nello script:

- region: `eu-central-1`
- bucket: `staging.jacopopeca.com`
- distribution id: `E1WY7YHVG6PVEF`

La distribuzione e condivisa da:

- `staging.jacopopeca.com`
- `jacopopeca.com`
- `www.jacopopeca.com`

### Runtime standalone: percorso futuro / alternativo

Il repo supporta anche deploy server-capable.

Asset disponibili:

- `web/Dockerfile`
- `ops/build-runtime-bundle.sh`
- `ops/run-runtime-locally.sh`

Esempio rapido con Docker:

```bash
docker build -t jacopopeca-web ./web
docker run --env-file ./web/.env -p 3000:3000 jacopopeca-web
```

Per VM o Lightsail, il bundle prodotto da `ops/build-runtime-bundle.sh` va avviato dietro reverse proxy con `node server.js`.

## Checkout

Il carrello adotta due strategie:

- se `/api/checkout` e disponibile, usa il checkout server-side
- se il sito gira nel deploy statico live attuale e `/api/checkout` non esiste, usa il fallback client-side basato su `src/lib/stripe-prices.ts`

Questo evita di rompere il checkout finche la produzione resta dietro S3 + CloudFront statici.
