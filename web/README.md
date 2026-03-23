## Jacopo Peca Web

Next.js storefront e admin per jacopopeca.com con:

- catalogo storefront con fallback statico
- checkout Stripe server-side
- CRUD admin prodotti via Prisma
- protezione Basic Auth su `/admin` e `/api/admin`
- build server-capable in modalita `standalone`

## Avvio locale

Per sviluppo:

```bash
npm run dev
```

Per generare il client Prisma:

```bash
npm run db:generate
```

Per importare il catalogo corrente nel database:

```bash
npm run db:seed
```

## Variabili ambiente

Vedi `.env.example`. Le piu importanti per il runtime server sono:

- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Admin auth

Le route `/admin` e `/api/admin` sono protette con Basic Auth via middleware.
Se `ADMIN_EMAIL` o `ADMIN_PASSWORD` non sono configurati, l'admin risponde con `503`.

## Deploy server-capable

Questa app non e piu pensata per deploy S3 static-only.

Opzioni preparate nel repo:

- `web/Dockerfile` per runtime containerizzato
- `ops/build-runtime-bundle.sh` per produrre un bundle tar.gz deployabile su VM
- `ops/run-runtime-locally.sh` per verificare il runtime standalone locale

Esempio rapido con Docker:

```bash
docker build -t jacopopeca-web ./web
docker run --env-file ./web/.env -p 3000:3000 jacopopeca-web
```

Per un deploy su VM o Lightsail, estrai il bundle prodotto da `ops/build-runtime-bundle.sh`, imposta le env e avvia `node server.js` dietro reverse proxy.
