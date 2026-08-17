import mysql from "mysql2/promise";
import type { Availability, Category, IconName, Product } from "@/lib/products";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";
import { DEFAULT_SETTINGS, mergeSettings, type SiteSettings } from "@/lib/settings";
import type { PageBlock } from "@/lib/pages";
import { getPool } from "@/lib/db-pool";

export { ORDER_STATUSES, type OrderStatus };

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compare_at_price: number | null;
  description: string;
  details_json: string;
  icon: string;
  gradient: string;
  image_url: string | null;
  featured: number;
  is_new: number;
  stock: number;
  sku: string;
  availability: string;
  lead_time_days: number | null;
  rating: number | string;
  review_count: number;
  width_cm: number;
  depth_cm: number;
  height_cm: number;
  seat_height_cm: number | null;
  seat_depth_cm: number | null;
  arm_height_cm: number | null;
  leg_height_cm: number | null;
  weight_kg: number | null;
  frame_material: string;
  upholstery_material: string | null;
  legs_material: string | null;
  foam_density: string | null;
  colors_json: string;
  material_options_json: string;
  wood_options_json: string;
};

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category as Category,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    description: row.description,
    details: JSON.parse(row.details_json),
    icon: row.icon as Product["icon"],
    gradient: row.gradient,
    imageUrl: row.image_url ?? undefined,
    featured: !!row.featured,
    new: !!row.is_new,
    stock: row.stock,
    sku: row.sku,
    availability: row.availability as Availability,
    leadTimeDays: row.lead_time_days ?? undefined,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    dimensions: {
      widthCm: row.width_cm,
      depthCm: row.depth_cm,
      heightCm: row.height_cm,
      seatHeightCm: row.seat_height_cm ?? undefined,
      seatDepthCm: row.seat_depth_cm ?? undefined,
      armHeightCm: row.arm_height_cm ?? undefined,
      legHeightCm: row.leg_height_cm ?? undefined,
      weightKg: row.weight_kg ?? undefined,
    },
    materials: {
      frame: row.frame_material,
      upholstery: row.upholstery_material ?? undefined,
      legs: row.legs_material ?? undefined,
      foamDensity: row.foam_density ?? undefined,
    },
    colors: JSON.parse(row.colors_json),
    materialOptions: JSON.parse(row.material_options_json),
    woodOptions: JSON.parse(row.wood_options_json),
  };
}

export async function getAllProducts(category?: Category): Promise<Product[]> {
  const db = getPool();
  const [rows] = category
    ? await db.query<mysql.RowDataPacket[]>(
        "SELECT * FROM products WHERE category = ? ORDER BY name",
        [category]
      )
    : await db.query<mysql.RowDataPacket[]>("SELECT * FROM products ORDER BY name");
  return (rows as ProductRow[]).map(rowToProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM products WHERE featured = 1 ORDER BY name"
  );
  return (rows as ProductRow[]).map(rowToProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM products WHERE slug = ? LIMIT 1",
    [slug]
  );
  const row = (rows as ProductRow[])[0];
  return row ? rowToProduct(row) : undefined;
}

export async function getRelatedProducts(
  product: Product,
  count = 4
): Promise<Product[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM products WHERE category = ? AND id != ? ORDER BY name LIMIT ?",
    [product.category, product.id, count]
  );
  return (rows as ProductRow[]).map(rowToProduct);
}

// "Complete the room": a handful of products from other categories, for
// cross-selling on the product detail page.
export async function getCompleteTheRoomProducts(
  product: Product,
  count = 4
): Promise<Product[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM products WHERE category != ? AND id != ? ORDER BY RAND() LIMIT ?",
    [product.category, product.id, count]
  );
  return (rows as ProductRow[]).map(rowToProduct);
}

export type OrderInput = {
  customerName: string;
  customerEmail: string;
  address: string;
  city: string;
  postalCode: string;
  items: { slug: string; quantity: number; variant?: string }[];
};

export type OrderResult = {
  id: number;
  subtotal: number;
  items: { slug: string; name: string; price: number; quantity: number; variant?: string }[];
};

