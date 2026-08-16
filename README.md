# Furniture Shop

A furniture e-commerce site: browse by category, view product details,
add to cart, and check out. Built as a reusable template — all branding
(name, logo, tagline, contact info) lives in one config file so it can be
re-skinned per client without touching page code.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · MySQL (`mysql2`)

Product images are inline SVG line-art on gradient backgrounds rather than
photos, so the whole site works with zero external image dependencies —
swap in real product photography later without any layout changes.

## Running it locally

You need [Node.js](https://nodejs.org) 18+ and a MySQL-compatible server
(MySQL or MariaDB both work).

1. Start a database — either your own, or via Docker:

   ```bash
   docker compose up -d
   ```

   This starts MySQL 8.4 on `localhost:3306` with a `furniture` database
   already created.

2. Install dependencies and configure environment variables:

   ```bash
   npm install
   cp .env.example .env.local
   ```

   Edit `.env.local` if your database isn't using the defaults in
   `docker-compose.yml`.

3. Create the schema and seed the product catalog:

   ```bash
   npm run seed
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open **http://localhost:3000**.

## Rebranding for a client

Everything client-specific lives in two places:

- **`lib/site-config.ts`** — shop name, tagline, description, contact
  info, free-shipping threshold. Update these values and every page
  (header, footer, metadata) picks them up automatically.
- **`components/Logo.tsx`** — currently a placeholder monogram. Swap the
  inner `<span>` for a real `<Image>` once a logo file is available.
- **`lib/products.ts`** (`PRODUCT_SEED`) — the starter product catalog.
  Replace with the real catalog, then run `npm run seed` again.
- **`tailwind.config.ts`** — the `walnut` / `terracotta` / `sand` color
  scale. Swap the hex values to match brand colors; every component
  already references these tokens rather than hardcoded colors.

## What's real vs. placeholder

- **Products & inventory** — real. Stored in MySQL, served via
  `lib/db.ts` and the `/api/products` routes. Stock is decremented
  transactionally when an order is placed.
- **Orders** — real. `POST /api/orders` validates stock against the
  database (inside a transaction, so two people can't both buy the last
  unit) and persists the order + line items. `/order-confirmation/[id]`
  reads it back.
- **Checkout payment** — placeholder. No payment processor is wired up;
  "Place order" records the order for real but doesn't charge a card.
  Wire up Stripe (or similar) in `app/api/orders/route.ts` when ready to
  go live.
- **Cart** — client-side only, persisted to the browser's `localStorage`
  (`lib/cart-context.tsx`). Not tied to a user account.
- **Contact form** — client-side only for now; shows a success state but
  doesn't send anywhere. Point it at an email service or an `/api/contact`
  route when needed.

## Project structure

```
app/                  Pages and API routes (App Router)
  shop/                Product listing + [slug] detail pages
  cart/, checkout/     Cart and checkout flow
  order-confirmation/  Post-purchase confirmation
  about/, contact/     Static-ish content pages
  api/                 products, orders route handlers
components/           Shared UI (Header, Footer, ProductCard, etc.)
lib/                  Product types/seed data, db access, cart context, site config
db/                   schema.sql + seed script
```
