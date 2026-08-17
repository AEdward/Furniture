import { NextResponse } from "next/server";
import { deletePage, PageError, updatePage } from "@/lib/db";
import { parsePageInput, PageValidationError } from "@/lib/pages";

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
    const input = parsePageInput(body);
    const page = await updatePage(params.slug, input);
    return NextResponse.json({ page });
  } catch (err) {
    if (err instanceof PageValidationError || err instanceof PageError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to update page." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await deletePage(params.slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof PageError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to delete page." }, { status: 500 });
  }
}
