import mysql from "mysql2/promise";
import { getPool } from "@/lib/db-pool";

// In-app notifications for both admin and customer accounts (item 3).
// recipient_id is an admin_users.id or customers.id depending on
// recipient_type — deliberately not FK'd (see db/schema.sql) so old
// notifications survive account deletion, same tradeoff as page_views.

export type NotificationType =
  | "new_order"
  | "new_message"
  | "new_review"
  | "low_stock"
  | "order_status"
  | "back_in_stock"
  | "review_approved";

export type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

function rowToNotification(row: mysql.RowDataPacket): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body ?? null,
    link: row.link ?? null,
    readAt: row.read_at ?? null,
    createdAt: row.created_at,
  };
}

type RecipientType = "admin" | "customer";

async function insertNotification(
  recipientType: RecipientType,
  recipientId: number,
  input: { type: NotificationType; title: string; body?: string | null; link?: string | null }
): Promise<void> {
  const db = getPool();
  await db.query(
    "INSERT INTO notifications (recipient_type, recipient_id, type, title, body, link) VALUES (?, ?, ?, ?, ?, ?)",
    [recipientType, recipientId, input.type, input.title, input.body ?? null, input.link ?? null]
  );
}

export async function notifyCustomer(
  customerId: number,
  input: { type: NotificationType; title: string; body?: string | null; link?: string | null }
): Promise<void> {
  try {
    await insertNotification("customer", customerId, input);
  } catch (err) {
    console.error("[notifications] Failed to notify customer:", err);
  }
}

// Fans out one row per current admin_users account. Best-effort — never
// throws, since a failed notification shouldn't block the action (order
// placed, message sent, etc.) that triggered it.
export async function notifyAllAdmins(input: {
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
}): Promise<void> {
  try {
    const db = getPool();
    const [rows] = await db.query<mysql.RowDataPacket[]>("SELECT id FROM admin_users");
    if (rows.length === 0) return;
    const values = rows.map((r) => [
      "admin",
      r.id,
      input.type,
      input.title,
      input.body ?? null,
      input.link ?? null,
    ]);
    await db.query(
      "INSERT INTO notifications (recipient_type, recipient_id, type, title, body, link) VALUES ?",
      [values]
    );
  } catch (err) {
    console.error("[notifications] Failed to notify admins:", err);
  }
}

export async function getNotifications(
  recipientType: RecipientType,
  recipientId: number,
  limit = 30
): Promise<Notification[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM notifications WHERE recipient_type = ? AND recipient_id = ? ORDER BY created_at DESC LIMIT ?",
    [recipientType, recipientId, limit]
  );
  return rows.map(rowToNotification);
}

export async function getUnreadNotificationCount(
  recipientType: RecipientType,
  recipientId: number
): Promise<number> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT COUNT(*) AS count FROM notifications WHERE recipient_type = ? AND recipient_id = ? AND read_at IS NULL",
    [recipientType, recipientId]
  );
  return Number(rows[0]?.count ?? 0);
}

// Scoped to (id, recipientType, recipientId) so one recipient can never
// mark another's notification read via a guessed id.
export async function markNotificationRead(
  id: number,
  recipientType: RecipientType,
  recipientId: number
): Promise<void> {
  const db = getPool();
  await db.query(
    "UPDATE notifications SET read_at = NOW() WHERE id = ? AND recipient_type = ? AND recipient_id = ? AND read_at IS NULL",
    [id, recipientType, recipientId]
  );
}

export async function markAllNotificationsRead(
  recipientType: RecipientType,
  recipientId: number
): Promise<void> {
  const db = getPool();
  await db.query(
    "UPDATE notifications SET read_at = NOW() WHERE recipient_type = ? AND recipient_id = ? AND read_at IS NULL",
    [recipientType, recipientId]
  );
}
