"use client";

import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import type { SiteSettings } from "@/lib/settings";
import { settingsToApiBody } from "@/lib/settings-form-utils";
import { inputClass, labelClass, sectionClass, SettingsSaveBar, useSettingsSectionSubmit } from "./shared";

export default function HeroSettingsForm({ initial }: { initial: SiteSettings }) {
  const [heroHeading, setHeroHeading] = useState(initial.hero.heading);
  const [heroSubheading, setHeroSubheading] = useState(initial.hero.subheading);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(initial.hero.imageUrl);
  const [heroCtaLabel, setHeroCtaLabel] = useState(initial.hero.ctaLabel);
  const [heroCtaHref, setHeroCtaHref] = useState(initial.hero.ctaHref);

  const { handleSubmit, submitting, error, saved } = useSettingsSectionSubmit(() => ({
    ...settingsToApiBody(initial),
    hero: {
      heading: heroHeading,
      subheading: heroSubheading,
      imageUrl: heroImageUrl,
      ctaLabel: heroCtaLabel,
      ctaHref: heroCtaHref,
    },
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className={sectionClass}>
        <ImageUpload value={heroImageUrl} onChange={setHeroImageUrl} label="Hero image (optional — falls back to featured products)" />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={`${labelClass} sm:col-span-2`}>
            Heading
            <input required value={heroHeading} onChange={(e) => setHeroHeading(e.target.value)} className={inputClass} />
          </label>
          <label className={`${labelClass} sm:col-span-2`}>
            Subheading
            <textarea required rows={2} value={heroSubheading} onChange={(e) => setHeroSubheading(e.target.value)} className={`${inputClass} resize-none`} />
          </label>
          <label className={labelClass}>
            Button label
            <input required value={heroCtaLabel} onChange={(e) => setHeroCtaLabel(e.target.value)} className={inputClass} />
          </label>
          <label className={labelClass}>
            Button link
            <input required value={heroCtaHref} onChange={(e) => setHeroCtaHref(e.target.value)} className={inputClass} />
          </label>
        </div>
      </div>

      <SettingsSaveBar submitting={submitting} error={error} saved={saved} />
    </form>
  );
}
