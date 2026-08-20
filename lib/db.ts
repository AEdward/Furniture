import mysql from "mysql2/promise";
import type { Availability, Category, IconName, Product } from "@/lib/products";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";
import { DEFAULT_SETTINGS, mergeSettings, type SiteSettings } from "@/lib/settings";
import type { PageBlock } from "@/lib/pages";
import { getPool } from "@/lib/db-pool";
import { sendEmail } from "@/lib/mailer";
import { backInStockEmail, orderConfirmationEmail, orderStatusUpdateEmail } from "@/lib/email-templates";
import { notifyAllAdmins, notifyCustomer } from "@/lib/notifications";

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
  images_json: string;
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
  low_stock_threshold: number;
  variant_images_json: string;
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
    images: row.images_json ? JSON.parse(row.images_json) : [],
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
    lowStockThreshold: row.low_stock_threshold,
    variantImages: row.variant_images_json ? JSON.parse(row.variant_images_json) : {},
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
  return withReviewAggregates((rows as ProductRow[]).map(rowToProduct));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM products WHERE featured = 1 ORDER BY name"
  );
  return withReviewAggregates((rows as ProductRow[]).map(rowToProduct));
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM products WHERE slug = ? LIMIT 1",
    [slug]
  );
  const row = (rows as ProductRow[])[0];
  if (!row) return undefined;
  const [withAgg] = await withReviewAggregates([rowToProduct(row)]);
  return withAgg;
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
  return withReviewAggregates((rows as ProductRow[]).map(rowToProduct));
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
  return withReviewAggregates((rows as ProductRow[]).map(rowToProduct));
}

export type PaymentMethod = "chapa" | "cod" | "bank_transfer";

export type OrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  postalCode: string;
  items: { slug: string; quantity: number; variant?: string }[];
  paymentMethod: PaymentMethod;
  couponCode?: string | null;
  // Set when the customer was logged in at checkout, so the order shows
  // up in their account order history. Guest checkout leaves this null —
  // login is never required to buy.
  customerId?: number | null;
  // Identifies "this browser's current checkout attempt" (see
  // lib/cart-context.tsx). If a still-pending order already exists for
  // this id, it's updated in place instead of inserting a new row —
  // that's what turns "payment failed, customer retries" into one
  // order, not a new one every attempt.
  cartSessionId: string | null;
};

export type OrderResult = {
  id: number;
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  items: { slug: string; name: string; price: number; quantity: number; variant?: string }[];
};

export class OrderError extends Error {}

// Only 'chapa' defers its stock decrement to confirmOrderPayment — it's
// the one method with an external redirect step that can be abandoned.
// 'cod'/'bank_transfer' commit immediately: there's no gateway hop to
// abandon, so the stock is reserved the moment the order is placed.
function decrementsStockImmediately(method: PaymentMethod): boolean {
  return method !== "chapa";
}

