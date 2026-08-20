import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createSessionToken } from "@/lib/admin-auth";
import { getAdminUserCount, verifyAdminCredentials } from "@/lib/admin-users";
import { rateLimit, rateLimitByKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  // Two limits: one per IP (stops one attacker trying many accounts)
  // and one per email (stops the same attacker rotating IPs against
  // one account) — either tripping blocks the request.
  const limited =
    rateLimit(request, "admin-login", 10, 10 * 60 * 1000) ||
    rateLimitByKey(email, "admin-login-email", 8, 10 * 60 * 1000);
  if (limited) return limited;

  if ((await getAdminUserCount()) === 0) {
    return NextResponse.json(
      {
        error:
          "No admin accounts exist yet. Run `npm run seed` to create the bootstrap admin from ADMIN_EMAIL / ADMIN_PASSWORD.",
      },
      { status: 500 }
    );
  }

  const user = await verifyAdminCredentials(email, password);
  if (!user) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  let token: string;
  try {
    token = await createSessionToken(user.id);
  } catch {
    return NextResponse.json(
      { error: "ADMIN_SESSION_SECRET is not set in .env.local." },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
