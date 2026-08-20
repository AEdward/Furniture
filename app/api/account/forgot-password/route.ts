import { NextResponse } from "next/server";
import { getCustomerByEmail } from "@/lib/customers";
import { createOtp } from "@/lib/otp";
import { getSettings } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import { otpEmail } from "@/lib/email-templates";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";

  // Always return the same generic response whether or not the email
  // matches an account — this endpoint must not reveal which emails
  // have accounts.
  if (email) {
    const customer = await getCustomerByEmail(email);
    if (customer) {
      const code = await createOtp("customer", "password_reset", customer.id, customer.email);
      const settings = await getSettings();
      await sendEmail({ to: customer.email, ...otpEmail("password_reset", code, settings) });
    }
  }

  return NextResponse.json({
    ok: true,
    message: "If that email has an account, we've sent a reset code to it.",
  });
}
