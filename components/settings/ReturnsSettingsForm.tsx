"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/settings";
import { settingsToApiBody } from "@/lib/settings-form-utils";
import { inputClass, labelClass, sectionClass, SettingsSaveBar, useSettingsSectionSubmit } from "./shared";

export default function ReturnsSettingsForm({ initial }: { initial: SiteSettings }) {
  const [returnsPeriodDays, setReturnsPeriodDays] = useState(String(initial.returns.periodDays));
  const [returnsConditions, setReturnsConditions] = useState(initial.returns.conditions.join("\n"));
  const [returnsCustomExclusion, setReturnsCustomExclusion] = useState(initial.returns.customExclusion);
  const [returnsWhoPays, setReturnsWhoPays] = useState(initial.returns.whoPaysReturn);
  const [returnsRefundProcess, setReturnsRefundProcess] = useState(initial.returns.refundProcess);
  const [returnsDamaged, setReturnsDamaged] = useState(initial.returns.damagedProcedure);

  const { handleSubmit, submitting, error, saved } = useSettingsSectionSubmit(() => ({
    ...settingsToApiBody(initial),
    returns: {
      periodDays: Number(returnsPeriodDays),
      conditions: returnsConditions,
      customExclusion: returnsCustomExclusion,
      whoPaysReturn: returnsWhoPays,
      refundProcess: returnsRefundProcess,
      damagedProcedure: returnsDamaged,
    },
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className={sectionClass}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Return period (days)
            <input required type="number" min={0} value={returnsPeriodDays} onChange={(e) => setReturnsPeriodDays(e.target.value)} className={inputClass} />
          </label>
        </div>
        <label className={labelClass}>
          Conditions — one per line
          <textarea rows={3} value={returnsConditions} onChange={(e) => setReturnsConditions(e.target.value)} className={`${inputClass} resize-none`} />
        </label>
        <label className={labelClass}>
          Custom / made-to-order exclusion
          <textarea rows={2} value={returnsCustomExclusion} onChange={(e) => setReturnsCustomExclusion(e.target.value)} className={`${inputClass} resize-none`} />
        </label>
        <label className={labelClass}>
          Who pays return shipping
          <textarea rows={2} value={returnsWhoPays} onChange={(e) => setReturnsWhoPays(e.target.value)} className={`${inputClass} resize-none`} />
        </label>
        <label className={labelClass}>
          Refund process
          <textarea rows={2} value={returnsRefundProcess} onChange={(e) => setReturnsRefundProcess(e.target.value)} className={`${inputClass} resize-none`} />
        </label>
        <label className={labelClass}>
          Damaged-on-arrival procedure
          <textarea rows={2} value={returnsDamaged} onChange={(e) => setReturnsDamaged(e.target.value)} className={`${inputClass} resize-none`} />
        </label>
      </div>

      <SettingsSaveBar submitting={submitting} error={error} saved={saved} />
    </form>
  );
}
