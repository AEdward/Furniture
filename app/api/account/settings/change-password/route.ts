import { NextResponse } from "next/server";
import { CustomerError, changeCustomerPassword, getCurrentCustomer, verifyCustomerCredentials } from "@/lib/customers";

export async function POST(request: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  const verified = await verifyCustomerCredentials(customer.email, currentPassword);
  if (!verified) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  try {
    await changeCustomerPassword(customer.id, newPassword);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof CustomerError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to change password." }, { status: 500 });
  }
}
