"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FurnitureIcon from "@/components/FurnitureIcon";
import ImageUpload from "@/components/ImageUpload";
import {
  categories,
  gradientOptions,
  iconNames,
  slugify,
  type Availability,
  type IconName,
  type Product,
} from "@/lib/products";

type Props = {
  mode: "create" | "edit";
  initial?: Product;
};

const availabilityOptions: { value: Availability; label: string }[] = [
  { value: "in_stock", label: "In Stock" },
  { value: "made_to_order", label: "Made to Order" },
  { value: "out_of_stock", label: "Out of Stock" },
];

function numToStr(n: number | undefined): string {
  return n === undefined || n === null ? "" : String(n);
}

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
  const [icon, setIcon] = useState<IconName>(initial?.icon ?? "sofa");
  const [gradient, setGradient] = useState(initial?.gradient ?? gradientOptions[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [stock, setStock] = useState(initial ? String(initial.stock) : "0");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [isNew, setIsNew] = useState(initial?.new ?? false);

  const [sku, setSku] = useState(initial?.sku ?? "");
  const [availability, setAvailability] = useState<Availability>(
    initial?.availability ?? "in_stock"
  );
  const [leadTimeDays, setLeadTimeDays] = useState(numToStr(initial?.leadTimeDays));
  const [rating, setRating] = useState(initial ? String(initial.rating) : "4.5");
  const [reviewCount, setReviewCount] = useState(numToStr(initial?.reviewCount ?? 0));

  const [widthCm, setWidthCm] = useState(numToStr(initial?.dimensions.widthCm));
  const [depthCm, setDepthCm] = useState(numToStr(initial?.dimensions.depthCm));
  const [heightCm, setHeightCm] = useState(numToStr(initial?.dimensions.heightCm));
  const [seatHeightCm, setSeatHeightCm] = useState(numToStr(initial?.dimensions.seatHeightCm));
  const [seatDepthCm, setSeatDepthCm] = useState(numToStr(initial?.dimensions.seatDepthCm));
  const [armHeightCm, setArmHeightCm] = useState(numToStr(initial?.dimensions.armHeightCm));
  const [legHeightCm, setLegHeightCm] = useState(numToStr(initial?.dimensions.legHeightCm));
  const [weightKg, setWeightKg] = useState(numToStr(initial?.dimensions.weightKg));

  const [frameMaterial, setFrameMaterial] = useState(initial?.materials.frame ?? "");
  const [upholsteryMaterial, setUpholsteryMaterial] = useState(
    initial?.materials.upholstery ?? ""
  );
  const [legsMaterial, setLegsMaterial] = useState(initial?.materials.legs ?? "");
  const [foamDensity, setFoamDensity] = useState(initial?.materials.foamDensity ?? "");

  const [colors, setColors] = useState(initial?.colors.join("\n") ?? "");
  const [materialOptions, setMaterialOptions] = useState(
    initial?.materialOptions.join("\n") ?? ""
  );
  const [woodOptions, setWoodOptions] = useState(initial?.woodOptions.join("\n") ?? "");

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
      icon,
      gradient,
      imageUrl,
      stock: Number(stock),
      featured,
      new: isNew,
      sku,
      availability,
      leadTimeDays: leadTimeDays === "" ? null : Number(leadTimeDays),
      rating: Number(rating),
      reviewCount: Number(reviewCount),
      widthCm: Number(widthCm),
      depthCm: Number(depthCm),
      heightCm: Number(heightCm),
      seatHeightCm: seatHeightCm === "" ? null : Number(seatHeightCm),
      seatDepthCm: seatDepthCm === "" ? null : Number(seatDepthCm),
      armHeightCm: armHeightCm === "" ? null : Number(armHeightCm),
      legHeightCm: legHeightCm === "" ? null : Number(legHeightCm),
      weightKg: weightKg === "" ? null : Number(weightKg),
      frameMaterial,
      upholsteryMaterial: upholsteryMaterial || null,
      legsMaterial: legsMaterial || null,
      foamDensity: foamDensity || null,
      colors,
      materialOptions,
      woodOptions,
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

  const inputClass =
    "rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none";
  const labelClass = "flex flex-col gap-1.5 text-sm";
  const sectionClass = "flex flex-col gap-4 rounded-2xl border border-walnut-100 bg-white/60 p-6";
  const sectionTitleClass = "font-serif text-base font-semibold text-ink";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-6">
          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>Basics</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={`${labelClass} sm:col-span-2`}>
                Name
                <input
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                  className={inputClass}
                />
              </label>

              <label className={`${labelClass} sm:col-span-2`}>
                Slug
                <input
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  className={`${inputClass} font-mono text-xs`}
                />
              </label>

              <label className={labelClass}>
                Category
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as typeof category)}
                  className={inputClass}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>

              <label className={labelClass}>
                SKU
                <input
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. SOF-HVN-3S"
                  className={`${inputClass} font-mono text-xs`}
                />
              </label>

              <label className={labelClass}>
                Price (ETB)
                <input
                  required
                  type="number"
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Compare-at price (optional)
                <input
                  type="number"
                  min={1}
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Availability
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as Availability)}
                  className={inputClass}
                >
                  {availabilityOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              {availability === "in_stock" ? (
                <label className={labelClass}>
                  Stock
                  <input
                    required
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className={inputClass}
                  />
                </label>
              ) : (
                <label className={labelClass}>
                  Lead time (working days)
                  <input
                    required={availability === "made_to_order"}
                    type="number"
                    min={1}
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(e.target.value)}
                    className={inputClass}
                  />
                </label>
              )}

              <label className={labelClass}>
                Rating (0–5)
                <input
                  required
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Review count
                <input
                  required
                  type="number"
                  min={0}
                  value={reviewCount}
                  onChange={(e) => setReviewCount(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          </div>

          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>Description</h2>
            <label className={labelClass}>
              Short description
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </label>
            <label className={labelClass}>
              Detail bullets (one per line)
              <textarea
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className={`${inputClass} resize-none font-mono text-xs`}
              />
            </label>
          </div>

          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>Dimensions (cm)</h2>
            <div className="grid gap-4 sm:grid-cols-4">
              <label className={labelClass}>
                Width *
                <input required type="number" min={1} value={widthCm} onChange={(e) => setWidthCm(e.target.value)} className={inputClass} />
              </label>
              <label className={labelClass}>
                Depth *
                <input required type="number" min={1} value={depthCm} onChange={(e) => setDepthCm(e.target.value)} className={inputClass} />
              </label>
              <label className={labelClass}>
                Height *
                <input required type="number" min={1} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className={inputClass} />
              </label>
              <label className={labelClass}>
                Weight (kg)
                <input type="number" min={0} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className={inputClass} />
              </label>
              <label className={labelClass}>
                Seat height
                <input type="number" min={0} value={seatHeightCm} onChange={(e) => setSeatHeightCm(e.target.value)} className={inputClass} />
              </label>
              <label className={labelClass}>
                Seat depth
                <input type="number" min={0} value={seatDepthCm} onChange={(e) => setSeatDepthCm(e.target.value)} className={inputClass} />
              </label>
              <label className={labelClass}>
                Arm height
                <input type="number" min={0} value={armHeightCm} onChange={(e) => setArmHeightCm(e.target.value)} className={inputClass} />
              </label>
              <label className={labelClass}>
                Leg height
                <input type="number" min={0} value={legHeightCm} onChange={(e) => setLegHeightCm(e.target.value)} className={inputClass} />
              </label>
            </div>
          </div>

          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>Materials & construction</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={`${labelClass} sm:col-span-2`}>
                Core material *
                <input required value={frameMaterial} onChange={(e) => setFrameMaterial(e.target.value)} placeholder="e.g. Solid oak" className={inputClass} />
              </label>
              <label className={labelClass}>
                Finish (optional)
                <input value={upholsteryMaterial} onChange={(e) => setUpholsteryMaterial(e.target.value)} placeholder="e.g. Matte lacquer finish" className={inputClass} />
              </label>
              <label className={labelClass}>
                Hardware (optional)
                <input value={legsMaterial} onChange={(e) => setLegsMaterial(e.target.value)} placeholder="e.g. Soft-close hinges" className={inputClass} />
              </label>
              <label className={labelClass}>
                Additional spec (optional)
                <input
                  value={foamDensity}
                  onChange={(e) => setFoamDensity(e.target.value)}
                  placeholder="e.g. 60-minute fire rating"
                  className={inputClass}
                />
              </label>
            </div>
          </div>

          <div className={sectionClass}>
            <h2 className={sectionTitleClass}>Colors & variants</h2>
            <p className="text-xs text-ink/50">
              One per line. Shown as selectable chips on the product page — informational only for now (doesn't change price or stock).
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className={labelClass}>
                Colors / finishes
                <textarea rows={3} value={colors} onChange={(e) => setColors(e.target.value)} className={`${inputClass} resize-none`} />
              </label>
              <label className={labelClass}>
                Style options
                <textarea rows={3} value={materialOptions} onChange={(e) => setMaterialOptions(e.target.value)} className={`${inputClass} resize-none`} />
              </label>
              <label className={labelClass}>
                Wood options
                <textarea rows={3} value={woodOptions} onChange={(e) => setWoodOptions(e.target.value)} className={`${inputClass} resize-none`} />
              </label>
            </div>
          </div>

          <div className="flex gap-6 rounded-2xl border border-walnut-100 bg-white/60 p-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              Featured on home page
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
              "New" badge
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <ImageUpload value={imageUrl} onChange={setImageUrl} label="Product photo" />
          <p className="-mt-2 text-xs text-ink/50">
            If no photo is uploaded, the icon + background below are shown instead.
          </p>

          <div className={`flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${gradient}`}>
            {imageUrl ? (
              <Image src={imageUrl} alt="" width={260} height={260} className="h-full w-full object-cover" />
            ) : (
              <FurnitureIcon name={icon} className="h-24 w-24 text-walnut-500/70" />
            )}
          </div>

          <label className={labelClass}>
            Icon (fallback if no photo)
            <select value={icon} onChange={(e) => setIcon(e.target.value as IconName)} className={inputClass}>
              {iconNames.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            Background
            <select value={gradient} onChange={(e) => setGradient(e.target.value)} className={inputClass}>
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
        <p className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-500">{error}</p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
