"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentStatusActions({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"paid" | "failed" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function markAs(paymentStatus: "paid" | "failed") {
    setLoading(paymentStatus);
    setError(null);

    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to update payment.");
      setLoading(null);
      return;
    }

    setLoading(null);
    router.refresh();
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => markAs("paid")}
          disabled={loading !== null}
          className="rounded-full bg-walnut-500 px-3 py-1.5 text-xs font-medium text-walnut-50 disabled:opacity-50"
        >
          {loading === "paid" ? "Saving…" : "Mark as paid"}
        </button>
        <button
          type="button"
          onClick={() => markAs("failed")}
          disabled={loading !== null}
          className="rounded-full border border-danger-500 px-3 py-1.5 text-xs font-medium text-danger-500 disabled:opacity-50"
        >
          {loading === "failed" ? "Saving…" : "Mark as failed"}
        </button>
      </div>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}
