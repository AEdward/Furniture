"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/settings";
import { settingsToApiBody } from "@/lib/settings-form-utils";
import { inputClass, labelClass, sectionClass, SettingsSaveBar, useSettingsSectionSubmit } from "./shared";

export default function WarrantySettingsForm({ initial }: { initial: SiteSettings }) {
  const [warrantyTiers, setWarrantyTiers] = useState(
    initial.warranty.tiers.map((t) => `${t.part} | ${t.years}`).join("\n")
  );
  const [warrantyNotCovered, setWarrantyNotCovered] = useState(initial.warranty.notCovered);

  const { handleSubmit, submitting, error, saved } = useSettingsSectionSubmit(() => ({
    ...settingsToApiBody(initial),
    warranty: { tiers: warrantyTiers, notCovered: warrantyNotCovered },
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className={sectionClass}>
        <label className={labelClass}>
          Tiers — one per line, formatted as "Part name | years"
          <textarea rows={4} value={warrantyTiers} onChange={(e) => setWarrantyTiers(e.target.value)} className={`${inputClass} resize-none font-mono text-xs`} placeholder="Frame & core material | 5" />
        </label>
        <label className={labelClass}>
          Not covered
          <textarea rows={2} value={warrantyNotCovered} onChange={(e) => setWarrantyNotCovered(e.target.value)} className={`${inputClass} resize-none`} />
        </label>
      </div>

      <SettingsSaveBar submitting={submitting} error={error} saved={saved} />
    </form>
  );
}
