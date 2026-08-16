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

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  compareAtPrice?: number;
  description: string;
  details: string[];
  material: string;
  dimensions: string;
  icon: IconName;
  gradient: string;
  featured?: boolean;
  new?: boolean;
  stock: number;
};

// Seed data only — loaded into the database by `npm run seed`.
// At runtime, pages read products from MySQL via lib/db.ts, not from here.
export const PRODUCT_SEED: Product[] = [
  {
    id: "p1",
    slug: "haven-3-seat-sofa",
    name: "Haven 3-Seat Sofa",
    category: "Living Room",
    price: 1249,
    compareAtPrice: 1499,
    description:
      "A deep, cloud-soft sofa built for long weekends. Kiln-dried hardwood frame, high-resilience foam, and a boucle weave that only gets better with age.",
    details: [
      "Solid kiln-dried hardwood frame",
      "High-resilience foam with down-wrapped cushions",
      "Removable, machine-washable covers",
      "Assembly required (approx. 20 min)",
    ],
    material: "Boucle upholstery, oak legs",
    dimensions: '86"W x 36"D x 33"H',
    icon: "sofa",
    gradient: "from-terracotta-100 to-walnut-100",
    stock: 24,
    featured: true,
  },
  {
    id: "p2",
    slug: "orbit-lounge-armchair",
    name: "Orbit Lounge Armchair",
    category: "Living Room",
    price: 589,
    description:
      "A gently curved armchair that cradles you from every angle, on a solid walnut swivel base.",
    details: [
      "360° swivel base",
      "Solid walnut frame",
      "Water-repellent performance fabric",
    ],
    material: "Performance weave, solid walnut",
    dimensions: '32"W x 34"D x 30"H',
    icon: "armchair",
    gradient: "from-walnut-100 to-sand",
    stock: 24,
    featured: true,
  },
  {
    id: "p3",
    slug: "drift-coffee-table",
    name: "Drift Coffee Table",
    category: "Living Room",
    price: 349,
    description:
      "Live-edge inspired coffee table with a hand-rubbed oil finish that highlights the natural grain.",
    details: [
      "Solid acacia top",
      "Hand-rubbed oil finish",
      "Tapered black steel legs",
    ],
    material: "Solid acacia, powder-coated steel",
    dimensions: '48"W x 24"D x 17"H',
    icon: "coffee-table",
    gradient: "from-sand to-walnut-100",
    stock: 24,
  },
  {
    id: "p4",
    slug: "solstice-dining-table",
    name: "Solstice Dining Table",
    category: "Dining",
    price: 1099,
    description:
      "Seats six comfortably. A single-slab silhouette in solid oak, finished to resist everyday wear.",
    details: [
      "Solid oak construction",
      "Seats up to 6",
      "Scratch and heat resistant finish",
    ],
    material: "Solid oak",
    dimensions: '72"W x 38"D x 30"H',
    icon: "dining-table",
    gradient: "from-walnut-100 to-terracotta-100",
    stock: 24,
    featured: true,
  },
  {
    id: "p5",
    slug: "wicker-dining-chair",
    name: "Marsh Woven Dining Chair",
    category: "Dining",
    price: 179,
    description:
      "Hand-woven natural rush seating on a solid beech frame — light, sturdy, and quietly elegant.",
    details: [
      "Hand-woven natural rush seat",
      "Solid beech frame",
      "Sold individually",
    ],
    material: "Rush weave, solid beech",
    dimensions: '19"W x 21"D x 32"H',
    icon: "dining-chair",
    gradient: "from-sand to-terracotta-100",
    stock: 24,
    new: true,
  },
  {
    id: "p6",
    slug: "canopy-upholstered-bed",
    name: "Canopy Upholstered Bed",
    category: "Bedroom",
    price: 899,
    description:
      "A tall, channel-tufted headboard wrapped in bouclé, built on a noise-free slatted base.",
    details: [
      "Channel-tufted headboard",
      "Slatted base, no box spring needed",
      "Queen and King available",
    ],
    material: "Boucle upholstery, solid pine base",
    dimensions: 'Queen: 64"W x 86"D x 51"H',
    icon: "bed",
    gradient: "from-terracotta-100 to-sand",
    stock: 24,
    featured: true,
  },
  {
    id: "p7",
    slug: "hollow-nightstand",
    name: "Hollow Nightstand",
    category: "Bedroom",
    price: 249,
    description:
      "A single floating drawer and open shelf in warm walnut veneer — quiet storage with a light footprint.",
    details: ["One soft-close drawer", "Open lower shelf", "Wall-mount or freestanding"],
    material: "Walnut veneer, engineered wood",
    dimensions: '20"W x 16"D x 22"H',
    icon: "nightstand",
    gradient: "from-walnut-100 to-sand",
    stock: 3,
  },
  {
    id: "p8",
    slug: "atlas-wardrobe",
    name: "Atlas 3-Door Wardrobe",
    category: "Bedroom",
    price: 1199,
    description:
      "Generous hanging and shelf space behind three solid doors, in a deep matte walnut finish.",
    details: [
      "3 doors, 2 drawers, adjustable shelving",
      "Full-length hanging rail",
      "Soft-close hardware throughout",
    ],
    material: "Solid walnut, engineered wood",
    dimensions: '70"W x 22"D x 78"H',
    icon: "wardrobe",
    gradient: "from-walnut-100 to-walnut-100",
    stock: 24,
  },
  {
    id: "p9",
    slug: "meridian-writing-desk",
    name: "Meridian Writing Desk",
    category: "Office",
    price: 429,
    description:
      "A slim, cable-managed desk with a single drawer — enough surface for a monitor, notebook, and a good lamp.",
    details: [
      "Built-in cable management",
      "One soft-close drawer",
      "Solid ash legs",
    ],
    material: "Ash veneer top, solid ash legs",
    dimensions: '48"W x 24"D x 29"H',
    icon: "desk",
    gradient: "from-sand to-walnut-100",
    stock: 24,
    new: true,
  },
  {
    id: "p10",
    slug: "pivot-task-chair",
    name: "Pivot Task Chair",
    category: "Office",
    price: 379,
    description:
      "All-day ergonomic support with a breathable woven back and a base that adjusts to how you actually sit.",
    details: [
      "Adjustable lumbar and armrests",
      "Breathable woven backrest",
      "5-year mechanism warranty",
    ],
    material: "Woven mesh, aluminum base",
    dimensions: '26"W x 25"D x 38-42"H',
    icon: "office-chair",
    gradient: "from-walnut-100 to-terracotta-100",
    stock: 24,
    featured: true,
  },
  {
    id: "p11",
    slug: "linear-bookshelf",
    name: "Linear 5-Tier Bookshelf",
    category: "Office",
    price: 329,
    description:
      "Open, modular shelving in solid birch — equally at home holding books or displayed objects.",
    details: ["5 fixed shelves", "Solid birch construction", "Anti-tip wall strap included"],
    material: "Solid birch",
    dimensions: '32"W x 12"D x 72"H',
    icon: "bookshelf",
    gradient: "from-sand to-sand",
    stock: 0,
  },
  {
    id: "p12",
    slug: "harbor-outdoor-lounge-chair",
    name: "Harbor Outdoor Lounge Chair",
    category: "Outdoor",
    price: 449,
    description:
      "Weatherproof teak and all-weather rope, built to live outside through every season.",
    details: [
      "FSC-certified teak frame",
      "All-weather rope weave",
      "Quick-dry cushion included",
    ],
    material: "Teak, all-weather rope",
    dimensions: '27"W x 32"D x 30"H',
    icon: "outdoor-chair",
    gradient: "from-terracotta-100 to-walnut-100",
    stock: 24,
  },
  {
    id: "p13",
    slug: "grove-outdoor-dining-table",
    name: "Grove Outdoor Dining Table",
    category: "Outdoor",
    price: 799,
    description:
      "A rust-proof aluminum base under a slatted teak top, seating six under open sky.",
    details: [
      "Slatted FSC teak top",
      "Powder-coated aluminum base",
      "Seats up to 6",
    ],
    material: "Teak, powder-coated aluminum",
    dimensions: '70"W x 36"D x 29"H',
    icon: "outdoor-table",
    gradient: "from-walnut-100 to-terracotta-100",
    stock: 24,
    new: true,
  },
  {
    id: "p14",
    slug: "arc-floor-lamp",
    name: "Arc Floor Lamp",
    category: "Living Room",
    price: 219,
    description:
      "A sweeping brushed-brass arc that casts warm, directional light over a sofa or reading chair.",
    details: [
      "Brushed brass finish",
      "Marble weighted base",
      "In-line foot dimmer switch",
    ],
    material: "Brushed brass, marble base",
    dimensions: '58"W arc reach x 78"H',
    icon: "lamp",
    gradient: "from-sand to-terracotta-100",
    stock: 24,
  },
  {
    id: "p15",
    slug: "birch-entry-bench",
    name: "Birch Entry Bench",
    category: "Living Room",
    price: 259,
    description:
      "A simple, sturdy bench for the entryway — lace up boots, drop your bag, keep moving.",
    details: ["Solid birch seat and legs", "Holds up to 300 lbs", "Felt floor pads included"],
    material: "Solid birch",
    dimensions: '42"W x 14"D x 18"H',
    icon: "bench",
    gradient: "from-walnut-100 to-sand",
    stock: 24,
  },
  {
    id: "p16",
    slug: "cove-outdoor-bench",
    name: "Cove Outdoor Bench",
    category: "Outdoor",
    price: 299,
    description:
      "Weatherproof teak slats over a rust-proof frame — built for a porch, garden, or patio edge.",
    details: ["FSC-certified teak slats", "Rust-proof steel frame", "No cushion needed"],
    material: "Teak, powder-coated steel",
    dimensions: '48"W x 16"D x 17"H',
    icon: "bench",
    gradient: "from-terracotta-100 to-sand",
    stock: 24,
  },
];

export const categories: Category[] = [
  "Living Room",
  "Bedroom",
  "Dining",
  "Office",
  "Outdoor",
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}
