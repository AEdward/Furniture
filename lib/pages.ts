import { slugify } from "@/lib/products";

export type HeroBlock = {
  type: "hero";
  heading: string;
  subheading: string;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export type RichTextBlock = {
  type: "richtext";
  heading: string | null;
  body: string;
};

export type ImageTextBlock = {
  type: "imagetext";
  heading: string | null;
  body: string;
  imageUrl: string | null;
  imagePosition: "left" | "right";
};

export type PageBlock = HeroBlock | RichTextBlock | ImageTextBlock;

export const BLOCK_TYPE_LABELS: Record<PageBlock["type"], string> = {
  hero: "Hero",
  richtext: "Text",
  imagetext: "Image + Text",
};

export function emptyBlock(type: PageBlock["type"]): PageBlock {
  switch (type) {
    case "hero":
      return {
        type: "hero",
        heading: "",
        subheading: "",
        imageUrl: null,
        ctaLabel: null,
        ctaHref: null,
      };
    case "richtext":
      return { type: "richtext", heading: null, body: "" };
    case "imagetext":
      return {
        type: "imagetext",
        heading: null,
        body: "",
        imageUrl: null,
        imagePosition: "left",
      };
  }
}

// Slugs that route to code-driven pages and can't be used for a
// CMS-created page.
export const RESERVED_SLUGS = new Set([
  "",
  "shop",
  "cart",
  "checkout",
  "order-confirmation",
  "contact",
  "admin",
  "api",
]);

export class PageValidationError extends Error {}

export function parsePageInput(body: unknown): {
  slug: string;
  title: string;
  metaDescription: string | null;
  blocks: PageBlock[];
  showInNav: boolean;
  navLabel: string | null;
  navOrder: number;
} {
  if (typeof body !== "object" || body === null) {
    throw new PageValidationError("Invalid request body.");
  }
  const b = body as Record<string, unknown>;

  const title = typeof b.title === "string" ? b.title.trim() : "";
  if (!title) throw new PageValidationError("Title is required.");

  const slugSource = typeof b.slug === "string" && b.slug.trim() ? b.slug.trim() : title;
  const slug = slugify(slugSource);
  if (!slug) throw new PageValidationError("Slug is required.");
  if (RESERVED_SLUGS.has(slug)) {
    throw new PageValidationError(`"${slug}" is a reserved page name — please choose another.`);
  }

  const metaDescription =
    typeof b.metaDescription === "string" && b.metaDescription.trim()
      ? b.metaDescription.trim()
      : null;

  const blocksRaw = Array.isArray(b.blocks) ? b.blocks : [];
  const blocks: PageBlock[] = blocksRaw.map((block) => {
    if (typeof block !== "object" || block === null) {
      throw new PageValidationError("Invalid block.");
    }
    const bl = block as Record<string, unknown>;
    switch (bl.type) {
      case "hero":
        return {
          type: "hero",
          heading: String(bl.heading ?? ""),
          subheading: String(bl.subheading ?? ""),
          imageUrl: typeof bl.imageUrl === "string" && bl.imageUrl ? bl.imageUrl : null,
          ctaLabel: typeof bl.ctaLabel === "string" && bl.ctaLabel ? bl.ctaLabel : null,
          ctaHref: typeof bl.ctaHref === "string" && bl.ctaHref ? bl.ctaHref : null,
        };
      case "richtext":
        return {
          type: "richtext",
          heading: typeof bl.heading === "string" && bl.heading ? bl.heading : null,
          body: String(bl.body ?? ""),
        };
      case "imagetext":
        return {
          type: "imagetext",
          heading: typeof bl.heading === "string" && bl.heading ? bl.heading : null,
          body: String(bl.body ?? ""),
          imageUrl: typeof bl.imageUrl === "string" && bl.imageUrl ? bl.imageUrl : null,
          imagePosition: bl.imagePosition === "right" ? "right" : "left",
        };
      default:
        throw new PageValidationError("Unknown block type.");
    }
  });

  const showInNav = Boolean(b.showInNav);
  const navLabel = typeof b.navLabel === "string" && b.navLabel.trim() ? b.navLabel.trim() : null;
  const navOrder = Number.isFinite(Number(b.navOrder)) ? Number(b.navOrder) : 0;

  return { slug, title, metaDescription, blocks, showInNav, navLabel, navOrder };
}
