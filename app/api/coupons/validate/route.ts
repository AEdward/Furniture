import { NextResponse } from "next/server";
import { CouponError, previewCoupon } from "@/lib/db";

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
  const code = typeof b.code === "string" ? b.code.trim() : "";
  const subtotal = Number(b.subtotal);

  if (!code) {
    return NextResponse.json({ error: "Please enter a coupon code." }, { status: 400 });
  }
  if (!Number.isFinite(subtotal) || subtotal < 0) {
    return NextResponse.json({ error: "Invalid cart total." }, { status: 400 });
  }

  try {
    const { coupon, discountAmount } = await previewCoupon(code, subtotal);
    return NextResponse.json({ code: coupon.code, discountAmount });
  } catch (err) {
    if (err instanceof CouponError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong — please try again." }, { status: 500 });
  }
}
