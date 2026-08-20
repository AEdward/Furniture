import { NextResponse } from "next/server";
import { getCurrentCustomer, getCustomerByEmail } from "@/lib/customers";
import { createOtp } from "@/lib/otp";
import { getSettings } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import { otpEmail } from "@/lib/email-templates";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // Already gated behind a signed-in session, but still rate-limited —
  // a compromised or malicious session shouldn't be able to spam
  // arbitrary target inboxes with verification codes.
  const limited = rateLimit(request, "email-change-request", 5, 15 * 60 * 1000);
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const newEmail = typeof body.newEmail === "string" ? body.newEmail.trim() : "";
  if (!newEmail) {
    return NextResponse.json({ error: "Enter a new email." }, { status: 400 });
  }

  const existing = await getCustomerByEmail(newEmail);
  if (existing && existing.id !== customer.id) {
    return NextResponse.json({ error: "That email is already in use." }, { status: 400 });
  }

  const code = await createOtp("customer", "email_change", customer.id, newEmail);
  const settings = await getSettings();
  await sendEmail({ to: newEmail, ...otpEmail("email_change", code, settings) });

  return NextResponse.json({ ok: true });
}
