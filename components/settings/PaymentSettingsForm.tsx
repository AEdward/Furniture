"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/settings";
import { settingsToApiBody } from "@/lib/settings-form-utils";
import { inputClass, labelClass, sectionClass, SettingsSaveBar, useSettingsSectionSubmit } from "./shared";

export default function PaymentSettingsForm({ initial }: { initial: SiteSettings }) {
  const [paymentMethods, setPaymentMethods] = useState(initial.paymentMethods.join("\n"));

  const { handleSubmit, submitting, error, saved } = useSettingsSectionSubmit(() => ({
    ...settingsToApiBody(initial),
    paymentMethods,
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className={sectionClass}>
        <label className={labelClass}>
          One per line
          <textarea rows={4} value={paymentMethods} onChange={(e) => setPaymentMethods(e.target.value)} className={`${inputClass} resize-none`} />
        </label>
      </div>

      <SettingsSaveBar submitting={submitting} error={error} saved={saved} />
    </form>
  );
}
