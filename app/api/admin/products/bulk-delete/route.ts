import { NextResponse } from "next/server";
import { deleteProducts } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-guard";
import { logAdminAction } from "@/lib/audit-log";

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;

  const body = await request.json().catch(() => ({}));
  const slugs = Array.isArray(body.slugs)
    ? body.slugs.filter((s: unknown): s is string => typeof s === "string" && s.length > 0)
    : [];

  if (slugs.length === 0) {
    return NextResponse.json({ error: "No products selected." }, { status: 400 });
  }

  try {
    const deleted = await deleteProducts(slugs);
    await logAdminAction(gate, "bulk_delete", "product", null, { slugs, count: deleted });
    return NextResponse.json({ deleted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete products." }, { status: 500 });
  }
}
