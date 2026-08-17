"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { createT, type Dictionary, type TFunction } from "@/lib/i18n/t";

const I18nContext = createContext<{ locale: Locale; dict: Dictionary }>({
  locale: "en",
  dict: {},
});

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ locale, dict }), [locale, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}

export function useT(): TFunction {
  const { dict } = useContext(I18nContext);
  return useMemo(() => createT(dict), [dict]);
}
