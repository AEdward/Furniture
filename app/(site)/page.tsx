import Image from "next/image";
import Link from "next/link";
import FurnitureIcon from "@/components/FurnitureIcon";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts, getSettings } from "@/lib/db";
import { categories, formatPrice, type IconName } from "@/lib/products";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createT } from "@/lib/i18n/t";
import { translateProducts, translateSettings } from "@/lib/i18n/translate-content";

export const dynamic = "force-dynamic";

const categoryIcon: Record<(typeof categories)[number], IconName> = {
  "Living Room": "sofa",
  Bedroom: "bed",
  Dining: "dining-table",
  Office: "office-desk",
};

export default async function HomePage() {
  const locale = await getLocale();
  const [featuredRaw, settingsRaw, dict] = await Promise.all([
    getFeaturedProducts(),
    getSettings(),
    getDictionary(locale),
  ]);
  const t = createT(dict);
  const [featured, settings] = await Promise.all([
    translateProducts(featuredRaw, locale),
    translateSettings(settingsRaw, locale),
  ]);
  const { hero } = settings;

  const trustPoints = [
    { title: t("Quality materials"), body: t("Solid wood and hardware built to outlast the house it's in.") },
    { title: t("Expert craftsmanship"), body: t("Every joint and grain match is done by hand.") },
    {
      title: t("Free delivery over {amount}", { amount: formatPrice(settings.freeShippingThreshold) }),
      body: t("Delivered and installed, no surprise fees at checkout."),
    },
    {
      title: t("{years}-year warranty", { years: settings.warranty.tiers[0]?.years ?? 5 }),
      body: t("Every piece is backed to match."),
    },
    { title: t("Dedicated support"), body: t("We're here to help before and after delivery.") },
  ];

  return (
    <div>
      {/* Full-bleed image hero — the header floats transparently over
          this section only (see Header.tsx's onHero check); a dark
          gradient over the photo keeps the text legible. Falls back to
          a plain dark panel until an admin uploads a hero image at
          /portal2026/settings/hero. */}
      <section className="relative flex min-h-[560px] items-center overflow-hidden bg-walnut-700 pt-20">
        {hero.imageUrl ? (
          <Image
            src={hero.imageUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="bg-plank-grain absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-walnut-700/95 via-walnut-700/60 to-walnut-700/20" />

        <div className="container-shop relative py-16">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-400">
              {settings.tagline}
            </p>
            <h1 className="mt-4 font-serif text-5xl uppercase leading-[1.05] tracking-tight text-white sm:text-6xl">
              {hero.heading}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/70">
              {hero.subheading}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={hero.ctaHref}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-terracotta-200 via-terracotta-400 to-terracotta-600 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-walnut-700 transition-opacity hover:opacity-90"
              >
                {hero.ctaLabel}
                <span aria-hidden>&rarr;</span>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:border-terracotta-400 hover:text-terracotta-200"
              >
                {t("Our story")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shop py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="section-label">{t("Browse")}</p>
            <h2 className="mt-2 font-serif text-3xl uppercase tracking-tight text-ink">
              {t("Shop by category")}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/shop?category=${encodeURIComponent(category)}`}
              className="group flex flex-col items-center gap-3 rounded-xl border border-walnut-100 bg-white py-8 text-center shadow-sm transition-shadow hover:shadow-soft"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-walnut-50 transition-transform group-hover:scale-105">
                <FurnitureIcon
                  name={categoryIcon[category]}
                  className="h-7 w-7 text-terracotta-500"
                />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-ink">
                {t(category)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-walnut-50/60 py-16">
        <div className="container-shop">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="section-label">{t("Featured")}</p>
              <h2 className="mt-2 font-serif text-3xl uppercase tracking-tight text-ink">
                {t("Customer favorites")}
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden text-sm font-medium text-walnut-600 hover:underline sm:block"
            >
              {t("View all products →")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Link
            href="/shop"
            className="mt-8 block text-center text-sm font-medium text-walnut-600 hover:underline sm:hidden"
          >
            {t("View all products →")}
          </Link>
        </div>
      </section>

      <section className="border-y border-walnut-100 bg-white py-14">
        <div className="container-shop grid gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {trustPoints.map((v) => (
            <div key={v.title} className="flex flex-col items-center gap-2 text-center">
              <span className="h-1 w-8 rounded-full bg-gradient-to-r from-terracotta-200 via-terracotta-400 to-terracotta-600" />
              <h3 className="font-serif text-sm uppercase tracking-wide text-ink">
                {v.title}
              </h3>
              <p className="text-xs leading-relaxed text-ink/60">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-shop py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col justify-center gap-3 rounded-xl border border-walnut-100 bg-white p-10 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-500">
              {t("Custom furniture")}
            </p>
            <h3 className="font-serif text-2xl uppercase tracking-tight text-ink">
              {t("Create furniture that fits your space")}
            </h3>
            <p className="max-w-sm text-sm leading-relaxed text-ink/60">
              {t("Tell us the piece you have in mind — we'll work out the size, wood, and finish with you.")}
            </p>
            <Link
              href="/contact"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-terracotta-400 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600 transition-colors hover:bg-terracotta-50"
            >
              {t("Get in touch")}
              <span aria-hidden>&rarr;</span>
            </Link>
          </div>

          <div className="flex flex-col justify-center gap-3 rounded-xl border border-walnut-100 bg-white p-10 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-500">
              {t("Visit us")}
            </p>
            <h3 className="font-serif text-2xl uppercase tracking-tight text-ink">
              {t("We'd love to welcome you")}
            </h3>
            <p className="max-w-sm text-sm leading-relaxed text-ink/60">
              {settings.address.join(", ")}
            </p>
            <Link
              href="/contact"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-terracotta-400 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600 transition-colors hover:bg-terracotta-50"
            >
              {t("Contact")}
              <span aria-hidden>&rarr;</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
