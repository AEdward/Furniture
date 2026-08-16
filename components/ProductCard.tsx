import Link from "next/link";
import FurnitureIcon from "@/components/FurnitureIcon";
import QuickAddButton from "@/components/QuickAddButton";
import { formatPrice, type Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  const lowStock = product.stock > 0 && product.stock <= 5;
  const outOfStock = product.stock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-walnut-100 bg-white/60 transition-shadow hover:shadow-soft">
      <Link href={`/shop/${product.slug}`} className="block">
        <div
          className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${product.gradient}`}
        >
          <FurnitureIcon
            name={product.icon}
            className="h-24 w-24 text-walnut-500/70 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.new && (
              <span className="rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream">
                New
              </span>
            )}
            {product.compareAtPrice && (
              <span className="rounded-full bg-terracotta-400 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                Sale
              </span>
            )}
          </div>
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink">
                Sold out
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="section-label">{product.category}</p>
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-serif text-lg font-semibold leading-snug text-ink hover:text-walnut-600">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold text-walnut-600">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-ink/40 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {lowStock && (
          <p className="text-xs font-medium text-terracotta-500">
            Only {product.stock} left
          </p>
        )}

        <div className="mt-auto pt-2">
          <QuickAddButton product={product} />
        </div>
      </div>
    </div>
  );
}
