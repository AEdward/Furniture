"use client";

import { useMemo, useState } from "react";
import type { TranslationRow } from "@/lib/i18n/manage-translations";

export default function TranslationsEditor({ initialRows }: { initialRows: TranslationRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [errorId, setErrorId] = useState<number | null>(null);

  const needsCount = rows.filter((r) => r.needsTranslation).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) => r.sourceText.toLowerCase().includes(q) || r.translatedText.toLowerCase().includes(q)
    );
  }, [rows, query]);

  async function save(id: number, value: string) {
    setSavingId(id);
    setErrorId(null);
    try {
      const res = await fetch(`/api/admin/translations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ translatedText: value }),
      });
      if (!res.ok) throw new Error();
      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, translatedText: value, needsTranslation: value === r.sourceText } : r
        )
      );
    } catch {
      setErrorId(id);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/60">
          {needsCount === 0
            ? `All ${rows.length} strings translated.`
            : `${needsCount} of ${rows.length} still need translation.`}
        </p>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search English or translated text…"
          className="w-72 rounded-lg border border-walnut-200 px-3 py-1.5 text-sm focus:border-walnut-400 focus:outline-none"
        />
      </div>

      <div className="flex flex-col divide-y divide-walnut-100 rounded-2xl border border-walnut-100 bg-white/60">
        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink/50">No strings match &ldquo;{query}&rdquo;.</p>
        ) : (
          filtered.map((row) => (
            <TranslationRowEditor
              key={row.id}
              row={row}
              saving={savingId === row.id}
              error={errorId === row.id}
              onSave={(value) => save(row.id, value)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TranslationRowEditor({
  row,
  saving,
  error,
  onSave,
}: {
  row: TranslationRow;
  saving: boolean;
  error: boolean;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(row.translatedText);
  const dirty = value !== row.translatedText;

  return (
    <div className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-2 md:gap-6">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-ink/40">English</div>
        <p className="mt-1 text-sm text-ink/80">{row.sourceText}</p>
        {row.needsTranslation && !dirty && (
          <span className="mt-2 inline-block rounded-full bg-terracotta-100 px-2 py-0.5 text-xs font-medium text-terracotta-500">
            Needs translation
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-walnut-200 px-3 py-2 text-sm focus:border-walnut-400 focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!dirty || saving || !value.trim()}
            onClick={() => onSave(value)}
            className="rounded-full bg-walnut-500 px-4 py-1.5 text-xs font-medium text-walnut-50 transition-opacity disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {error && <span className="text-xs text-danger-500">Couldn&apos;t save. Try again.</span>}
        </div>
      </div>
    </div>
  );
}
