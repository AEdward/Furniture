"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/products";

export default function WishlistGrid({ items }: { items: Product[] }) {
  const router = useRouter();
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleRemove(slug: string) {
    setRemoving(slug);
    await fetch("/api/account/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productSlug: slug }),
    });
    router.refresh();
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((product) => (
        <div key={product.id} className="flex flex-col gap-2">
          <ProductCard product={product} />
          <button
            type="button"
            onClick={() => handleRemove(product.slug)}
            disabled={removing === product.slug}
            className="text-xs font-medium text-danger-500 hover:underline disabled:opacity-50"
          >
            {removing === product.slug ? "Removing…" : "Remove from wishlist"}
          </button>
        </div>
      ))}
    </div>
  );
}