export async function createOrder(input: OrderInput): Promise<OrderResult> {
  if (input.items.length === 0) {
    throw new OrderError("Cart is empty.");
  }

  const db = getPool();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Resume a still-pending Chapa draft order for this browser, if one
    // exists, instead of creating a duplicate — that's what turns
    // "payment failed, customer retries" into one order, not a new one
    // every attempt. Deliberately scoped to payment_method = 'chapa'
    // only: for cod/bank_transfer, payment_status stays 'pending' for a
    // long time by design (waiting on cash/transfer confirmation) — that
    // pending order is a *committed, final* order, not an abandoned
    // draft, and must never be silently overwritten by a later,
    // unrelated checkout that happens to share the same browser. Chapa
    // never reserves stock for a pending order (see
    // decrementsStockImmediately), so there's nothing to restore here.
    let existingOrderId: number | null = null;
    if (input.cartSessionId) {
      const [draftRows] = await conn.query<mysql.RowDataPacket[]>(
        "SELECT id FROM orders WHERE cart_session_id = ? AND payment_method = 'chapa' AND payment_status = 'pending' FOR UPDATE",
        [input.cartSessionId]
      );
      const draft = draftRows[0];
      if (draft) {
        existingOrderId = draft.id;
        await conn.query("DELETE FROM order_items WHERE order_id = ?", [existingOrderId]);
      }
    }

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
      if (product.availability === "in_stock" && product.stock < item.quantity) {
        throw new OrderError(
          `Only ${product.stock} left of "${product.name}" — please update your cart.`
        );
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

    // Re-validated here rather than trusting whatever the client showed
    // during checkout — the coupon row is locked so a coupon can't be
    // oversold past max_uses by two orders racing to redeem it.
    let discountAmount = 0;
    let couponCode: string | null = null;
    if (input.couponCode) {
      const [couponRows] = await conn.query<mysql.RowDataPacket[]>(
        "SELECT * FROM coupons WHERE code = ? FOR UPDATE",
        [input.couponCode.trim().toUpperCase()]
      );
      const couponRow = couponRows[0];
      if (!couponRow) throw new OrderError("Invalid coupon code.");
      const coupon = rowToCoupon(couponRow);
      assertCouponUsable(coupon);
      discountAmount = computeCouponDiscount(coupon, subtotal);
      couponCode = coupon.code;
      await conn.query("UPDATE coupons SET used_count = used_count + 1 WHERE id = ?", [coupon.id]);
    }

    const lowStockAlerts: Product[] = [];
    if (decrementsStockImmediately(input.paymentMethod)) {
      for (const item of lineItems) {
        const { crossedLowStock, product } = await applyStockDelta(
          conn,
          item.slug,
          -item.quantity,
          "Sold (order placed)"
        );
        if (crossedLowStock && product) lowStockAlerts.push(product);
      }
    }

    let orderId: number;
    if (existingOrderId) {
      await conn.query(
        `UPDATE orders SET
          customer_id = ?, customer_name = ?, customer_email = ?, customer_phone = ?,
          address = ?, city = ?, postal_code = ?, subtotal = ?, coupon_code = ?, discount_amount = ?,
          payment_method = ?, payment_status = 'pending', payment_provider = NULL, payment_ref = NULL
         WHERE id = ?`,
        [
          input.customerId ?? null,
          input.customerName,
          input.customerEmail,
          input.customerPhone,
          input.address,
          input.city,
          input.postalCode,
          subtotal,
          couponCode,
          discountAmount,
          input.paymentMethod,
          existingOrderId,
        ]
      );
      orderId = existingOrderId;
    } else {
      const [orderResult] = await conn.query<mysql.ResultSetHeader>(
        `INSERT INTO orders
          (customer_id, customer_name, customer_email, customer_phone, address, city, postal_code, subtotal,
           coupon_code, discount_amount, status, payment_method, payment_status, cart_session_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'placed', ?, 'pending', ?)`,
        [
          input.customerId ?? null,
          input.customerName,
          input.customerEmail,
          input.customerPhone,
          input.address,
          input.city,
          input.postalCode,
          subtotal,
          couponCode,
          discountAmount,
          input.paymentMethod,
          input.cartSessionId,
        ]
      );
      orderId = orderResult.insertId;
    }

    for (const item of lineItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_slug, name, price, quantity, variant_label)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.slug, item.name, item.price, item.quantity, item.variant ?? null]
      );
    }

    await conn.commit();

    // Only for a genuinely new order — not a resumed Chapa draft (see
    // existingOrderId above), which would otherwise re-send this on
    // every retry after a failed payment.
    if (!existingOrderId) {
      const settings = await getSettings();
      await sendEmail({
        to: input.customerEmail,
        ...orderConfirmationEmail(
          {
            id: orderId,
            customerName: input.customerName,
            address: input.address,
            city: input.city,
            subtotal,
            discountAmount,
            items: lineItems,
          },
          settings
        ),
      });
      await notifyAllAdmins({
        type: "new_order",
        title: `New order #${orderId}`,
        body: `${input.customerName} — ${lineItems.length} item${lineItems.length === 1 ? "" : "s"}`,
        link: `/portal2026/orders/${orderId}`,
      });
    }
    for (const product of lowStockAlerts) {
      await notifyLowStock(product);
    }

    return { id: orderId, subtotal, discountAmount, couponCode, items: lineItems };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export type PaymentStatus = "pending" | "paid" | "failed";

export type Order = {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  postalCode: string;
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  status: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentProvider: string | null;
  paymentRef: string | null;
  paymentReceiptUrl: string | null;
  createdAt: string;
  items: { slug: string; name: string; price: number; quantity: number; variant?: string }[];
};

// The amount actually payable/charged — subtotal minus any coupon
// discount. Chapa is charged this, not the raw subtotal.
export function orderTotal(order: Pick<Order, "subtotal" | "discountAmount">): number {
  return Math.max(0, order.subtotal - order.discountAmount);
}

function rowToOrder(order: mysql.RowDataPacket, items: Order["items"]): Order {
  return {
    id: order.id,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    address: order.address,
    city: order.city,
    postalCode: order.postal_code,
    subtotal: order.subtotal,
    discountAmount: order.discount_amount ?? 0,
    couponCode: order.coupon_code ?? null,
    status: order.status,
    paymentMethod: order.payment_method as PaymentMethod,
    paymentStatus: order.payment_status as PaymentStatus,
    paymentProvider: order.payment_provider ?? null,
    paymentRef: order.payment_ref ?? null,
    paymentReceiptUrl: order.payment_receipt_url ?? null,
    createdAt: order.created_at,
    items,
  };
}

async function getOrderItems(id: number): Promise<Order["items"]> {
  const db = getPool();
  const [itemRows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT product_slug, name, price, quantity, variant_label FROM order_items WHERE order_id = ?",
    [id]
  );
  return (itemRows as mysql.RowDataPacket[]).map((r) => ({
    slug: r.product_slug,
    name: r.name,
    price: r.price,
    quantity: r.quantity,
    variant: r.variant_label ?? undefined,
  }));
}

