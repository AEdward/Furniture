import { NextResponse } from "next/server";
import { getCustomerByEmail } from "@/lib/customers";
import { createOtp } from "@/lib/otp";
import { getSettings } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import { otpEmail } from "@/lib/email-templates";
import { rateLimit, rateLimitByKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim() : "";

  // Rate-limited before anything else — this endpoint sends an email
  // per call, so it's the cheapest one to abuse for either annoying a
  // victim's inbox or running up SMTP-provider costs.
  const limited =
    rateLimit(request, "forgot-password", 5, 15 * 60 * 1000) ||
    (email ? rateLimitByKey(email, "forgot-password-email", 3, 15 * 60 * 1000) : null);
  if (limited) return limited;

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
