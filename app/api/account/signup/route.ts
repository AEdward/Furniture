import { NextResponse } from "next/server";
import { createCustomerSessionToken, CUSTOMER_COOKIE_NAME } from "@/lib/customer-auth";
import { createCustomer, CustomerError } from "@/lib/customers";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(request, "signup", 8, 15 * 60 * 1000);
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name : "";
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  try {
    const customer = await createCustomer({ name, email, password });
    const token = await createCustomerSessionToken(customer.id);

    const res = NextResponse.json({ customer }, { status: 201 });
    res.cookies.set(CUSTOMER_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  } catch (err) {
    if (err instanceof CustomerError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
  }
}