export async function getOrderById(id: number): Promise<Order | undefined> {
  const db = getPool();
  const [orderRows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM orders WHERE id = ? LIMIT 1",
    [id]
  );
  const order = orderRows[0];
  if (!order) return undefined;
  return rowToOrder(order, await getOrderItems(id));
}

export async function getOrderByPaymentRef(paymentRef: string): Promise<Order | undefined> {
  const db = getPool();
  const [orderRows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM orders WHERE payment_ref = ? LIMIT 1",
    [paymentRef]
  );
  const order = orderRows[0];
  if (!order) return undefined;
  return rowToOrder(order, await getOrderItems(order.id));
}

// Called right before redirecting the customer to Chapa's hosted
// checkout, so the webhook (which only carries tx_ref) can look up
// which order it belongs to.
export async function setOrderPaymentRef(
  orderId: number,
  provider: string,
  paymentRef: string
): Promise<void> {
  const db = getPool();
  const [result] = await db.query<mysql.ResultSetHeader>(
    "UPDATE orders SET payment_provider = ?, payment_ref = ? WHERE id = ?",
    [provider, paymentRef, orderId]
  );
  if (result.affectedRows === 0) {
    throw new OrderError("Order not found.");
  }
}

// Idempotent: safe to call more than once for the same order (the
// return-URL page and the webhook can both race to confirm the same
// payment — whichever gets there first wins, the other is a no-op).
// Used for both Chapa's auto-confirm (webhook/return-URL verify) and
// the admin's manual "Mark as paid" action (cod/bank_transfer).
//
// Stock is only decremented here for 'chapa' orders — 'cod'/
// 'bank_transfer' already reserved it at order-creation time (see
// createOrder), so decrementing again here would double-count it.
// Chapa's decrement is floored at zero rather than re-validated
// strictly, since the money has already been captured by this point —
// an oversell caught here is a rare edge case for manual follow-up, not
// something to bounce a paid customer over.
export async function confirmOrderPayment(
  orderId: number,
  provider: string,
  paymentRef: string | null
): Promise<{ alreadyConfirmed: boolean }> {
  const db = getPool();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [orderRows] = await conn.query<mysql.RowDataPacket[]>(
      "SELECT id, payment_status, payment_method FROM orders WHERE id = ? FOR UPDATE",
      [orderId]
    );
    const order = orderRows[0];
    if (!order) throw new OrderError("Order not found.");

    if (order.payment_status === "paid") {
      await conn.commit();
      return { alreadyConfirmed: true };
    }

    const lowStockAlerts: Product[] = [];
    if (!decrementsStockImmediately(order.payment_method as PaymentMethod)) {
      const [itemRows] = await conn.query<mysql.RowDataPacket[]>(
        "SELECT product_slug, quantity FROM order_items WHERE order_id = ?",
        [orderId]
      );
      for (const item of itemRows) {
        const { crossedLowStock, product } = await applyStockDelta(
          conn,
          item.product_slug,
          -item.quantity,
          "Sold (payment confirmed)"
        );
        if (crossedLowStock && product) lowStockAlerts.push(product);
      }
    }

    await conn.query(
      "UPDATE orders SET payment_status = 'paid', payment_provider = ?, payment_ref = ? WHERE id = ?",
      [provider, paymentRef, orderId]
    );

    await conn.commit();
    for (const product of lowStockAlerts) {
      await notifyLowStock(product);
    }
    return { alreadyConfirmed: false };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Restores any stock the order had reserved (cod/bank_transfer decrement
// immediately at creation; chapa never reserved anything for a pending
// order, so there's nothing to give back there). Only downgrades from
// 'pending' — never overwrites an already-paid order.
export async function markOrderPaymentFailed(
  orderId: number,
  paymentRef: string | null
): Promise<void> {
  const db = getPool();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [orderRows] = await conn.query<mysql.RowDataPacket[]>(
      "SELECT id, payment_status, payment_method FROM orders WHERE id = ? FOR UPDATE",
      [orderId]
    );
    const order = orderRows[0];
    if (!order || order.payment_status !== "pending") {
      await conn.commit();
      return;
    }

    if (decrementsStockImmediately(order.payment_method as PaymentMethod)) {
      const [itemRows] = await conn.query<mysql.RowDataPacket[]>(
        "SELECT product_slug, quantity FROM order_items WHERE order_id = ?",
        [orderId]
      );
      for (const item of itemRows) {
        await applyStockDelta(conn, item.product_slug, item.quantity, "Restocked (payment failed)");
      }
    }

    await conn.query(
      "UPDATE orders SET payment_status = 'failed', payment_ref = ? WHERE id = ?",
      [paymentRef, orderId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Customer-uploaded proof of a bank transfer, for a shop owner to check
// before marking the order paid. Callers are expected to have already
// verified the order belongs to this customer (see trackOrder) and that
// it's actually a bank_transfer order.
export async function setOrderPaymentReceipt(orderId: number, url: string): Promise<void> {
  const db = getPool();
  const [result] = await db.query<mysql.ResultSetHeader>(
    "UPDATE orders SET payment_receipt_url = ? WHERE id = ?",
    [url, orderId]
  );
  if (result.affectedRows === 0) throw new OrderError("Order not found.");

  await notifyAllAdmins({
    type: "payment_receipt",
    title: `Receipt uploaded for order #${orderId}`,
    body: "A bank transfer receipt was uploaded — review it before marking the order paid.",
    link: `/portal2026/orders/${orderId}`,
  });
}

// ---------------------------------------------------------------------
// Admin: orders
// ---------------------------------------------------------------------

export type OrderSummary = {
  id: number;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  discountAmount: number;
  status: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  itemCount: number;
};

export async function getAllOrders(): Promise<OrderSummary[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    `SELECT o.id, o.customer_name, o.customer_email, o.subtotal, o.discount_amount, o.status,
            o.payment_method, o.payment_status, o.created_at,
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
    discountAmount: r.discount_amount ?? 0,
    status: r.status,
    paymentMethod: r.payment_method as PaymentMethod,
    paymentStatus: r.payment_status as PaymentStatus,
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

  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT customer_id, customer_name, customer_email FROM orders WHERE id = ?",
    [id]
  );
  const order = rows[0];
  if (order) {
    const settings = await getSettings();
    await sendEmail({
      to: order.customer_email,
      ...orderStatusUpdateEmail({ id, customerName: order.customer_name, status }, settings),
    });
    if (order.customer_id) {
      await notifyCustomer(order.customer_id, {
        type: "order_status",
        title: `Order #${id} is now "${status}"`,
        link: `/account/orders`,
      });
    }
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
  images?: string[];
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
  lowStockThreshold?: number;
  variantImages?: Record<string, string>;
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
    JSON.stringify(input.images ?? []),
    input.lowStockThreshold ?? 5,
    JSON.stringify(input.variantImages ?? {}),
  ];
}

const PRODUCT_INSERT_PLACEHOLDERS = Array(35).fill("?").join(", ");

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
       colors_json, material_options_json, wood_options_json, images_json,
       low_stock_threshold, variant_images_json)
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

  const before = await getProductBySlug(slug);

  const [result] = await db.query<mysql.ResultSetHeader>(
    `UPDATE products SET
      id = ?, slug = ?, name = ?, category = ?, price = ?, compare_at_price = ?,
      description = ?, details_json = ?, icon = ?, gradient = ?, image_url = ?, featured = ?, is_new = ?, stock = ?,
      sku = ?, availability = ?, lead_time_days = ?, rating = ?, review_count = ?,
      width_cm = ?, depth_cm = ?, height_cm = ?, seat_height_cm = ?, seat_depth_cm = ?,
      arm_height_cm = ?, leg_height_cm = ?, weight_kg = ?,
      frame_material = ?, upholstery_material = ?, legs_material = ?, foam_density = ?,
      colors_json = ?, material_options_json = ?, wood_options_json = ?, images_json = ?,
      low_stock_threshold = ?, variant_images_json = ?
     WHERE slug = ?`,
    [input.slug, input.slug, ...productInputParams(input), slug]
  );
  if (result.affectedRows === 0) {
    throw new ProductError("Product not found.");
  }

  const updated = await getProductBySlug(input.slug);
  if (!updated) throw new ProductError("Failed to update product.");

  if (before && before.availability === "out_of_stock" && updated.availability !== "out_of_stock") {
    await notifyBackInStock(updated);
  }

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

