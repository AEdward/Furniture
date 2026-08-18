"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/products";
import type { SiteSettings } from "@/lib/settings";
import { useT } from "@/lib/i18n/context";

export default function DeliveryEstimator({
  delivery,
}: {
  delivery: SiteSettings["delivery"];
}) {
  const t = useT();
  const [location, setLocation] = useState<"addis" | "other">("addis");
  const minDays = location === "addis" ? delivery.addisMinDays : delivery.otherMinDays;
  const maxDays = location === "addis" ? delivery.addisMaxDays : delivery.otherMaxDays;
  const fee = location === "addis" ? delivery.addisFee : delivery.otherFee;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setLocation("addis")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            location === "addis"
              ? "border-walnut-500 bg-walnut-500 text-walnut-50"
              : "border-walnut-200 text-ink/70 hover:border-walnut-400"
          }`}
        >
          {t("Addis Ababa")}
        </button>
        <button
          type="button"
          onClick={() => setLocation("other")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            location === "other"
              ? "border-walnut-500 bg-walnut-500 text-walnut-50"
              : "border-walnut-200 text-ink/70 hover:border-walnut-400"
          }`}
        >
          {t("Other cities")}
        </button>
      </div>
      <p className="text-sm text-ink/70">
        🚚 {t("{min}–{max} working days · {fee} delivery fee", { min: minDays, max: maxDays, fee: formatPrice(fee) })}
        <br />
        <span className="text-ink/50">
          {t("Free delivery on orders over {amount}.", {
            amount: formatPrice(delivery.freeDeliveryThreshold),
          })}
        </span>
      </p>
    </div>
  );
}
