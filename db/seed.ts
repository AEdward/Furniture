import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

import { PRODUCT_SEED } from "../lib/products";
import { DEFAULT_SETTINGS } from "../lib/settings";
import type { PageBlock } from "../lib/pages";

const ABOUT_PAGE_BLOCKS: PageBlock[] = [
  {
    type: "hero",
    heading: "Crafting Comfort & Elegance",
    subheading:
      "Golden Wood Furniture designs and builds high-quality wooden furniture for living rooms, bedrooms, dining spaces, and offices across Addis Ababa.",
    imageUrl: null,
    ctaLabel: "Shop the collection",
    ctaHref: "/shop",
  },
  {
    type: "richtext",
    heading: "Our story",
    body: "Golden Wood Furniture is a furniture company based in Addis Ababa, Ethiopia, specializing in the design and production of high-quality wooden furniture for homes and offices. We focus on combining modern design, durability, and comfort to create furniture that enhances living and working spaces.\n\nOur vision is to become one of the most trusted furniture brands in Ethiopia. Our mission is to provide high-quality furniture that combines beauty, comfort, and durability — built on quality craftsmanship, customer satisfaction, innovation in design, and honest business practices.",
  },
  {
    type: "imagetext",
    heading: "What we build",
    body: "From sofas and center tables to beds, wardrobes, dining sets, and office desks and chairs, every piece is crafted with attention to detail and quality materials — reliable craftsmanship that meets the needs of customers in Addis Ababa and beyond.",
    imageUrl: null,
    imagePosition: "right",
  },
];

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "furniture_app",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "goldenwood",
    multipleStatements: true,
  });

  // Drop and recreate so schema changes (new columns) always take effect —
  // this seed script is dev/demo tooling, not a production migration path.
  await conn.query("SET FOREIGN_KEY_CHECKS = 0");
  await conn.query("DROP TABLE IF EXISTS order_items");
  await conn.query("DROP TABLE IF EXISTS orders");
  await conn.query("DROP TABLE IF EXISTS products");
  await conn.query("DROP TABLE IF EXISTS settings");
  await conn.query("DROP TABLE IF EXISTS pages");
  await conn.query("DROP TABLE IF EXISTS page_views");
  await conn.query("DROP TABLE IF EXISTS translations");
  await conn.query("SET FOREIGN_KEY_CHECKS = 1");

  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await conn.query(schema);

  for (const p of PRODUCT_SEED) {
    await conn.query(
      `INSERT INTO products
        (id, slug, name, category, price, compare_at_price, description, details_json,
         icon, gradient, image_url, featured, is_new, stock,
         sku, availability, lead_time_days, rating, review_count,
         width_cm, depth_cm, height_cm, seat_height_cm, seat_depth_cm, arm_height_cm, leg_height_cm, weight_kg,
         frame_material, upholstery_material, legs_material, foam_density,
         colors_json, material_options_json, wood_options_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?,
               ?, ?, ?, ?, ?, ?,
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
        p.imageUrl ?? null,
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

  await conn.query("INSERT INTO settings (`key`, value) VALUES ('site', ?)", [
    JSON.stringify(DEFAULT_SETTINGS),
  ]);
  console.log("Seeded site settings.");

  await conn.query(
    `INSERT INTO pages (slug, title, meta_description, blocks_json, show_in_nav, nav_label, nav_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      "about",
      "Our Story",
      "How Golden Wood Furniture crafts living room, bedroom, dining, and office furniture in Addis Ababa.",
      JSON.stringify(ABOUT_PAGE_BLOCKS),
      1,
      "About",
      1,
    ]
  );
  console.log("Seeded About page.");

  // admin_users isn't in the drop list above (see schema.sql) so accounts
  // added via /admin/users survive a reseed — only bootstrap one if the
  // table is completely empty (e.g. first run).
  const [adminRows] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT COUNT(*) AS count FROM admin_users"
  );
  const adminCount = Number((adminRows as mysql.RowDataPacket[])[0]?.count ?? 0);
  if (adminCount === 0) {
    const bootstrapEmail = (process.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
    const bootstrapPassword = process.env.ADMIN_PASSWORD || "changeme";
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = await new Promise<Buffer>((resolve, reject) => {
      crypto.scrypt(bootstrapPassword, salt, 64, (err, key) => (err ? reject(err) : resolve(key)));
    });
    const passwordHash = `${salt}:${derivedKey.toString("hex")}`;
    await conn.query(
      "INSERT INTO admin_users (name, email, password_hash) VALUES (?, ?, ?)",
      ["Admin", bootstrapEmail, passwordHash]
    );
    console.log(`Seeded bootstrap admin: ${bootstrapEmail} (password from ADMIN_PASSWORD).`);
  } else {
    console.log(`Skipped admin bootstrap — ${adminCount} admin account(s) already exist.`);
  }

  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
