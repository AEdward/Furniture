import Link from "next/link";
import { getAllProducts } from "@/lib/db";
import ProductsTable from "@/components/ProductsTable";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink/60">{products.length} total</p>
        </div>
        <Link href="/portal2026/products/new" className="btn-primary">
          Add product
        </Link>
      </div>

      <ProductsTable products={products} />
    </div>
  );
}
