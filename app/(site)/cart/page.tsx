"use client";

import Link from "next/link";
import FurnitureIcon from "@/components/FurnitureIcon";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";

export default function CartPage() {
  const { lines, subtotal, updateQuantity, removeItem, isReady } = useCart();

  if (isReady && lines.length === 0) {
    return (
      <div className="container-shop flex flex-col items-center py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold text-ink">
          Your cart is empty
        </h1>
        <p className="mt-3 max-w-sm text-ink/60">
          Looks like you haven&apos;t added anything yet. Go find something
          you&apos;ll actually want to sit on.
        </p>
        <Link href="/shop" className="btn-primary mt-8">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-shop py-12">
      <h1 className="mb-8 font-serif text-3xl font-semibold text-ink">
        Your Cart
      </h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col divide-y divide-walnut-100 rounded-2xl border border-walnut-100">
          {lines.map((line) => (
            <div key={`${line.slug}::${line.variant ?? ""}`} className="flex gap-4 p-4 sm:p-5">
              <Link
                href={`/shop/${line.slug}`}
                className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${line.gradient}`}
              >
                <FurnitureIcon
                  name={line.icon}
                  className="h-10 w-10 text-walnut-500/70"
                />
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/shop/${line.slug}`}
                      className="font-medium text-ink hover:text-walnut-600"
                    >
                      {line.name}
                    </Link>
                    {line.variant && (
                      <p className="text-xs text-ink/50">{line.variant}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(line.slug, line.variant)}
                    className="text-xs font-medium text-ink/40 hover:text-terracotta-500"
                  >
                    Remove
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-walnut-200">
                    <button
                      type="button"
                      onClick={() => updateQuantity(line.slug, line.quantity - 1, line.variant)}
                      className="flex h-8 w-8 items-center justify-center text-walnut-600"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(line.slug, line.quantity + 1, line.variant)}
                      className="flex h-8 w-8 items-center justify-center text-walnut-600"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-medium text-ink">
                    {formatPrice(line.price * line.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl border border-walnut-100 p-6">
          <h2 className="font-serif text-lg font-semibold text-ink">
            Order Summary
          </h2>
          <div className="mt-4 flex justify-between text-sm text-ink/70">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-ink/50">
            Shipping and any applicable tax are calculated at checkout.
          </p>
          <Link
            href="/checkout"
            className="btn-primary mt-6 block w-full text-center"
          >
            Checkout
          </Link>
          <Link
            href="/shop"
            className="mt-3 block text-center text-sm font-medium text-walnut-600 hover:underline"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
