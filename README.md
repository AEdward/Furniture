# Zemenay Furniture

A site for a custom furniture and joinery business — doors, kitchen
cabinets, closets, sofas, dining tables & chairs, and beds — with a real
catalog, cart, and checkout, plus a genuine
content-management layer: everything is admin-editable and stored in
MySQL, not baked into code. Built from a reusable template; `main` stays
the generic, unbranded version for other clients, and this branch
(`company/zemenay-furniture`) is rebranded and re-catalogued for
**Zemenay Furniture** specifically.

The real logo, mark, and full favicon/app-icon set are in place
(`public/brand/`, `public/favicon*`, `public/apple-touch-icon.png`,
`public/android-chrome-*.png`, `public/site.webmanifest`), wired up via
`app/layout.tsx` metadata and `components/Logo.tsx`.

**Still placeholder:** contact email/phone (editable at `/admin/settings`,
just not confirmed real numbers yet). The product catalog is a
representative starter set (28 products across doors, kitchen cabinets,
closets, sofas, dining tables & chairs, and beds), not Zemenay's actual
current inventory — replace it product-by-product in `/admin/products`
or wholesale via `lib/products.ts` + `npm run seed`.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · MySQL (`mysql2`)

Every product can have a real uploaded photo (`/admin` → edit a product →
"Product photo"). Until one's uploaded, products fall back to inline SVG
line-art on a gradient background, so the catalog never shows a broken
image.

## Running it locally