export class OrderError extends Error {}

export async function createOrder(input: OrderInput): Promise<OrderResult> {
  if (input.items.length === 0) {
    throw new OrderError("Cart is empty.");
  }

  const db = getPool();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const lineItems: OrderResult["items"] = [];
    let subtotal = 0;

    for (const item of input.items) {
      if (item.quantity <= 0) continue;

      const [rows] = await conn.query<mysql.RowDataPacket[]>(
        "SELECT * FROM products WHERE slug = ? FOR UPDATE",
        [item.slug]
      );
      const product = (rows as ProductRow[])[0];
      if (!product) {
        throw new OrderError(`Product "${item.slug}" no longer exists.`);
      }

      if (product.availability === "out_of_stock") {
        throw new OrderError(`"${product.name}" is out of stock.`);
      }

      // Made-to-order items aren't tracked against a stock count.
      if (product.availability === "in_stock") {
        if (product.stock < item.quantity) {
          throw new OrderError(
            `Only ${product.stock} left of "${product.name}" — please update your cart.`
          );
        }
        await conn.query("UPDATE products SET stock = stock - ? WHERE slug = ?", [
          item.quantity,
          item.slug,
        ]);
      }

      lineItems.push({
        slug: product.slug,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        variant: item.variant,
      });
      subtotal += product.price * item.quantity;
    }

    if (lineItems.length === 0) {
      throw new OrderError("Cart is empty.");
    }

    const [orderResult] = await conn.query<mysql.ResultSetHeader>(
      `INSERT INTO orders (customer_name, customer_email, address, city, postal_code, subtotal, status)
       VALUES (?, ?, ?, ?, ?, ?, 'placed')`,
      [
        input.customerName,
        input.customerEmail,
        input.address,
        input.city,
        input.postalCode,
        subtotal,
      ]
    );
    const orderId = orderResult.insertId;

    for (const item of lineItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_slug, name, price, quantity, variant_label)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.slug, item.name, item.price, item.quantity, item.variant ?? null]
      );
    }

    await conn.commit();
    return { id: orderId, subtotal, items: lineItems };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export type Order = {
  id: number;
  customerName: string;
  customerEmail: string;
  address: string;
  city: string;
  postalCode: string;
  subtotal: number;
  status: string;
  createdAt: string;
  items: { slug: string; name: string; price: number; quantity: number; variant?: string }[];
};

export async function getOrderById(id: number): Promise<Order | undefined> {
  const db = getPool();
  const [orderRows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM orders WHERE id = ? LIMIT 1",
    [id]
  );
  const order = orderRows[0];
  if (!order) return undefined;

  const [itemRows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT product_slug, name, price, quantity, variant_label FROM order_items WHERE order_id = ?",
    [id]
  );

  return {
    id: order.id,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    address: order.address,
    city: order.city,
    postalCode: order.postal_code,
    subtotal: order.subtotal,
    status: order.status,
    createdAt: order.created_at,
    items: (itemRows as mysql.RowDataPacket[]).map((r) => ({
      slug: r.product_slug,
      name: r.name,
      price: r.price,
      quantity: r.quantity,
      variant: r.variant_label ?? undefined,
    })),
  };
}

// ---------------------------------------------------------------------
// Admin: orders
// ---------------------------------------------------------------------

export type OrderSummary = {
  id: number;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  status: string;
  createdAt: string;
  itemCount: number;
};

export async function getAllOrders(): Promise<OrderSummary[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    `SELECT o.id, o.customer_name, o.customer_email, o.subtotal, o.status, o.created_at,
            COALESCE(SUM(oi.quantity), 0) AS item_count
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     GROUP BY o.id
     ORDER BY o.created_at DESC`
  );
  return rows.map((r) => ({
    id: r.id,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    subtotal: r.subtotal,
    status: r.status,
    createdAt: r.created_at,
    itemCount: Number(r.item_count),
  }));
}

