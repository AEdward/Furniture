"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export const inputClass =
  "rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none";
export const labelClass = "flex flex-col gap-1.5 text-sm";
export const sectionClass = "flex flex-col gap-4 rounded-2xl border border-walnut-100 bg-white/60 p-6";

// Shared submit/error/saved state for every /admin/settings/* section
// form — each page builds its own request body (via settingsToApiBody
// plus its edited slice) and passes it in on submit.
export function useSettingsSectionSubmit(buildBody: () => Record<string, unknown>) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody()),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return { handleSubmit, submitting, error, saved };
}

export function SettingsSaveBar({
  submitting,
  error,
  saved,
}: {
  submitting: boolean;
  error: string | null;
  saved: boolean;
}) {
  return (
    <>
      {error && <p className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-500">{error}</p>}
      {saved && !error && (
        <p className="rounded-lg bg-walnut-50 px-4 py-3 text-sm text-walnut-700">Settings saved.</p>
      )}
      <button type="submit" disabled={submitting} className="btn-primary self-start">
        {submitting ? "Saving…" : "Save settings"}
      </button>
    </>
  );
}
