"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Coupon } from "@/lib/db";
import { formatPrice } from "@/lib/products";

export default function AdminCouponsTable({
  initialCoupons,
}: {
  initialCoupons: Coupon[];
}) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initialCoupons);

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discountType,
          discountValue: Number(discountValue),
          maxUses: maxUses === "" ? null : Number(maxUses),
          expiresAt: expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create coupon.");
        return;
      }
      setCoupons((prev) => [data.coupon, ...prev]);
      setCode("");
      setDiscountValue("");
      setMaxUses("");
      setExpiresAt("");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(coupon: Coupon) {
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to update coupon.");
      return;
    }
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, active: !c.active } : c))
    );
    router.refresh();
  }

  async function handleDelete(coupon: Coupon) {
    if (!confirm(`Delete coupon "${coupon.code}"? This can't be undone.`)) return;
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to delete coupon.");
      return;
    }
    setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto rounded-2xl border border-walnut-100 bg-white/60">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-walnut-100 text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-5 py-3 font-medium">Code</th>
              <th className="px-5 py-3 font-medium">Discount</th>
              <th className="px-5 py-3 font-medium">Uses</th>
              <th className="px-5 py-3 font-medium">Expires</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-walnut-100">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-ink/50">
                  No coupons yet.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="px-5 py-3 font-mono font-medium text-ink">{coupon.code}</td>
                  <td className="px-5 py-3 text-ink/70">
                    {coupon.discountType === "percent"
                      ? `${coupon.discountValue}%`
                      : formatPrice(coupon.discountValue)}
                  </td>
                  <td className="px-5 py-3 text-ink/70">
                    {coupon.usedCount}
                    {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : ""}
                  </td>
                  <td className="px-5 py-3 text-ink/50">
                    {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(coupon)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        coupon.active
                          ? "bg-walnut-500 text-walnut-50"
                          : "bg-walnut-700/10 text-ink/50"
                      }`}
                    >
                      {coupon.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(coupon)}
                      className="text-sm font-medium text-danger-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-4 rounded-2xl border border-walnut-100 bg-white/60 p-6"
      >
        <h2 className="font-serif text-base font-semibold text-ink">Add a coupon</h2>
        <div className="grid gap-4 sm:grid-cols-5">
          <label className="flex flex-col gap-1.5 text-sm">
            Code
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SAVE10"
              className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Type
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")}
              className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
            >
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed amount off (ETB)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Value
            <input
              required
              type="number"
              min={1}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Max uses (optional)
            <input
              type="number"
              min={1}
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            Expires (optional)
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
            />
          </label>
        </div>
        {error && (
          <p className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-500">{error}</p>
        )}
        <button type="submit" disabled={submitting} className="btn-primary self-start">
          {submitting ? "Adding…" : "Add coupon"}
        </button>
      </form>
    </div>
  );
}