export async function updateOrderStatus(
  id: number,
  status: OrderStatus
): Promise<void> {
  const db = getPool();
  const [result] = await db.query<mysql.ResultSetHeader>(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, id]
  );
  if (result.affectedRows === 0) {
    throw new OrderError("Order not found.");
  }
}

// ---------------------------------------------------------------------
// Admin: products
// ---------------------------------------------------------------------

export type ProductInput = {
  slug: string;
  name: string;
  category: Category;
  price: number;
  compareAtPrice?: number | null;
  description: string;
  details: string[];
  icon: IconName;
  gradient: string;
  imageUrl?: string | null;
  featured: boolean;
  new: boolean;
  stock: number;
  sku: string;
  availability: Availability;
  leadTimeDays?: number | null;
  rating: number;
  reviewCount: number;
  widthCm: number;
  depthCm: number;
  heightCm: number;
  seatHeightCm?: number | null;
  seatDepthCm?: number | null;
  armHeightCm?: number | null;
  legHeightCm?: number | null;
  weightKg?: number | null;
  frameMaterial: string;
  upholsteryMaterial?: string | null;
  legsMaterial?: string | null;
  foamDensity?: string | null;
  colors: string[];
  materialOptions: string[];
  woodOptions: string[];
};

export class ProductError extends Error {}

function productInputParams(input: ProductInput): unknown[] {
  return [
    input.name,
    input.category,
    input.price,
    input.compareAtPrice ?? null,
    input.description,
    JSON.stringify(input.details),
    input.icon,
    input.gradient,
    input.imageUrl ?? null,
    input.featured ? 1 : 0,
    input.new ? 1 : 0,
    input.stock,
    input.sku,
    input.availability,
    input.leadTimeDays ?? null,
    input.rating,
    input.reviewCount,
    input.widthCm,
    input.depthCm,
    input.heightCm,
    input.seatHeightCm ?? null,
    input.seatDepthCm ?? null,
    input.armHeightCm ?? null,
    input.legHeightCm ?? null,
    input.weightKg ?? null,
    input.frameMaterial,
    input.upholsteryMaterial ?? null,
    input.legsMaterial ?? null,
    input.foamDensity ?? null,
    JSON.stringify(input.colors),
    JSON.stringify(input.materialOptions),
    JSON.stringify(input.woodOptions),
  ];
}

const PRODUCT_INSERT_PLACEHOLDERS = Array(32).fill("?").join(", ");

export async function createProduct(input: ProductInput): Promise<Product> {
  const db = getPool();
  const [existing] = await db.query<mysql.RowDataPacket[]>(
    "SELECT slug FROM products WHERE slug = ? LIMIT 1",
    [input.slug]
  );
  if (existing.length > 0) {
    throw new ProductError(`A product with slug "${input.slug}" already exists.`);
  }

  await db.query(
    `INSERT INTO products
      (id, slug, name, category, price, compare_at_price, description, details_json,
       icon, gradient, image_url, featured, is_new, stock,
       sku, availability, lead_time_days, rating, review_count,
       width_cm, depth_cm, height_cm, seat_height_cm, seat_depth_cm, arm_height_cm, leg_height_cm, weight_kg,
       frame_material, upholstery_material, legs_material, foam_density,
       colors_json, material_options_json, wood_options_json)
     VALUES (?, ?, ${PRODUCT_INSERT_PLACEHOLDERS})`,
    [input.slug, input.slug, ...productInputParams(input)]
  );

  const created = await getProductBySlug(input.slug);
  if (!created) throw new ProductError("Failed to create product.");
  return created;
}

