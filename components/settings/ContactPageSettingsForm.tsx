"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/settings";
import { settingsToApiBody } from "@/lib/settings-form-utils";
import { inputClass, labelClass, sectionClass, SettingsSaveBar, useSettingsSectionSubmit } from "./shared";

export default function ContactPageSettingsForm({ initial }: { initial: SiteSettings }) {
  const [contactHeading, setContactHeading] = useState(initial.contact.heading);
  const [contactSubheading, setContactSubheading] = useState(initial.contact.subheading);
  const [contactHoursWeekday, setContactHoursWeekday] = useState(initial.contact.hoursWeekday);
  const [contactHoursWeekend, setContactHoursWeekend] = useState(initial.contact.hoursWeekend);

  const { handleSubmit, submitting, error, saved } = useSettingsSectionSubmit(() => ({
    ...settingsToApiBody(initial),
    contact: {
      heading: contactHeading,
      subheading: contactSubheading,
      hoursWeekday: contactHoursWeekday,
      hoursWeekend: contactHoursWeekend,
    },
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className={sectionClass}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Subheading (small label above title)
            <input required value={contactSubheading} onChange={(e) => setContactSubheading(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Heading
            <input required value={contactHeading} onChange={(e) => setContactHeading(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Weekday hours
            <input value={contactHoursWeekday} onChange={(e) => setContactHoursWeekday(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Weekend hours
            <input value={contactHoursWeekend} onChange={(e) => setContactHoursWeekend(e.target.value)} className={inputClass} />
          </label>
        </div>
      </div>

      <SettingsSaveBar submitting={submitting} error={error} saved={saved} />
    </form>
  );
}
