import { NextResponse } from "next/server";
import { CustomerError, changeCustomerEmail, getCurrentCustomer } from "@/lib/customers";
import { verifyOtp } from "@/lib/otp";

export async function POST(request: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const newEmail = typeof body.newEmail === "string" ? body.newEmail.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!newEmail || !code) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const accountId = await verifyOtp("customer", "email_change", newEmail, code);
  if (accountId !== customer.id) {
    return NextResponse.json({ error: "That code is invalid or has expired." }, { status: 400 });
  }

  try {
    await changeCustomerEmail(customer.id, newEmail);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof CustomerError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to change email." }, { status: 500 });
  }
}
