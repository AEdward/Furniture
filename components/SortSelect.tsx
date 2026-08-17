"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/context";

const options = [
  { value: "", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
];

export default function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useT();

  return (
    <select
      defaultValue={searchParams.get("sort") ?? ""}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) {
          params.set("sort", e.target.value);
        } else {
          params.delete("sort");
        }
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="rounded-full border border-walnut-200 bg-white px-4 py-2 text-sm text-ink focus:border-walnut-400 focus:outline-none"
      aria-label={t("Sort products")}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {t(opt.label)}
        </option>
      ))}
    </select>
  );
}
