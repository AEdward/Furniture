import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

import { PRODUCT_SEED } from "../lib/products";

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "furniture_app",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "furniture",
    multipleStatements: true,
  });

  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await conn.query(schema);

  await conn.query("DELETE FROM order_items");
  await conn.query("DELETE FROM orders");
  await conn.query("DELETE FROM products");

  for (const p of PRODUCT_SEED) {
    await conn.query(
      `INSERT INTO products
        (id, slug, name, category, price, compare_at_price, description, details_json, material, dimensions, icon, gradient, featured, is_new, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        p.slug,
        p.name,
        p.category,
        p.price,
        p.compareAtPrice ?? null,
        p.description,
        JSON.stringify(p.details),
        p.material,
        p.dimensions,
        p.icon,
        p.gradient,
        p.featured ? 1 : 0,
        p.new ? 1 : 0,
        p.stock,
      ]
    );
  }

  console.log(`Seeded ${PRODUCT_SEED.length} products.`);
  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
