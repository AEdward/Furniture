"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/settings";
import { settingsToApiBody } from "@/lib/settings-form-utils";
import { inputClass, labelClass, sectionClass, SettingsSaveBar, useSettingsSectionSubmit } from "./shared";

export default function AssemblySettingsForm({ initial }: { initial: SiteSettings }) {
  const [assemblyRequired, setAssemblyRequired] = useState(initial.assembly.requiredByDefault);
  const [assemblyMinutes, setAssemblyMinutes] = useState(String(initial.assembly.typicalMinutes));
  const [installAvailable, setInstallAvailable] = useState(initial.assembly.installationAvailable);
  const [assemblyInstallFee, setAssemblyInstallFee] = useState(String(initial.assembly.installationFee));

  const { handleSubmit, submitting, error, saved } = useSettingsSectionSubmit(() => ({
    ...settingsToApiBody(initial),
    assembly: {
      requiredByDefault: assemblyRequired,
      typicalMinutes: Number(assemblyMinutes),
      installationAvailable: installAvailable,
      installationFee: Number(assemblyInstallFee),
    },
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className={sectionClass}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={assemblyRequired} onChange={(e) => setAssemblyRequired(e.target.checked)} />
            Installation required by default
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={installAvailable} onChange={(e) => setInstallAvailable(e.target.checked)} />
            Professional installation available
          </label>
          <label className={labelClass}>
            Typical install time (minutes)
            <input required type="number" min={0} value={assemblyMinutes} onChange={(e) => setAssemblyMinutes(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Installation fee (ETB)
            <input required type="number" min={0} value={assemblyInstallFee} onChange={(e) => setAssemblyInstallFee(e.target.value)} className={inputClass} />
          </label>
        </div>
      </div>

      <SettingsSaveBar submitting={submitting} error={error} saved={saved} />
    </form>
  );
}
