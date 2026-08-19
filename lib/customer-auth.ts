// Signed session cookie identifying which customers row is logged in
// (see lib/customers.ts). Same HMAC scheme as lib/admin-auth.ts, reusing
// ADMIN_SESSION_SECRET but with a "customer:" payload prefix so a
// customer token can never be mistaken for an admin one (or vice versa)
// even though they share a signing key.

export const CUSTOMER_COOKIE_NAME = "customer_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set.");
  }
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createCustomerSessionToken(customerId: number): Promise<string> {
  const expires = Date.now() + SESSION_DURATION_MS;
  const payload = `customer:${customerId}:${expires}`;
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${toHex(signature)}`;
}

export async function verifyCustomerSessionToken(
  token: string | undefined | null
): Promise<number | null> {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!payload.startsWith("customer:")) return null;

  const [, customerIdRaw, expiresRaw] = payload.split(":");
  const customerId = Number(customerIdRaw);
  const expires = Number(expiresRaw);
  if (!Number.isInteger(customerId) || !Number.isFinite(expires) || expires <= Date.now()) {
    return null;
  }

  try {
    const key = await getKey();
    const expected = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
    return timingSafeEqual(toHex(expected), signature) ? customerId : null;
  } catch {
    return null;
  }
}
