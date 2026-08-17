export type Category = "Doors" | "Kitchen Cabinets" | "Closets";

export type IconName =
  | "single-door"
  | "double-door"
  | "sliding-door"
  | "base-cabinet"
  | "wall-cabinet"
  | "kitchen-island"
  | "pantry-cabinet"
  | "wardrobe"
  | "sliding-wardrobe";

export type Availability = "in_stock" | "made_to_order" | "out_of_stock";

export const availabilityLabels: Record<Availability, string> = {
  in_stock: "In Stock",
  made_to_order: "Made to Order",
  out_of_stock: "Out of Stock",
};

export type Dimensions = {
  widthCm: number;
  depthCm: number;
  heightCm: number;
  seatHeightCm?: number;
  seatDepthCm?: number;
  armHeightCm?: number;
  legHeightCm?: number;
  weightKg?: number;
};

// Field names kept generic (frame/upholstery/legs/foamDensity) so the
// schema doesn't need to change per business, but on this branch they're
// displayed as Core Material / Finish / Hardware / Additional Spec —
// see the labels in the product page and admin form.
export type Materials = {
  frame: string;
  upholstery?: string;
  legs?: string;
  foamDensity?: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  compareAtPrice?: number;
  description: string;
  details: string[];
  materials: Materials;
  dimensions: Dimensions;
  icon: IconName;
  gradient: string;
  imageUrl?: string;
  featured?: boolean;
  new?: boolean;
  stock: number;
  sku: string;
  availability: Availability;
  leadTimeDays?: number;
  rating: number;
  reviewCount: number;
  colors: string[];
  materialOptions: string[];
  woodOptions: string[];
};

export function formatDimensionsSummary(d: Dimensions): string {
  return `${d.widthCm} × ${d.depthCm} × ${d.heightCm} cm`;
}

export function availabilityMessage(product: Product): string {
  if (product.availability === "made_to_order") {
    return product.leadTimeDays
      ? `Made to order — available in ${product.leadTimeDays} working days`
      : "Made to order";
  }
  if (product.availability === "out_of_stock") return "Out of stock";
  if (product.stock > 0 && product.stock <= 5) return `Only ${product.stock} left in stock`;
  return "In stock";
}

