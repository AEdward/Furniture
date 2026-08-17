import { categories, iconNames, slugify, type Category, type IconName } from "@/lib/products";
import type { ProductInput } from "@/lib/db";

export class ValidationError extends Error {}

export function parseProductInput(body: unknown): ProductInput {
  if (typeof body !== "object" || body === null) {
    throw new ValidationError("Invalid request body.");
  }
  const b = body as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) throw new ValidationError("Name is required.");

  const slugSource =
    typeof b.slug === "string" && b.slug.trim() ? b.slug.trim() : name;
  const slug = slugify(slugSource);
  if (!slug) throw new ValidationError("Slug is required.");

  const category = b.category as Category;
  if (!categories.includes(category)) {
    throw new ValidationError("Please choose a valid category.");
  }

  const price = Number(b.price);
  if (!Number.isFinite(price) || price <= 0) {
    throw new ValidationError("Price must be a positive number.");
  }

  let compareAtPrice: number | null = null;
  const compareRaw = b.compareAtPrice;
  if (compareRaw !== undefined && compareRaw !== null && compareRaw !== "") {
    const n = Number(compareRaw);
    if (!Number.isFinite(n) || n <= 0) {
      throw new ValidationError("Compare-at price must be a positive number.");
    }
    compareAtPrice = Math.round(n);
  }

  const description = typeof b.description === "string" ? b.description.trim() : "";
  if (!description) throw new ValidationError("Description is required.");

  const detailsRaw = b.details;
  const details = Array.isArray(detailsRaw)
    ? detailsRaw
        .filter((d): d is string => typeof d === "string" && d.trim().length > 0)
        .map((d) => d.trim())
    : typeof detailsRaw === "string"
      ? detailsRaw
          .split("\n")
          .map((d) => d.trim())
          .filter(Boolean)
      : [];

  const material = typeof b.material === "string" ? b.material.trim() : "";
  if (!material) throw new ValidationError("Material is required.");

  const dimensions = typeof b.dimensions === "string" ? b.dimensions.trim() : "";
  if (!dimensions) throw new ValidationError("Dimensions is required.");

  const icon = b.icon as IconName;
  if (!iconNames.includes(icon)) throw new ValidationError("Please choose a valid icon.");

  const gradient = typeof b.gradient === "string" ? b.gradient : "";
  if (!gradient) throw new ValidationError("Please choose a background.");

  const stock = Number(b.stock);
  if (!Number.isFinite(stock) || stock < 0) {
    throw new ValidationError("Stock must be zero or a positive number.");
  }

  return {
    slug,
    name,
    category,
    price: Math.round(price),
    compareAtPrice,
    description,
    details,
    material,
    dimensions,
    icon,
    gradient,
    featured: Boolean(b.featured),
    new: Boolean(b.new),
    stock: Math.round(stock),
  };
}
