import { NextResponse } from "next/server";
import { getAdminUserByEmail } from "@/lib/admin-users";
import { createOtp } from "@/lib/otp";
import { getSettings } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import { otpEmail } from "@/lib/email-templates";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (email) {
    const admin = await getAdminUserByEmail(email);
    if (admin) {
      const code = await createOtp("admin", "password_reset", admin.id, admin.email);
      const settings = await getSettings();
      await sendEmail({ to: admin.email, ...otpEmail("password_reset", code, settings) });
    }
  }

  return NextResponse.json({
    ok: true,
    message: "If that email has an admin account, we've sent a reset code to it.",
  });
}
