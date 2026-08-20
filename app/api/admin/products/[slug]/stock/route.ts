import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-users";
import { adjustProductStock, getStockAdjustments, ProductError } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const adjustments = await getStockAdjustments(params.slug);
  return NextResponse.json({ adjustments });
}

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const delta = Number(body.delta);
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (!Number.isFinite(delta) || delta === 0) {
    return NextResponse.json({ error: "Enter a non-zero quantity." }, { status: 400 });
  }
  if (!reason) {
    return NextResponse.json({ error: "A reason is required." }, { status: 400 });
  }

  try {
    const product = await adjustProductStock(params.slug, Math.round(delta), reason, user.id);
    return NextResponse.json({ product });
  } catch (err) {
    if (err instanceof ProductError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to adjust stock." }, { status: 500 });
  }
}
