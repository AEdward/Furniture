export type Category = "Living Room" | "Bedroom" | "Dining" | "Office";

export type IconName =
  | "sofa"
  | "sectional-sofa"
  | "center-table"
  | "tv-stand"
  | "wall-drawer"
  | "bed"
  | "wardrobe"
  | "sliding-wardrobe"
  | "nightstand"
  | "dining-table"
  | "dining-chair"
  | "base-cabinet"
  | "wall-cabinet"
  | "kitchen-island"
  | "office-desk"
  | "office-chair";

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
  images?: string[];
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
  // Admin-configurable "notify me when this drops below N" threshold
  // (item 12) — falls back to a site-wide default when unset.
  lowStockThreshold?: number;
  // Maps a color/material/wood option label (e.g. "Walnut") to an
  // uploaded image URL, so the gallery can swap photos when a customer
  // changes their selection instead of just showing a text label.
  variantImages?: Record<string, string>;
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
  // ---------------------------------------------------------------
  // Living Room
  // ---------------------------------------------------------------
  {
    id: "p1",
    slug: "classic-three-seater-sofa",
    name: "Classic Three-Seater Sofa",
    category: "Living Room",
    price: 45000,
    description:
      "A kiln-dried hardwood-frame sofa with high-resilience foam cushions, upholstered in durable performance fabric built for everyday family use.",
    details: [
      "Kiln-dried hardwood frame — won't warp or sag",
      "High-resilience foam seat cushions",
      "Removable, washable cushion covers",
      "Solid wood tapered legs",
    ],
    materials: {
      frame: "Kiln-dried hardwood frame",
      upholstery: "Performance weave fabric upholstery",
      legs: "Solid wood tapered legs",
      foamDensity: "High-resilience foam (32kg/m³)",
    },
    dimensions: {
      widthCm: 210,
      depthCm: 90,
      heightCm: 85,
      seatHeightCm: 45,
      seatDepthCm: 58,
      armHeightCm: 62,
      legHeightCm: 12,
      weightKg: 55,
    },
    icon: "sofa",
    gradient: "from-terracotta-100 to-walnut-100",
    stock: 8,
    featured: true,
    sku: "SOF-CLS-3ST",
    availability: "in_stock",
    rating: 4.7,
    reviewCount: 41,
    colors: ["Charcoal", "Oatmeal", "Terracotta", "Navy"],
    materialOptions: ["Fabric", "Leather"],
    woodOptions: ["Oak", "Walnut"],
  },
  {
    id: "p2",
    slug: "l-shaped-sectional-sofa",
    name: "L-Shaped Sectional Sofa",
    category: "Living Room",
    price: 82000,
    compareAtPrice: 92000,
    description:
      "A generous L-shaped sectional built to order in your choice of chaise side, with deep seats and a low, modern profile.",
    details: [
      "Chaise can be configured left or right",
      "Deep 60cm seat depth for lounging",
      "High-resilience foam over pocket-coil support",
      "Built to order — 3 week lead time",
    ],
    materials: {
      frame: "Kiln-dried hardwood frame",
      upholstery: "Woven upholstery fabric",
      legs: "Blackened steel legs",
      foamDensity: "High-resilience foam over pocket coils",
    },
    dimensions: {
      widthCm: 280,
      depthCm: 170,
      heightCm: 88,
      seatHeightCm: 45,
      seatDepthCm: 60,
      armHeightCm: 63,
      legHeightCm: 10,
      weightKg: 95,
    },
    icon: "sectional-sofa",
    gradient: "from-walnut-100 to-terracotta-100",
    stock: 0,
    featured: true,
    sku: "SOF-SEC-LSH",
    availability: "made_to_order",
    leadTimeDays: 21,
    rating: 4.9,
    reviewCount: 17,
    colors: ["Stone", "Charcoal", "Sage"],
    materialOptions: ["Chaise Left", "Chaise Right"],
    woodOptions: [],
  },
  {
    id: "p3",
    slug: "tufted-two-seater-loveseat",
    name: "Tufted Two-Seater Loveseat",
    category: "Living Room",
    price: 32000,
    description:
      "A compact tufted loveseat sized for small living rooms and reading nooks, with a button-tufted back.",
    details: [
      "Button-tufted backrest",
      "Compact footprint for small rooms",
      "Solid wood tapered feet",
      "Removable seat cushions",
    ],
    materials: {
      frame: "Kiln-dried hardwood frame",
      upholstery: "Woven upholstery fabric",
      legs: "Solid wood tapered feet",
      foamDensity: "High-resilience foam (30kg/m³)",
    },
    dimensions: {
      widthCm: 150,
      depthCm: 88,
      heightCm: 84,
      seatHeightCm: 44,
      seatDepthCm: 56,
      armHeightCm: 60,
      legHeightCm: 12,
      weightKg: 38,
    },
    icon: "sofa",
    gradient: "from-sand to-walnut-100",
    stock: 11,
    new: true,
    sku: "SOF-TFT-LVS",
    availability: "in_stock",
    rating: 4.6,
    reviewCount: 23,
    colors: ["Ivory", "Dusty Rose", "Charcoal"],
    materialOptions: ["Fabric"],
    woodOptions: [],
  },
  {
    id: "p4",
    slug: "round-center-table",
    name: "Round Center Table",
    category: "Living Room",
    price: 18500,
    description:
      "A round solid-wood center table with a lower shelf for magazines or a stack of books, finished to show the natural grain.",
    details: [
      "Solid wood top and shelf",
      "Natural oil finish shows the grain",
      "Lower shelf for extra storage",
      "Rounded edges, safe for kids' rooms",
    ],
    materials: {
      frame: "Solid wood top",
      upholstery: "Natural oil finish",
      legs: "Solid wood tapered legs",
    },
    dimensions: { widthCm: 90, depthCm: 90, heightCm: 45, weightKg: 22 },
    icon: "center-table",
    gradient: "from-walnut-100 to-sand",
    stock: 14,
    featured: true,
    sku: "TBL-CTR-RND",
    availability: "in_stock",
    rating: 4.7,
    reviewCount: 29,
    colors: ["Natural Wood", "Walnut Stain", "White"],
    materialOptions: ["Round", "With Shelf"],
    woodOptions: ["Oak", "Pine"],
  },
  {
    id: "p5",
    slug: "rectangular-center-table",
    name: "Rectangular Center Table",
    category: "Living Room",
    price: 21500,
    description:
      "A low rectangular center table sized to sit comfortably in front of a three-seater sofa, with a lower storage shelf.",
    details: [
      "Solid wood construction",
      "Lower shelf for baskets or books",
      "Matte lacquer finish",
      "Standard living-room proportions",
    ],
    materials: {
      frame: "Solid wood top",
      upholstery: "Matte lacquer finish",
      legs: "Solid wood block legs",
    },
    dimensions: { widthCm: 110, depthCm: 60, heightCm: 42, weightKg: 26 },
    icon: "center-table",
    gradient: "from-sand to-terracotta-100",
    stock: 9,
    sku: "TBL-CTR-RCT",
    availability: "in_stock",
    rating: 4.6,
    reviewCount: 16,
    colors: ["Natural Wood", "Walnut Stain", "Charcoal"],
    materialOptions: ["With Shelf", "Open Base"],
    woodOptions: ["Oak", "Pine"],
  },
  {
    id: "p6",
    slug: "modern-tv-stand",
    name: "Modern TV Stand",
    category: "Living Room",
    price: 26500,
    description:
      "A low, wide media console with soft-close cabinet storage on either side and open shelving in the middle for a set-top box or console.",
    details: [
      "Soft-close cabinet doors on both sides",
      "Open middle shelf, cable-management cutout",
      "Fits TVs up to 65 inches",
      "Solid wood legs",
    ],
    materials: {
      frame: "Solid plywood box construction",
      upholstery: "Painted or laminate finish",
      legs: "Solid wood tapered legs",
    },
    dimensions: { widthCm: 160, depthCm: 40, heightCm: 45, weightKg: 34 },
    icon: "tv-stand",
    gradient: "from-terracotta-100 to-sand",
    stock: 10,
    featured: true,
    sku: "TV-STD-MOD",
    availability: "in_stock",
    rating: 4.6,
    reviewCount: 22,
    colors: ["White", "Natural Oak", "Charcoal"],
    materialOptions: ["With Cable Cutout", "Standard"],
    woodOptions: ["Oak", "Birch"],
  },
  {
    id: "p7",
    slug: "wall-mounted-tv-unit",
    name: "Wall-Mounted TV Unit",
    category: "Living Room",
    price: 39500,
    compareAtPrice: 45000,
    description:
      "A floating wall-mounted TV unit with side storage panels — keeps the floor clear and hides cables behind a closed back panel.",
    details: [
      "Fully wall-mounted — floor stays clear",
      "Side storage panels with soft-close doors",
      "Concealed cable routing",
      "Professional installation recommended",
    ],
    materials: {
      frame: "Solid plywood box, MDF panels",
      upholstery: "Painted or laminate finish",
      legs: "Concealed wall mounting brackets",
    },
    dimensions: { widthCm: 220, depthCm: 35, heightCm: 55, weightKg: 42 },
    icon: "tv-stand",
    gradient: "from-walnut-100 to-terracotta-100",
    stock: 4,
    new: true,
    sku: "TV-UNT-WLM",
    availability: "made_to_order",
    leadTimeDays: 12,
    rating: 4.8,
    reviewCount: 13,
    colors: ["White", "Charcoal", "Natural Oak"],
    materialOptions: ["With Side Storage", "Panel Only"],
    woodOptions: ["MDF", "Oak"],
  },
  {
    id: "p8",
    slug: "floating-wall-drawer-unit",
    name: "Floating Wall Drawer Unit",
    category: "Living Room",
    price: 17500,
    description:
      "A slim wall-mounted drawer unit for remotes, chargers, and everyday clutter — floats above the floor for a clean, modern look.",
    details: [
      "Wall-mounted, no visible legs",
      "Soft-close drawer",
      "Concealed mounting hardware included",
      "Standard 90cm width",
    ],
    materials: {
      frame: "Solid plywood box",
      upholstery: "Painted or laminate finish",
      legs: "Concealed wall mounting brackets",
    },
    dimensions: { widthCm: 90, depthCm: 30, heightCm: 15, weightKg: 12 },
    icon: "wall-drawer",
    gradient: "from-sand to-walnut-100",
    stock: 16,
    sku: "DRW-WLL-90",
    availability: "in_stock",
    rating: 4.5,
    reviewCount: 18,
    colors: ["White", "Natural Oak", "Charcoal"],
    materialOptions: [],
    woodOptions: ["Birch", "Oak"],
  },

  // ---------------------------------------------------------------
  // Bedroom
  // ---------------------------------------------------------------
  {
    id: "p9",
    slug: "platform-bed-frame-queen",
    name: "Platform Bed Frame (Queen)",
    category: "Bedroom",
    price: 28000,
    description:
      "A low-profile platform bed frame in solid wood with a slatted base — no box spring required.",
    details: [
      "Slatted base, no box spring required",
      "Low-profile modern silhouette",
      "Solid wood construction",
      "Queen size (160 x 200cm mattress)",
    ],
    materials: {
      frame: "Solid wood frame",
      legs: "Solid wood block legs",
    },
    dimensions: { widthCm: 160, depthCm: 210, heightCm: 35, legHeightCm: 15, weightKg: 42 },
    icon: "bed",
    gradient: "from-sand to-terracotta-100",
    stock: 13,
    sku: "BED-PLT-QN",
    availability: "in_stock",
    rating: 4.6,
    reviewCount: 26,
    colors: ["Natural Wood", "Walnut Stain", "White"],
    materialOptions: ["Slatted Base", "Solid Base"],
    woodOptions: ["Pine", "Oak"],
  },
  {
    id: "p10",
    slug: "upholstered-bed-frame-king",
    name: "Upholstered Bed Frame (King)",
    category: "Bedroom",
    price: 41000,
    description:
      "A king-size bed frame with a tall upholstered headboard and channel tufting, built on a solid wood slatted base.",
    details: [
      "Tall channel-tufted upholstered headboard",
      "Solid wood slatted base",
      "King size (180 x 215cm mattress)",
      "No box spring required",
    ],
    materials: {
      frame: "Solid wood frame",
      upholstery: "Channel-tufted upholstered headboard",
      legs: "Solid wood block legs",
    },
    dimensions: { widthCm: 180, depthCm: 215, heightCm: 110, legHeightCm: 20, weightKg: 58 },
    icon: "bed",
    gradient: "from-terracotta-100 to-walnut-100",
    stock: 6,
    featured: true,
    sku: "BED-UPH-KG",
    availability: "in_stock",
    rating: 4.8,
    reviewCount: 19,
    colors: ["Ivory", "Charcoal", "Dusty Blue"],
    materialOptions: ["Fabric", "Velvet"],
    woodOptions: [],
  },
  {
    id: "p11",
    slug: "storage-bed-with-drawers-queen",
    name: "Storage Bed with Drawers (Queen)",
    category: "Bedroom",
    price: 36500,
    description:
      "A queen bed frame with four soft-close storage drawers built into the base — extra storage without an extra piece of furniture.",
    details: [
      "4 soft-close storage drawers",
      "Solid plywood box construction",
      "Queen size (160 x 200cm mattress)",
      "Built to order — 2 week lead time",
    ],
    materials: {
      frame: "Solid plywood box frame",
      legs: "Integrated base, no separate legs",
    },
    dimensions: { widthCm: 160, depthCm: 210, heightCm: 90, weightKg: 65 },
    icon: "bed",
    gradient: "from-walnut-100 to-sand",
    stock: 0,
    new: true,
    sku: "BED-STR-QN",
    availability: "made_to_order",
    leadTimeDays: 14,
    rating: 4.7,
    reviewCount: 11,
    colors: ["White", "Natural Oak", "Charcoal"],
    materialOptions: ["4-Drawer Base", "2-Drawer Base"],
    woodOptions: ["Birch", "Oak"],
  },
  {
    id: "p12",
    slug: "sliding-door-wardrobe",
    name: "Sliding Door Wardrobe",
    category: "Bedroom",
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
    sku: "WRD-SLD-200",
    availability: "in_stock",
    rating: 4.8,
    reviewCount: 31,
    colors: ["White", "Charcoal", "Natural Oak"],
    materialOptions: ["Mirrored Panel", "Solid Panel"],
    woodOptions: ["MDF", "Oak"],
  },
  {
    id: "p13",
    slug: "hinged-door-wardrobe",
    name: "Hinged Door Wardrobe",
    category: "Bedroom",
    price: 46000,
    description:
      "A freestanding hinged-door wardrobe with adjustable shelving and a full hanging rail — built to fit most bedroom layouts.",
    details: [
      "Adjustable shelving and hanging rail",
      "Soft-close hinges",
      "Freestanding, no wall fixing required",
      "Flat-packed and assembled on delivery",
    ],
    materials: {
      frame: "Solid plywood box",
      upholstery: "Painted or laminate finish",
      legs: "Soft-close hinges, hanging rail",
    },
    dimensions: { widthCm: 150, depthCm: 60, heightCm: 210, weightKg: 88 },
    icon: "wardrobe",
    gradient: "from-sand to-terracotta-100",
    stock: 7,
    sku: "WRD-HNG-150",
    availability: "in_stock",
    rating: 4.7,
    reviewCount: 14,
    colors: ["White", "Natural Oak", "Charcoal"],
    materialOptions: ["3-Door", "2-Door"],
    woodOptions: ["Oak", "MDF"],
  },
  {
    id: "p14",
    slug: "bedside-nightstand",
    name: "Bedside Nightstand",
    category: "Bedroom",
    price: 12500,
    description:
      "A compact bedside nightstand with two soft-close drawers, sized to sit alongside any of our bed frames.",
    details: [
      "2 soft-close drawers",
      "Solid wood top",
      "Sized to match our bed frame heights",
      "Sold individually",
    ],
    materials: {
      frame: "Solid plywood box, solid wood top",
      upholstery: "Painted or natural oil finish",
      legs: "Soft-close drawer runners",
    },
    dimensions: { widthCm: 45, depthCm: 40, heightCm: 55, weightKg: 14 },
    icon: "nightstand",
    gradient: "from-walnut-100 to-terracotta-100",
    stock: 22,
    new: true,
    sku: "NGT-STD-45",
    availability: "in_stock",
    rating: 4.6,
    reviewCount: 27,
    colors: ["White", "Natural Wood", "Walnut Stain", "Charcoal"],
    materialOptions: ["2-Drawer", "1-Drawer"],
    woodOptions: ["Oak", "Pine"],
  },

  // ---------------------------------------------------------------
  // Dining
  // ---------------------------------------------------------------
  {
    id: "p15",
    slug: "solid-wood-dining-table-8-seater",
    name: "Solid Wood Dining Table (8-Seater)",
    category: "Dining",
    price: 54000,
    description:
      "A solid wood dining table built to seat eight, with a trestle base and a hand-rubbed natural oil finish that shows the grain.",
    details: [
      "Solid wood tabletop, not veneer",
      "Trestle base for open legroom",
      "Hand-rubbed natural oil finish",
      "Built to order — 3 week lead time",
    ],
    materials: {
      frame: "Solid wood tabletop",
      upholstery: "Natural oil finish",
      legs: "Solid wood trestle base",
    },
    dimensions: { widthCm: 220, depthCm: 100, heightCm: 76, weightKg: 65 },
    icon: "dining-table",
    gradient: "from-terracotta-100 to-sand",
    stock: 0,
    featured: true,
    sku: "DIN-TBL-8ST",
    availability: "made_to_order",
    leadTimeDays: 21,
    rating: 4.9,
    reviewCount: 22,
    colors: ["Natural Wood", "Dark Walnut Stain"],
    materialOptions: ["Trestle Base", "Pedestal Base"],
    woodOptions: ["Oak", "Walnut"],
  },
  {
    id: "p16",
    slug: "extendable-dining-table",
    name: "Extendable Dining Table",
    category: "Dining",
    price: 38000,
    description:
      "A dining table with a fold-out leaf that extends from a compact 6-seat footprint to a full 8-seat length for hosting.",
    details: [
      "Fold-out leaf extends seating from 6 to 8",
      "Solid wood construction throughout",
      "Smooth-glide extension mechanism",
      "Standard 160cm base length",
    ],
    materials: {
      frame: "Solid wood tabletop",
      upholstery: "Matte lacquer finish",
      legs: "Solid wood tapered legs",
    },
    dimensions: { widthCm: 160, depthCm: 90, heightCm: 75, weightKg: 48 },
    icon: "dining-table",
    gradient: "from-sand to-walnut-100",
    stock: 14,
    sku: "DIN-EXT-TBL",
    availability: "in_stock",
    rating: 4.6,
    reviewCount: 29,
    colors: ["Natural Wood", "White", "Charcoal"],
    materialOptions: ["Extendable", "Fixed Length"],
    woodOptions: ["Oak", "Pine"],
  },
  {
    id: "p17",
    slug: "upholstered-dining-chair-set",
    name: "Upholstered Dining Chair Set (Set of 4)",
    category: "Dining",
    price: 24000,
    description:
      "A set of four upholstered dining chairs with solid wood frames and a woven fabric seat, built to match any of our dining tables.",
    details: [
      "Set of 4 matching chairs",
      "Solid wood frame construction",
      "Woven fabric upholstered seat",
      "Stacks for easy storage",
    ],
    materials: {
      frame: "Solid wood frame",
      upholstery: "Woven fabric seat",
      legs: "Tapered solid wood legs",
    },
    dimensions: {
      widthCm: 45,
      depthCm: 52,
      heightCm: 88,
      seatHeightCm: 46,
      weightKg: 24,
    },
    icon: "dining-chair",
    gradient: "from-walnut-100 to-terracotta-100",
    stock: 20,
    new: true,
    sku: "DIN-CHR-SET4",
    availability: "in_stock",
    rating: 4.5,
    reviewCount: 33,
    colors: ["Oatmeal", "Charcoal", "Terracotta"],
    materialOptions: ["Fabric", "Woven Rattan"],
    woodOptions: ["Oak", "Pine"],
  },
  {
    id: "p18",
    slug: "dining-bench",
    name: "Dining Bench",
    category: "Dining",
    price: 15500,
    description:
      "A solid wood dining bench sized to pair with our 6- or 8-seater tables — a space-saving alternative to a full chair set on one side.",
    details: [
      "Solid wood construction",
      "Seats up to 3 comfortably",
      "Matches our dining table finishes",
      "No back rest — slides under the table",
    ],
    materials: {
      frame: "Solid wood frame and seat",
      upholstery: "Natural oil finish",
      legs: "Solid wood tapered legs",
    },
    dimensions: { widthCm: 140, depthCm: 35, heightCm: 46, weightKg: 18 },
    icon: "dining-chair",
    gradient: "from-sand to-terracotta-100",
    stock: 9,
    sku: "DIN-BNC-140",
    availability: "in_stock",
    rating: 4.5,
    reviewCount: 10,
    colors: ["Natural Wood", "Walnut Stain"],
    materialOptions: [],
    woodOptions: ["Oak", "Pine"],
  },
  {
    id: "p19",
    slug: "shaker-kitchen-base-cabinet",
    name: "Shaker Kitchen Base Cabinet",
    category: "Dining",
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
      frame: "Solid plywood box",
      upholstery: "Shaker-style painted door",
      legs: "Soft-close hinges + pulls",
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
    colors: ["White", "Sage Green", "Charcoal", "Natural Wood"],
    materialOptions: ["Shaker", "Flat Panel"],
    woodOptions: ["Birch", "Oak"],
  },
  {
    id: "p20",
    slug: "glass-front-kitchen-wall-cabinet",
    name: "Glass-Front Kitchen Wall Cabinet",
    category: "Dining",
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
      frame: "Solid plywood box",
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
    colors: ["White", "Natural Wood"],
    materialOptions: ["Glass Front", "Solid Front"],
    woodOptions: ["Birch", "Oak"],
  },
  {
    id: "p21",
    slug: "kitchen-island-unit",
    name: "Kitchen Island Unit",
    category: "Dining",
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
      legs: "Soft-close drawers, pulls",
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
    colors: ["White", "Navy", "Natural Wood", "Charcoal"],
    materialOptions: ["With Seating Overhang", "Standard"],
    woodOptions: ["Oak", "Birch"],
  },

  // ---------------------------------------------------------------
  // Office
  // ---------------------------------------------------------------
  {
    id: "p22",
    slug: "executive-office-desk",
    name: "Executive Office Desk",
    category: "Office",
    price: 34500,
    description:
      "A wide solid-wood executive desk with a built-in drawer pedestal, sized for a home office or a director's office.",
    details: [
      "Solid wood desktop",
      "3-drawer pedestal with soft-close runners",
      "Cable management port",
      "Seats one comfortably behind a full-width desk",
    ],
    materials: {
      frame: "Solid wood desktop",
      upholstery: "Matte lacquer finish",
      legs: "Solid wood panel legs",
    },
    dimensions: { widthCm: 160, depthCm: 75, heightCm: 76, weightKg: 52 },
    icon: "office-desk",
    gradient: "from-walnut-100 to-sand",
    stock: 6,
    featured: true,
    sku: "DSK-EXC-160",
    availability: "in_stock",
    rating: 4.8,
    reviewCount: 20,
    colors: ["Natural Wood", "Walnut Stain", "White"],
    materialOptions: ["3-Drawer Pedestal", "Open Base"],
    woodOptions: ["Oak", "Walnut"],
  },
  {
    id: "p23",
    slug: "compact-writing-desk",
    name: "Compact Writing Desk",
    category: "Office",
    price: 16500,
    description:
      "A slim writing desk sized for a home office corner or a student's room, with a single drawer for everyday supplies.",
    details: [
      "Compact footprint fits small rooms",
      "1 soft-close drawer",
      "Solid wood legs",
      "Cable-management cutout at the back",
    ],
    materials: {
      frame: "Solid plywood top",
      upholstery: "Painted or natural oil finish",
      legs: "Solid wood tapered legs",
    },
    dimensions: { widthCm: 100, depthCm: 55, heightCm: 75, weightKg: 22 },
    icon: "office-desk",
    gradient: "from-sand to-terracotta-100",
    stock: 18,
    new: true,
    sku: "DSK-CMP-100",
    availability: "in_stock",
    rating: 4.5,
    reviewCount: 24,
    colors: ["White", "Natural Wood", "Charcoal"],
    materialOptions: [],
    woodOptions: ["Pine", "Birch"],
  },
  {
    id: "p24",
    slug: "l-shaped-corner-desk",
    name: "L-Shaped Corner Desk",
    category: "Office",
    price: 42000,
    description:
      "An L-shaped corner desk that makes use of a room's full corner, with a two-tier shelf for a monitor or printer.",
    details: [
      "Fits standard 90-degree room corners",
      "Two-tier open shelf built in",
      "Solid wood frame",
      "Built to order — 2 week lead time",
    ],
    materials: {
      frame: "Solid plywood top, hardwood frame",
      upholstery: "Matte lacquer finish",
      legs: "Solid wood panel legs",
    },
    dimensions: { widthCm: 150, depthCm: 150, heightCm: 76, weightKg: 58 },
    icon: "office-desk",
    gradient: "from-terracotta-100 to-walnut-100",
    stock: 0,
    sku: "DSK-LSH-150",
    availability: "made_to_order",
    leadTimeDays: 14,
    rating: 4.7,
    reviewCount: 9,
    colors: ["Natural Wood", "Walnut Stain"],
    materialOptions: ["Left Return", "Right Return"],
    woodOptions: ["Oak", "Walnut"],
  },
  {
    id: "p25",
    slug: "ergonomic-office-chair",
    name: "Ergonomic Office Chair",
    category: "Office",
    price: 19500,
    description:
      "An ergonomic office chair with adjustable lumbar support, armrests, and seat height — built for long working days.",
    details: [
      "Adjustable lumbar support",
      "Height-adjustable armrests",
      "Smooth-rolling caster wheels",
      "Breathable mesh backrest",
    ],
    materials: {
      frame: "Steel frame, mesh backrest",
      upholstery: "Breathable mesh + cushioned seat",
      legs: "5-point caster base",
    },
    dimensions: { widthCm: 65, depthCm: 65, heightCm: 115, seatHeightCm: 48, weightKg: 16 },
    icon: "office-chair",
    gradient: "from-walnut-100 to-terracotta-100",
    stock: 12,
    featured: true,
    sku: "CHR-ERG-MSH",
    availability: "in_stock",
    rating: 4.7,
    reviewCount: 35,
    colors: ["Black", "Charcoal Grey"],
    materialOptions: ["Mesh Back", "Fabric Back"],
    woodOptions: [],
  },
  {
    id: "p26",
    slug: "executive-office-chair",
    name: "Executive Office Chair",
    category: "Office",
    price: 27500,
    description:
      "A high-back executive office chair upholstered in easy-clean faux leather, with a reclining backrest and padded armrests.",
    details: [
      "High-back design with headrest",
      "Reclining backrest with tilt lock",
      "Padded armrests",
      "Easy-clean faux leather upholstery",
    ],
    materials: {
      frame: "Steel frame",
      upholstery: "Faux leather upholstery",
      legs: "5-point caster base",
    },
    dimensions: { widthCm: 70, depthCm: 70, heightCm: 125, seatHeightCm: 50, weightKg: 21 },
    icon: "office-chair",
    gradient: "from-sand to-walnut-100",
    stock: 5,
    sku: "CHR-EXC-LTH",
    availability: "in_stock",
    rating: 4.6,
    reviewCount: 14,
    colors: ["Black", "Brown"],
    materialOptions: ["Faux Leather"],
    woodOptions: [],
  },
  {
    id: "p27",
    slug: "task-chair",
    name: "Task Chair",
    category: "Office",
    price: 11500,
    description:
      "A simple, affordable task chair for a home desk or a second workstation — height-adjustable with a fixed backrest.",
    details: [
      "Height-adjustable gas lift",
      "Fixed backrest, fabric upholstery",
      "Smooth-rolling caster wheels",
      "Lightweight and easy to move",
    ],
    materials: {
      frame: "Steel frame",
      upholstery: "Fabric upholstery",
      legs: "5-point caster base",
    },
    dimensions: { widthCm: 55, depthCm: 55, heightCm: 90, seatHeightCm: 46, weightKg: 10 },
    icon: "office-chair",
    gradient: "from-terracotta-100 to-sand",
    stock: 25,
    new: true,
    sku: "CHR-TSK-FB",
    availability: "in_stock",
    rating: 4.4,
    reviewCount: 21,
    colors: ["Black", "Grey", "Navy"],
    materialOptions: [],
    woodOptions: [],
  },
];

export const categories: Category[] = ["Living Room", "Bedroom", "Dining", "Office"];

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const iconNames: IconName[] = [
  "sofa",
  "sectional-sofa",
  "center-table",
  "tv-stand",
  "wall-drawer",
  "bed",
  "wardrobe",
  "sliding-wardrobe",
  "nightstand",
  "dining-table",
  "dining-chair",
  "base-cabinet",
  "wall-cabinet",
  "kitchen-island",
  "office-desk",
  "office-chair",
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
