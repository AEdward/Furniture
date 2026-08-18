"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/products";
import { useT } from "@/lib/i18n/context";

function VariantGroup({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div>
      <p className="text-sm font-medium text-ink">
        {label}: <span className="font-normal text-ink/60">{selected}</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              selected === opt
                ? "border-walnut-500 bg-walnut-500 text-walnut-50"
                : "border-walnut-200 text-ink/70 hover:border-walnut-400"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AddToCartPanel({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const t = useT();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [material, setMaterial] = useState(product.materialOptions[0] ?? "");
  const [wood, setWood] = useState(product.woodOptions[0] ?? "");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [notifySubmitting, setNotifySubmitting] = useState(false);
  const [notifyError, setNotifyError] = useState<string | null>(null);

  const outOfStock = product.availability === "out_of_stock";
  const madeToOrder = product.availability === "made_to_order";
  const maxQuantity = madeToOrder ? 10 : Math.max(product.stock, 0);

  const variantLabel = useMemo(() => {
    return [color, material, wood].filter(Boolean).join(" · ") || undefined;
  }, [color, material, wood]);

  async function handleNotifySubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotifySubmitting(true);
    setNotifyError(null);
    try {
      const res = await fetch("/api/back-in-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: product.slug, email: notifyEmail }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setNotifyError(data.error ?? "Something went wrong — please try again.");
        return;
      }
      setNotifySubmitted(true);
    } catch {
      setNotifyError("Network error — please try again.");
    } finally {
      setNotifySubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <VariantGroup label={t("Color")} options={product.colors} selected={color} onSelect={setColor} />
      <VariantGroup
        label={t("Fabric / material")}
        options={product.materialOptions}
        selected={material}
        onSelect={setMaterial}
      />
      <VariantGroup label={t("Wood")} options={product.woodOptions} selected={wood} onSelect={setWood} />
      {product.colors.length > 0 && (
        <p className="-mt-3 text-xs text-ink/40">
          {t("Actual color may vary slightly from what's shown on screen.")}
        </p>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-walnut-200">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center text-lg text-walnut-600 disabled:opacity-30"
            disabled={outOfStock}
            aria-label={t("Decrease quantity")}
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxQuantity || 1, q + 1))}
            className="flex h-11 w-11 items-center justify-center text-lg text-walnut-600 disabled:opacity-30"
            disabled={outOfStock || quantity >= maxQuantity}
            aria-label={t("Increase quantity")}
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled={outOfStock}
          onClick={() => {
            addItem(product, quantity, variantLabel);
            setAdded(true);
            setTimeout(() => setAdded(false), 1600);
          }}
          className="btn-primary flex-1 disabled:bg-walnut-700/20"
        >
          {outOfStock ? t("Sold out") : added ? t("Added to cart ✓") : t("Add to cart")}
        </button>
      </div>

      {added && (
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="text-sm font-medium text-walnut-600 hover:underline"
        >
          {t("View cart →")}
        </button>
      )}

      {outOfStock &&
        (notifySubmitted ? (
          <p className="rounded-lg bg-walnut-50 px-4 py-3 text-sm text-walnut-700">
            {t("We'll email you when it's back.")}
          </p>
        ) : (
          <form onSubmit={handleNotifySubmit} className="flex flex-col gap-2">
            <p className="text-sm font-medium text-ink">{t("Notify me when back in stock")}</p>
            <div className="flex gap-2">
              <input
                required
                type="email"
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder={t("Email")}
                className="flex-1 rounded-lg border border-walnut-200 px-3 py-2.5 text-sm focus:border-walnut-400 focus:outline-none"
              />
              <button type="submit" disabled={notifySubmitting} className="btn-secondary">
                {notifySubmitting ? t("Submitting…") : t("Notify me")}
              </button>
            </div>
            {notifyError && <p className="text-xs text-danger-500">{notifyError}</p>}
          </form>
        ))}
    </div>
  );
}
