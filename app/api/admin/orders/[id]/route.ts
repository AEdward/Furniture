import { NextResponse } from "next/server";
import { confirmOrderPayment, markOrderPaymentFailed, OrderError, updateOrderStatus } from "@/lib/db";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";
import { requireAdminApi } from "@/lib/admin-guard";
import { logAdminAction } from "@/lib/audit-log";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));

  try {
    if (typeof body.status === "string") {
      const status = body.status as OrderStatus;
      if (!ORDER_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }
      await updateOrderStatus(id, status);
      await logAdminAction(gate, "update_status", "order", id, { status });
    }

    // Manual override for cod/bank_transfer (and a fallback for chapa,
    // in case the webhook/return-URL verify never fired) — the shop
    // owner confirming they physically received cash or saw the
    // transfer land, or that it never came.
    if (typeof body.paymentStatus === "string") {
      if (body.paymentStatus === "paid") {
        await confirmOrderPayment(id, "admin", null);
        await logAdminAction(gate, "mark_paid", "order", id);
      } else if (body.paymentStatus === "failed") {
        await markOrderPaymentFailed(id, null);
        await logAdminAction(gate, "mark_payment_failed", "order", id);
      } else {
        return NextResponse.json({ error: "Invalid payment status." }, { status: 400 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}
