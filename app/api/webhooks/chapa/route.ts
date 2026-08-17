import { NextRequest, NextResponse } from "next/server";
import { confirmOrderPayment, getOrderByPaymentRef, markOrderPaymentFailed } from "@/lib/db";
import { verifyChapaTransaction } from "@/lib/chapa";

// Public endpoint Chapa calls server-to-server after a payment attempt.
// Deliberately never trusts the webhook body's claimed status — it only
// uses it to find the tx_ref, then independently re-verifies with
// Chapa's own API before doing anything. That means even a spoofed
// webhook call can't mark an order paid; only a transaction Chapa
// itself confirms as successful can.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const txRef =
    typeof body?.tx_ref === "string"
      ? body.tx_ref
      : typeof body?.data?.tx_ref === "string"
        ? body.data.tx_ref
        : null;

  if (!txRef) {
    return NextResponse.json({ error: "Missing tx_ref." }, { status: 400 });
  }

  const order = await getOrderByPaymentRef(txRef);
  if (!order) {
    // Unknown tx_ref — nothing for us to do, but acknowledge so Chapa
    // doesn't keep retrying.
    return NextResponse.json({ ok: true });
  }

  let result;
  try {
    result = await verifyChapaTransaction(txRef);
  } catch {
    return NextResponse.json({ error: "Verification failed." }, { status: 502 });
  }

  if (result.success) {
    await confirmOrderPayment(order.id, "chapa", txRef);
  } else {
    await markOrderPaymentFailed(order.id, txRef);
  }

  return NextResponse.json({ ok: true });
}
