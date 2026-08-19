import { NextResponse } from "next/server";
import { createCustomerSessionToken, CUSTOMER_COOKIE_NAME } from "@/lib/customer-auth";
import { verifyCustomerCredentials } from "@/lib/customers";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const customer = await verifyCustomerCredentials(email, password);
  if (!customer) {
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  const token = await createCustomerSessionToken(customer.id);
  const res = NextResponse.json({ customer });
  res.cookies.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
