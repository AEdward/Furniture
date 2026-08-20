"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/settings";
import { settingsToApiBody } from "@/lib/settings-form-utils";
import { inputClass, labelClass, sectionClass, SettingsSaveBar, useSettingsSectionSubmit } from "./shared";

export default function GeneralSettingsForm({ initial }: { initial: SiteSettings }) {
  const [name, setName] = useState(initial.name);
  const [shortName, setShortName] = useState(initial.shortName);
  const [tagline, setTagline] = useState(initial.tagline);
  const [description, setDescription] = useState(initial.description);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [telegramUsername, setTelegramUsername] = useState(initial.telegramUsername);
  const [address, setAddress] = useState(initial.address.join("\n"));
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(String(initial.freeShippingThreshold));

  const { handleSubmit, submitting, error, saved } = useSettingsSectionSubmit(() => ({
    ...settingsToApiBody(initial),
    name,
    shortName,
    tagline,
    description,
    email,
    phone,
    telegramUsername,
    address,
    freeShippingThreshold: Number(freeShippingThreshold),
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className={sectionClass}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Site name
            <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Short name (logo initial)
            <input required value={shortName} onChange={(e) => setShortName(e.target.value)} className={inputClass} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Tagline
            <input required value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputClass} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Description
            <textarea required rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`} />
          </label>
          <label className={labelClass}>
            Email
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Phone
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Telegram username (optional)
            <input
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value.replace(/^@/, ""))}
              placeholder="example"
              className={inputClass}
            />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Address (one line per row)
            <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} className={`${inputClass} resize-none`} />
          </label>
          <label className={labelClass}>
            Free shipping threshold (ETB)
            <input required type="number" min={0} value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(e.target.value)} className={inputClass} />
          </label>
        </div>
      </div>

      <SettingsSaveBar submitting={submitting} error={error} saved={saved} />
    </form>
  );
}
