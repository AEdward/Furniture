import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_GATE_COOKIE_NAME,
  createGateToken,
  timingSafeEqual,
  verifyGateToken,
  verifySessionToken,
} from "@/lib/admin-auth";

const PUBLIC_ADMIN_PATHS = new Set([
  "/portal2026/login",
  "/api/admin/login",
  "/api/admin/logout",
  "/portal2026/forgot-password",
  "/api/admin/forgot-password",
  "/api/admin/reset-password",
]);

const GATE_DURATION_SECONDS = 400 * 24 * 60 * 60;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Everything under /portal2026 (pages and API alike) is gated behind
  // ADMIN_GATE_KEY, if set — a shared secret appended as ?key=... the
  // first time, after which a long-lived signed cookie remembers this
  // browser. Without it, /portal2026/* 404s outright (not a redirect to a
  // login form — there's nothing here for an anonymous scanner to
  // find), so a bot or a curious visitor probing /portal2026 gets nothing.
  // Unset, this is a no-op and /portal2026 behaves exactly as before — kept
  // optional so local dev never needs an extra secret to try the app.
  if (pathname === "/portal2026" || pathname.startsWith("/portal2026/")) {
    const gateKey = process.env.ADMIN_GATE_KEY;
    if (gateKey) {
      const gated = await verifyGateToken(request.cookies.get(ADMIN_GATE_COOKIE_NAME)?.value);
      if (!gated) {
        const suppliedKey = request.nextUrl.searchParams.get("key");
        if (!suppliedKey || !timingSafeEqual(suppliedKey, gateKey)) {
          return new NextResponse(null, { status: 404 });
        }
        // Correct key — mint the gate cookie and redirect to the same
        // URL with ?key stripped, so the secret doesn't linger in the
        // address bar, browser history, or any Referer header.
        const cleanUrl = request.nextUrl.clone();
        cleanUrl.searchParams.delete("key");
        const res = NextResponse.redirect(cleanUrl);
        res.cookies.set(ADMIN_GATE_COOKIE_NAME, await createGateToken(), {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/portal2026",
          maxAge: GATE_DURATION_SECONDS,
        });
        return res;
      }
    }
  }

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const userId = await verifySessionToken(token);

  if (!userId) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const loginUrl = new URL("/portal2026/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal2026/:path*", "/api/admin/:path*"],
};
