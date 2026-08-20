import { NextResponse } from "next/server";
import { createProduct, ProductError } from "@/lib/db";
import { parseProductInput, ValidationError } from "@/lib/validate-product";
import { getCurrentAdminUser } from "@/lib/admin-users";
import { logAdminAction } from "@/lib/audit-log";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const input = parseProductInput(body);
    const product = await createProduct(input);
    const admin = await getCurrentAdminUser();
    if (admin) await logAdminAction(admin, "create", "product", product.slug, { name: product.name });
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof ProductError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}
