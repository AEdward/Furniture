import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customers";
import { markNotificationRead } from "@/lib/notifications";

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid notification id." }, { status: 400 });
  }
  await markNotificationRead(id, "customer", customer.id);
  return NextResponse.json({ ok: true });
}
