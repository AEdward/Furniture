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

  // Drop and recreate so schema changes (new columns) always take effect —
  // this seed script is dev/demo tooling, not a production migration path.
  await conn.query("SET FOREIGN_KEY_CHECKS = 0");
  await conn.query("DROP TABLE IF EXISTS order_items");
  await conn.query("DROP TABLE IF EXISTS orders");
  await conn.query("DROP TABLE IF EXISTS products");
  await conn.query("SET FOREIGN_KEY_CHECKS = 1");

  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await conn.query(schema);

  for (const p of PRODUCT_SEED) {
    await conn.query(
      `INSERT INTO products
        (id, slug, name, category, price, compare_at_price, description, details_json,
         icon, gradient, featured, is_new, stock,
         sku, availability, lead_time_days, rating, review_count,
         width_cm, depth_cm, height_cm, seat_height_cm, seat_depth_cm, arm_height_cm, leg_height_cm, weight_kg,
         frame_material, upholstery_material, legs_material, foam_density,
         colors_json, material_options_json, wood_options_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?,
               ?, ?, ?, ?, ?,
               ?, ?, ?, ?, ?,
               ?, ?, ?, ?, ?, ?, ?, ?,
               ?, ?, ?, ?,
               ?, ?, ?)`,
      [
        p.id,
        p.slug,
        p.name,
        p.category,
        p.price,
        p.compareAtPrice ?? null,
        p.description,
        JSON.stringify(p.details),
        p.icon,
        p.gradient,
        p.featured ? 1 : 0,
        p.new ? 1 : 0,
        p.stock,
        p.sku,
        p.availability,
        p.leadTimeDays ?? null,
        p.rating,
        p.reviewCount,
        p.dimensions.widthCm,
        p.dimensions.depthCm,
        p.dimensions.heightCm,
        p.dimensions.seatHeightCm ?? null,
        p.dimensions.seatDepthCm ?? null,
        p.dimensions.armHeightCm ?? null,
        p.dimensions.legHeightCm ?? null,
        p.dimensions.weightKg ?? null,
        p.materials.frame,
        p.materials.upholstery ?? null,
        p.materials.legs ?? null,
        p.materials.foamDensity ?? null,
        JSON.stringify(p.colors),
        JSON.stringify(p.materialOptions),
        JSON.stringify(p.woodOptions),
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
