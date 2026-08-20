import { NextResponse } from "next/server";
import { AdminUserError, changeAdminPassword } from "@/lib/admin-users";
import { verifyOtp } from "@/lib/otp";
import { rateLimit, rateLimitByKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (!email || !code || !newPassword) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const limited =
    rateLimit(request, "admin-reset-password", 15, 15 * 60 * 1000) ||
    rateLimitByKey(email, "admin-reset-password-email", 10, 15 * 60 * 1000);
  if (limited) return limited;

  const adminId = await verifyOtp("admin", "password_reset", email, code);
  if (!adminId) {
    return NextResponse.json({ error: "That code is invalid or has expired." }, { status: 400 });
  }

  try {
    await changeAdminPassword(adminId, newPassword);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AdminUserError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}
