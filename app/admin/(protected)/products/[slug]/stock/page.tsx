import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getStockAdjustments } from "@/lib/db";
import StockManager from "@/components/StockManager";

export const dynamic = "force-dynamic";

export default async function ProductStockPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const adjustments = await getStockAdjustments(params.slug);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/products" className="text-sm text-ink/50 hover:text-walnut-600">
          ← Products
        </Link>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-ink">Stock — {product.name}</h1>
      </div>
      <StockManager product={product} initialAdjustments={adjustments} />
    </div>
  );
}
