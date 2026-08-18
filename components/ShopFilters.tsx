"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/context";

export default function ShopFilters({
  materials,
  colors,
}: {
  materials: string[];
  colors: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useT();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", q.trim() || null);
  }

  function handlePriceSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeMaterial = searchParams.get("material") ?? "";
  const activeColor = searchParams.get("color") ?? "";

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearchSubmit} className="relative max-w-sm">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("Search products…")}
          className="w-full rounded-full border border-walnut-200 bg-white px-4 py-2.5 pr-10 text-sm focus:border-walnut-400 focus:outline-none"
        />
        <button
          type="submit"
          aria-label={t("Search")}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-ink/50 hover:text-walnut-600"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="h-4 w-4">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handlePriceSubmit} className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder={t("Min price")}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-24 rounded-lg border border-walnut-200 px-3 py-2 text-sm focus:border-walnut-400 focus:outline-none sm:w-28"
          />
          <span className="text-ink/40">–</span>
          <input
            type="number"
            min={0}
            placeholder={t("Max price")}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-24 rounded-lg border border-walnut-200 px-3 py-2 text-sm focus:border-walnut-400 focus:outline-none sm:w-28"
          />
          <button
            type="submit"
            className="rounded-lg border border-walnut-200 px-3 py-2 text-sm font-medium text-ink/70 hover:border-walnut-400"
          >
            {t("Apply")}
          </button>
        </form>

        {materials.length > 0 && (
          <select
            value={activeMaterial}
            onChange={(e) => updateParam("material", e.target.value || null)}
            className="rounded-full border border-walnut-200 bg-white px-3 py-2 text-sm focus:border-walnut-400 focus:outline-none"
          >
            <option value="">{t("All materials")}</option>
            {materials.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        )}

        {colors.length > 0 && (
          <select
            value={activeColor}
            onChange={(e) => updateParam("color", e.target.value || null)}
            className="rounded-full border border-walnut-200 bg-white px-3 py-2 text-sm focus:border-walnut-400 focus:outline-none"
          >
            <option value="">{t("All colors")}</option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
