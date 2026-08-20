import { NextResponse } from "next/server";
import { trackOrder, setOrderPaymentReceipt, OrderError } from "@/lib/db";
import { saveImageUpload } from "@/lib/uploads";
import { rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const limited = rateLimit(request, "order-receipt-upload", 20, 10 * 60 * 1000);
  if (limited) return limited;

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid order id." }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const email = formData.get("email");
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // Same guest-checkout ownership check as /api/track-order — the order
  // id alone can't be used to attach a receipt to someone else's order.
  const order = await trackOrder(id, email);
  if (!order) {
    return NextResponse.json(
      { error: "We couldn't find an order with that number and email." },
      { status: 404 }
    );
  }
  if (order.paymentMethod !== "bank_transfer") {
    return NextResponse.json(
      { error: "This order isn't a bank transfer order." },
      { status: 400 }
    );
  }
  if (order.paymentStatus === "paid") {
    return NextResponse.json({ error: "This order is already marked paid." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const result = await saveImageUpload(file);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    await setOrderPaymentReceipt(id, result.url);
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to save receipt." }, { status: 500 });
  }

  return NextResponse.json({ url: result.url }, { status: 201 });
}
