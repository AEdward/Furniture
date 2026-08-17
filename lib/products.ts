export type Category =
  | "Living Room"
  | "Bedroom"
  | "Dining"
  | "Office"
  | "Outdoor";

export type IconName =
  | "sofa"
  | "armchair"
  | "coffee-table"
  | "dining-table"
  | "dining-chair"
  | "bed"
  | "nightstand"
  | "wardrobe"
  | "desk"
  | "office-chair"
  | "bookshelf"
  | "outdoor-chair"
  | "outdoor-table"
  | "lamp"
  | "bench";

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
    slug: "haven-3-seat-sofa",
    name: "Haven 3-Seat Sofa",
    category: "Living Room",
    price: 74900,
    compareAtPrice: 89900,
    description:
      "A deep, cloud-soft sofa built for long weekends. Kiln-dried hardwood frame, high-resilience foam, and a boucle weave that only gets better with age.",
    details: [
      "Solid kiln-dried hardwood frame",
      "High-resilience foam with down-wrapped cushions",
      "Removable, machine-washable covers",
      "Reinforced corner-block joints",
    ],
    materials: {
      frame: "Kiln-dried hardwood",
      foamDensity: "32kg/m³ high-resilience foam",
      upholstery: "Boucle fabric",
      legs: "Solid oak",
    },
    dimensions: {
      widthCm: 218,
      depthCm: 91,
      heightCm: 84,
      seatHeightCm: 45,
      seatDepthCm: 58,
      armHeightCm: 63,
      legHeightCm: 12,
      weightKg: 62,
    },
    icon: "sofa",
    gradient: "from-terracotta-100 to-walnut-100",
    stock: 24,
    featured: true,
    sku: "SOF-HVN-3S",
    availability: "in_stock",
    rating: 4.8,
    reviewCount: 126,
    colors: ["Beige", "Charcoal", "Terracotta"],
    materialOptions: ["Boucle", "Performance Linen", "Velvet"],
    woodOptions: ["Oak", "Walnut"],
  },
  {
    id: "p2",
    slug: "orbit-lounge-armchair",
    name: "Orbit Lounge Armchair",
    category: "Living Room",
    price: 35300,
    description:
      "A gently curved armchair that cradles you from every angle, on a solid walnut swivel base.",
    details: [
      "360° swivel base",
      "Solid walnut frame",
      "Water-repellent performance fabric",
    ],
    materials: {
      frame: "Solid walnut",
      foamDensity: "30kg/m³ foam",
      upholstery: "Performance weave fabric",
      legs: "Solid walnut swivel base",
    },
    dimensions: {
      widthCm: 81,
      depthCm: 86,
      heightCm: 76,
      seatHeightCm: 43,
      seatDepthCm: 55,
      armHeightCm: 60,
      weightKg: 28,
    },
    icon: "armchair",
    gradient: "from-walnut-100 to-sand",
    stock: 24,
    featured: true,
    sku: "ARM-ORB-01",
    availability: "in_stock",
    rating: 4.6,
    reviewCount: 58,
    colors: ["Grey", "Rust", "Cream"],
    materialOptions: ["Performance Weave", "Velvet"],
    woodOptions: ["Walnut"],
  },
  {
    id: "p3",
    slug: "drift-coffee-table",
    name: "Drift Coffee Table",
    category: "Living Room",
    price: 20900,
    description:
      "Live-edge inspired coffee table with a hand-rubbed oil finish that highlights the natural grain.",
    details: [
      "Solid acacia top",
      "Hand-rubbed oil finish",
      "Tapered black steel legs",
    ],
    materials: {
      frame: "Solid acacia wood",
      legs: "Powder-coated steel",
    },
    dimensions: { widthCm: 122, depthCm: 61, heightCm: 43, weightKg: 18 },
    icon: "coffee-table",
    gradient: "from-sand to-walnut-100",
    stock: 24,
    sku: "TBL-DFT-CF",
    availability: "in_stock",
    rating: 4.7,
    reviewCount: 41,
    colors: ["Natural Acacia", "Black Steel"],
    materialOptions: [],
    woodOptions: ["Acacia", "Walnut"],
  },
  {
    id: "p4",
    slug: "solstice-dining-table",
    name: "Solstice Dining Table",
    category: "Dining",
    price: 65900,
    description:
      "Seats six comfortably. A single-slab silhouette in solid oak, finished to resist everyday wear.",
    details: [
      "Solid oak construction",
      "Seats up to 6",
      "Scratch and heat resistant finish",
    ],
    materials: {
      frame: "Solid oak",
      legs: "Solid oak",
    },
    dimensions: { widthCm: 183, depthCm: 97, heightCm: 76, weightKg: 54 },
    icon: "dining-table",
    gradient: "from-walnut-100 to-terracotta-100",
    stock: 24,
    featured: true,
    sku: "TBL-SOL-DN",
    availability: "made_to_order",
    leadTimeDays: 14,
    rating: 4.9,
    reviewCount: 33,
    colors: ["Natural Oak", "Espresso"],
    materialOptions: [],
    woodOptions: ["Oak", "Walnut", "Teak"],
  },
  {
    id: "p5",
    slug: "wicker-dining-chair",
    name: "Marsh Woven Dining Chair",
    category: "Dining",
    price: 10700,
    description:
      "Hand-woven natural rush seating on a solid beech frame — light, sturdy, and quietly elegant.",
    details: [
      "Hand-woven natural rush seat",
      "Solid beech frame",
      "Sold individually",
    ],
    materials: {
      frame: "Solid beech",
      upholstery: "Hand-woven natural rush",
    },
    dimensions: { widthCm: 48, depthCm: 53, heightCm: 81, seatHeightCm: 46, weightKg: 6 },
    icon: "dining-chair",
    gradient: "from-sand to-terracotta-100",
    stock: 24,
    new: true,
    sku: "CHR-MRS-DN",
    availability: "in_stock",
    rating: 4.5,
    reviewCount: 19,
    colors: ["Natural"],
    materialOptions: ["Natural Rush"],
    woodOptions: ["Beech", "Oak"],
  },
  {
    id: "p6",
    slug: "canopy-upholstered-bed",
    name: "Canopy Upholstered Bed",
    category: "Bedroom",
    price: 53900,
    description:
      "A tall, channel-tufted headboard wrapped in bouclé, built on a noise-free slatted base.",
    details: [
      "Channel-tufted headboard",
      "Slatted base, no box spring needed",
      "Queen and King available",
    ],
    materials: {
      frame: "Solid pine base",
      upholstery: "Boucle fabric headboard",
    },
    dimensions: { widthCm: 163, depthCm: 218, heightCm: 130, weightKg: 71 },
    icon: "bed",
    gradient: "from-terracotta-100 to-sand",
    stock: 24,
    featured: true,
    sku: "BED-CNP-QN",
    availability: "made_to_order",
    leadTimeDays: 10,
    rating: 4.8,
    reviewCount: 87,
    colors: ["Beige", "Charcoal", "Sage"],
    materialOptions: ["Boucle", "Linen", "Velvet"],
    woodOptions: [],
  },
  {
    id: "p7",
    slug: "hollow-nightstand",
    name: "Hollow Nightstand",
    category: "Bedroom",
    price: 14900,
    description:
      "A single floating drawer and open shelf in warm walnut veneer — quiet storage with a light footprint.",
    details: ["One soft-close drawer", "Open lower shelf", "Wall-mount or freestanding"],
    materials: {
      frame: "Walnut veneer",
      legs: "Engineered wood",
    },
    dimensions: { widthCm: 51, depthCm: 41, heightCm: 56, weightKg: 14 },
    icon: "nightstand",
    gradient: "from-walnut-100 to-sand",
    stock: 3,
    sku: "NST-HLW-01",
    availability: "in_stock",
    rating: 4.4,
    reviewCount: 22,
    colors: ["Walnut", "White"],
    materialOptions: [],
    woodOptions: ["Walnut", "Oak"],
  },
  {
    id: "p8",
    slug: "atlas-wardrobe",
    name: "Atlas 3-Door Wardrobe",
    category: "Bedroom",
    price: 71900,
    description:
      "Generous hanging and shelf space behind three solid doors, in a deep matte walnut finish.",
    details: [
      "3 doors, 2 drawers, adjustable shelving",
      "Full-length hanging rail",
      "Soft-close hardware throughout",
    ],
    materials: {
      frame: "Solid walnut",
      legs: "Engineered wood panels",
    },
    dimensions: { widthCm: 178, depthCm: 56, heightCm: 198, weightKg: 96 },
    icon: "wardrobe",
    gradient: "from-walnut-100 to-walnut-100",
    stock: 24,
    sku: "WRD-ATL-3D",
    availability: "made_to_order",
    leadTimeDays: 21,
    rating: 4.7,
    reviewCount: 15,
    colors: ["Walnut", "Charcoal"],
    materialOptions: [],
    woodOptions: ["Walnut", "Oak", "MDF"],
  },
  {
    id: "p9",
    slug: "meridian-writing-desk",
    name: "Meridian Writing Desk",
    category: "Office",
    price: 25700,
    description:
      "A slim, cable-managed desk with a single drawer — enough surface for a monitor, notebook, and a good lamp.",
    details: [
      "Built-in cable management",
      "One soft-close drawer",
      "Solid ash legs",
    ],
    materials: {
      frame: "Ash veneer top",
      legs: "Solid ash",
    },
    dimensions: { widthCm: 122, depthCm: 61, heightCm: 74, weightKg: 24 },
    icon: "desk",
    gradient: "from-sand to-walnut-100",
    stock: 24,
    new: true,
    sku: "DSK-MRD-01",
    availability: "in_stock",
    rating: 4.6,
    reviewCount: 29,
    colors: ["Natural Ash", "Black"],
    materialOptions: [],
    woodOptions: ["Ash", "Oak", "Walnut"],
  },
  {
    id: "p10",
    slug: "pivot-task-chair",
    name: "Pivot Task Chair",
    category: "Office",
    price: 22700,
    description:
      "All-day ergonomic support with a breathable woven back and a base that adjusts to how you actually sit.",
    details: [
      "Adjustable lumbar and armrests",
      "Breathable woven backrest",
      "5-year mechanism warranty",
    ],
    materials: {
      frame: "Aluminum base",
      upholstery: "Breathable woven mesh",
    },
    dimensions: {
      widthCm: 66,
      depthCm: 64,
      heightCm: 107,
      seatHeightCm: 48,
      armHeightCm: 22,
      weightKg: 17,
    },
    icon: "office-chair",
    gradient: "from-walnut-100 to-terracotta-100",
    stock: 24,
    featured: true,
    sku: "CHR-PVT-TK",
    availability: "in_stock",
    rating: 4.5,
    reviewCount: 64,
    colors: ["Black", "Grey"],
    materialOptions: ["Mesh", "Leather"],
    woodOptions: [],
  },
  {
    id: "p11",
    slug: "linear-bookshelf",
    name: "Linear 5-Tier Bookshelf",
    category: "Office",
    price: 19700,
    description:
      "Open, modular shelving in solid birch — equally at home holding books or displayed objects.",
    details: ["5 fixed shelves", "Solid birch construction", "Anti-tip wall strap included"],
    materials: {
      frame: "Solid birch",
    },
    dimensions: { widthCm: 81, depthCm: 30, heightCm: 183, weightKg: 38 },
    icon: "bookshelf",
    gradient: "from-sand to-sand",
    stock: 0,
    sku: "BSH-LNR-5T",
    availability: "out_of_stock",
    rating: 4.6,
    reviewCount: 12,
    colors: ["Natural Birch"],
    materialOptions: [],
    woodOptions: ["Birch", "Oak"],
  },
  {
    id: "p12",
    slug: "harbor-outdoor-lounge-chair",
    name: "Harbor Outdoor Lounge Chair",
    category: "Outdoor",
    price: 26900,
    description:
      "Weatherproof teak and all-weather rope, built to live outside through every season.",
    details: [
      "FSC-certified teak frame",
      "All-weather rope weave",
      "Quick-dry cushion included",
    ],
    materials: {
      frame: "FSC-certified teak",
      upholstery: "All-weather rope",
    },
    dimensions: { widthCm: 69, depthCm: 81, heightCm: 76, seatHeightCm: 40, weightKg: 16 },
    icon: "outdoor-chair",
    gradient: "from-terracotta-100 to-walnut-100",
    stock: 24,
    sku: "CHR-HRB-OD",
    availability: "in_stock",
    rating: 4.7,
    reviewCount: 24,
    colors: ["Natural Teak", "Grey Rope"],
    materialOptions: [],
    woodOptions: ["Teak"],
  },
  {
    id: "p13",
    slug: "grove-outdoor-dining-table",
    name: "Grove Outdoor Dining Table",
    category: "Outdoor",
    price: 47900,
    description:
      "A rust-proof aluminum base under a slatted teak top, seating six under open sky.",
    details: [
      "Slatted FSC teak top",
      "Powder-coated aluminum base",
      "Seats up to 6",
    ],
    materials: {
      frame: "Slatted FSC teak top",
      legs: "Powder-coated aluminum",
    },
    dimensions: { widthCm: 178, depthCm: 91, heightCm: 74, weightKg: 48 },
    icon: "outdoor-table",
    gradient: "from-walnut-100 to-terracotta-100",
    stock: 24,
    new: true,
    sku: "TBL-GRV-OD",
    availability: "made_to_order",
    leadTimeDays: 12,
    rating: 4.8,
    reviewCount: 9,
    colors: ["Natural Teak"],
    materialOptions: [],
    woodOptions: ["Teak"],
  },
  {
    id: "p14",
    slug: "arc-floor-lamp",
    name: "Arc Floor Lamp",
    category: "Living Room",
    price: 13100,
    description:
      "A sweeping brushed-brass arc that casts warm, directional light over a sofa or reading chair.",
    details: [
      "Brushed brass finish",
      "Marble weighted base",
      "In-line foot dimmer switch",
    ],
    materials: {
      frame: "Brushed brass",
      legs: "Marble base",
    },
    dimensions: { widthCm: 147, depthCm: 33, heightCm: 198, weightKg: 15 },
    icon: "lamp",
    gradient: "from-sand to-terracotta-100",
    stock: 24,
    sku: "LMP-ARC-FL",
    availability: "in_stock",
    rating: 4.6,
    reviewCount: 37,
    colors: ["Brass / Black Marble", "Brass / White Marble"],
    materialOptions: [],
    woodOptions: [],
  },
  {
    id: "p15",
    slug: "birch-entry-bench",
    name: "Birch Entry Bench",
    category: "Living Room",
    price: 15500,
    description:
      "A simple, sturdy bench for the entryway — lace up boots, drop your bag, keep moving.",
    details: ["Solid birch seat and legs", "Holds up to 135 kg", "Felt floor pads included"],
    materials: {
      frame: "Solid birch",
    },
    dimensions: { widthCm: 107, depthCm: 36, heightCm: 46, seatHeightCm: 46, weightKg: 12 },
    icon: "bench",
    gradient: "from-walnut-100 to-sand",
    stock: 24,
    sku: "BNC-BRC-EN",
    availability: "in_stock",
    rating: 4.5,
    reviewCount: 16,
    colors: ["Natural Birch"],
    materialOptions: [],
    woodOptions: ["Birch", "Oak"],
  },
  {
    id: "p16",
    slug: "cove-outdoor-bench",
    name: "Cove Outdoor Bench",
    category: "Outdoor",
    price: 17900,
    description:
      "Weatherproof teak slats over a rust-proof frame — built for a porch, garden, or patio edge.",
    details: ["FSC-certified teak slats", "Rust-proof steel frame", "No cushion needed"],
    materials: {
      frame: "FSC teak slats",
      legs: "Powder-coated steel",
    },
    dimensions: { widthCm: 122, depthCm: 41, heightCm: 43, seatHeightCm: 43, weightKg: 22 },
    icon: "bench",
    gradient: "from-terracotta-100 to-sand",
    stock: 24,
    sku: "BNC-CV-OD",
    availability: "in_stock",
    rating: 4.4,
    reviewCount: 11,
    colors: ["Natural Teak"],
    materialOptions: [],
    woodOptions: ["Teak"],
  },
];

export const categories: Category[] = [
  "Living Room",
  "Bedroom",
  "Dining",
  "Office",
  "Outdoor",
];

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const iconNames: IconName[] = [
  "sofa",
  "armchair",
  "coffee-table",
  "dining-table",
  "dining-chair",
  "bed",
  "nightstand",
  "wardrobe",
  "desk",
  "office-chair",
  "bookshelf",
  "outdoor-chair",
  "outdoor-table",
  "lamp",
  "bench",
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
