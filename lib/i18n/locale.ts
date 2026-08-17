import type { TargetLang } from "@/lib/translate";

// Client-safe — no next/headers import here, so components using
// LOCALES/LOCALE_LABELS (e.g. LanguageSwitcher) don't accidentally pull
// a server-only module into the client bundle. Server-only getLocale()
// lives in lib/i18n/get-locale.ts instead.

export type Locale = "en" | TargetLang;

export const LOCALES: Locale[] = ["en", "am", "om"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  am: "አማርኛ",
  om: "Afaan Oromoo",
};

export const LOCALE_COOKIE = "locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as string[]).includes(value);
}
