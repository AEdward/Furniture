import { NextResponse } from "next/server";
import { createReview, getProductBySlug } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_COMMENT_LENGTH = 2000;

export async function POST(request: Request) {
  const limited = rateLimit(request, "reviews", 5, 10 * 60 * 1000);
  if (limited) return limited;

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
  const customerName = typeof b.name === "string" ? b.name.trim() : "";
  const customerEmail = typeof b.email === "string" ? b.email.trim() : "";
  const comment = typeof b.comment === "string" ? b.comment.trim() : "";
  const rating = Number(b.rating);

  if (!productSlug) {
    return NextResponse.json({ error: "Missing product." }, { status: 400 });
  }
  if (!customerName) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(customerEmail)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Please choose a rating from 1 to 5." }, { status: 400 });
  }
  if (!comment) {
    return NextResponse.json({ error: "Please enter a review." }, { status: 400 });
  }
  if (comment.length > MAX_COMMENT_LENGTH) {
    return NextResponse.json({ error: "Review is too long." }, { status: 400 });
  }

  const product = await getProductBySlug(productSlug);
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  try {
    const review = await createReview({
      productId: product.id,
      customerName,
      customerEmail,
      rating,
      comment,
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong submitting your review." },
      { status: 500 }
    );
  }
}
