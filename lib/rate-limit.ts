import { NextResponse } from "next/server";

// In-memory, single-process rate limiting — a fixed window counter per
// (bucket, IP[, extra key]). This fits how this app is meant to be
// deployed: one long-running Node process (e.g. cPanel's Passenger-
// managed Node app, or `next start`), where a module-level Map
// survives across requests. It would silently stop working correctly
// behind a multi-instance/serverless deployment (each instance gets
// its own counters) — swap in a shared store (Redis, etc.) if this
// app is ever run that way.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so the map doesn't grow unbounded under
// sustained traffic — runs at most once a minute, piggybacking on
// whichever request happens to trigger it, rather than a setInterval
// that would need its own lifecycle management.
let lastCleanup = 0;
function cleanup(now: number): void {
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function getClientIp(request: Request): string {
  // Most reverse proxies (nginx/Apache in front of a cPanel Node app,
  // or any CDN) set one of these; x-forwarded-for's first entry is the
  // original client. Falls back to a constant, which degrades to a
  // single shared limit across all unproxied direct traffic rather
  // than throwing.
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

// Checks and increments a rate-limit bucket, scoped to the request's
// IP. Returns a ready-to-return 429 NextResponse if the caller is over
// the limit, or null if the request should proceed — mirrors the
// requireAdminApi() guard pattern already used throughout this app's
// routes:
//   const limited = rateLimit(request, "login", 10, 10 * 60 * 1000);
//   if (limited) return limited;
export function rateLimit(
  request: Request,
  bucketName: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const now = Date.now();
  cleanup(now);

  const ip = getClientIp(request);
  const key = `${bucketName}:${ip}`;

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (bucket.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return NextResponse.json(
      { error: "Too many requests — please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  bucket.count += 1;
  return null;
}

// Same as rateLimit(), but scoped purely to a caller-supplied key (an
// email address, typically) instead of the request's IP — used
// alongside the IP-scoped limit on OTP/login endpoints so an attacker
// rotating source IPs against one victim's account is still caught,
// not just one IP hammering many accounts.
export function rateLimitByKey(
  rawKey: string,
  bucketName: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const now = Date.now();
  cleanup(now);

  const key = `${bucketName}:${rawKey.toLowerCase()}`;
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (bucket.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return NextResponse.json(
      { error: "Too many requests — please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  bucket.count += 1;
  return null;
}
