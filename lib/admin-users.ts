import crypto from "node:crypto";
import { cookies } from "next/headers";
import mysql from "mysql2/promise";
import { getPool } from "@/lib/db-pool";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/admin-auth";

// Named admin accounts, replacing the old single shared ADMIN_PASSWORD.
// Passwords are hashed with scrypt (Node's built-in, no extra
// dependency) — salt:hash, both hex — never stored or logged in the
// clear.

export type AdminRole = "admin" | "editor";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
};

export class AdminUserError extends Error {}

function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return Promise.resolve(false);
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      const expected = Buffer.from(hash, "hex");
      resolve(
        expected.length === derivedKey.length && crypto.timingSafeEqual(expected, derivedKey)
      );
    });
  });
}

function rowToUser(row: mysql.RowDataPacket): AdminUser {
  return {
    id: row.id as number,
    name: row.name as string,
    email: row.email as string,
    role: (row.role as AdminRole) ?? "admin",
    createdAt:
      row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

export async function getAdminUserCount(): Promise<number> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT COUNT(*) AS count FROM admin_users"
  );
  return Number(rows[0]?.count ?? 0);
}

async function getAdminRoleCount(role: AdminRole): Promise<number> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT COUNT(*) AS count FROM admin_users WHERE role = ?",
    [role]
  );
  return Number(rows[0]?.count ?? 0);
}

export async function getAllAdminUsers(): Promise<AdminUser[]> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT id, name, email, role, created_at FROM admin_users ORDER BY created_at ASC"
  );
  return rows.map(rowToUser);
}

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminUser | null> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT id, name, email, password_hash, role, created_at FROM admin_users WHERE email = ? LIMIT 1",
    [email.trim().toLowerCase()]
  );
  const row = rows[0];
  if (!row) return null;
  const valid = await verifyPassword(password, row.password_hash as string);
  return valid ? rowToUser(row) : null;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createAdminUser(input: {
  name: string;
  email: string;
  password: string;
  role?: AdminRole;
}): Promise<AdminUser> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const role: AdminRole = input.role === "editor" ? "editor" : "admin";
  if (!name) throw new AdminUserError("Name is required.");
  if (!EMAIL_PATTERN.test(email)) throw new AdminUserError("A valid email is required.");
  if (input.password.length < 8) {
    throw new AdminUserError("Password must be at least 8 characters.");
  }

  const db = getPool();
  const passwordHash = await hashPassword(input.password);
  try {
    const [result] = await db.query<mysql.ResultSetHeader>(
      "INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name, email, passwordHash, role]
    );
    return { id: result.insertId, name, email, role, createdAt: new Date().toISOString() };
  } catch (err) {
    if (err instanceof Error && (err as { code?: string }).code === "ER_DUP_ENTRY") {
      throw new AdminUserError("An admin with that email already exists.");
    }
    throw err;
  }
}

export async function deleteAdminUser(id: number): Promise<void> {
  const user = await getAdminUserById(id);
  if (!user) throw new AdminUserError("Admin user not found.");
  if (user.role === "admin" && (await getAdminRoleCount("admin")) <= 1) {
    throw new AdminUserError("Can't remove the last admin account.");
  }
  const db = getPool();
  const [result] = await db.query<mysql.ResultSetHeader>(
    "DELETE FROM admin_users WHERE id = ?",
    [id]
  );
  if (result.affectedRows === 0) {
    throw new AdminUserError("Admin user not found.");
  }
}

export async function changeAdminRole(id: number, role: AdminRole): Promise<void> {
  const user = await getAdminUserById(id);
  if (!user) throw new AdminUserError("Admin user not found.");
  if (user.role === "admin" && role === "editor" && (await getAdminRoleCount("admin")) <= 1) {
    throw new AdminUserError("Can't demote the last admin account.");
  }
  const db = getPool();
  const [result] = await db.query<mysql.ResultSetHeader>(
    "UPDATE admin_users SET role = ? WHERE id = ?",
    [role, id]
  );
  if (result.affectedRows === 0) {
    throw new AdminUserError("Admin user not found.");
  }
}

export async function changeAdminPassword(id: number, newPassword: string): Promise<void> {
  if (newPassword.length < 8) {
    throw new AdminUserError("Password must be at least 8 characters.");
  }
  const db = getPool();
  const passwordHash = await hashPassword(newPassword);
  const [result] = await db.query<mysql.ResultSetHeader>(
    "UPDATE admin_users SET password_hash = ? WHERE id = ?",
    [passwordHash, id]
  );
  if (result.affectedRows === 0) {
    throw new AdminUserError("Admin user not found.");
  }
}

export async function getAdminUserById(id: number): Promise<AdminUser | null> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT id, name, email, role, created_at FROM admin_users WHERE id = ? LIMIT 1",
    [id]
  );
  const row = rows[0];
  return row ? rowToUser(row) : null;
}

// Server-component convenience: who's logged in right now, straight
// from the request cookie. Used to show "Signed in as ..." in the
// admin nav — never a security boundary by itself, since middleware.ts
// already gates every /admin* route before a page component runs.
export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  const userId = await verifySessionToken(token);
  return userId ? getAdminUserById(userId) : null;
}
