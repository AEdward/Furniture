# Zemenay Furniture

A furniture e-commerce site: browse by category, view product details,
add to cart, and check out. Built from a reusable template — all branding
(name, logo, tagline, contact info) lives in one config file so it can be
re-skinned per client without touching page code. This branch
(`company/zemenay-furniture`) is rebranded for **Zemenay Furniture**
specifically; `main` stays the generic, unbranded template for other
clients.

**Still placeholder on this branch:** the logo is a text-based
approximation of the real Zemenay mark (charcoal box, gold "Z", serif
wordmark) — swap `components/Logo.tsx` for the real logo file when it's
available. Contact email/phone in `lib/site-config.ts` are also
unconfirmed placeholders. The product catalog itself is still the
generic starter catalog (`lib/products.ts`), not Zemenay's real
inventory.

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

4. Set an admin password. In `.env.local`, set `ADMIN_PASSWORD` to whatever
   you want to sign in with, and `ADMIN_SESSION_SECRET` to any long random
   string (this signs the login cookie — it doesn't need to be memorable).

5. Run the dev server:

   ```bash
   npm run dev
   ```

   Open **http://localhost:3000**.

## Admin dashboard

**http://localhost:3000/admin** — sign in with `ADMIN_PASSWORD`. It's a
single shared password (no per-user accounts), meant for the shop owner /
small team, not a multi-role permission system.

- **Dashboard** — product/order counts, revenue, low-stock list, recent orders
- **Products** — add, edit, delete; set price, availability (in stock /
  made to order / out of stock), dimensions, materials, colors/fabric/wood
  options, rating, SKU, icon/background, and the Featured/New flags
- **Orders** — view line items and shipping info, update status
  (placed → processing → shipped → delivered, or cancelled)

Access is a signed, httpOnly cookie (`middleware.ts` guards every
`/admin` and `/api/admin` route) — there's no separate user table, so
"logging in" just means presenting the correct `ADMIN_PASSWORD`.

## Product pages

Each product page (`/shop/[slug]`) is a full furniture PDP, not a generic
e-commerce template:

- Rating + review count, SKU, and one of three availability states —
  **In Stock** (tracked by a numeric `stock` count), **Made to Order**
  (skips stock tracking entirely, shows a lead-time message, checkout
  never blocks it), or **Out of Stock** (checkout always rejects it,
  regardless of the `stock` number)
- Structured dimensions (width/depth/height/seat height/seat depth/arm
  height/leg height/weight) rendered as a table, plus a **room-fit
  calculator** that compares a customer's entered room/door size against
  them
- Structured materials & construction (frame/upholstery/legs/foam density)
- Color / fabric / wood **selector chips** — informational (single SKU,
  doesn't fork price or stock), but the selection follows the item into
  the cart, the order record, and the confirmation page as a variant label
- Delivery, assembly, warranty, returns, and payment-method info pulled
  from `lib/policies.ts` (shop-wide, not per-product)
- Two cross-sell rails: same-category "You may also like" and
  cross-category "Complete the room"

**Deferred** (would need infrastructure this project doesn't have yet):
multi-photo galleries / 360° / AR — blocked on real product photos
existing at all, still using placeholder icons; a full submittable review
system with sub-ratings and customer photos — `rating`/`reviewCount` are
admin-set aggregate numbers, not a live review feed; installment/split
payments — needs the real payment processor first; automatic bundle
discount pricing for "Complete the room".

## Rebranding for a client

Everything client-specific lives in two places:

- **`lib/site-config.ts`** — shop name, tagline, description, contact
  info, free-shipping threshold. Update these values and every page
  (header, footer, metadata) picks them up automatically.
- **`components/Logo.tsx`** — currently a placeholder monogram. Swap the
  inner `<span>` for a real `<Image>` once a logo file is available.
- **`lib/products.ts`** (`PRODUCT_SEED`) — the starter product catalog.
  Replace with the real catalog, then run `npm run seed` again.
- **`lib/policies.ts`** — delivery fees/times, assembly, warranty tiers,
  returns policy, and payment methods shown on every product page.
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
app/
  (site)/              Customer-facing pages, wrapped in Header/Footer/CartProvider
    shop/                Product listing + [slug] detail pages
    cart/, checkout/     Cart and checkout flow
    order-confirmation/  Post-purchase confirmation
    about/, contact/     Static-ish content pages
  admin/
    login/               Public login page
    (protected)/         Dashboard, products, orders — gated by middleware.ts
  api/                 products, orders, admin/* route handlers
components/           Shared UI (Header, Footer, ProductCard, admin nav/forms, etc.)
lib/                  Product types/seed data, db access, cart context, site config, admin auth
db/                   schema.sql + seed script
middleware.ts          Protects /admin and /api/admin routes
```
