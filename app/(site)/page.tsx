import Image from "next/image";
import Link from "next/link";
import FurnitureIcon from "@/components/FurnitureIcon";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts, getSettings } from "@/lib/db";
import { categories, formatPrice, type IconName } from "@/lib/products";

export const dynamic = "force-dynamic";

const categoryIcon: Record<(typeof categories)[number], IconName> = {
  Doors: "single-door",
  "Kitchen Cabinets": "base-cabinet",
  Closets: "wardrobe",
  Sofas: "sofa",
  "Dining Tables & Chairs": "dining-table",
  Beds: "bed",
};

export default async function HomePage() {
  const [featured, settings] = await Promise.all([getFeaturedProducts(), getSettings()]);
  const { hero } = settings;

  const valueProps = [
    {
      title: `Free delivery over ${formatPrice(settings.freeShippingThreshold)}`,
      body: "Delivered and installed, no surprise fees at checkout.",
    },
    {
      title: `${settings.returns.periodDays}-day returns`,
      body: "Not the right fit? Send it back for a full refund.",
    },
    {
      title: `${settings.warranty.tiers[0]?.years ?? 5}-year warranty`,
      body: "Every piece is built to last and backed to match.",
    },
  ];

  return (
    <div>
      <section className="border-b border-walnut-100 bg-gradient-to-b from-sand to-cream">
        <div className="container-shop grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="section-label">{settings.tagline}</p>
            <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              {hero.heading}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink/70">
              {hero.subheading}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={hero.ctaHref} className="btn-primary">
                {hero.ctaLabel}
              </Link>
              <Link href="/about" className="btn-secondary">
                Our story
              </Link>
            </div>
          </div>

          {hero.imageUrl ? (
            <div className="relative aspect-square overflow-hidden rounded-2xl">
              <Image
                src={hero.imageUrl}
                alt={hero.heading}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {featured.slice(0, 4).map((product) => (
                <div
                  key={product.id}
                  className={`flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br ${product.gradient}`}
                >
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <FurnitureIcon
                      name={product.icon}
                      className="h-16 w-16 text-walnut-500/70 sm:h-20 sm:w-20"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="container-shop py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="section-label">Browse</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-ink">
              Shop by category
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/shop?category=${encodeURIComponent(category)}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-walnut-100 bg-white/60 p-6 text-center transition-shadow hover:shadow-soft"
            >
              <FurnitureIcon
                name={categoryIcon[category]}
                className="h-10 w-10 text-walnut-500 transition-transform group-hover:scale-110"
              />
              <span className="text-sm font-medium text-ink">{category}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-walnut-50/60 py-16">
        <div className="container-shop">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="section-label">Featured</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-ink">
                Customer favorites
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden text-sm font-medium text-walnut-600 hover:underline sm:block"
            >
              View all products →
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
            View all products →
          </Link>
        </div>
      </section>

      <section className="container-shop py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          {valueProps.map((v) => (
            <div key={v.title} className="rounded-2xl border border-walnut-100 p-6">
              <h3 className="font-serif text-lg font-semibold text-ink">
                {v.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{v.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
