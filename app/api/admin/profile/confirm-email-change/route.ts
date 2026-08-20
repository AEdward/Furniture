import { NextResponse } from "next/server";
import { AdminUserError, changeAdminEmail, getCurrentAdminUser } from "@/lib/admin-users";
import { verifyOtp } from "@/lib/otp";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const limited = rateLimit(request, "admin-confirm-email-change", 15, 15 * 60 * 1000);
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const newEmail = typeof body.newEmail === "string" ? body.newEmail.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!newEmail || !code) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const accountId = await verifyOtp("admin", "email_change", newEmail, code);
  if (accountId !== user.id) {
    return NextResponse.json({ error: "That code is invalid or has expired." }, { status: 400 });
  }

  try {
    await changeAdminEmail(user.id, newEmail);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AdminUserError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to change email." }, { status: 500 });
  }
}
