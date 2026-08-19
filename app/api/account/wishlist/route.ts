import { NextResponse } from "next/server";
import { addToWishlist, getWishlist, ProductError, removeFromWishlist } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/customers";

export const dynamic = "force-dynamic";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const items = await getWishlist(customer.id);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const productSlug = typeof body.productSlug === "string" ? body.productSlug : "";
  if (!productSlug) {
    return NextResponse.json({ error: "Missing product." }, { status: 400 });
  }

  try {
    await addToWishlist(customer.id, productSlug);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (err instanceof ProductError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to add to wishlist." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const productSlug = typeof body.productSlug === "string" ? body.productSlug : "";
  if (!productSlug) {
    return NextResponse.json({ error: "Missing product." }, { status: 400 });
  }

  try {
    await removeFromWishlist(customer.id, productSlug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ProductError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to remove from wishlist." }, { status: 500 });
  }
}
