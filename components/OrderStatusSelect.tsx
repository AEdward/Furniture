"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES } from "@/lib/order-status";

export default function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: number;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: string) {
    setValue(next);
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to update status.");
      setValue(status);
      setSaving(false);
      return;
    }

    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <select
        value={value}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-walnut-200 px-3 py-2.5 text-sm capitalize focus:border-walnut-400 focus:outline-none"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s} className="capitalize">
            {s}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}
