import { NextResponse } from "next/server";
import { createOrder, OrderError } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const customerName = typeof b.customerName === "string" ? b.customerName.trim() : "";
  const customerEmail = typeof b.customerEmail === "string" ? b.customerEmail.trim() : "";
  const address = typeof b.address === "string" ? b.address.trim() : "";
  const city = typeof b.city === "string" ? b.city.trim() : "";
  const postalCode = typeof b.postalCode === "string" ? b.postalCode.trim() : "";
  const rawItems = Array.isArray(b.items) ? b.items : [];

  if (!customerName || !address || !city || !postalCode) {
    return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });
  }
  if (!EMAIL_RE.test(customerEmail)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const items = rawItems
    .filter(
      (item): item is { slug: unknown; quantity: unknown } =>
        typeof item === "object" && item !== null
    )
    .map((item) => ({
      slug: String((item as { slug: unknown }).slug),
      quantity: Number((item as { quantity: unknown }).quantity),
    }))
    .filter((item) => item.slug && Number.isFinite(item.quantity) && item.quantity > 0);

  if (items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  try {
    const order = await createOrder({
      customerName,
      customerEmail,
      address,
      city,
      postalCode,
      items,
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong placing your order." },
      { status: 500 }
    );
  }
}