You need [Node.js](https://nodejs.org) 18+ and a MySQL-compatible server
(MySQL or MariaDB both work).

1. Start a database — either your own, or via Docker:

   ```bash
   docker compose up -d
   ```

   This starts MySQL 8.4 on `localhost:3306` with a `zemenay` database
   already created.

2. Install dependencies and configure environment variables:

   ```bash
   npm install
   cp .env.example .env.local
   ```

   Edit `.env.local` if your database isn't using the defaults in
   `docker-compose.yml`.

3. Create the schema and seed the product catalog, site settings, and the
   About page:

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
small team, not a multi-role permission system. Access is a signed,
httpOnly cookie (`middleware.ts` guards every `/admin` and `/api/admin`
route).

- **Dashboard** — product/order counts, revenue, low-stock list, recent orders
- **Products** — add, edit, delete; price, availability (in stock / made
  to order / out of stock), dimensions, materials, colors/style/wood
  options, rating, SKU, a real uploaded photo (falls back to icon +
  background if none), and Featured/New flags
- **Orders** — view line items and shipping info, update status
  (placed → processing → shipped → delivered, or cancelled)
- **Pages** — create, edit, and delete arbitrary pages (see below)
- **Analytics** — sales (revenue over time, top products, sales by
  category, orders by status), storefront traffic (page views over time,
  top pages, top referrers), and a site health panel (database
  connectivity/latency, app uptime, last order); see below
- **Settings** — site name/tagline/contact info, the home page hero
  (heading, subheading, image, button), and delivery/assembly/warranty/
  returns/payment-method policy shown across the site

## Analytics

**http://localhost:3000/admin/analytics** — three self-hosted panels, no
third-party account or API key required:

- **Sales** — computed directly from `orders`/`order_items`: revenue and
  order count for the last 30 days, average order value, all-time
  revenue, a daily revenue chart, top products by revenue, sales by
  category, and orders broken down by status.
- **Traffic** — a lightweight first-party page-view tracker
  (`components/PageViewTracker.tsx`) posts to `POST /api/track` on every
  storefront page load and logs to a `page_views` table. Only the path,
  referrer, and timestamp are stored — no IP address, user agent,
  fingerprint, or cookie/session id, so there's no cookie-consent banner
  to build. The panel shows page views over time, top pages, and top
  referrers.
- **Site health** — pings the database and reports latency, app uptime,
  Node version, environment, and the most recent order. If the database
  is unreachable, this panel reports it instead of the whole analytics
  page crashing.

## Language

A language switcher in the header (English / አማርኛ / Afaan Oromoo) lets a
visitor auto-translate the entire storefront — fixed UI text, product
names/descriptions/materials, site settings copy, and admin-authored
Pages — via the Google Cloud Translation API. Nothing needs translating
by hand and it stays live: edit a product description in `/admin`, and
the translated version updates on its own next time someone views it in
that language.

- **Setup**: set `GOOGLE_TRANSLATE_API_KEY` in `.env.local` (see
  `.env.example` for where to get one). Without it, the switcher still
  appears and works, but every string falls back to English — a missing
  or failing translation call never breaks the page.
- **How it works**: `lib/translate.ts` calls the API in batches and
  caches every result in a `translations` table (keyed by a hash of
  language + source text), so a string is only ever translated once —
  after that, every page load reads the cache. `lib/i18n/ui-strings.ts`
  is the fixed-text manifest (nav, buttons, labels); `lib/i18n/
  translate-content.ts` translates DB content (products, settings, page
  blocks) at render time. Translation is a read-time overlay — the
  database always stores the original English/whatever-the-admin-typed
  text, never a translated copy.
- **Selection**: stored in a `locale` cookie (`components/
  LanguageSwitcher.tsx` → `POST /api/locale`), read server-side by
  `lib/i18n/get-locale.ts`.
- **Scope**: the customer-facing storefront only — `/admin` stays
  English, since it's the shop owner's own tool, not customer-facing.
  Historical order line items (on the confirmation page) show the name
  as recorded at purchase time, not re-translated.

## Content management

Nothing customer-facing is hardcoded in a way the shop owner can't reach
from `/admin`:

- **Site settings** (`/admin/settings`) — one record in the `settings`
  table (`lib/settings.ts` / `lib/db.ts`) drives the site name, tagline,
  contact info, the home page hero, and every delivery/warranty/returns/
  payment detail shown on product pages. Previously this lived in static
  code files (`lib/site-config.ts`, `lib/policies.ts`) — both are gone;
  everything reads from the database now.
- **Pages** (`/admin/pages`) — a `pages` table holds admin-authored pages
  as an ordered list of typed content blocks: **Hero** (heading/
  subheading/image/button), **Text** (heading + paragraphs), and
  **Image + Text** (image left or right of a text block). Reorder blocks
  with the ↑/↓ buttons, add more via the buttons at the bottom, and flag
  a page "Show in header navigation" to add it to the nav automatically.
  `app/(site)/[slug]/page.tsx` renders any page by slug — the About page
  (`/about`) is the first example, seeded by `db/seed.ts`.
- **Product photos** — `/api/admin/upload` accepts JPG/PNG/WEBP up to 5MB
  and saves to `public/uploads/` (gitignored — it's runtime content, not
  template code). The same upload widget (`components/ImageUpload.tsx`)
  is reused for product photos, the hero image, and page-block images.

**Reserved page slugs** (can't be used for a custom page — they route to
code-driven pages instead): `shop`, `cart`, `checkout`,
`order-confirmation`, `contact`, `admin`, `api`.

**Not built as a CMS feature** (deliberately out of scope for now): a
drag-and-drop visual editor (blocks reorder via buttons, not dragging),
rich WYSIWYG text (paragraphs are plain text split on blank lines), and a
gallery/multi-image block type.

## Product pages

Each product page (`/shop/[slug]`) is a full furniture/joinery PDP, not a
generic e-commerce template:

- Rating + review count, SKU, and one of three availability states —
  **In Stock** (tracked by a numeric `stock` count), **Made to Order**
  (skips stock tracking entirely, shows a lead-time message, checkout
  never blocks it), or **Out of Stock** (checkout always rejects it,
  regardless of the `stock` number)
- Structured dimensions (width/depth/height + optional seat/arm/leg
  height/weight) rendered as a table, plus a **fit calculator** that
  compares a customer's entered room/opening size against them
- Structured materials & construction — **core material**, **finish**,
  **hardware**, and an **additional spec** field (fire rating, glass type,
  etc.), reusing the same four schema columns across both furniture- and
  millwork-style products
- Color / style / wood **selector chips** — informational (single SKU,
  doesn't fork price or stock), but the selection follows the item into
  the cart, the order record, and the confirmation page as a variant label
- Delivery, assembly, warranty, returns, and payment-method info — all
  from `/admin/settings`, not hardcoded per product
- Two cross-sell rails: same-category "You may also like" and
  cross-category "Complete the project"

**Deferred** (would need infrastructure this project doesn't have yet):
multi-photo galleries / 360° / AR — products support one photo today;
a full submittable review system with sub-ratings and customer photos —
`rating`/`reviewCount` are admin-set aggregate numbers, not a live review
feed; installment/split payments — needs a real payment processor first;
automatic bundle discount pricing for "Complete the project".

## Rebranding for a client

- **`/admin/settings`** — name, tagline, contact info, hero, and all
  policy content. No code changes needed.
- **`components/Logo.tsx`** + **`public/brand/`** — swap the logo PNGs and
  update the `src` paths (and regenerate `public/favicon*` etc. if the
  new client needs their own icon set).
- **`lib/products.ts`** (`PRODUCT_SEED`) — the starter product catalog.
  Replace with the real catalog, then run `npm run seed` again — or just
  use `/admin/products` once live.
- **`tailwind.config.ts`** — the `walnut` / `terracotta` / `sand` color
  scale. Swap the hex values to match brand colors; every component
  already references these tokens rather than hardcoded colors. (`danger`
  is intentionally separate — it's the error/warning red, not a brand
  accent, so error states never confuse a customer regardless of theme.)

## Payment

Checkout charges real money through [Chapa](https://chapa.co), the
Ethiopian payment gateway — no placeholder, no fake "order placed" until
payment actually clears.

- **Flow**: `POST /api/orders` creates the order with `payment_status =
  'pending'` and validates stock (fails fast if something's sold out),
  but does **not** decrement stock yet. `POST /api/checkout/chapa`
  then starts a Chapa transaction and the browser is redirected to
  Chapa's hosted checkout page to pay. Stock is only decremented once
  payment is confirmed (see below) — an abandoned or failed checkout
  never holds stock hostage.
- **Confirmation, two independent paths**: (1) Chapa calls
  `POST /api/webhooks/chapa` server-to-server after the payment
  attempt, and (2) the customer's browser lands back on
  `/order-confirmation/[id]` via Chapa's `return_url`, which also
  actively checks the result — so the customer sees an accurate status
  immediately rather than waiting on the async webhook. Both paths call
  the same `confirmOrderPayment()` in `lib/db.ts`, which is idempotent
  (safe if both fire) and **always independently re-verifies with
  Chapa's API** before trusting a "success" — a webhook payload or
  return-URL query string is only ever treated as a hint to check, never
  as proof of payment on its own.
- **If payment fails or is left pending**, the order confirmation page
  shows that clearly and offers a "Try payment again" button
  (`components/RetryPaymentButton.tsx`), which re-starts a fresh Chapa
  transaction for the same order.
- **Setup**: get a secret key from your
  [Chapa dashboard](https://dashboard.chapa.co) (test or live) and set
  `CHAPA_SECRET_KEY` in `.env.local`. Without it, checkout still records
  the order for real but shows a clear "payment isn't set up yet" error
  instead of redirecting to pay — it never silently pretends a payment
  succeeded. Set `APP_BASE_URL` too if you're not on `localhost:3000`
  (used to build the callback/return URLs Chapa redirects to).
- **Admin**: `/admin/orders` shows a Payment column (pending/paid/failed)
  alongside fulfillment status; the order detail page shows the payment
  provider and transaction reference.

## What's real vs. placeholder

- **Products, inventory, settings, and pages** — all real, stored in
  MySQL. Stock is decremented once payment is confirmed (see "Payment").
- **Orders and payment** — real, via Chapa (see "Payment" above).
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
    contact/             Contact page (form + settings-driven info panel)
    [slug]/              Dynamic renderer for admin-created CMS pages
  admin/
    login/               Public login page
    (protected)/         Dashboard, products, orders, pages, analytics, settings — gated by middleware.ts
  api/                 products, orders, checkout/chapa + webhooks/chapa
                       (payment), track (public page-view logging),
                       locale (language switcher), admin/* route handlers
components/           Shared UI — Header, Footer, ProductCard, admin forms,
                       ImageUpload, PageBlockEditor, BlockRenderer,
                       PageViewTracker, BarChart, HorizontalBars,
                       LanguageSwitcher, RetryPaymentButton, etc.
lib/                  Product types/seed data, db access, settings, pages/blocks,
                       cart context, admin auth, validation, translate.ts, chapa.ts
  i18n/                Locale/dictionary/context (see "Language" above)
db/                   schema.sql + seed script (products, settings, About page)
middleware.ts          Protects /admin and /api/admin routes
public/uploads/        Admin-uploaded images (gitignored)
```
