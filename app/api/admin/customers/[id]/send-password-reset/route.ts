import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-users";
import { getCustomerById } from "@/lib/customers";
import { createOtp } from "@/lib/otp";
import { getSettings } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import { otpEmail } from "@/lib/email-templates";
import { logAdminAction } from "@/lib/audit-log";
import { rateLimit } from "@/lib/rate-limit";

// Admin-triggered password reset — sends the customer a reset code by
// email. Deliberately does NOT log the admin into the customer's
// account (no impersonation): the admin only ever gets to trigger the
// same self-service reset flow the customer could trigger themselves.
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Defense-in-depth even though this is already behind admin auth —
  // a compromised admin session shouldn't be able to mass-email every
  // customer's inbox in one sweep.
  const limited = rateLimit(request, "admin-send-password-reset", 20, 15 * 60 * 1000);
  if (limited) return limited;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid customer id." }, { status: 400 });
  }

  const customer = await getCustomerById(id);
  if (!customer) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }

  const code = await createOtp("customer", "password_reset", customer.id, customer.email);
  const settings = await getSettings();
  await sendEmail({ to: customer.email, ...otpEmail("password_reset", code, settings) });
  await logAdminAction(admin, "send_password_reset", "customer", customer.id, { email: customer.email });

  return NextResponse.json({ ok: true });
}