export async function updateProduct(
  slug: string,
  input: ProductInput
): Promise<Product> {
  const db = getPool();

  if (input.slug !== slug) {
    const [existing] = await db.query<mysql.RowDataPacket[]>(
      "SELECT slug FROM products WHERE slug = ? LIMIT 1",
      [input.slug]
    );
    if (existing.length > 0) {
      throw new ProductError(`A product with slug "${input.slug}" already exists.`);
    }
  }

  const [result] = await db.query<mysql.ResultSetHeader>(
    `UPDATE products SET
      id = ?, slug = ?, name = ?, category = ?, price = ?, compare_at_price = ?,
      description = ?, details_json = ?, icon = ?, gradient = ?, image_url = ?, featured = ?, is_new = ?, stock = ?,
      sku = ?, availability = ?, lead_time_days = ?, rating = ?, review_count = ?,
      width_cm = ?, depth_cm = ?, height_cm = ?, seat_height_cm = ?, seat_depth_cm = ?,
      arm_height_cm = ?, leg_height_cm = ?, weight_kg = ?,
      frame_material = ?, upholstery_material = ?, legs_material = ?, foam_density = ?,
      colors_json = ?, material_options_json = ?, wood_options_json = ?
     WHERE slug = ?`,
    [input.slug, input.slug, ...productInputParams(input), slug]
  );
  if (result.affectedRows === 0) {
    throw new ProductError("Product not found.");
  }

  const updated = await getProductBySlug(input.slug);
  if (!updated) throw new ProductError("Failed to update product.");
  return updated;
}

export async function deleteProduct(slug: string): Promise<void> {
  const db = getPool();
  const [result] = await db.query<mysql.ResultSetHeader>(
    "DELETE FROM products WHERE slug = ?",
    [slug]
  );
  if (result.affectedRows === 0) {
    throw new ProductError("Product not found.");
  }
}

// ---------------------------------------------------------------------
// Admin: dashboard
// ---------------------------------------------------------------------

export type DashboardStats = {
  productCount: number;
  orderCount: number;
  revenueTotal: number;
  lowStockProducts: Product[];
  recentOrders: OrderSummary[];
};

const LOW_STOCK_THRESHOLD = 5;

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = getPool();

  const [[productCountRow]] = await db.query<mysql.RowDataPacket[]>(
    "SELECT COUNT(*) AS count FROM products"
  );
  const [[orderStatsRow]] = await db.query<mysql.RowDataPacket[]>(
    "SELECT COUNT(*) AS count, COALESCE(SUM(subtotal), 0) AS revenue FROM orders WHERE status != 'cancelled'"
  );
  const [lowStockRows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM products WHERE availability = 'in_stock' AND stock <= ? ORDER BY stock ASC LIMIT 8",
    [LOW_STOCK_THRESHOLD]
  );
  const allOrders = await getAllOrders();

  return {
    productCount: Number(productCountRow.count),
    orderCount: Number(orderStatsRow.count),
    revenueTotal: Number(orderStatsRow.revenue),
    lowStockProducts: (lowStockRows as ProductRow[]).map(rowToProduct),
    recentOrders: allOrders.slice(0, 8),
  };
}

// ---------------------------------------------------------------------
// Admin: analytics (sales, traffic, site health)
// ---------------------------------------------------------------------

const ANALYTICS_DAYS = 30;

// Builds the last N calendar days (oldest first) as "YYYY-MM-DD" strings,
// so charts show a continuous series with zeros for days with no rows —
// rather than gaps wherever a day happens to have no orders/views.
function lastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export type SalesByDay = { day: string; revenue: number; orders: number };
export type OrdersByStatus = { status: string; count: number };
export type TopProduct = { slug: string; name: string; units: number; revenue: number };
export type SalesByCategory = { category: string; revenue: number };

export type PageViewsByDay = { day: string; views: number };
export type TopPage = { path: string; views: number };
export type TopReferrer = { referrer: string; views: number };

export type SiteHealth = {
  dbOk: boolean;
  dbLatencyMs: number;
  uptimeSeconds: number;
  nodeVersion: string;
  env: string;
  productCount: number;
  orderCount: number;
  pageViewCount: number;
  lastOrderAt: string | null;
};

export type Analytics = {
  salesByDay: SalesByDay[];
  ordersByStatus: OrdersByStatus[];
  topProducts: TopProduct[];
  salesByCategory: SalesByCategory[];
  revenueLast30: number;
  ordersLast30: number;
  avgOrderValue: number;
  totalRevenue: number;
  totalOrders: number;

  pageViewsByDay: PageViewsByDay[];
  topPages: TopPage[];
  topReferrers: TopReferrer[];
  viewsLast30: number;
  viewsAllTime: number;

  health: SiteHealth;
};

