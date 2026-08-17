import { cache } from "react";
import { UI_STRINGS } from "@/lib/i18n/ui-strings";
import { translateBatch } from "@/lib/translate";
import type { Locale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/t";

// Wrapped in React's per-request cache() so every server component that
// calls getDictionary(locale) for the same locale within one request
// (layout, page, nested pages) shares a single lookup instead of each
// re-querying the translation cache table.
export const getDictionary = cache(async (locale: Locale): Promise<Dictionary> => {
  if (locale === "en") {
    return Object.fromEntries(UI_STRINGS.map((s) => [s, s]));
  }
  const translated = await translateBatch([...UI_STRINGS], locale);
  const dict: Dictionary = {};
  UI_STRINGS.forEach((source, i) => {
    dict[source] = translated[i];
  });
  return dict;
});
