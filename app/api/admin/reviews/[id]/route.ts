import { NextResponse } from "next/server";
import { deleteReview, ReviewError, setReviewApproved } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid review id." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const approved = Boolean(body.approved);

  try {
    await setReviewApproved(id, approved);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ReviewError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to update review." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid review id." }, { status: 400 });
  }

  try {
    await deleteReview(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ReviewError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to delete review." }, { status: 500 });
  }
}