// Used by the admin products page's "select all/some, delete" bulk
// action. Order/order_items keep their own snapshot of product name,
// price, etc. (see db/schema.sql) rather than a foreign key to
// products, so deleting a product here never touches past orders.
export async function deleteProducts(slugs: string[]): Promise<number> {
  if (slugs.length === 0) return 0;
  const db = getPool();
  const [result] = await db.query<mysql.ResultSetHeader>(
    "DELETE FROM products WHERE slug IN (?)",
    [slugs]
  );
  return result.affectedRows;
}

// ---------------------------------------------------------------------
// Admin: stock management
// ---------------------------------------------------------------------

export type StockAdjustment = {
  id: number;
  delta: number;
  reason: string;
  adminUserId: number | null;
  createdAt: string;
};

function rowToStockAdjustment(row: mysql.RowDataPacket): StockAdjustment {
  return {
    id: row.id,
    delta: row.delta,
    reason: row.reason,
    adminUserId: row.admin_user_id ?? null,
    createdAt: row.created_at,
  };
}

// Applies a stock delta to a product on a given connection (so it can
// participate in the caller's transaction, e.g. an order being placed),
// logs it to stock_adjustments, and reports whether the change just
// crossed the product's low-stock threshold from above it to at-or-
// below it — so the caller notifies admins once per dip, not on every
// sale while a product is already low. A no-op for made-to-order/
// out-of-stock items, which aren't tracked against a stock count.
async function applyStockDelta(
  conn: mysql.PoolConnection,
  slug: string,
  delta: number,
  reason: string,
  adminUserId: number | null = null
): Promise<{ crossedLowStock: boolean; product?: Product }> {
  const [rows] = await conn.query<mysql.RowDataPacket[]>(
    "SELECT * FROM products WHERE slug = ? FOR UPDATE",
    [slug]
  );
  const row = rows[0] as ProductRow | undefined;
  if (!row || row.availability !== "in_stock") return { crossedLowStock: false };

  const before = row.stock;
  const after = Math.max(0, before + delta);
  await conn.query("UPDATE products SET stock = ? WHERE id = ?", [after, row.id]);
  await conn.query(
    "INSERT INTO stock_adjustments (product_id, delta, reason, admin_user_id) VALUES (?, ?, ?, ?)",
    [row.id, after - before, reason, adminUserId]
  );

  const crossedLowStock = before > row.low_stock_threshold && after <= row.low_stock_threshold;
  return {
    crossedLowStock,
    product: crossedLowStock ? rowToProduct({ ...row, stock: after }) : undefined,
  };
}

