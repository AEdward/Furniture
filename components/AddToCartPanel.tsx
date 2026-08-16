"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/products";

export default function AddToCartPanel({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-walnut-200">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center text-lg text-walnut-600 disabled:opacity-30"
            disabled={outOfStock}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() =>
              setQuantity((q) => Math.min(product.stock || 1, q + 1))
            }
            className="flex h-11 w-11 items-center justify-center text-lg text-walnut-600 disabled:opacity-30"
            disabled={outOfStock || quantity >= product.stock}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled={outOfStock}
          onClick={() => {
            addItem(product, quantity);
            setAdded(true);
            setTimeout(() => setAdded(false), 1600);
          }}
          className="btn-primary flex-1 disabled:bg-ink/20"
        >
          {outOfStock ? "Sold out" : added ? "Added to cart ✓" : "Add to cart"}
        </button>
      </div>

      {added && (
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="text-sm font-medium text-walnut-600 hover:underline"
        >
          View cart →
        </button>
      )}
    </div>
  );
}
