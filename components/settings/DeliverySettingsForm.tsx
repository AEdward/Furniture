"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/settings";
import { settingsToApiBody } from "@/lib/settings-form-utils";
import { inputClass, labelClass, sectionClass, SettingsSaveBar, useSettingsSectionSubmit } from "./shared";

export default function DeliverySettingsForm({ initial }: { initial: SiteSettings }) {
  const [addisMinDays, setAddisMinDays] = useState(String(initial.delivery.addisMinDays));
  const [addisMaxDays, setAddisMaxDays] = useState(String(initial.delivery.addisMaxDays));
  const [addisFee, setAddisFee] = useState(String(initial.delivery.addisFee));
  const [otherMinDays, setOtherMinDays] = useState(String(initial.delivery.otherMinDays));
  const [otherMaxDays, setOtherMaxDays] = useState(String(initial.delivery.otherMaxDays));
  const [otherFee, setOtherFee] = useState(String(initial.delivery.otherFee));
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(String(initial.delivery.freeDeliveryThreshold));
  const [deliveryInstallationFee, setDeliveryInstallationFee] = useState(String(initial.delivery.installationFee));
  const [carryingFee, setCarryingFee] = useState(String(initial.delivery.carryingFee));
  const [carryingFeeNote, setCarryingFeeNote] = useState(initial.delivery.carryingFeeNote);

  const { handleSubmit, submitting, error, saved } = useSettingsSectionSubmit(() => ({
    ...settingsToApiBody(initial),
    delivery: {
      addisMinDays: Number(addisMinDays),
      addisMaxDays: Number(addisMaxDays),
      addisFee: Number(addisFee),
      otherMinDays: Number(otherMinDays),
      otherMaxDays: Number(otherMaxDays),
      otherFee: Number(otherFee),
      freeDeliveryThreshold: Number(freeDeliveryThreshold),
      installationFee: Number(deliveryInstallationFee),
      carryingFee: Number(carryingFee),
      carryingFeeNote,
    },
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className={sectionClass}>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className={labelClass}>
            Addis Ababa: min days
            <input required type="number" min={0} value={addisMinDays} onChange={(e) => setAddisMinDays(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Addis Ababa: max days
            <input required type="number" min={0} value={addisMaxDays} onChange={(e) => setAddisMaxDays(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Addis Ababa: fee (ETB)
            <input required type="number" min={0} value={addisFee} onChange={(e) => setAddisFee(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Other cities: min days
            <input required type="number" min={0} value={otherMinDays} onChange={(e) => setOtherMinDays(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Other cities: max days
            <input required type="number" min={0} value={otherMaxDays} onChange={(e) => setOtherMaxDays(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Other cities: fee (ETB)
            <input required type="number" min={0} value={otherFee} onChange={(e) => setOtherFee(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Free delivery threshold (ETB)
            <input required type="number" min={0} value={freeDeliveryThreshold} onChange={(e) => setFreeDeliveryThreshold(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Installation fee (ETB)
            <input required type="number" min={0} value={deliveryInstallationFee} onChange={(e) => setDeliveryInstallationFee(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Carrying fee (ETB)
            <input required type="number" min={0} value={carryingFee} onChange={(e) => setCarryingFee(e.target.value)} className={inputClass} />
          </label>
          <label className={`${labelClass} sm:col-span-3`}>
            Carrying fee note
            <input value={carryingFeeNote} onChange={(e) => setCarryingFeeNote(e.target.value)} className={inputClass} />
          </label>
        </div>
      </div>

      <SettingsSaveBar submitting={submitting} error={error} saved={saved} />
    </form>
  );
}
