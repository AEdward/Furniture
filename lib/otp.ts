import crypto from "node:crypto";
import mysql from "mysql2/promise";
import { getPool } from "@/lib/db-pool";

// One-time codes shared by both account systems (see db/schema.sql's
// otp_codes) — used for password-reset and email-change verification,
// mailed via lib/mailer.ts (sendEmail is itself a no-op when SMTP_* is
// unset, same as every other transactional email in this app).

export type OtpPurpose = "password_reset" | "email_change";
export type OtpAccountType = "customer" | "admin";

const OTP_TTL_MS = 10 * 60 * 1000;

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

// Generates and stores a 6-digit code, returning the plaintext code to
// email to the user — never stored in the clear.
export async function createOtp(
  accountType: OtpAccountType,
  purpose: OtpPurpose,
  accountId: number,
  email: string
): Promise<string> {
  const code = crypto.randomInt(100000, 1000000).toString();
  const db = getPool();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await db.query(
    "INSERT INTO otp_codes (account_type, purpose, account_id, email, code_hash, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
    [accountType, purpose, accountId, email.trim().toLowerCase(), hashCode(code), expiresAt]
  );
  return code;
}

// Returns the account_id the code was issued for if valid (unused,
// unexpired, matching hash) — and marks it used so it can't be replayed.
// Null for any mismatch, without distinguishing "wrong code" from
// "expired" to a caller, so this never leaks which is the case.
export async function verifyOtp(
  accountType: OtpAccountType,
  purpose: OtpPurpose,
  email: string,
  code: string
): Promise<number | null> {
  const db = getPool();
  const [rows] = await db.query<mysql.RowDataPacket[]>(
    `SELECT id, account_id FROM otp_codes
     WHERE account_type = ? AND purpose = ? AND email = ? AND code_hash = ?
       AND used_at IS NULL AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [accountType, purpose, email.trim().toLowerCase(), hashCode(code)]
  );
  const row = rows[0];
  if (!row) return null;
  await db.query("UPDATE otp_codes SET used_at = NOW() WHERE id = ?", [row.id]);
  return row.account_id as number;
}
