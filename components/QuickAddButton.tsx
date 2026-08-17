"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/products";
import { useT } from "@/lib/i18n/context";

export default function QuickAddButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const t = useT();
  const outOfStock = product.availability === "out_of_stock";

  return (
    <button
      type="button"
      disabled={outOfStock}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1400);
      }}
      className="btn-secondary !px-4 !py-2 text-xs disabled:border-ink/20 disabled:text-ink/30 disabled:hover:bg-transparent"
    >
      {outOfStock ? t("Sold out") : added ? t("Added ✓") : t("Quick add")}
    </button>
  );
}
