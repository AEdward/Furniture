import { NextResponse } from "next/server";
import { createOrder, OrderError, type PaymentMethod } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Permissive on purpose — accepts local (09...) and international
// (+2519...) formats without forcing a specific country pattern.
const PHONE_RE = /^\+?[0-9 ()-]{7,20}$/;
const PAYMENT_METHODS: PaymentMethod[] = ["chapa", "cod", "bank_transfer"];

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
  const customerPhone = typeof b.customerPhone === "string" ? b.customerPhone.trim() : "";
  const address = typeof b.address === "string" ? b.address.trim() : "";
  const city = typeof b.city === "string" ? b.city.trim() : "";
  const postalCode = typeof b.postalCode === "string" ? b.postalCode.trim() : "";
  const rawItems = Array.isArray(b.items) ? b.items : [];
  const paymentMethod = b.paymentMethod as PaymentMethod;
  const cartSessionId =
    typeof b.cartSessionId === "string" && b.cartSessionId.trim() ? b.cartSessionId.trim() : null;
  const couponCode =
    typeof b.couponCode === "string" && b.couponCode.trim() ? b.couponCode.trim() : null;

  if (!customerName || !address || !city || !postalCode) {
    return NextResponse.json({ error: "Please fill in all fields." }, { status: 400 });
  }
  if (!EMAIL_RE.test(customerEmail)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!PHONE_RE.test(customerPhone)) {
    return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  }
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return NextResponse.json({ error: "Please choose a payment method." }, { status: 400 });
  }

  const items = rawItems
    .filter(
      (item): item is { slug: unknown; quantity: unknown; variant?: unknown } =>
        typeof item === "object" && item !== null
    )
    .map((item) => ({
      slug: String((item as { slug: unknown }).slug),
      quantity: Number((item as { quantity: unknown }).quantity),
      variant:
        typeof (item as { variant?: unknown }).variant === "string"
          ? ((item as { variant?: string }).variant as string)
          : undefined,
    }))
    .filter((item) => item.slug && Number.isFinite(item.quantity) && item.quantity > 0);

  if (items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  try {
    const order = await createOrder({
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      postalCode,
      items,
      paymentMethod,
      couponCode,
      cartSessionId,
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
