import { NextResponse } from "next/server";
import { ContactMessageError, deleteContactMessage, markContactMessageRead } from "@/lib/db";

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid message id." }, { status: 400 });
  }

  try {
    await markContactMessageRead(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ContactMessageError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to update message." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid message id." }, { status: 400 });
  }

  try {
    await deleteContactMessage(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ContactMessageError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to delete message." }, { status: 500 });
  }
}
