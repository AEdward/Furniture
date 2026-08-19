import { NextResponse } from "next/server";
import { trackOrder } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const orderId = Number(body.orderId);
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!Number.isInteger(orderId)) {
    return NextResponse.json({ error: "Please enter a valid order number." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const order = await trackOrder(orderId, email);
  if (!order) {
    return NextResponse.json(
      { error: "We couldn't find an order with that number and email." },
      { status: 404 }
    );
  }

  return NextResponse.json({ order });
}
