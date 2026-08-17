"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";

export default function CheckoutPage() {
  const { lines, subtotal, clearCart, isReady } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    address: "",
    city: "",
    postalCode: "",
  });

  if (isReady && lines.length === 0) {
    return (
      <div className="container-shop flex flex-col items-center py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold text-ink">
          Your cart is empty
        </h1>
        <Link href="/shop" className="btn-primary mt-8">
          Continue shopping
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: lines.map((l) => ({ slug: l.slug, quantity: l.quantity, variant: l.variant })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      clearCart();
      router.push(`/order-confirmation/${data.order.id}`);
    } catch {
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="container-shop py-12">
      <h1 className="mb-8 font-serif text-3xl font-semibold text-ink">
        Checkout
      </h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="rounded-2xl border border-walnut-100 p-6">
            <h2 className="mb-4 font-serif text-lg font-semibold text-ink">
              Shipping details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm">
                Full name
                <input
                  required
                  value={form.customerName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customerName: e.target.value }))
                  }
                  className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                Email
                <input
                  required
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customerEmail: e.target.value }))
                  }
                  className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                Address
                <input
                  required
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                City
                <input
                  required
                  value={form.city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, city: e.target.value }))
                  }
                  className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                Postal code
                <input
                  required
                  value={form.postalCode}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, postalCode: e.target.value }))
                  }
                  className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-walnut-300 bg-walnut-50/50 p-6 text-sm text-ink/60">
            Payment is a placeholder for this build — no card is charged.
            Placing an order records it for real; wire up a payment
            processor here when ready to go live.
          </div>

          {error && (
            <p className="rounded-lg bg-terracotta-50 px-4 py-3 text-sm text-terracotta-500">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Placing order…" : `Place order — ${formatPrice(subtotal)}`}
          </button>
        </form>

        <div className="h-fit rounded-2xl border border-walnut-100 p-6">
          <h2 className="font-serif text-lg font-semibold text-ink">
            Order Summary
          </h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm">
            {lines.map((line) => (
              <li key={`${line.slug}::${line.variant ?? ""}`} className="flex justify-between text-ink/70">
                <span>
                  {line.name}
                  {line.variant && <span className="text-ink/40"> — {line.variant}</span>} ×{" "}
                  {line.quantity}
                </span>
                <span>{formatPrice(line.price * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-walnut-100 pt-4 font-semibold text-ink">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
