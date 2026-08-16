import Link from "next/link";
import FurnitureIcon from "@/components/FurnitureIcon";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts } from "@/lib/db";
import { categories } from "@/lib/products";
import { siteConfig } from "@/lib/site-config";

const categoryIcon = {
  "Living Room": "sofa",
  Bedroom: "bed",
  Dining: "dining-table",
  Office: "desk",
  Outdoor: "outdoor-chair",
} as const;

const valueProps = [
  {
    title: "Free shipping over $" + siteConfig.freeShippingThreshold,
    body: "Delivered to your door, no surprise fees at checkout.",
  },
  {
    title: "30-day returns",
    body: "Not the right fit? Send it back within 30 days for a full refund.",
  },
  {
    title: "5-year warranty",
    body: "Every piece is built to last and backed to match.",
  },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div>
      <section className="border-b border-walnut-100 bg-gradient-to-b from-sand to-cream">
        <div className="container-shop grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="section-label">{siteConfig.tagline}</p>
            <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Furniture that feels like it was already yours.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink/70">
              Solid materials, honest prices, and pieces built to be lived
              in — not just looked at. Browse the collection and furnish a
              room that actually feels like home.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary">
                Shop the collection
              </Link>
              <Link href="/about" className="btn-secondary">
                Our story
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {featured.slice(0, 4).map((product) => (
              <div
                key={product.id}
                className={`flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br ${product.gradient}`}
              >
                <FurnitureIcon
                  name={product.icon}
                  className="h-16 w-16 text-walnut-500/70 sm:h-20 sm:w-20"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shop py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="section-label">Browse</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-ink">
              Shop by room
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
