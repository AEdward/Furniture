import crypto from "node:crypto";
import { cookies } from "next/headers";
import mysql from "mysql2/promise";
import { getPool } from "@/lib/db-pool";
import { CUSTOMER_COOKIE_NAME, verifyCustomerSessionToken } from "@/lib/customer-auth";

// Storefront customer accounts — separate from lib/admin-users.ts, which
// is for /admin logins only. Same scrypt password hashing (salt:hash,
// both hex) as admin accounts.

export type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  createdAt: string;
};

export class CustomerError extends Error {}

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

function rowToCustomer(row: mysql.RowDataPacket): Customer {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    postalCode: row.postal_code ?? "",
    createdAt: row.created_at,
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createCustomer(input: {
  name: string;
  email: string;
  password: string;
}): Promise<Customer> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name) throw new CustomerError("Name is required.");
  if (!EMAIL_PATTERN.test(email)) throw new CustomerError("A valid email is required.");
  if (input.password.length < 8) {
    throw new CustomerError("Password must be at least 8 characters.");
  }

  const db = getPool();
  const passwordHash = await hashPassword(input.password);
  try {
    const [result] = await db.query<mysql.ResultSetHeader>(
      "INSERT INTO customers (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash]
    );
    return {
      id: result.insertId,
      name,
      email,
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    if (err instanceof Error && (err as { code?: string }).code === "ER_DUP_ENTRY") {
      throw new CustomerError("An account with that email already exists.");
    }
    throw err;
  }
}

export async function verifyCustomerCredentials(
  email: string,
  password: string
): Promise<Customer | null> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM customers WHERE email = ? LIMIT 1",
    [email.trim().toLowerCase()]
  );
  const row = rows[0];
  if (!row) return null;
  const valid = await verifyPassword(password, row.password_hash as string);
  return valid ? rowToCustomer(row) : null;
}

export async function updateCustomerProfile(
  id: number,
  input: { name: string; phone: string; address: string; city: string; postalCode: string }
): Promise<Customer> {
  const name = input.name.trim();
  if (!name) throw new CustomerError("Name is required.");

  const db = getPool();
  const [result] = await db.query<mysql.ResultSetHeader>(
    "UPDATE customers SET name = ?, phone = ?, address = ?, city = ?, postal_code = ? WHERE id = ?",
    [name, input.phone.trim(), input.address.trim(), input.city.trim(), input.postalCode.trim(), id]
  );
  if (result.affectedRows === 0) {
    throw new CustomerError("Account not found.");
  }
  const updated = await getCustomerById(id);
  if (!updated) throw new CustomerError("Account not found.");
  return updated;
}

// OTP-verified — the caller must have already confirmed a code sent to
// newEmail (see /api/account/settings/change-email) before calling this.
export async function changeCustomerEmail(id: number, newEmail: string): Promise<void> {
  const email = newEmail.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw new CustomerError("A valid email is required.");

  const db = getPool();
  try {
    const [result] = await db.query<mysql.ResultSetHeader>(
      "UPDATE customers SET email = ? WHERE id = ?",
      [email, id]
    );
    if (result.affectedRows === 0) {
      throw new CustomerError("Account not found.");
    }
  } catch (err) {
    if (err instanceof Error && (err as { code?: string }).code === "ER_DUP_ENTRY") {
      throw new CustomerError("An account with that email already exists.");
    }
    throw err;
  }
}

export async function changeCustomerPassword(id: number, newPassword: string): Promise<void> {
  if (newPassword.length < 8) {
    throw new CustomerError("Password must be at least 8 characters.");
  }
  const db = getPool();
  const passwordHash = await hashPassword(newPassword);
  const [result] = await db.query<mysql.ResultSetHeader>(
    "UPDATE customers SET password_hash = ? WHERE id = ?",
    [passwordHash, id]
  );
  if (result.affectedRows === 0) {
    throw new CustomerError("Account not found.");
  }
}

export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM customers WHERE email = ? LIMIT 1",
    [email.trim().toLowerCase()]
  );
  const row = rows[0];
  return row ? rowToCustomer(row) : null;
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    "SELECT * FROM customers WHERE id = ? LIMIT 1",
    [id]
  );
  const row = rows[0];
  return row ? rowToCustomer(row) : null;
}

// Server-component convenience: who's logged in right now, straight
// from the request cookie — never a security boundary by itself (each
// account API route re-derives the id from the same cookie itself).
export async function getCurrentCustomer(): Promise<Customer | null> {
  const token = cookies().get(CUSTOMER_COOKIE_NAME)?.value;
  const customerId = await verifyCustomerSessionToken(token);
  return customerId ? getCustomerById(customerId) : null;
}
