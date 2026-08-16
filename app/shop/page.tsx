import Link from "next/link";
import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import SortSelect from "@/components/SortSelect";
import { getAllProducts } from "@/lib/db";
import { categories, type Category, type Product } from "@/lib/products";

export const metadata: Metadata = { title: "Shop" };

function sortProducts(products: Product[], sort?: string) {
  const list = [...products];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "name":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return list.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string };
}) {
  const activeCategory = categories.includes(searchParams.category as Category)
    ? (searchParams.category as Category)
    : undefined;

  const products = sortProducts(
    await getAllProducts(activeCategory),
    searchParams.sort
  );

  return (
    <div className="container-shop py-12">
      <div className="mb-8">
        <p className="section-label">Shop</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink sm:text-4xl">
          {activeCategory ?? "All Furniture"}
        </h1>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/shop"
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              !activeCategory
                ? "border-walnut-500 bg-walnut-500 text-cream"
                : "border-walnut-200 text-ink/70 hover:border-walnut-400"
            }`}
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={`/shop?category=${encodeURIComponent(category)}`}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === category
                  ? "border-walnut-500 bg-walnut-500 text-cream"
                  : "border-walnut-200 text-ink/70 hover:border-walnut-400"
              }`}
            >
              {category}
            </Link>
          ))}
        </div>

        <SortSelect />
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-ink/60">
          No products found in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
