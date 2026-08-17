"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/locale";
import { useLocale, useT } from "@/lib/i18n/context";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useT();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  async function selectLocale(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("Language")}
        disabled={isPending}
        className="flex h-10 items-center gap-1 rounded-full border border-walnut-200 px-3 text-sm font-medium text-walnut-600 transition-colors hover:bg-walnut-100 disabled:opacity-50"
      >
        {LOCALE_LABELS[locale]}
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M5.5 7.5l4.5 5 4.5-5" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 flex w-40 flex-col overflow-hidden rounded-xl border border-walnut-100 bg-white py-1 shadow-soft">
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => selectLocale(l)}
                className={`px-4 py-2 text-left text-sm ${
                  l === locale ? "font-semibold text-walnut-600" : "text-ink/70 hover:bg-walnut-50"
                }`}
              >
                {LOCALE_LABELS[l]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
