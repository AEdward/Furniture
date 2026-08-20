"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/settings";
import { settingsToApiBody } from "@/lib/settings-form-utils";
import { inputClass, labelClass, sectionClass, SettingsSaveBar, useSettingsSectionSubmit } from "./shared";

export default function LanguageSettingsForm({ initial }: { initial: SiteSettings }) {
  const [translationEnabled, setTranslationEnabled] = useState(initial.translation.enabled);
  const [translationLanguages, setTranslationLanguages] = useState(
    initial.translation.languages.map((l) => `${l.code} | ${l.label}`).join("\n")
  );

  const { handleSubmit, submitting, error, saved } = useSettingsSectionSubmit(() => ({
    ...settingsToApiBody(initial),
    translation: { enabled: translationEnabled, languages: translationLanguages },
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className={sectionClass}>
        <p className="text-xs text-ink/50">
          Manage which languages the storefront's language switcher offers. Fill in the actual
          translated text at <a href="/portal2026/translations" className="font-medium text-walnut-600 hover:underline">Translations</a>.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={translationEnabled} onChange={(e) => setTranslationEnabled(e.target.checked)} />
          Automatically translate new text with Google Translate
        </label>
        <label className={labelClass}>
          Languages — one per line, formatted as "code | Label" (e.g. "am | አማርኛ")
          <textarea
            rows={4}
            value={translationLanguages}
            onChange={(e) => setTranslationLanguages(e.target.value)}
            className={`${inputClass} resize-none font-mono text-xs`}
            placeholder="am | አማርኛ"
          />
        </label>
      </div>

      <SettingsSaveBar submitting={submitting} error={error} saved={saved} />
    </form>
  );
}