// Seed data only — loaded into the database by `npm run seed`.
// At runtime, pages read products from MySQL via lib/db.ts, not from here.
export const PRODUCT_SEED: Product[] = [
  {
    id: "p1",
    slug: "solid-oak-panel-door",
    name: "Solid Oak Panel Door",
    category: "Doors",
    price: 18500,
    description:
      "A solid oak interior door with a raised panel profile, finished to show the natural grain. Built to standard door openings and ready to install.",
    details: [
      "Solid oak core, not veneer",
      "Pre-hung frame available on request",
      "Standard 90cm x 205cm opening",
      "Soft-close hinges included",
    ],
    materials: {
      frame: "Solid oak",
      upholstery: "Natural oil finish",
      legs: "Soft-close brass hinges",
    },
    dimensions: { widthCm: 90, depthCm: 5, heightCm: 205, weightKg: 32 },
    icon: "single-door",
    gradient: "from-terracotta-100 to-walnut-100",
    stock: 12,
    featured: true,
    sku: "DR-OAK-PNL",
    availability: "in_stock",
    rating: 4.8,
    reviewCount: 64,
    colors: ["Natural Oak", "Espresso", "White"],
    materialOptions: ["Raised Panel", "Flat Panel"],
    woodOptions: ["Oak", "Walnut", "Mahogany"],
  },
  {
    id: "p2",
    slug: "classic-french-double-doors",
    name: "Classic French Double Doors",
    category: "Doors",
    price: 42000,
    compareAtPrice: 48000,
    description:
      "Elegant French doors that open a room to natural light. Built to your exact opening size in solid mahogany with tempered glass panels.",
    details: [
      "Built to your exact opening dimensions",
      "Tempered safety glass",
      "Multi-point locking hardware",
      "Weatherproofing available for exterior use",
    ],
    materials: {
      frame: "Solid mahogany",
      upholstery: "Multi-coat lacquer finish",
      legs: "Brushed brass handles + multi-point lock",
      foamDensity: "Tempered glass panels",
    },
    dimensions: { widthCm: 150, depthCm: 5, heightCm: 210, weightKg: 58 },
    icon: "double-door",
    gradient: "from-walnut-100 to-terracotta-100",
    stock: 0,
    featured: true,
    sku: "DR-FRN-DBL",
    availability: "made_to_order",
    leadTimeDays: 18,
    rating: 4.9,
    reviewCount: 21,
    colors: ["Natural Mahogany", "White", "Charcoal"],
    materialOptions: ["Full Glass", "Half Glass", "Solid Panel"],
    woodOptions: ["Mahogany", "Oak", "Walnut"],
  },
  {
    id: "p3",
    slug: "modern-flush-door-white-oak",
    name: "Modern Flush Door (White Oak Veneer)",
    category: "Doors",
    price: 14500,
    description:
      "A clean, minimal flush door in white oak veneer over an engineered core — a modern alternative to a raised-panel look.",
    details: [
      "Engineered core resists warping",
      "White oak veneer face",
      "Standard 80cm x 200cm size",
      "Pre-drilled for standard hardware",
    ],
    materials: {
      frame: "Engineered core, white oak veneer",
      upholstery: "Matte lacquer finish",
      legs: "Standard butt hinges",
    },
    dimensions: { widthCm: 80, depthCm: 4, heightCm: 200, weightKg: 26 },
    icon: "single-door",
    gradient: "from-sand to-walnut-100",
    stock: 20,
    new: true,
    sku: "DR-FLS-WO",
    availability: "in_stock",
    rating: 4.6,
    reviewCount: 38,
    colors: ["White Oak", "Walnut Veneer", "Painted White"],
    materialOptions: ["Flush", "Shaker"],
    woodOptions: ["Oak", "Walnut"],
  },
  {
    id: "p4",
    slug: "frosted-glass-sliding-door",
    name: "Frosted Glass Sliding Door",
    category: "Doors",
    price: 27500,
    description:
      "A space-saving sliding door in frosted tempered glass, ideal for bathrooms, closets, or tight hallways.",
    details: [
      "Frosted tempered safety glass",
      "Heavy-duty soft-close sliding track",
      "No swing clearance needed",
      "Track sold pre-assembled",
    ],
    materials: {
      frame: "Aluminum frame",
      upholstery: "Powder-coated black finish",
      legs: "Heavy-duty sliding track + soft-close",
      foamDensity: "Frosted tempered glass",
    },
    dimensions: { widthCm: 100, depthCm: 6, heightCm: 210, weightKg: 34 },
    icon: "sliding-door",
    gradient: "from-sand to-terracotta-100",
    stock: 9,
    sku: "DR-SLD-FR",
    availability: "made_to_order",
    leadTimeDays: 10,
    rating: 4.7,
    reviewCount: 15,
    colors: ["Black Frame", "Brushed Nickel Frame"],
    materialOptions: ["Fully Frosted", "Frosted Band"],
    woodOptions: [],
  },
  {
    id: "p5",
    slug: "fire-rated-steel-door",
    name: "Fire-Rated Steel Door",
    category: "Doors",
    price: 33000,
    description:
      "A certified fire-rated steel door for stairwells, plant rooms, and commercial openings, without sacrificing a clean finish.",
    details: [
      "60-minute fire rating certified",
      "Galvanized steel construction",
      "Panic bar hardware available",
      "Meets commercial building code",
    ],
    materials: {
      frame: "Galvanized steel",
      upholstery: "Powder-coated finish",
      legs: "Fire-rated hinges + panic bar option",
      foamDensity: "60-minute fire rating",
    },
    dimensions: { widthCm: 90, depthCm: 5, heightCm: 210, weightKg: 68 },
    icon: "single-door",
    gradient: "from-walnut-100 to-walnut-100",
    stock: 5,
    sku: "DR-FIR-STL",
    availability: "made_to_order",
    leadTimeDays: 15,
    rating: 4.9,
    reviewCount: 8,
    colors: ["Charcoal", "Red", "White"],
    materialOptions: [],
    woodOptions: [],
  },
  {
    id: "p6",
    slug: "mahogany-entry-door",
    name: "Mahogany Entry Door",
    category: "Doors",
    price: 39500,
    compareAtPrice: 45000,
    description:
      "A statement entry door in solid mahogany, weatherproofed and finished to handle years of daily use.",
    details: [
      "Weatherproof multi-coat finish",
      "Solid brass handle set included",
      "Reinforced frame for exterior use",
      "Only 4 in stock at this size",
    ],
    materials: {
      frame: "Solid mahogany",
      upholstery: "Weatherproof multi-coat finish",
      legs: "Solid brass entry handle set",
      foamDensity: "Weatherproofed for exterior use",
    },
    dimensions: { widthCm: 100, depthCm: 6, heightCm: 215, weightKg: 45 },
    icon: "single-door",
    gradient: "from-terracotta-100 to-sand",
    stock: 4,
    featured: true,
    sku: "DR-MHG-ENT",
    availability: "in_stock",
    rating: 4.8,
    reviewCount: 27,
    colors: ["Natural Mahogany", "Dark Walnut Stain"],
    materialOptions: ["Solid Panel", "Glass Insert"],
    woodOptions: ["Mahogany"],
  },
  {
    id: "p7",
    slug: "shaker-base-cabinet",
    name: "Shaker Base Cabinet",
    category: "Kitchen Cabinets",
    price: 24500,
    description:
      "A solid plywood-box base cabinet with a shaker door front — the workhorse of a kitchen build, ready to install under any countertop.",
    details: [
      "Solid plywood box construction",
      "Soft-close hinges and slides",
      "Adjustable interior shelf",
      "Standard 90cm width",
    ],
    materials: {
      frame: "Solid birch plywood box",
      upholstery: "Shaker-style painted door",
      legs: "Soft-close hinges + brushed brass pulls",
    },
    dimensions: { widthCm: 90, depthCm: 58, heightCm: 85, weightKg: 38 },
    icon: "base-cabinet",
    gradient: "from-walnut-100 to-sand",
    stock: 15,
    featured: true,
    sku: "CAB-SHK-BS",
    availability: "in_stock",
    rating: 4.7,
    reviewCount: 52,
    colors: ["White", "Sage Green", "Charcoal", "Natural Oak"],
    materialOptions: ["Shaker", "Flat Panel"],
    woodOptions: ["Birch", "Oak"],
  },
  {
    id: "p8",
    slug: "glass-front-wall-cabinet",
    name: "Glass-Front Wall Cabinet",
    category: "Kitchen Cabinets",
    price: 19500,
    description:
      "A wall cabinet with a tempered glass door for displaying dishware, paired with an interior LED-ready shelf.",
    details: [
      "Tempered glass door panel",
      "Soft-close hinges",
      "Interior shelf, LED-strip ready",
      "Standard 80cm width",
    ],
    materials: {
      frame: "Solid birch plywood box",
      upholstery: "Painted frame, tempered glass door",
      legs: "Soft-close hinges",
      foamDensity: "Tempered glass panel",
    },
    dimensions: { widthCm: 80, depthCm: 32, heightCm: 70, weightKg: 22 },
    icon: "wall-cabinet",
    gradient: "from-sand to-walnut-100",
    stock: 10,
    new: true,
    sku: "CAB-GLS-WL",
    availability: "in_stock",
    rating: 4.6,
    reviewCount: 24,
    colors: ["White", "Natural Oak"],
    materialOptions: ["Glass Front", "Solid Front"],
    woodOptions: ["Birch", "Oak"],
  },
  {
    id: "p9",
    slug: "kitchen-island-unit",
    name: "Kitchen Island Unit",
    category: "Kitchen Cabinets",
    price: 68000,
    compareAtPrice: 76000,
    description:
      "A built-to-size kitchen island with soft-close drawer storage on both sides, built to fit your exact kitchen footprint.",
    details: [
      "Built to your exact dimensions",
      "Soft-close drawers on both sides",
      "Countertop sold separately",
      "Electrical rough-in available on request",
    ],
    materials: {
      frame: "Solid plywood box, hardwood frame",
      upholstery: "Painted or stained finish",
      legs: "Soft-close drawers, brass pulls",
      foamDensity: "Butcher block or stone-ready top",
    },
    dimensions: { widthCm: 150, depthCm: 90, heightCm: 90, weightKg: 95 },
    icon: "kitchen-island",
    gradient: "from-walnut-100 to-terracotta-100",
    stock: 0,
    featured: true,
    sku: "CAB-ISL-01",
    availability: "made_to_order",
    leadTimeDays: 20,
    rating: 4.9,
    reviewCount: 19,
    colors: ["White", "Navy", "Natural Oak", "Charcoal"],
    materialOptions: ["With Seating Overhang", "Standard"],
    woodOptions: ["Oak", "Walnut", "Birch"],
  },
  {
    id: "p10",
    slug: "tall-pantry-cabinet",
    name: "Tall Pantry Cabinet",
    category: "Kitchen Cabinets",
    price: 32500,
    description:
      "Full-height pantry storage in a single cabinet — five adjustable shelves behind a soft-close door.",
    details: [
      "5 adjustable interior shelves",
      "Soft-close hinges",
      "Floor-to-near-ceiling storage",
      "Standard 60cm width",
    ],
    materials: {
      frame: "Solid plywood box",
      upholstery: "Shaker-style painted door",
      legs: "Soft-close hinges, 5 adjustable shelves",
    },
    dimensions: { widthCm: 60, depthCm: 58, heightCm: 220, weightKg: 54 },
    icon: "pantry-cabinet",
    gradient: "from-terracotta-100 to-walnut-100",
    stock: 6,
    sku: "CAB-PNT-TL",
    availability: "in_stock",
    rating: 4.7,
    reviewCount: 18,
    colors: ["White", "Natural Oak", "Charcoal"],
    materialOptions: ["Shaker", "Flat Panel"],
    woodOptions: ["Birch", "Oak"],
  },
  {
    id: "p11",
    slug: "corner-base-cabinet",
    name: "Corner Base Cabinet",
    category: "Kitchen Cabinets",
    price: 27500,
    description:
      "Turn a dead kitchen corner into usable storage with a corner base cabinet fitted with a Lazy Susan or pull-out shelving.",
    details: [
      "Choice of Lazy Susan or pull-out shelving",
      "Solid plywood box construction",
      "Fits standard 90cm x 90cm corners",
      "Soft-close hardware",
    ],
    materials: {
      frame: "Solid plywood box",
      upholstery: "Shaker-style painted door",
      legs: "Lazy Susan or pull-out hardware",
    },
    dimensions: { widthCm: 90, depthCm: 90, heightCm: 85, weightKg: 42 },
    icon: "base-cabinet",
    gradient: "from-sand to-terracotta-100",
    stock: 7,
    sku: "CAB-CRN-BS",
    availability: "made_to_order",
    leadTimeDays: 12,
    rating: 4.5,
    reviewCount: 11,
    colors: ["White", "Natural Oak"],
    materialOptions: ["Lazy Susan", "Pull-Out Shelving"],
    woodOptions: ["Birch", "Oak"],
  },
  {
    id: "p12",
    slug: "open-shelf-wall-cabinet",
    name: "Open Shelf Wall Cabinet",
    category: "Kitchen Cabinets",
    price: 15500,
    description:
      "Open shelving for everyday dishware and styling, in solid birch plywood with a natural oil finish.",
    details: [
      "Open-front design, no doors",
      "Concealed wall mounting brackets",
      "Natural oil finish",
      "Currently sold out — check back soon",
    ],
    materials: {
      frame: "Solid birch plywood",
      upholstery: "Natural oil finish",
      legs: "Concealed wall mounting brackets",
    },
    dimensions: { widthCm: 90, depthCm: 28, heightCm: 70, weightKg: 18 },
    icon: "wall-cabinet",
    gradient: "from-walnut-100 to-sand",
    stock: 0,
    sku: "CAB-OPN-WL",
    availability: "out_of_stock",
    rating: 4.4,
    reviewCount: 9,
    colors: ["Natural Birch", "Walnut Stain"],
    materialOptions: [],
    woodOptions: ["Birch", "Walnut"],
  },
  {
    id: "p13",
    slug: "sliding-door-wardrobe",
    name: "Sliding Door Wardrobe",
    category: "Closets",
    price: 58000,
    description:
      "A full-width sliding wardrobe with soft-close doors — no swing clearance needed, ideal for smaller bedrooms.",
    details: [
      "Heavy-duty soft-close sliding track",
      "Adjustable interior shelving and rail",
      "Mirrored or solid panel doors",
      "No swing clearance required",
    ],
    materials: {
      frame: "Solid plywood box, MDF panels",
      upholstery: "Painted or laminate finish",
      legs: "Heavy-duty sliding track, soft-close",
    },
    dimensions: { widthCm: 200, depthCm: 60, heightCm: 230, weightKg: 110 },
    icon: "sliding-wardrobe",
    gradient: "from-terracotta-100 to-sand",
    stock: 5,
    featured: true,
    sku: "CLS-SLD-WD",
    availability: "in_stock",
    rating: 4.8,
    reviewCount: 31,
    colors: ["White", "Charcoal", "Natural Oak"],
    materialOptions: ["Mirrored Panel", "Solid Panel"],
    woodOptions: ["MDF", "Oak"],
  },
  {
    id: "p14",
    slug: "walk-in-closet-system",
    name: "Walk-in Closet System",
    category: "Closets",
    price: 95000,
    compareAtPrice: 110000,
    description:
      "A fully custom walk-in closet system — hanging rails, drawers, and shelving laid out to your room and your wardrobe.",
    details: [
      "Fully custom modular layout",
      "In-home measurement included",
      "Soft-close drawers throughout",
      "Design consultation included",
    ],
    materials: {
      frame: "Solid plywood modular units",
      upholstery: "Painted or veneer finish",
      legs: "Soft-close drawers, brass rails",
      foamDensity: "Fully modular layout",
    },
    dimensions: { widthCm: 250, depthCm: 60, heightCm: 240, weightKg: 180 },
    icon: "wardrobe",
    gradient: "from-walnut-100 to-terracotta-100",
    stock: 0,
    featured: true,
    sku: "CLS-WLK-SYS",
    availability: "made_to_order",
    leadTimeDays: 25,
    rating: 5,
    reviewCount: 7,
    colors: ["White", "Natural Oak", "Charcoal", "Walnut"],
    materialOptions: [],
    woodOptions: ["Oak", "Walnut", "MDF"],
  },
  {
    id: "p15",
    slug: "built-in-reach-wardrobe",
    name: "Built-in Reach Wardrobe",
    category: "Closets",
    price: 46000,
    description:
      "A built-in reach closet fitted floor-to-ceiling into an alcove or bedroom wall, with hanging rail and adjustable shelving.",
    details: [
      "Built floor-to-ceiling into your space",
      "Adjustable shelving and hanging rail",
      "Hinged or open-front option",
      "In-home measurement included",
    ],
    materials: {
      frame: "Solid plywood box",
      upholstery: "Painted or laminate finish",
      legs: "Soft-close hinges, hanging rail",
    },
    dimensions: { widthCm: 180, depthCm: 60, heightCm: 240, weightKg: 95 },
    icon: "wardrobe",
    gradient: "from-sand to-terracotta-100",
    stock: 3,
    sku: "CLS-BLT-RW",
    availability: "made_to_order",
    leadTimeDays: 16,
    rating: 4.7,
    reviewCount: 14,
    colors: ["White", "Natural Oak", "Charcoal"],
    materialOptions: ["Hinged Doors", "Open Front"],
    woodOptions: ["Oak", "MDF"],
  },
  {
    id: "p16",
    slug: "mirrored-sliding-closet",
    name: "Mirrored Sliding Closet",
    category: "Closets",
    price: 64500,
    description:
      "A sliding wardrobe with full-length mirrored door panels — built-in storage and a full-length mirror in one footprint.",
    details: [
      "Full-length mirrored panels",
      "Heavy-duty soft-close sliding track",
      "Adjustable interior shelving and rail",
      "Custom width available on request",
    ],
    materials: {
      frame: "Solid plywood box, MDF panels",
      upholstery: "Mirrored panel finish",
      legs: "Heavy-duty sliding track, soft-close",
      foamDensity: "Full-length mirrored panels",
    },
    dimensions: { widthCm: 220, depthCm: 62, heightCm: 235, weightKg: 125 },
    icon: "sliding-wardrobe",
    gradient: "from-walnut-100 to-sand",
    stock: 4,
    new: true,
    sku: "CLS-MIR-SLD",
    availability: "made_to_order",
    leadTimeDays: 18,
    rating: 4.6,
    reviewCount: 12,
    colors: ["Mirror / White Frame", "Mirror / Black Frame"],
    materialOptions: [],
    woodOptions: ["MDF"],
  },
];

export const categories: Category[] = ["Doors", "Kitchen Cabinets", "Closets"];

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const iconNames: IconName[] = [
  "single-door",
  "double-door",
  "sliding-door",
  "base-cabinet",
  "wall-cabinet",
  "kitchen-island",
  "pantry-cabinet",
  "wardrobe",
  "sliding-wardrobe",
];

export const gradientOptions = [
  "from-terracotta-100 to-walnut-100",
  "from-walnut-100 to-sand",
  "from-sand to-walnut-100",
  "from-walnut-100 to-terracotta-100",
  "from-sand to-terracotta-100",
  "from-terracotta-100 to-sand",
  "from-walnut-100 to-walnut-100",
  "from-sand to-sand",
];

export function formatPrice(price: number): string {
  return `ETB ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(price)}`;
}
