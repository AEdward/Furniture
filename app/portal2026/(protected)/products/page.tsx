import Link from "next/link";
import { getAllProducts } from "@/lib/db";
import { formatPrice } from "@/lib/products";
import DeleteProductButton from "@/components/DeleteProductButton";

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

      <div className="overflow-x-auto rounded-2xl border border-walnut-100 bg-white/60">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-walnut-100 text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Flags</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-walnut-100">
            {products.map((product) => (
              <tr key={product.slug}>
                <td className="px-5 py-3">
                  <Link
                    href={`/portal2026/products/${product.slug}/edit`}
                    className="font-medium text-ink hover:text-walnut-600"
                  >
                    {product.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-ink/70">{product.category}</td>
                <td className="px-5 py-3 text-ink/70">{formatPrice(product.price)}</td>
                <td className="px-5 py-3">
                  <span
                    className={
                      product.stock <= (product.lowStockThreshold ?? 5)
                        ? "font-medium text-danger-500"
                        : "text-ink/70"
                    }
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-1.5">
                    {product.featured && (
                      <span className="rounded-full bg-walnut-100 px-2 py-0.5 text-xs text-walnut-700">
                        Featured
                      </span>
                    )}
                    {product.new && (
                      <span className="rounded-full bg-walnut-700 px-2 py-0.5 text-xs text-walnut-50">
                        New
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/portal2026/products/${product.slug}/stock`}
                      className="text-sm font-medium text-walnut-600 hover:underline"
                    >
                      Stock
                    </Link>
                    <Link
                      href={`/portal2026/products/${product.slug}/edit`}
                      className="text-sm font-medium text-walnut-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton slug={product.slug} name={product.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
