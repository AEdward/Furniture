"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useT } from "@/lib/i18n/context";

export type LanguageOption = { code: string; label: string };

export default function LanguageSwitcher({
  enabled,
  languages,
  dark = false,
}: {
  enabled: boolean;
  languages: LanguageOption[];
  dark?: boolean;
}) {
  const locale = useLocale();
  const t = useT();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const options: LanguageOption[] = [{ code: "en", label: "English" }, ...languages];
  // Hidden entirely unless an admin has turned translation on and
  // configured at least one language — otherwise English is the only
  // option, so there's nothing to switch.
  if (!enabled || options.length <= 1) return null;

  const current = options.find((o) => o.code === locale) ?? options[0];

  async function selectLocale(next: string) {
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
        className={`flex h-10 items-center gap-1 rounded-full border px-3 text-sm font-medium transition-colors disabled:opacity-50 ${
          dark
            ? "border-white/30 text-white/90 hover:border-terracotta-300 hover:text-terracotta-200"
            : "border-walnut-200 text-walnut-600 hover:bg-walnut-50"
        }`}
      >
        {current.label}
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M5.5 7.5l4.5 5 4.5-5" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 flex w-40 flex-col overflow-hidden rounded-xl border border-walnut-100 bg-white py-1 shadow-soft">
            {options.map((o) => (
              <button
                key={o.code}
                type="button"
                onClick={() => selectLocale(o.code)}
                className={`px-4 py-2 text-left text-sm ${
                  o.code === locale ? "font-semibold text-walnut-600" : "text-ink/70 hover:bg-walnut-50"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