export async function recordPageView(path: string, referrer: string | null): Promise<void> {
  const db = getPool();
  await db.query("INSERT INTO page_views (path, referrer) VALUES (?, ?)", [path, referrer]);
}

function emptyAnalytics(days: string[], health: SiteHealth): Analytics {
  return {
    salesByDay: days.map((day) => ({ day, revenue: 0, orders: 0 })),
    ordersByStatus: [],
    topProducts: [],
    salesByCategory: [],
    revenueLast30: 0,
    ordersLast30: 0,
    avgOrderValue: 0,
    totalRevenue: 0,
    totalOrders: 0,
    pageViewsByDay: days.map((day) => ({ day, views: 0 })),
    topPages: [],
    topReferrers: [],
    viewsLast30: 0,
    viewsAllTime: 0,
    health,
  };
}

// Pings the database first, independent of the rest of the queries below —
// so a DB outage surfaces as a health-panel warning instead of crashing
// the whole analytics page (the queries below would all fail together
// anyway if the DB were actually down).
export async function getAnalytics(): Promise<Analytics> {
  const db = getPool();
  const days = lastNDays(ANALYTICS_DAYS);
  const since = days[0];

  const dbStart = Date.now();
  try {
    await db.query("SELECT 1");
  } catch {
    return emptyAnalytics(days, {
      dbOk: false,
      dbLatencyMs: Date.now() - dbStart,
      uptimeSeconds: Math.round(process.uptime()),
      nodeVersion: process.version,
      env: process.env.NODE_ENV ?? "development",
      productCount: 0,
      orderCount: 0,
      pageViewCount: 0,
      lastOrderAt: null,
    });
  }
  const dbLatencyMs = Date.now() - dbStart;

  const [
    [salesByDayRows],
    [ordersByStatusRows],
    [topProductRows],
    [salesByCategoryRows],
    [[totalsRow]],
    [pageViewsByDayRows],
    [topPageRows],
    [topReferrerRows],
    [[viewsRow]],
    [[healthCountsRow]],
    [[lastOrderRow]],
  ] = await Promise.all([
    db.query<mysql.RowDataPacket[]>(
      `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day,
              COALESCE(SUM(subtotal), 0) AS revenue, COUNT(*) AS orders
       FROM orders
       WHERE status != 'cancelled' AND created_at >= ?
       GROUP BY day`,
      [since]
    ),
    db.query<mysql.RowDataPacket[]>(
      "SELECT status, COUNT(*) AS count FROM orders GROUP BY status"
    ),
    db.query<mysql.RowDataPacket[]>(
      `SELECT product_slug AS slug, name, SUM(quantity) AS units, SUM(price * quantity) AS revenue
       FROM order_items
       GROUP BY product_slug, name
       ORDER BY revenue DESC
       LIMIT 5`
    ),
    db.query<mysql.RowDataPacket[]>(
      `SELECT COALESCE(p.category, 'Other') AS category, SUM(oi.price * oi.quantity) AS revenue
       FROM order_items oi
       LEFT JOIN products p ON p.slug = oi.product_slug
       GROUP BY category
       ORDER BY revenue DESC`
    ),
    db.query<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) AS count, COALESCE(SUM(subtotal), 0) AS revenue FROM orders WHERE status != 'cancelled'"
    ),
    db.query<mysql.RowDataPacket[]>(
      `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(*) AS views
       FROM page_views
       WHERE created_at >= ?
       GROUP BY day`,
      [since]
    ),
    db.query<mysql.RowDataPacket[]>(
      `SELECT path, COUNT(*) AS views FROM page_views
       WHERE created_at >= ?
       GROUP BY path ORDER BY views DESC LIMIT 8`,
      [since]
    ),
    db.query<mysql.RowDataPacket[]>(
      `SELECT referrer, COUNT(*) AS views FROM page_views
       WHERE created_at >= ? AND referrer IS NOT NULL AND referrer != ''
       GROUP BY referrer ORDER BY views DESC LIMIT 8`,
      [since]
    ),
    db.query<mysql.RowDataPacket[]>("SELECT COUNT(*) AS count FROM page_views"),
    db.query<mysql.RowDataPacket[]>(
      `SELECT
        (SELECT COUNT(*) FROM products) AS product_count,
        (SELECT COUNT(*) FROM orders) AS order_count,
        (SELECT COUNT(*) FROM page_views) AS page_view_count`
    ),
    db.query<mysql.RowDataPacket[]>(
      "SELECT created_at FROM orders ORDER BY created_at DESC LIMIT 1"
    ),
  ]);

  const revenueByDay = new Map(
    salesByDayRows.map((r) => [r.day as string, { revenue: Number(r.revenue), orders: Number(r.orders) }])
  );
  const salesByDay: SalesByDay[] = days.map((day) => ({
    day,
    revenue: revenueByDay.get(day)?.revenue ?? 0,
    orders: revenueByDay.get(day)?.orders ?? 0,
  }));

  const viewsByDay = new Map(pageViewsByDayRows.map((r) => [r.day as string, Number(r.views)]));
  const pageViewsByDay: PageViewsByDay[] = days.map((day) => ({
    day,
    views: viewsByDay.get(day) ?? 0,
  }));

  const revenueLast30 = salesByDay.reduce((sum, d) => sum + d.revenue, 0);
  const ordersLast30 = salesByDay.reduce((sum, d) => sum + d.orders, 0);
  const totalRevenue = Number(totalsRow.revenue);
  const totalOrders = Number(totalsRow.count);

  return {
    salesByDay,
    ordersByStatus: ordersByStatusRows.map((r) => ({
      status: r.status as string,
      count: Number(r.count),
    })),
    topProducts: topProductRows.map((r) => ({
      slug: r.slug as string,
      name: r.name as string,
      units: Number(r.units),
      revenue: Number(r.revenue),
    })),
    salesByCategory: salesByCategoryRows.map((r) => ({
      category: r.category as string,
      revenue: Number(r.revenue),
    })),
    revenueLast30,
    ordersLast30,
    avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    totalRevenue,
    totalOrders,

    pageViewsByDay,
    topPages: topPageRows.map((r) => ({ path: r.path as string, views: Number(r.views) })),
    topReferrers: topReferrerRows.map((r) => ({
      referrer: r.referrer as string,
      views: Number(r.views),
    })),
    viewsLast30: pageViewsByDay.reduce((sum, d) => sum + d.views, 0),
    viewsAllTime: Number(viewsRow.count),

    health: {
      dbOk: true,
      dbLatencyMs,
      uptimeSeconds: Math.round(process.uptime()),
      nodeVersion: process.version,
      env: process.env.NODE_ENV ?? "development",
      productCount: Number(healthCountsRow.product_count),
      orderCount: Number(healthCountsRow.order_count),
      pageViewCount: Number(healthCountsRow.page_view_count),
      lastOrderAt: lastOrderRow ? (lastOrderRow.created_at as string) : null,
    },
  };
}

