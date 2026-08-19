import { NextResponse } from "next/server";
import { getOrdersByCustomerId } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/customers";

export const dynamic = "force-dynamic";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const orders = await getOrdersByCustomerId(customer.id);
  return NextResponse.json({ orders });
}
