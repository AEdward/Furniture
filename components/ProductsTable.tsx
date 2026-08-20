"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/products";
import DeleteProductButton from "@/components/DeleteProductButton";

type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  lowStockThreshold?: number;
  featured?: boolean;
  new?: boolean;
};

export default function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const allSelected = products.length > 0 && selected.size === products.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.slug)));
  }

  function toggleOne(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function handleBulkDelete() {
    const count = selected.size;
    if (!confirm(`Delete ${count} product${count === 1 ? "" : "s"}? This can't be undone.`)) return;

    setDeleting(true);
    const res = await fetch("/api/admin/products/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: Array.from(selected) }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to delete products.");
      setDeleting(false);
      return;
    }
    setSelected(new Set());
    setDeleting(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-walnut-50 px-4 py-2.5 text-sm">
          <span className="text-ink/70">{selected.size} selected</span>
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={deleting}
            className="font-medium text-danger-500 hover:underline disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete selected"}
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-walnut-100 bg-white/60">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-walnut-100 text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="w-10 px-5 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Select all products"
                  className="h-4 w-4 rounded border-walnut-300"
                />
              </th>
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
                  <input
                    type="checkbox"
                    checked={selected.has(product.slug)}
                    onChange={() => toggleOne(product.slug)}
                    aria-label={`Select ${product.name}`}
                    className="h-4 w-4 rounded border-walnut-300"
                  />
                </td>
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
