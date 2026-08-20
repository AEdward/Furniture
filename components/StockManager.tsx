"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";

type StockAdjustment = {
  id: number;
  delta: number;
  reason: string;
  adminUserId: number | null;
  createdAt: string;
};

const REASON_PRESETS = ["New shipment arrived", "Inventory correction", "Damaged/written off"];

export default function StockManager({
  product,
  initialAdjustments,
}: {
  product: Product;
  initialAdjustments: StockAdjustment[];
}) {
  const router = useRouter();
  const [adjustments, setAdjustments] = useState(initialAdjustments);
  const [currentStock, setCurrentStock] = useState(product.stock);
  const [direction, setDirection] = useState<"add" | "remove">("add");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState(REASON_PRESETS[0]);
  const [customReason, setCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Enter a quantity greater than zero.");
      return;
    }
    const finalReason = reason === "Other" ? customReason.trim() : reason;
    if (!finalReason) {
      setError("Enter a reason.");
      return;
    }

    setSubmitting(true);
    setError(null);
    const delta = direction === "add" ? qty : -qty;

    try {
      const res = await fetch(`/api/admin/products/${product.slug}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta, reason: finalReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setCurrentStock(data.product.stock);
      setAdjustments((prev) => [
        { id: Date.now(), delta, reason: finalReason, adminUserId: null, createdAt: new Date().toISOString() },
        ...prev,
      ]);
      setQuantity("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-walnut-100 bg-white/60 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Current stock</p>
        <p className="mt-1 font-serif text-3xl font-semibold text-ink">{currentStock}</p>
        <p className="mt-1 text-sm text-ink/60">
          Low-stock alert threshold: {product.lowStockThreshold ?? 5}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-walnut-100 bg-white/60 p-6">
        <p className="text-sm font-semibold text-ink">Adjust stock</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDirection("add")}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium ${
              direction === "add" ? "border-walnut-500 bg-walnut-500 text-walnut-50" : "border-walnut-200 text-ink/70"
            }`}
          >
            + Add stock
          </button>
          <button
            type="button"
            onClick={() => setDirection("remove")}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium ${
              direction === "remove" ? "border-danger-500 bg-danger-500 text-white" : "border-walnut-200 text-ink/70"
            }`}
          >
            − Remove stock
          </button>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink/70">
          Quantity
          <input
            type="number"
            min={1}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="rounded-lg border border-walnut-200 bg-white px-3 py-2 text-sm text-ink"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink/70">
          Reason
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="rounded-lg border border-walnut-200 bg-white px-3 py-2 text-sm text-ink"
          >
            {REASON_PRESETS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
            <option value="Other">Other…</option>
          </select>
        </label>

        {reason === "Other" && (
          <input
            type="text"
            required
            placeholder="Describe the reason"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            className="rounded-lg border border-walnut-200 bg-white px-3 py-2 text-sm text-ink"
          />
        )}

        {error && <p className="text-sm text-danger-500">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary self-start">
          {submitting ? "Saving…" : "Save adjustment"}
        </button>
      </form>

      <div>
        <p className="mb-3 text-sm font-semibold text-ink">History</p>
        {adjustments.length === 0 ? (
          <p className="text-sm text-ink/50">No stock adjustments logged yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-walnut-100 bg-white/60">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-walnut-100 text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Change</th>
                  <th className="px-5 py-3 font-medium">Reason</th>
                  <th className="px-5 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-walnut-100">
                {adjustments.map((a) => (
                  <tr key={a.id}>
                    <td className={`px-5 py-3 font-medium ${a.delta >= 0 ? "text-green-600" : "text-danger-500"}`}>
                      {a.delta >= 0 ? `+${a.delta}` : a.delta}
                    </td>
                    <td className="px-5 py-3 text-ink/70">{a.reason}</td>
                    <td className="px-5 py-3 text-ink/50">
                      {new Date(a.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
