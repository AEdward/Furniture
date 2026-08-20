import { NextResponse } from "next/server";
import { CouponError, createCoupon, getAllCoupons } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-guard";
import { logAdminAction } from "@/lib/audit-log";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;

  const coupons = await getAllCoupons();
  return NextResponse.json({ coupons });
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;

  const body = await request.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code : "";
  const discountType = body.discountType === "fixed" ? "fixed" : "percent";
  const discountValue = Number(body.discountValue);
  const maxUses =
    body.maxUses === "" || body.maxUses === null || body.maxUses === undefined
      ? null
      : Number(body.maxUses);
  const expiresAt =
    typeof body.expiresAt === "string" && body.expiresAt.trim() ? body.expiresAt : null;

  try {
    const coupon = await createCoupon({ code, discountType, discountValue, maxUses, expiresAt });
    await logAdminAction(gate, "create", "coupon", coupon.id, { code: coupon.code });
    return NextResponse.json({ coupon }, { status: 201 });
  } catch (err) {
    if (err instanceof CouponError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to create coupon." }, { status: 500 });
  }
}
