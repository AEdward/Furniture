import { NextRequest, NextResponse } from "next/server";
import { getTranslationsForLang } from "@/lib/i18n/manage-translations";
import { getSettings } from "@/lib/db";

export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang");
  if (!lang) {
    return NextResponse.json({ error: "lang is required." }, { status: 400 });
  }

  try {
    const settings = await getSettings();
    if (!settings.translation.languages.some((l) => l.code === lang)) {
      return NextResponse.json({ error: "That language isn't configured." }, { status: 400 });
    }
    const translations = await getTranslationsForLang(lang);
    return NextResponse.json({ translations });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load translations." }, { status: 500 });
  }
}