async function notifyLowStock(product: Product): Promise<void> {
  await notifyAllAdmins({
    type: "low_stock",
    title: `${product.name} is low on stock`,
    body: `Only ${product.stock} left (threshold: ${product.lowStockThreshold ?? 5}).`,
    link: `/portal2026/products/${product.slug}/edit`,
  });
}

// Manual restock/correction from /portal2026/products/[slug]/stock — always
// runs on its own short transaction (never shares one with an order).
export async function adjustProductStock(
  slug: string,
  delta: number,
  reason: string,
  adminUserId: number | null
): Promise<Product> {
  const db = getPool();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query<mysql.RowDataPacket[]>(
      "SELECT id FROM products WHERE slug = ? LIMIT 1",
      [slug]
    );
    if (!rows[0]) throw new ProductError("Product not found.");

    const { crossedLowStock, product } = await applyStockDelta(conn, slug, delta, reason, adminUserId);
    await conn.commit();

    if (crossedLowStock && product) {
      await notifyLowStock(product);
    }
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  const updated = await getProductBySlug(slug);
  if (!updated) throw new ProductError("Product not found.");
  return updated;
}

export async function getStockAdjustments(productSlug: string): Promise<StockAdjustment[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    `SELECT sa.* FROM stock_adjustments sa
     JOIN products p ON p.id = sa.product_id
     WHERE p.slug = ?
     ORDER BY sa.created_at DESC
     LIMIT 50`,
    [productSlug]
  );
  return rows.map(rowToStockAdjustment);
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

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = getPool();

  const [[productCountRow]] = await db.query<mysql.RowDataPacket[]>(
    "SELECT COUNT(*) AS count FROM products"
  );
  const [[orderStatsRow]] = await db.query<mysql.RowDataPacket[]>(
    "SELECT COUNT(*) AS count, COALESCE(SUM(subtotal), 0) AS revenue FROM orders WHERE status != 'cancelled' AND payment_status = 'paid'"
  );
  const [lowStockRows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM products WHERE availability = 'in_stock' AND stock <= low_stock_threshold ORDER BY stock ASC LIMIT 8"
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
       WHERE status != 'cancelled' AND payment_status = 'paid' AND created_at >= ?
       GROUP BY day`,
      [since]
    ),
    db.query<mysql.RowDataPacket[]>(
      "SELECT status, COUNT(*) AS count FROM orders WHERE payment_status = 'paid' GROUP BY status"
    ),
    db.query<mysql.RowDataPacket[]>(
      `SELECT oi.product_slug AS slug, oi.name, SUM(oi.quantity) AS units, SUM(oi.price * oi.quantity) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.payment_status = 'paid'
       GROUP BY oi.product_slug, oi.name
       ORDER BY revenue DESC
       LIMIT 5`
    ),
    db.query<mysql.RowDataPacket[]>(
      `SELECT COALESCE(p.category, 'Other') AS category, SUM(oi.price * oi.quantity) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       LEFT JOIN products p ON p.slug = oi.product_slug
       WHERE o.payment_status = 'paid'
       GROUP BY category
       ORDER BY revenue DESC`
    ),
    db.query<mysql.RowDataPacket[]>(
      "SELECT COUNT(*) AS count, COALESCE(SUM(subtotal), 0) AS revenue FROM orders WHERE status != 'cancelled' AND payment_status = 'paid'"
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

// ---------------------------------------------------------------------
// Contact messages (public contact form submissions)
// ---------------------------------------------------------------------

export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  message: string;
  readAt: string | null;
  createdAt: string;
};

export class ContactMessageError extends Error {}

function rowToContactMessage(row: mysql.RowDataPacket): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export async function createContactMessage(input: {
  name: string;
  email: string;
  message: string;
}): Promise<ContactMessage> {
  const db = getPool();
  const [result] = await db.query<mysql.ResultSetHeader>(
    "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
    [input.name, input.email, input.message]
  );
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT id, name, email, message, read_at, created_at FROM contact_messages WHERE id = ?",
    [result.insertId]
  );
  await notifyAllAdmins({
    type: "new_message",
    title: `New message from ${input.name}`,
    body: input.message.slice(0, 140),
    link: "/portal2026/messages",
  });
  return rowToContactMessage(rows[0]);
}

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT id, name, email, message, read_at, created_at FROM contact_messages ORDER BY created_at DESC"
  );
  return rows.map(rowToContactMessage);
}

export async function getUnreadContactMessageCount(): Promise<number> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT COUNT(*) AS count FROM contact_messages WHERE read_at IS NULL"
  );
  return Number(rows[0]?.count ?? 0);
}

export async function markContactMessageRead(id: number): Promise<void> {
  const db = getPool();
  const [result] = await db.query<mysql.ResultSetHeader>(
    "UPDATE contact_messages SET read_at = NOW() WHERE id = ? AND read_at IS NULL",
    [id]
  );
  if (result.affectedRows === 0) {
    const [rows] = await db.query<mysql.RowDataPacket[]>(
      "SELECT id FROM contact_messages WHERE id = ?",
      [id]
    );
    if (!rows[0]) throw new ContactMessageError("Message not found.");
  }
}

export async function deleteContactMessage(id: number): Promise<void> {
  const db = getPool();
  const [result] = await db.query<mysql.ResultSetHeader>(
    "DELETE FROM contact_messages WHERE id = ?",
    [id]
  );
  if (result.affectedRows === 0) {
    throw new ContactMessageError("Message not found.");
  }
}

// ---------------------------------------------------------------------
// Reviews (customer-submitted, moderated before showing publicly)
// ---------------------------------------------------------------------

export type Review = {
  id: number;
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
};

export class ReviewError extends Error {}

function rowToReview(row: mysql.RowDataPacket): Review {
  return {
    id: row.id,
    productId: row.product_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    rating: row.rating,
    comment: row.comment,
    approved: !!row.approved,
    createdAt: row.created_at,
  };
}

export async function createReview(input: {
  productId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
}): Promise<Review> {
  const db = getPool();
  const [result] = await db.query<mysql.ResultSetHeader>(
    "INSERT INTO reviews (product_id, customer_name, customer_email, rating, comment) VALUES (?, ?, ?, ?, ?)",
    [input.productId, input.customerName, input.customerEmail, input.rating, input.comment]
  );
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM reviews WHERE id = ?",
    [result.insertId]
  );
  await notifyAllAdmins({
    type: "new_review",
    title: `New review from ${input.customerName}`,
    body: `${input.rating}★ — ${input.comment.slice(0, 120)}`,
    link: "/portal2026/reviews",
  });
  return rowToReview(rows[0]);
}

export async function getApprovedReviews(productId: string): Promise<Review[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM reviews WHERE product_id = ? AND approved = 1 ORDER BY created_at DESC",
    [productId]
  );
  return rows.map(rowToReview);
}

export async function getAllReviews(): Promise<(Review & { productName: string; productSlug: string })[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    `SELECT r.*, p.name AS product_name, p.slug AS product_slug
     FROM reviews r
     JOIN products p ON p.id = r.product_id
     ORDER BY r.created_at DESC`
  );
  return rows.map((row) => ({
    ...rowToReview(row),
    productName: row.product_name,
    productSlug: row.product_slug,
  }));
}

export async function setReviewApproved(id: number, approved: boolean): Promise<void> {
  const db = getPool();
  const [result] = await db.query<mysql.ResultSetHeader>(
    "UPDATE reviews SET approved = ? WHERE id = ?",
    [approved ? 1 : 0, id]
  );
  if (result.affectedRows === 0) {
    throw new ReviewError("Review not found.");
  }

  if (approved) {
    const [reviewRows] = await db.query<mysql.RowDataPacket[]>(
      "SELECT customer_email FROM reviews WHERE id = ?",
      [id]
    );
    const email = reviewRows[0]?.customer_email as string | undefined;
    if (email) {
      const [customerRows] = await db.query<mysql.RowDataPacket[]>(
        "SELECT id FROM customers WHERE email = ? LIMIT 1",
        [email.trim().toLowerCase()]
      );
      const customerId = customerRows[0]?.id as number | undefined;
      if (customerId) {
        await notifyCustomer(customerId, {
          type: "review_approved",
          title: "Your review is now live",
          link: "/account",
        });
      }
    }
  }
}

export async function deleteReview(id: number): Promise<void> {
  const db = getPool();
  const [result] = await db.query<mysql.ResultSetHeader>(
    "DELETE FROM reviews WHERE id = ?",
    [id]
  );
  if (result.affectedRows === 0) {
    throw new ReviewError("Review not found.");
  }
}

// Overlays real approved-review averages onto products that have them,
// leaving the seeded rating/reviewCount as a fallback for products with
// no submissions yet (so the catalog doesn't suddenly look empty).
async function withReviewAggregates(products: Product[]): Promise<Product[]> {
  if (products.length === 0) return products;
  const db = getPool();
  const ids = products.map((p) => p.id);
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    `SELECT product_id, AVG(rating) AS avg_rating, COUNT(*) AS cnt
     FROM reviews
     WHERE approved = 1 AND product_id IN (?)
     GROUP BY product_id`,
    [ids]
  );
  const byProduct = new Map<string, { rating: number; count: number }>();
  for (const row of rows) {
    byProduct.set(row.product_id, { rating: Number(row.avg_rating), count: Number(row.cnt) });
  }
  return products.map((p) => {
    const agg = byProduct.get(p.id);
    if (!agg) return p;
    return { ...p, rating: Math.round(agg.rating * 10) / 10, reviewCount: agg.count };
  });
}

// ---------------------------------------------------------------------
// Back-in-stock notifications
// ---------------------------------------------------------------------

export class BackInStockError extends Error {}

export async function createBackInStockRequest(
  productSlug: string,
  email: string
): Promise<void> {
  const product = await getProductBySlug(productSlug);
  if (!product) throw new BackInStockError("Product not found.");

  const db = getPool();
  try {
    await db.query(
      "INSERT INTO back_in_stock_requests (product_id, email) VALUES (?, ?)",
      [product.id, email]
    );
  } catch (err) {
    if (err instanceof Error && (err as { code?: string }).code === "ER_DUP_ENTRY") {
      // Already signed up for this product — not an error from the
      // customer's point of view, just a no-op.
      return;
    }
    throw err;
  }
}

// Emails everyone who asked to be notified for this product, then marks
// them notified so a later availability flap doesn't re-email them.
// Called from updateProduct() the moment availability moves away from
// out_of_stock — never throws, since a failed notification pass
// shouldn't block the product edit that triggered it.
async function notifyBackInStock(product: Product): Promise<void> {
  try {
    const db = getPool();
    const [rows] = await db.query<mysql.RowDataPacket[]>(
      "SELECT id, email FROM back_in_stock_requests WHERE product_id = ? AND notified_at IS NULL",
      [product.id]
    );
    if (rows.length === 0) return;

    const settings = await getSettings();
    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
    const productUrl = `${baseUrl}/shop/${product.slug}`;
    const template = backInStockEmail(product.name, productUrl, settings);

    for (const row of rows) {
      await sendEmail({ to: row.email, ...template });
      const [customerRows] = await db.query<mysql.RowDataPacket[]>(
        "SELECT id FROM customers WHERE email = ? LIMIT 1",
        [String(row.email).trim().toLowerCase()]
      );
      const customerId = customerRows[0]?.id as number | undefined;
      if (customerId) {
        await notifyCustomer(customerId, {
          type: "back_in_stock",
          title: `${product.name} is back in stock`,
          link: `/shop/${product.slug}`,
        });
      }
    }

    const ids = rows.map((r) => r.id);
    await db.query("UPDATE back_in_stock_requests SET notified_at = NOW() WHERE id IN (?)", [ids]);
  } catch (err) {
    console.error("[back-in-stock] Failed to send notifications:", err);
  }
}

// ---------------------------------------------------------------------
// Coupons (admin-managed discount codes)
// ---------------------------------------------------------------------

export type Coupon = {
  id: number;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  active: boolean;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
};

export class CouponError extends Error {}

function rowToCoupon(row: mysql.RowDataPacket): Coupon {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    active: !!row.active,
    maxUses: row.max_uses ?? null,
    usedCount: row.used_count,
    expiresAt: row.expires_at ?? null,
    createdAt: row.created_at,
  };
}

function assertCouponUsable(coupon: Coupon): void {
  if (!coupon.active) throw new CouponError("This coupon is no longer active.");
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    throw new CouponError("This coupon has expired.");
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new CouponError("This coupon has reached its usage limit.");
  }
}

export function computeCouponDiscount(coupon: Coupon, subtotal: number): number {
  const raw =
    coupon.discountType === "percent"
      ? Math.round((subtotal * coupon.discountValue) / 100)
      : coupon.discountValue;
  return Math.max(0, Math.min(raw, subtotal));
}

// Preview-only — validates and computes the discount without consuming
// a use. Used by the checkout page's "Apply" button before the order
// actually exists; createOrder() re-validates for real inside its
// transaction, since a client-supplied discount is never trusted.
export async function previewCoupon(
  code: string,
  subtotal: number
): Promise<{ coupon: Coupon; discountAmount: number }> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM coupons WHERE code = ? LIMIT 1",
    [code.trim().toUpperCase()]
  );
  const row = rows[0];
  if (!row) throw new CouponError("Invalid coupon code.");
  const coupon = rowToCoupon(row);
  assertCouponUsable(coupon);
  return { coupon, discountAmount: computeCouponDiscount(coupon, subtotal) };
}

export async function getAllCoupons(): Promise<Coupon[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM coupons ORDER BY created_at DESC"
  );
  return rows.map(rowToCoupon);
}

export async function createCoupon(input: {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  maxUses: number | null;
  expiresAt: string | null;
}): Promise<Coupon> {
  const code = input.code.trim().toUpperCase();
  if (!code) throw new CouponError("Code is required.");
  if (!Number.isFinite(input.discountValue) || input.discountValue <= 0) {
    throw new CouponError("Discount value must be a positive number.");
  }
  if (input.discountType === "percent" && input.discountValue > 100) {
    throw new CouponError("Percent discount can't exceed 100.");
  }

  const db = getPool();
  try {
    const [result] = await db.query<mysql.ResultSetHeader>(
      "INSERT INTO coupons (code, discount_type, discount_value, max_uses, expires_at) VALUES (?, ?, ?, ?, ?)",
      [code, input.discountType, input.discountValue, input.maxUses, input.expiresAt]
    );
    const [rows] = await db.query<mysql.RowDataPacket[]>("SELECT * FROM coupons WHERE id = ?", [
      result.insertId,
    ]);
    return rowToCoupon(rows[0]);
  } catch (err) {
    if (err instanceof Error && (err as { code?: string }).code === "ER_DUP_ENTRY") {
      throw new CouponError(`A coupon with code "${code}" already exists.`);
    }
    throw err;
  }
}

export async function setCouponActive(id: number, active: boolean): Promise<void> {
  const db = getPool();
  const [result] = await db.query<mysql.ResultSetHeader>(
    "UPDATE coupons SET active = ? WHERE id = ?",
    [active ? 1 : 0, id]
  );
  if (result.affectedRows === 0) throw new CouponError("Coupon not found.");
}

export async function deleteCoupon(id: number): Promise<void> {
  const db = getPool();
  const [result] = await db.query<mysql.ResultSetHeader>("DELETE FROM coupons WHERE id = ?", [id]);
  if (result.affectedRows === 0) throw new CouponError("Coupon not found.");
}

// ---------------------------------------------------------------------
// Customer accounts: order history, wishlist, public order tracking
// ---------------------------------------------------------------------

export async function getOrdersByCustomerId(customerId: number): Promise<OrderSummary[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    `SELECT o.id, o.customer_name, o.customer_email, o.subtotal, o.discount_amount, o.status,
            o.payment_method, o.payment_status, o.created_at,
            COALESCE(SUM(oi.quantity), 0) AS item_count
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.customer_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [customerId]
  );
  return rows.map((r) => ({
    id: r.id,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    subtotal: r.subtotal,
    discountAmount: r.discount_amount ?? 0,
    status: r.status,
    paymentMethod: r.payment_method as PaymentMethod,
    paymentStatus: r.payment_status as PaymentStatus,
    createdAt: r.created_at,
    itemCount: Number(r.item_count),
  }));
}

