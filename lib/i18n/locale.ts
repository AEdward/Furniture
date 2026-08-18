// Client-safe — no next/headers import here, so components using these
// exports (e.g. LanguageSwitcher) don't accidentally pull a server-only
// module into the client bundle. Server-only getLocale() lives in
// lib/i18n/get-locale.ts instead.
//
// Which non-English languages actually exist is admin-configurable
// (see settings.translation.languages, managed at /admin/settings), so
// there's no fixed list here — Locale is just "en" or whatever code an
// admin typed.

export type Locale = string;

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "locale";

// Syntactic validity only (2–3 lowercase letters, optional -REGION) —
// NOT a check against the currently configured language list. A cookie
// left over from a language an admin has since removed just degrades
// to English pass-through translations rather than erroring; the
// authoritative check against what's actually offered right now
// happens in components/LanguageSwitcher.tsx and the /api/locale route.
const LOCALE_PATTERN = /^[a-z]{2,3}(-[A-Z]{2})?$/;

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (value === "en" || LOCALE_PATTERN.test(value));
}
