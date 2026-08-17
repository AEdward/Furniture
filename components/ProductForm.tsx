"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FurnitureIcon from "@/components/FurnitureIcon";
import {
  categories,
  gradientOptions,
  iconNames,
  slugify,
  type IconName,
  type Product,
} from "@/lib/products";

type Props = {
  mode: "create" | "edit";
  initial?: Product;
};

export default function ProductForm({ mode, initial }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [category, setCategory] = useState(initial?.category ?? categories[0]);
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [compareAtPrice, setCompareAtPrice] = useState(
    initial?.compareAtPrice ? String(initial.compareAtPrice) : ""
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [details, setDetails] = useState(initial?.details.join("\n") ?? "");
  const [material, setMaterial] = useState(initial?.material ?? "");
  const [dimensions, setDimensions] = useState(initial?.dimensions ?? "");
  const [icon, setIcon] = useState<IconName>(initial?.icon ?? "sofa");
  const [gradient, setGradient] = useState(initial?.gradient ?? gradientOptions[0]);
  const [stock, setStock] = useState(initial ? String(initial.stock) : "0");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [isNew, setIsNew] = useState(initial?.new ?? false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const body = {
      name,
      slug: slugTouched ? slug : slugify(name),
      category,
      price: Number(price),
      compareAtPrice: compareAtPrice === "" ? null : Number(compareAtPrice),
      description,
      details,
      material,
      dimensions,
      icon,
      gradient,
      stock: Number(stock),
      featured,
      new: isNew,
    };

    try {
      const res = await fetch(
        mode === "create" ? "/api/admin/products" : `/api/admin/products/${initial!.slug}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-4 rounded-2xl border border-walnut-100 bg-white/60 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              Name
              <input
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              Slug
              <input
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                className="rounded-lg border border-walnut-200 px-3 py-2.5 font-mono text-xs focus:border-walnut-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              Stock
              <input
                required
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              Price (ETB)
              <input
                required
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              Compare-at price (optional)
              <input
                type="number"
                min={1}
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              Description
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              Detail bullets (one per line)
              <textarea
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="resize-none rounded-lg border border-walnut-200 px-3 py-2.5 font-mono text-xs focus:border-walnut-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              Material
              <input
                required
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              Dimensions
              <input
                required
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
              />
            </label>
          </div>

          <div className="flex gap-6 border-t border-walnut-100 pt-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              Featured on home page
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
              />
              "New" badge
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div
            className={`flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br ${gradient}`}
          >
            <FurnitureIcon name={icon} className="h-24 w-24 text-walnut-500/70" />
          </div>

          <label className="flex flex-col gap-1.5 text-sm">
            Icon
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value as IconName)}
              className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
            >
              {iconNames.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            Background
            <select
              value={gradient}
              onChange={(e) => setGradient(e.target.value)}
              className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
            >
              {gradientOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-terracotta-50 px-4 py-3 text-sm text-terracotta-500">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
