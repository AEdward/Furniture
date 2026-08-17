"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/products";
import type { SiteSettings } from "@/lib/settings";

export default function DeliveryEstimator({
  delivery,
}: {
  delivery: SiteSettings["delivery"];
}) {
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
              ? "border-walnut-500 bg-walnut-500 text-cream"
              : "border-walnut-200 text-ink/70 hover:border-walnut-400"
          }`}
        >
          Addis Ababa
        </button>
        <button
          type="button"
          onClick={() => setLocation("other")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            location === "other"
              ? "border-walnut-500 bg-walnut-500 text-cream"
              : "border-walnut-200 text-ink/70 hover:border-walnut-400"
          }`}
        >
          Other cities
        </button>
      </div>
      <p className="text-sm text-ink/70">
        🚚 {minDays}–{maxDays} working days · {formatPrice(fee)} delivery fee
        <br />
        <span className="text-ink/50">
          Free delivery on orders over {formatPrice(delivery.freeDeliveryThreshold)}.
        </span>
      </p>
    </div>
  );
}
