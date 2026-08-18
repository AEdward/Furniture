import { NextResponse } from "next/server";
import { BackInStockError, createBackInStockRequest } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const productSlug = typeof b.productSlug === "string" ? b.productSlug.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";

  if (!productSlug) {
    return NextResponse.json({ error: "Missing product." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    await createBackInStockRequest(productSlug, email);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (err instanceof BackInStockError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong — please try again." }, { status: 500 });
  }
}
