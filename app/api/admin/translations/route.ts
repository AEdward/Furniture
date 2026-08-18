import { NextRequest, NextResponse } from "next/server";
import { getTranslationsForLang } from "@/lib/i18n/manage-translations";
import type { TargetLang } from "@/lib/translate";

function isTargetLang(value: string | null): value is TargetLang {
  return value === "am" || value === "om";
}

export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang");
  if (!isTargetLang(lang)) {
    return NextResponse.json({ error: "lang must be 'am' or 'om'." }, { status: 400 });
  }

  try {
    const translations = await getTranslationsForLang(lang);
    return NextResponse.json({ translations });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load translations." }, { status: 500 });
  }
}
