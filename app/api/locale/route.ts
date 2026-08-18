import { NextRequest, NextResponse } from "next/server";
import { isLocale, LOCALE_COOKIE } from "@/lib/i18n/locale";
import { getSettings } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const locale = typeof body.locale === "string" ? body.locale : "";
  if (!isLocale(locale)) {
    return NextResponse.json({ error: "Unsupported locale." }, { status: 400 });
  }
  if (locale !== "en") {
    const settings = await getSettings();
    if (!settings.translation.enabled) {
      return NextResponse.json({ error: "Translation is turned off." }, { status: 400 });
    }
    if (!settings.translation.languages.some((l) => l.code === locale)) {
      return NextResponse.json({ error: "That language isn't offered." }, { status: 400 });
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
