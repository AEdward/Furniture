"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/settings";
import { settingsToApiBody } from "@/lib/settings-form-utils";
import { inputClass, labelClass, sectionClass, SettingsSaveBar, useSettingsSectionSubmit } from "./shared";

export default function BankDetailsSettingsForm({ initial }: { initial: SiteSettings }) {
  const [bankName, setBankName] = useState(initial.bankDetails.bankName);
  const [bankAccountName, setBankAccountName] = useState(initial.bankDetails.accountName);
  const [bankAccountNumber, setBankAccountNumber] = useState(initial.bankDetails.accountNumber);
  const [bankBranch, setBankBranch] = useState(initial.bankDetails.branch);
  const [bankInstructions, setBankInstructions] = useState(initial.bankDetails.instructions);

  const { handleSubmit, submitting, error, saved } = useSettingsSectionSubmit(() => ({
    ...settingsToApiBody(initial),
    bankDetails: {
      bankName,
      accountName: bankAccountName,
      accountNumber: bankAccountNumber,
      branch: bankBranch,
      instructions: bankInstructions,
    },
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className={sectionClass}>
        <p className="text-xs text-ink/50">
          Shown to customers who choose "Bank transfer" at checkout, and on their order
          confirmation page.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Bank name
            <input value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Account name
            <input value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Account number
            <input value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Branch
            <input value={bankBranch} onChange={(e) => setBankBranch(e.target.value)} className={inputClass} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Instructions for the customer
            <textarea rows={2} value={bankInstructions} onChange={(e) => setBankInstructions(e.target.value)} className={`${inputClass} resize-none`} />
          </label>
        </div>
      </div>

      <SettingsSaveBar submitting={submitting} error={error} saved={saved} />
    </form>
  );
}
