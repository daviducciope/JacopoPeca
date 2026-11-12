# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js storefront and admin panel for jacopopeca.com — an Italian handcrafted denim/streetwear brand. The app lives in `web/`. Legacy WordPress assets, CSS, JS, and recovery scripts are in sibling directories but are not actively developed.

## Key Warning: Next.js Version

This project uses **Next.js 16**, which has breaking changes from versions in your training data. Before writing any Next.js-specific code, read the relevant guide in `web/node_modules/next/dist/docs/`. Heed deprecation notices.

## Commands

All commands run from `web/`:

```bash
npm run dev          # Start dev server
npm run build        # Production build (output: standalone)
npm run lint         # ESLint
npm run db:generate  # Generate Prisma client (required after schema changes)
npm run db:push      # Push schema to DB (dev only)
npm run db:seed      # Seed DB from catalog.ts
```

**Build & deploy scripts** (run from repo root):
```bash
ops/build-runtime-bundle.sh   # Produces .artifacts/jacopopeca-runtime.tgz
ops/run-runtime-locally.sh    # Test standalone build locally

docker build -t jacopopeca-web ./web
docker run --env-file ./web/.env -p 3000:3000 jacopopeca-web
```

## Environment Variables

Copy `web/.env.example`. Required at runtime:
- `DATABASE_URL` — PostgreSQL (app degrades to static catalog if absent)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GA_ID` (optional) — overrides the GA4 ID (default `G-5WD119X4KZ` in `src/components/GoogleAnalytics.tsx`). GA loads only after the user opts in to "Statistiche" in the cookie banner (`analytics` in `src/lib/cookie-consent.tsx`, Consent Mode v2)
- `NEXT_PUBLIC_GSC_VERIFICATION` (optional) — Search Console verification meta token
- `NEXT_PUBLIC_BING_VERIFICATION`, `NEXT_PUBLIC_YANDEX_VERIFICATION` (optional) — Bing Webmaster / Yandex verification meta tokens
- Favicon/brand icons: `src/app/favicon.ico`, `src/app/icon.png`, `src/app/apple-icon.png`, `public/icon-{192,512}.png`, `src/app/manifest.ts` (monogramma "JP", Road Rage)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — HTTP Basic Auth for admin (returns 503 if unset)

## Architecture

### Hybrid Data Mode

`web/src/lib/prisma.ts` exports an `isDatabaseConfigured` flag. All data-fetching functions in `web/src/lib/product-data.ts` check this flag: if the DB is available they query Prisma, otherwise they fall back to the static `web/src/lib/catalog.ts` JSON. This means the storefront works without a database.

### Data Flow

- **Server Components** call functions from `src/lib/product-data.ts` (server-only) directly.
- **Cart state** is client-side only: React Context + `localStorage` (key: `jp-cart`), implemented in `src/lib/cart.tsx`.
- **Checkout**: `POST /api/checkout` creates a Stripe Checkout Session server-side and returns the session URL. No client-side Stripe SDK is used for checkout creation.

### Admin Panel

Routes under `/admin` and `/api/admin` are protected by HTTP Basic Auth in `web/middleware.ts`. The admin CRUD UI is in `src/app/admin/` and calls `/api/admin/products`.

### Admin: foto e video prodotto

- `AdminProductsManager` ha un selettore **Con filtri / Originale** (persistito in `localStorage` `jp-admin-photo-mode`): "studio" usa `processPhonePhotoForWeb` (WebP 4:5), "originale" carica la foto senza ritocchi (solo HEIC/>12 MB convertite in JPG). Pulsanti "Scatta foto" (`capture`) e "Dalla galleria"; max 3 upload in parallelo.
- Video: modello Prisma `ProductVideo` (url, posterUrl, sortOrder; migration `20261112100000_product_videos`), max 6 per prodotto, 300 MB (presign S3 con progress; fallback `/api/admin/uploads/direct` max 100 MB). La copertina è estratta dal browser. Mostrati in `ProductGallery`. Dopo il deploy applicare la migration (`prisma migrate deploy` / `db:push`).

### Key Lib Files

| File | Purpose |
|---|---|
| `src/lib/product-data.ts` | All DB/catalog queries, Zod schema for product creation |
| `src/lib/catalog.ts` | Static fallback product catalog (~105 KB) |
| `src/lib/cart.tsx` | Cart context and `useCart()` hook |
| `src/lib/site-data.ts` | Static editorial content (categories, contact info, policies) |
| `src/lib/stripe-prices.ts` | Auto-generated slug → Stripe Price ID mapping |

### Prisma Schema

Core models: `Product`, `ProductVariant` (with `stripePriceId`), `ProductImage`, `Category`, `Order`, `OrderItem`, `Customer`, `AdminUser`. Run `npm run db:generate` after any schema change.

### Build Output

`next.config.ts` sets `output: "standalone"`. The Dockerfile and `ops/build-runtime-bundle.sh` both depend on this — the standalone server is started with `node .next/standalone/server.js`.
