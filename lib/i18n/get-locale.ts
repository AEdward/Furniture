import { cache } from "react";
import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n/locale";
import { getSettings } from "@/lib/db";

// Server-only — reads the visitor's saved language preference from a
// cookie (set by components/LanguageSwitcher.tsx via POST /api/locale).
// Kept in its own module so client components can import the plain
// constants in locale.ts without pulling in next/headers.
//
// Always resolves to "en" unless an admin currently has translation
// turned on AND the cookie's language is one they've currently
// configured — so a stale cookie (translation turned off, or that
// specific language removed, since the cookie was set) can never leave
// a visitor stuck on non-English text.
const getTranslationConfig = cache(async () => {
  const settings = await getSettings();
  return settings.translation;
});

export async function getLocale(): Promise<Locale> {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  if (!isLocale(value) || value === "en") return "en";

  const { enabled, languages } = await getTranslationConfig();
  if (!enabled) return "en";
  if (!languages.some((l) => l.code === value)) return "en";
  return value;
}
