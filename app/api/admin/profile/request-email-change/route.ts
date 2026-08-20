import { NextResponse } from "next/server";
import { getAdminUserByEmail, getCurrentAdminUser } from "@/lib/admin-users";
import { createOtp } from "@/lib/otp";
import { getSettings } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import { otpEmail } from "@/lib/email-templates";

export async function POST(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const newEmail = typeof body.newEmail === "string" ? body.newEmail.trim() : "";
  if (!newEmail) {
    return NextResponse.json({ error: "Enter a new email." }, { status: 400 });
  }

  const existing = await getAdminUserByEmail(newEmail);
  if (existing && existing.id !== user.id) {
    return NextResponse.json({ error: "That email is already in use." }, { status: 400 });
  }

  const code = await createOtp("admin", "email_change", user.id, newEmail);
  const settings = await getSettings();
  await sendEmail({ to: newEmail, ...otpEmail("email_change", code, settings) });

  return NextResponse.json({ ok: true });
}
