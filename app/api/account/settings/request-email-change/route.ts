import { NextResponse } from "next/server";
import { getCurrentCustomer, getCustomerByEmail } from "@/lib/customers";
import { createOtp } from "@/lib/otp";
import { getSettings } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import { otpEmail } from "@/lib/email-templates";

export async function POST(request: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

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
