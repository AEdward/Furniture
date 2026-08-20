import { NextResponse } from "next/server";
import { CustomerError, getCurrentCustomer, updateCustomerProfile } from "@/lib/customers";

export async function PUT(request: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  try {
    const updated = await updateCustomerProfile(customer.id, {
      name: typeof body.name === "string" ? body.name : "",
      phone: typeof body.phone === "string" ? body.phone : "",
      address: typeof body.address === "string" ? body.address : "",
      city: typeof body.city === "string" ? body.city : "",
      postalCode: typeof body.postalCode === "string" ? body.postalCode : "",
    });
    return NextResponse.json({ customer: updated });
  } catch (err) {
    if (err instanceof CustomerError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
