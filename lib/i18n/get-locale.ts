import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n/locale";

// Server-only — reads the visitor's saved language preference from a
// cookie (set by components/LanguageSwitcher.tsx via POST /api/locale).
// Kept in its own module so client components can import the plain
// constants in locale.ts without pulling in next/headers.
export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : "en";
}
