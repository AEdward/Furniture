"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/context";

export default function RetryPaymentButton({ orderId }: { orderId: number }) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/chapa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not start payment.");
        setLoading(false);
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button type="button" onClick={handleClick} disabled={loading} className="btn-primary">
        {loading ? t("Redirecting to payment…") : t("Try payment again")}
      </button>
      {error && <p className="text-sm text-danger-500">{error}</p>}
    </div>
  );
}
