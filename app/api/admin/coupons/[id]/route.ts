import { NextResponse } from "next/server";
import { CouponError, deleteCoupon, setCouponActive } from "@/lib/db";
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
    return NextResponse.json({ error: "Invalid coupon id." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const active = Boolean(body.active);

  try {
    await setCouponActive(id, active);
    await logAdminAction(gate, active ? "activate" : "deactivate", "coupon", id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof CouponError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to update coupon." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid coupon id." }, { status: 400 });
  }

  try {
    await deleteCoupon(id);
    await logAdminAction(gate, "delete", "coupon", id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof CouponError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to delete coupon." }, { status: 500 });
  }
}
