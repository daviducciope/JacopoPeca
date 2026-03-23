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
