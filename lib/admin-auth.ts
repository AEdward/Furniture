// Signed session cookie identifying which admin_users row is logged in
// (see lib/admin-users.ts). Uses Web Crypto (not node:crypto) so the
// same code runs in both the Node API routes and the Edge middleware.

export const ADMIN_COOKIE_NAME = "admin_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

// Separate long-lived cookie proving this browser has presented
// ADMIN_GATE_KEY at some point (see middleware.ts) — distinct from the
// session cookie above, which proves an actual admin login. The gate
// only unlocks the ability to reach the login form at all; it doesn't
// grant admin access by itself.
export const ADMIN_GATE_COOKIE_NAME = "admin_gate";
const GATE_DURATION_MS = 400 * 24 * 60 * 60 * 1000; // ~400 days — browsers cap cookie Max-Age around there anyway

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

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createSessionToken(userId: number): Promise<string> {
  const expires = Date.now() + SESSION_DURATION_MS;
  const payload = `${userId}:${expires}`;
  const key = await getKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return `${payload}.${toHex(signature)}`;
}

// Returns the logged-in admin's user id, or null if the token is
// missing, malformed, expired, or its signature doesn't check out.
export async function verifySessionToken(
  token: string | undefined | null
): Promise<number | null> {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const [userIdRaw, expiresRaw] = payload.split(":");
  const userId = Number(userIdRaw);
  const expires = Number(expiresRaw);
  if (!Number.isInteger(userId) || !Number.isFinite(expires) || expires <= Date.now()) {
    return null;
  }

  try {
    const key = await getKey();
    const expected = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload)
    );
    return timingSafeEqual(toHex(expected), signature) ? userId : null;
  } catch {
    return null;
  }
}

export async function createGateToken(): Promise<string> {
  const expires = Date.now() + GATE_DURATION_MS;
  const payload = `gate:${expires}`;
  const key = await getKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return `${payload}.${toHex(signature)}`;
}

export async function verifyGateToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!payload.startsWith("gate:")) return false;
  const expires = Number(payload.slice("gate:".length));
  if (!Number.isFinite(expires) || expires <= Date.now()) return false;

  try {
    const key = await getKey();
    const expected = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload)
    );
    return timingSafeEqual(toHex(expected), signature);
  } catch {
    return false;
  }
}
