import mysql from "mysql2/promise";
import { getPool } from "@/lib/db-pool";
import type { AdminUser } from "@/lib/admin-users";

// Append-only trail of admin mutations (item 11) — logged at the
// API-route level right after a mutation succeeds, not threaded
// through lib/db.ts function signatures, so adding a new logged action
// is a one-line addition at the call site rather than a signature
// change. Never throws: a failed audit write shouldn't undo or block
// the action it's describing.

export type AuditLogEntry = {
  id: number;
  adminUserId: number | null;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
};

function rowToEntry(row: mysql.RowDataPacket): AuditLogEntry {
  return {
    id: row.id,
    adminUserId: row.admin_user_id ?? null,
    adminName: row.admin_name,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id ?? null,
    details: row.details_json ?? null,
    createdAt: row.created_at,
  };
}

export async function logAdminAction(
  admin: AdminUser,
  action: string,
  entityType: string,
  entityId?: string | number | null,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const db = getPool();
    await db.query(
      "INSERT INTO admin_audit_log (admin_user_id, admin_name, action, entity_type, entity_id, details_json) VALUES (?, ?, ?, ?, ?, ?)",
      [
        admin.id,
        admin.name,
        action,
        entityType,
        entityId !== undefined && entityId !== null ? String(entityId) : null,
        details ? JSON.stringify(details) : null,
      ]
    );
  } catch (err) {
    console.error("[audit-log] Failed to record entry:", err);
  }
}

export async function getAuditLog(limit = 200): Promise<AuditLogEntry[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM admin_audit_log ORDER BY created_at DESC LIMIT ?",
    [limit]
  );
  return rows.map(rowToEntry);
}
