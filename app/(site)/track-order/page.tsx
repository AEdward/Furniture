"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/products";

type TrackedOrder = {
  id: number;
  status: string;
  subtotal: number;
  discountAmount: number;
  createdAt: string;
  items: { name: string; price: number; quantity: number; variant?: string }[];
};

export default function TrackOrderPage() {
  const [form, setForm] = useState({ orderId: "", email: "" });
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: Number(form.orderId), email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setOrder(data.order);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-shop flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="font-serif text-2xl font-semibold text-ink">Track your order</h1>
        <p className="mt-1 text-sm text-ink/60">
          Enter your order number and the email you used at checkout.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            Order number
            <input
              required
              type="number"
              value={form.orderId}
              onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))}
              className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
            />
          </label>
          {error && (
            <p className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-500">{error}</p>
          )}
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Looking up…" : "Track order"}
          </button>
        </form>

        {order && (
          <div className="mt-8 rounded-2xl border border-walnut-100 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-ink">Order #{order.id}</h2>
              <span className="rounded-full bg-walnut-100 px-2.5 py-1 text-xs font-medium capitalize text-walnut-700">
                {order.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink/40">
              Placed {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              {order.items.map((item, i) => (
                <li key={i} className="flex justify-between text-ink/70">
                  <span>
                    {item.name}
                    {item.variant && <span className="text-ink/40"> — {item.variant}</span>} ×{" "}
                    {item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-walnut-100 pt-4 font-semibold text-ink">
              <span>Total</span>
              <span>{formatPrice(order.subtotal - order.discountAmount)}</span>
            </div>
          </div>
        )}

        <p className="mt-6 text-sm text-ink/60">
          Have an account?{" "}
          <Link href="/account/orders" className="font-medium text-walnut-600 hover:underline">
            View all your orders
          </Link>
        </p>
      </div>
    </div>
  );
}
