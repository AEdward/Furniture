import { NextResponse } from "next/server";
import { OrderError, updateOrderStatus } from "@/lib/db";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/order-status";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const status = body.status as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  try {
    await updateOrderStatus(id, status);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}
