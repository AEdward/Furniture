import mysql from "mysql2/promise";
import type { Category, Product } from "@/lib/products";

let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "furniture_app",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "furniture",
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compare_at_price: number | null;
  description: string;
  details_json: string;
  material: string;
  dimensions: string;
  icon: string;
  gradient: string;
  featured: number;
  is_new: number;
  stock: number;
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
    material: row.material,
    dimensions: row.dimensions,
    icon: row.icon as Product["icon"],
    gradient: row.gradient,
    featured: !!row.featured,
    new: !!row.is_new,
    stock: row.stock,
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

export type OrderInput = {
  customerName: string;
  customerEmail: string;
  address: string;
  city: string;
  postalCode: string;
  items: { slug: string; quantity: number }[];
};

export type OrderResult = {
  id: number;
  subtotal: number;
  items: { slug: string; name: string; price: number; quantity: number }[];
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
      if (product.stock < item.quantity) {
        throw new OrderError(
          `Only ${product.stock} left of "${product.name}" — please update your cart.`
        );
      }

      await conn.query("UPDATE products SET stock = stock - ? WHERE slug = ?", [
        item.quantity,
        item.slug,
      ]);

      lineItems.push({
        slug: product.slug,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
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
        `INSERT INTO order_items (order_id, product_slug, name, price, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.slug, item.name, item.price, item.quantity]
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
  items: { slug: string; name: string; price: number; quantity: number }[];
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
    "SELECT product_slug, name, price, quantity FROM order_items WHERE order_id = ?",
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
    })),
  };
}
