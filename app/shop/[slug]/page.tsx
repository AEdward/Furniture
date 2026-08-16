import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import FurnitureIcon from "@/components/FurnitureIcon";
import ProductCard from "@/components/ProductCard";
import AddToCartPanel from "@/components/AddToCartPanel";
import { getProductBySlug, getRelatedProducts } from "@/lib/db";
import { formatPrice } from "@/lib/products";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="container-shop py-12">
      <nav className="mb-6 text-sm text-ink/50">
        <Link href="/shop" className="hover:text-walnut-600">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-walnut-600"
        >
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink/70">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div
          className={`flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br ${product.gradient}`}
        >
          <FurnitureIcon
            name={product.icon}
            className="h-40 w-40 text-walnut-500/70 sm:h-56 sm:w-56"
          />
        </div>

        <div className="flex flex-col">
          <p className="section-label">{product.category}</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-walnut-600">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-ink/40 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {lowStock && (
            <p className="mt-2 text-sm font-medium text-terracotta-500">
              Only {product.stock} left in stock
            </p>
          )}

          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/70">
            {product.description}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-ink/70">
            <div>
              <p className="font-medium text-ink">Material</p>
              <p>{product.material}</p>
            </div>
            <div>
              <p className="font-medium text-ink">Dimensions</p>
              <p>{product.dimensions}</p>
            </div>
          </div>

          <ul className="mt-6 space-y-1.5 text-sm text-ink/70">
            {product.details.map((detail) => (
              <li key={detail} className="flex gap-2">
                <span className="text-terracotta-400">•</span>
                {detail}
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <AddToCartPanel product={product} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-serif text-2xl font-semibold text-ink">
            You may also like
          </h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
