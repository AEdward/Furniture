"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/products";
import { useT } from "@/lib/i18n/context";
import type { SiteSettings } from "@/lib/settings";

type PaymentMethod = "chapa" | "cod" | "bank_transfer";

export default function CheckoutForm({
  bankDetails,
  prefill,
}: {
  bankDetails: SiteSettings["bankDetails"];
  prefill?: { customerName: string; customerEmail: string };
}) {
  const { lines, subtotal, clearCart, isReady, cartSessionId } = useCart();
  const router = useRouter();
  const t = useT();
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("chapa");
  const [form, setForm] = useState({
    customerName: prefill?.customerName ?? "",
    customerEmail: prefill?.customerEmail ?? "",
    customerPhone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(
    null
  );
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);

  const total = Math.max(0, subtotal - (appliedCoupon?.discountAmount ?? 0));

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    setCouponChecking(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error ?? "Invalid coupon code.");
        return;
      }
      setAppliedCoupon({ code: data.code, discountAmount: data.discountAmount });
    } catch {
      setCouponError("Network error — please try again.");
    } finally {
      setCouponChecking(false);
    }
  }

  if (isReady && lines.length === 0) {
    return (
      <div className="container-shop flex flex-col items-center py-24 text-center">
        <h1 className="font-serif text-3xl font-semibold text-ink">
          {t("Your cart is empty")}
        </h1>
        <Link href="/shop" className="btn-primary mt-8">
          {t("Continue shopping")}
        </Link>
      </div>
    );
  }

  const paymentOptions: { value: PaymentMethod; label: string; description: string }[] = [
    {
      value: "chapa",
      label: t("Pay online"),
      description: t("Pay securely with Chapa — card, mobile money, and more."),
    },
    {
      value: "cod",
      label: t("Cash on delivery"),
      description: t("Pay in cash when your order arrives."),
    },
    {
      value: "bank_transfer",
      label: t("Bank transfer"),
      description: t("Transfer the total to our bank account; we'll confirm and prepare your order."),
    },
  ];

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
          paymentMethod,
          cartSessionId,
          couponCode: appliedCoupon?.code ?? null,
          items: lines.map((l) => ({ slug: l.slug, quantity: l.quantity, variant: l.variant })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      const orderId = data.order.id;

      if (paymentMethod !== "chapa") {
        // Cash on delivery / bank transfer commit immediately — no
        // external redirect to abandon, so the order is fully placed
        // the moment createOrder succeeds.
        clearCart();
        router.push(`/order-confirmation/${orderId}`);
        return;
      }

      setRedirecting(true);
      const payRes = await fetch("/api/checkout/chapa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) {
        // Order exists either way — just couldn't start the Chapa
        // payment step (e.g. not configured yet in this environment).
        // Retrying "Place order" reuses this same draft (via
        // cartSessionId) rather than creating a duplicate.
        setError(payData.error ?? "Could not start payment. Please try again.");
        setSubmitting(false);
        setRedirecting(false);
        return;
      }

      clearCart();
      window.location.href = payData.checkoutUrl;
    } catch {
      setError("Network error — please try again.");
      setSubmitting(false);
      setRedirecting(false);
    }
  }

  return (
    <div className="container-shop py-12">
      <h1 className="mb-8 font-serif text-3xl font-semibold text-ink">
        {t("Checkout")}
      </h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="rounded-2xl border border-walnut-100 p-6">
            <h2 className="mb-4 font-serif text-lg font-semibold text-ink">
              {t("Shipping details")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm">
                {t("Full name")}
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
                {t("Email")}
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
                {t("Phone number")}
                <input
                  required
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customerPhone: e.target.value }))
                  }
                  className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
                {t("Address")}
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
                {t("City")}
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
                {t("Postal code")}
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

          <div className="rounded-2xl border border-walnut-100 p-6">
            <h2 className="mb-4 font-serif text-lg font-semibold text-ink">
              {t("Payment method")}
            </h2>
            <div className="flex flex-col gap-3">
              {paymentOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer flex-col gap-1 rounded-xl border px-4 py-3 transition-colors ${
                    paymentMethod === opt.value
                      ? "border-walnut-500 bg-walnut-50"
                      : "border-walnut-200 hover:border-walnut-300"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value)}
                      className="accent-walnut-500"
                    />
                    <span className="text-sm font-medium text-ink">{opt.label}</span>
                  </span>
                  <span className="pl-6 text-xs text-ink/60">{opt.description}</span>
                </label>
              ))}
            </div>

            {paymentMethod === "chapa" && (
              <p className="mt-4 text-xs text-ink/50">
                {t("You'll be redirected to Chapa to pay securely — your order is recorded once payment is confirmed.")}
              </p>
            )}

            {paymentMethod === "bank_transfer" && (
              <div className="mt-4 rounded-xl bg-walnut-50/60 p-4 text-sm text-ink/70">
                <p className="font-medium text-ink">{t("Bank transfer details")}</p>
                <p className="mt-2">
                  {t("Bank")}: {bankDetails.bankName}
                </p>
                <p>
                  {t("Account name")}: {bankDetails.accountName}
                </p>
                <p>
                  {t("Account number")}: {bankDetails.accountNumber}
                </p>
                {bankDetails.branch && (
                  <p>
                    {t("Branch")}: {bankDetails.branch}
                  </p>
                )}
                {bankDetails.instructions && (
                  <p className="mt-2 text-xs text-ink/50">{bankDetails.instructions}</p>
                )}
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-500">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary">
            {redirecting
              ? t("Redirecting to payment…")
              : submitting
                ? t("Placing order…")
                : paymentMethod === "chapa"
                  ? t("Place order — {price}", { price: formatPrice(total) })
                  : t("Place order")}
          </button>
        </form>

        <div className="h-fit rounded-2xl border border-walnut-100 p-6">
          <h2 className="font-serif text-lg font-semibold text-ink">
            {t("Order Summary")}
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

          <div className="mt-4 border-t border-walnut-100 pt-4">
            {appliedCoupon ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink/70">
                  {t("Coupon code")}: <span className="font-mono">{appliedCoupon.code}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(null)}
                  className="text-xs font-medium text-danger-500 hover:underline"
                >
                  {t("Remove")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={t("Coupon code")}
                  className="flex-1 rounded-lg border border-walnut-200 px-3 py-2 text-sm focus:border-walnut-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={couponChecking || !couponInput.trim()}
                  className="rounded-lg border border-walnut-200 px-3 py-2 text-sm font-medium text-ink/70 hover:border-walnut-400 disabled:opacity-50"
                >
                  {t("Apply")}
                </button>
              </form>
            )}
            {couponError && <p className="mt-2 text-xs text-danger-500">{couponError}</p>}
          </div>

          <div className="mt-4 flex justify-between text-sm text-ink/70">
            <span>{t("Subtotal")}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {appliedCoupon && appliedCoupon.discountAmount > 0 && (
            <div className="mt-2 flex justify-between text-sm text-ink/70">
              <span>{t("Discount")}</span>
              <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
            </div>
          )}
          <div className="mt-3 flex justify-between border-t border-walnut-100 pt-3 font-semibold text-ink">
            <span>{t("Total")}</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