// Public lookup for guest checkout customers — requires both the order
// id and the email it was placed under, so a sequential id can't be
// used to browse other people's orders.
export async function trackOrder(id: number, email: string): Promise<Order | undefined> {
  const order = await getOrderById(id);
  if (!order) return undefined;
  return order.customerEmail.toLowerCase() === email.trim().toLowerCase() ? order : undefined;
}

export type WishlistProduct = Product & { wishlistedAt: string };

export async function getWishlist(customerId: number): Promise<WishlistProduct[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    `SELECT p.*, w.created_at AS wishlisted_at
     FROM wishlist_items w
     JOIN products p ON p.id = w.product_id
     WHERE w.customer_id = ?
     ORDER BY w.created_at DESC`,
    [customerId]
  );
  const products = await withReviewAggregates(
    (rows as (ProductRow & { wishlisted_at: string })[]).map(rowToProduct)
  );
  return products.map((p, i) => ({ ...p, wishlistedAt: (rows[i] as { wishlisted_at: string }).wishlisted_at }));
}

export async function getWishlistProductIds(customerId: number): Promise<string[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT product_id FROM wishlist_items WHERE customer_id = ?",
    [customerId]
  );
  return rows.map((r) => r.product_id);
}

export async function addToWishlist(customerId: number, productSlug: string): Promise<void> {
  const product = await getProductBySlug(productSlug);
  if (!product) throw new ProductError("Product not found.");
  const db = getPool();
  await db.query(
    "INSERT IGNORE INTO wishlist_items (customer_id, product_id) VALUES (?, ?)",
    [customerId, product.id]
  );
}

export async function removeFromWishlist(customerId: number, productSlug: string): Promise<void> {
  const product = await getProductBySlug(productSlug);
  if (!product) throw new ProductError("Product not found.");
  const db = getPool();
  await db.query("DELETE FROM wishlist_items WHERE customer_id = ? AND product_id = ?", [
    customerId,
    product.id,
  ]);
}
