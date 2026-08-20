import { NextResponse } from "next/server";
import { CustomerError, changeCustomerPassword } from "@/lib/customers";
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

  // A 6-digit code is only ~1M possibilities — cap attempts per email
  // well below what a brute force would need, while staying generous
  // enough for a few genuine mistyped digits.
  const limited =
    rateLimit(request, "reset-password", 15, 15 * 60 * 1000) ||
    rateLimitByKey(email, "reset-password-email", 10, 15 * 60 * 1000);
  if (limited) return limited;

  const customerId = await verifyOtp("customer", "password_reset", email, code);
  if (!customerId) {
    return NextResponse.json({ error: "That code is invalid or has expired." }, { status: 400 });
  }

  try {
    await changeCustomerPassword(customerId, newPassword);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof CustomerError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}
