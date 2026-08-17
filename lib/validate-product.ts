import {
  categories,
  iconNames,
  slugify,
  type Availability,
  type Category,
  type IconName,
} from "@/lib/products";
import type { ProductInput } from "@/lib/db";

export class ValidationError extends Error {}

const AVAILABILITIES: Availability[] = ["in_stock", "made_to_order", "out_of_stock"];

function parseList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0).map((v) => v.trim());
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function parseOptionalNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new ValidationError("Expected a number.");
  return Math.round(n);
}

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

  const details = parseList(b.details);

  const icon = b.icon as IconName;
  if (!iconNames.includes(icon)) throw new ValidationError("Please choose a valid icon.");

  const gradient = typeof b.gradient === "string" ? b.gradient : "";
  if (!gradient) throw new ValidationError("Please choose a background.");

  const stock = Number(b.stock);
  if (!Number.isFinite(stock) || stock < 0) {
    throw new ValidationError("Stock must be zero or a positive number.");
  }

  const sku = typeof b.sku === "string" ? b.sku.trim() : "";
  if (!sku) throw new ValidationError("SKU is required.");

  const availability = b.availability as Availability;
  if (!AVAILABILITIES.includes(availability)) {
    throw new ValidationError("Please choose a valid availability status.");
  }

  const leadTimeDays = parseOptionalNumber(b.leadTimeDays);
  if (availability === "made_to_order" && !leadTimeDays) {
    throw new ValidationError("Lead time (days) is required for made-to-order items.");
  }

  const rating = Number(b.rating);
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    throw new ValidationError("Rating must be between 0 and 5.");
  }
  const reviewCount = Number(b.reviewCount);
  if (!Number.isFinite(reviewCount) || reviewCount < 0) {
    throw new ValidationError("Review count must be zero or a positive number.");
  }

  const widthCm = Number(b.widthCm);
  const depthCm = Number(b.depthCm);
  const heightCm = Number(b.heightCm);
  if (![widthCm, depthCm, heightCm].every((n) => Number.isFinite(n) && n > 0)) {
    throw new ValidationError("Width, depth, and height must be positive numbers (cm).");
  }

  const frameMaterial = typeof b.frameMaterial === "string" ? b.frameMaterial.trim() : "";
  if (!frameMaterial) throw new ValidationError("Frame material is required.");

  return {
    slug,
    name,
    category,
    price: Math.round(price),
    compareAtPrice,
    description,
    details,
    icon,
    gradient,
    featured: Boolean(b.featured),
    new: Boolean(b.new),
    stock: Math.round(stock),
    sku,
    availability,
    leadTimeDays,
    rating: Math.round(rating * 10) / 10,
    reviewCount: Math.round(reviewCount),
    widthCm: Math.round(widthCm),
    depthCm: Math.round(depthCm),
    heightCm: Math.round(heightCm),
    seatHeightCm: parseOptionalNumber(b.seatHeightCm),
    seatDepthCm: parseOptionalNumber(b.seatDepthCm),
    armHeightCm: parseOptionalNumber(b.armHeightCm),
    legHeightCm: parseOptionalNumber(b.legHeightCm),
    weightKg: parseOptionalNumber(b.weightKg),
    frameMaterial,
    upholsteryMaterial: typeof b.upholsteryMaterial === "string" && b.upholsteryMaterial.trim() ? b.upholsteryMaterial.trim() : null,
    legsMaterial: typeof b.legsMaterial === "string" && b.legsMaterial.trim() ? b.legsMaterial.trim() : null,
    foamDensity: typeof b.foamDensity === "string" && b.foamDensity.trim() ? b.foamDensity.trim() : null,
    colors: parseList(b.colors),
    materialOptions: parseList(b.materialOptions),
    woodOptions: parseList(b.woodOptions),
  };
}
