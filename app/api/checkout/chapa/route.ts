import { NextRequest, NextResponse } from "next/server";
import { getOrderById, setOrderPaymentRef } from "@/lib/db";
import { ChapaError, initializeChapaTransaction, isChapaConfigured } from "@/lib/chapa";

// Starts a Chapa payment for an order that's already been created (via
// POST /api/orders) with payment_status='pending'. Returns a
// checkout_url the client redirects the browser to.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const orderId = Number(body?.orderId);
  if (!Number.isInteger(orderId)) {
    return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  }

  const order = await getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.paymentStatus === "paid") {
    return NextResponse.json({ error: "This order has already been paid." }, { status: 400 });
  }
  if (order.paymentMethod !== "chapa") {
    return NextResponse.json(
      { error: "This order isn't set up for online payment." },
      { status: 400 }
    );
  }

  if (!isChapaConfigured()) {
    return NextResponse.json(
      {
        error:
          "Online payment isn't set up yet. Your order has been recorded — the shop will contact you to arrange payment.",
      },
      { status: 503 }
    );
  }

  const baseUrl = process.env.APP_BASE_URL || request.nextUrl.origin;
  const txRef = `order-${order.id}-${Date.now()}`;
  const [firstName, ...rest] = order.customerName.trim().split(/\s+/);

  try {
    const { checkoutUrl } = await initializeChapaTransaction({
      amount: order.subtotal,
      email: order.customerEmail,
      firstName: firstName || order.customerName,
      lastName: rest.join(" ") || "Customer",
      phone: order.customerPhone,
      txRef,
      callbackUrl: `${baseUrl}/api/webhooks/chapa`,
      returnUrl: `${baseUrl}/order-confirmation/${order.id}?tx_ref=${encodeURIComponent(txRef)}`,
      title: "Golden Wood Order",
      description: `Order ${order.id}`,
    });

    await setOrderPaymentRef(order.id, "chapa", txRef);
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    const message = err instanceof ChapaError ? err.message : "Could not start payment.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