// ---------------------------------------------------------------------
// Settings (site name/tagline/contact, home hero, policies)
// ---------------------------------------------------------------------

const SETTINGS_KEY = "site";

export async function getSettings(): Promise<SiteSettings> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT value FROM settings WHERE `key` = ? LIMIT 1",
    [SETTINGS_KEY]
  );
  const row = rows[0];
  if (!row) return DEFAULT_SETTINGS;
  try {
    return mergeSettings(JSON.parse(row.value));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(
  partial: Partial<SiteSettings>
): Promise<SiteSettings> {
  const current = await getSettings();
  const next = mergeSettings({ ...current, ...partial });
  const db = getPool();
  await db.query(
    "INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
    [SETTINGS_KEY, JSON.stringify(next)]
  );
  return next;
}

// ---------------------------------------------------------------------
// Pages (admin-authored, block-based CMS pages)
// ---------------------------------------------------------------------

export type Page = {
  id: number;
  slug: string;
  title: string;
  metaDescription: string | null;
  blocks: PageBlock[];
  showInNav: boolean;
  navLabel: string | null;
  navOrder: number;
  updatedAt: string;
};

type PageRow = {
  id: number;
  slug: string;
  title: string;
  meta_description: string | null;
  blocks_json: string;
  show_in_nav: number;
  nav_label: string | null;
  nav_order: number;
  updated_at: string;
};

function rowToPage(row: PageRow): Page {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    metaDescription: row.meta_description,
    blocks: JSON.parse(row.blocks_json),
    showInNav: !!row.show_in_nav,
    navLabel: row.nav_label,
    navOrder: row.nav_order,
    updatedAt: row.updated_at,
  };
}

