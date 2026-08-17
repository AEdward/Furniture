"use client";

import { useState } from "react";
import { deliveryPolicy } from "@/lib/policies";
import { formatPrice } from "@/lib/products";

export default function DeliveryEstimator() {
  const [location, setLocation] = useState<"addis" | "other">("addis");
  const policy = location === "addis" ? deliveryPolicy.addisAbaba : deliveryPolicy.otherCities;

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
        🚚 {policy.minDays}–{policy.maxDays} working days · {formatPrice(policy.fee)} delivery fee
        <br />
        <span className="text-ink/50">
          Free delivery on orders over {formatPrice(deliveryPolicy.freeDeliveryThreshold)}.
        </span>
      </p>
    </div>
  );
}
