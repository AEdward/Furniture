import { NextResponse } from "next/server";
import { TranslationError, updateTranslationText } from "@/lib/i18n/manage-translations";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid translation id." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  if (typeof body.translatedText !== "string") {
    return NextResponse.json({ error: "translatedText is required." }, { status: 400 });
  }

  try {
    await updateTranslationText(id, body.translatedText);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof TranslationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to save translation." }, { status: 500 });
  }
}