export class PageError extends Error {}

export async function getAllPages(): Promise<Page[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM pages ORDER BY title"
  );
  return (rows as PageRow[]).map(rowToPage);
}

export async function getNavPages(): Promise<Page[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM pages WHERE show_in_nav = 1 ORDER BY nav_order ASC, title ASC"
  );
  return (rows as PageRow[]).map(rowToPage);
}

export async function getPageBySlug(slug: string): Promise<Page | undefined> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM pages WHERE slug = ? LIMIT 1",
    [slug]
  );
  const row = (rows as PageRow[])[0];
  return row ? rowToPage(row) : undefined;
}

export type PageInput = {
  slug: string;
  title: string;
  metaDescription?: string | null;
  blocks: PageBlock[];
  showInNav: boolean;
  navLabel?: string | null;
  navOrder: number;
};

export async function createPage(input: PageInput): Promise<Page> {
  const db = getPool();
  const [existing] = await db.query<mysql.RowDataPacket[]>(
    "SELECT slug FROM pages WHERE slug = ? LIMIT 1",
    [input.slug]
  );
  if (existing.length > 0) {
    throw new PageError(`A page with slug "${input.slug}" already exists.`);
  }

  await db.query(
    `INSERT INTO pages (slug, title, meta_description, blocks_json, show_in_nav, nav_label, nav_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.slug,
      input.title,
      input.metaDescription ?? null,
      JSON.stringify(input.blocks),
      input.showInNav ? 1 : 0,
      input.navLabel ?? null,
      input.navOrder,
    ]
  );

  const created = await getPageBySlug(input.slug);
  if (!created) throw new PageError("Failed to create page.");
  return created;
}

export async function updatePage(slug: string, input: PageInput): Promise<Page> {
  const db = getPool();

  if (input.slug !== slug) {
    const [existing] = await db.query<mysql.RowDataPacket[]>(
      "SELECT slug FROM pages WHERE slug = ? LIMIT 1",
      [input.slug]
    );
    if (existing.length > 0) {
      throw new PageError(`A page with slug "${input.slug}" already exists.`);
    }
  }

  const [result] = await db.query<mysql.ResultSetHeader>(
    `UPDATE pages SET
      slug = ?, title = ?, meta_description = ?, blocks_json = ?,
      show_in_nav = ?, nav_label = ?, nav_order = ?
     WHERE slug = ?`,
    [
      input.slug,
      input.title,
      input.metaDescription ?? null,
      JSON.stringify(input.blocks),
      input.showInNav ? 1 : 0,
      input.navLabel ?? null,
      input.navOrder,
      slug,
    ]
  );
  if (result.affectedRows === 0) {
    throw new PageError("Page not found.");
  }

  const updated = await getPageBySlug(input.slug);
  if (!updated) throw new PageError("Failed to update page.");
  return updated;
}

export async function deletePage(slug: string): Promise<void> {
  const db = getPool();
  const [result] = await db.query<mysql.ResultSetHeader>(
    "DELETE FROM pages WHERE slug = ?",
    [slug]
  );
  if (result.affectedRows === 0) {
    throw new PageError("Page not found.");
  }
}
