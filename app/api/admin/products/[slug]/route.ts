import { NextResponse } from "next/server";
import { deleteProduct, ProductError, updateProduct } from "@/lib/db";
import { parseProductInput, ValidationError } from "@/lib/validate-product";

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const input = parseProductInput(body);
    const product = await updateProduct(params.slug, input);
    return NextResponse.json({ product });
  } catch (err) {
    if (err instanceof ValidationError || err instanceof ProductError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await deleteProduct(params.slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ProductError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}
