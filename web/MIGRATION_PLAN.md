# Jacopo Peca Migration Plan

## Current verified state

Stato verificato via AWS CLI il 2026-03-23:

- account AWS: `089081311517`
- IAM user operativo: `github-deployer`
- hosted zone Route53 attiva per `jacopopeca.com`
- apex `jacopopeca.com` e `www.jacopopeca.com` puntano alla distribuzione CloudFront `E1WY7YHVG6PVEF`
- alias CloudFront configurati:
   - `jacopopeca.com`
   - `www.jacopopeca.com`
   - `staging.jacopopeca.com`
- origin CloudFront attuale:
   - `staging.jacopopeca.com.s3-website.eu-central-1.amazonaws.com`
- non risultano cache behavior separati per `/api/*`
- conseguenza: la produzione attuale continua a funzionare come sito statico distribuito da S3 + CloudFront

## What is already migrated

- il frontend principale e stato ricostruito in Next.js sotto `web/`
- esistono admin pages e API routes per una futura modalita server-capable
- Prisma schema, client generation e seed script sono presenti
- il deploy live corrente usa una static export del frontend pubblico
- il checkout live resta compatibile grazie a un fallback client-side Stripe quando `/api/checkout` non e disponibile

## Active live deploy path

Percorso live oggi:

1. build statica con `npm run build:static`
2. sync di `web/out/` sul bucket `staging.jacopopeca.com`
3. invalidation della distribuzione CloudFront `E1WY7YHVG6PVEF`

Script operativo:

```bash
./ops/deploy-live-static.sh
```

Nota importante:

- la stessa distribuzione CloudFront serve staging, apex e www
- ogni invalidation fatta da questo script impatta tutti e tre gli hostname

## Target architecture

Target desiderato a regime:

- Next.js runtime dietro origin applicativo dedicato
- Postgres per products, variants, orders, customers e admin users
- admin CRUD pienamente operativo via Prisma
- Stripe Checkout server-side + webhook handling
- CloudFront con origin e behavior coerenti per pagine statiche e API/runtime

## Remaining migration work

1. scegliere il target runtime definitivo
    - container su VM/Lightsail/EC2 oppure altra piattaforma Node
2. pubblicare il runtime standalone come origin applicativo reale
3. aggiungere behavior CloudFront separati almeno per `/api/*` e per le route dinamiche necessarie
4. impostare env complete di produzione
    - `DATABASE_URL`
    - `STRIPE_SECRET_KEY`
    - `STRIPE_WEBHOOK_SECRET`
    - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
    - `ADMIN_EMAIL`
    - `ADMIN_PASSWORD`
5. validare admin CRUD e checkout server-side sulla nuova origin runtime
6. rimuovere il fallback static-only quando la produzione non dipendera piu da S3 website hosting

## Operational notes

- il repo ora supporta due modalita build:
   - `standalone` per runtime Node
   - `export` per static deploy compatibile con il live attuale
- `web/scripts/build-static.mjs` esclude temporaneamente admin, API e middleware per produrre l'export statico senza toccare il codice runtime del repo
- quando si fanno modifiche solo grafiche o editoriali, il deploy richiesto per il sito live resta quello statico finche l'infrastruttura non cambia
