"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";
import type { SiteSettings } from "@/lib/settings";

export default function SettingsForm({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(initial.name);
  const [shortName, setShortName] = useState(initial.shortName);
  const [tagline, setTagline] = useState(initial.tagline);
  const [description, setDescription] = useState(initial.description);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [telegramUsername, setTelegramUsername] = useState(initial.telegramUsername);
  const [address, setAddress] = useState(initial.address.join("\n"));
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    String(initial.freeShippingThreshold)
  );

  const [heroHeading, setHeroHeading] = useState(initial.hero.heading);
  const [heroSubheading, setHeroSubheading] = useState(initial.hero.subheading);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(initial.hero.imageUrl);
  const [heroCtaLabel, setHeroCtaLabel] = useState(initial.hero.ctaLabel);
  const [heroCtaHref, setHeroCtaHref] = useState(initial.hero.ctaHref);

  const [addisMinDays, setAddisMinDays] = useState(String(initial.delivery.addisMinDays));
  const [addisMaxDays, setAddisMaxDays] = useState(String(initial.delivery.addisMaxDays));
  const [addisFee, setAddisFee] = useState(String(initial.delivery.addisFee));
  const [otherMinDays, setOtherMinDays] = useState(String(initial.delivery.otherMinDays));
  const [otherMaxDays, setOtherMaxDays] = useState(String(initial.delivery.otherMaxDays));
  const [otherFee, setOtherFee] = useState(String(initial.delivery.otherFee));
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(
    String(initial.delivery.freeDeliveryThreshold)
  );
  const [deliveryInstallationFee, setDeliveryInstallationFee] = useState(
    String(initial.delivery.installationFee)
  );
  const [carryingFee, setCarryingFee] = useState(String(initial.delivery.carryingFee));
  const [carryingFeeNote, setCarryingFeeNote] = useState(initial.delivery.carryingFeeNote);

  const [assemblyRequired, setAssemblyRequired] = useState(initial.assembly.requiredByDefault);
  const [assemblyMinutes, setAssemblyMinutes] = useState(String(initial.assembly.typicalMinutes));
  const [installAvailable, setInstallAvailable] = useState(initial.assembly.installationAvailable);
  const [assemblyInstallFee, setAssemblyInstallFee] = useState(
    String(initial.assembly.installationFee)
  );

  const [warrantyTiers, setWarrantyTiers] = useState(
    initial.warranty.tiers.map((t) => `${t.part} | ${t.years}`).join("\n")
  );
  const [warrantyNotCovered, setWarrantyNotCovered] = useState(initial.warranty.notCovered);

  const [returnsPeriodDays, setReturnsPeriodDays] = useState(String(initial.returns.periodDays));
  const [returnsConditions, setReturnsConditions] = useState(initial.returns.conditions.join("\n"));
  const [returnsCustomExclusion, setReturnsCustomExclusion] = useState(
    initial.returns.customExclusion
  );
  const [returnsWhoPays, setReturnsWhoPays] = useState(initial.returns.whoPaysReturn);
  const [returnsRefundProcess, setReturnsRefundProcess] = useState(initial.returns.refundProcess);
  const [returnsDamaged, setReturnsDamaged] = useState(initial.returns.damagedProcedure);

  const [paymentMethods, setPaymentMethods] = useState(initial.paymentMethods.join("\n"));

  const [contactHeading, setContactHeading] = useState(initial.contact.heading);
  const [contactSubheading, setContactSubheading] = useState(initial.contact.subheading);
  const [contactHoursWeekday, setContactHoursWeekday] = useState(initial.contact.hoursWeekday);
  const [contactHoursWeekend, setContactHoursWeekend] = useState(initial.contact.hoursWeekend);

  const [translationEnabled, setTranslationEnabled] = useState(initial.translation.enabled);
  const [translationLanguages, setTranslationLanguages] = useState(
    initial.translation.languages.map((l) => `${l.code} | ${l.label}`).join("\n")
  );

  const [bankName, setBankName] = useState(initial.bankDetails.bankName);
  const [bankAccountName, setBankAccountName] = useState(initial.bankDetails.accountName);
  const [bankAccountNumber, setBankAccountNumber] = useState(initial.bankDetails.accountNumber);
  const [bankBranch, setBankBranch] = useState(initial.bankDetails.branch);
  const [bankInstructions, setBankInstructions] = useState(initial.bankDetails.instructions);

  const inputClass =
    "rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none";
  const labelClass = "flex flex-col gap-1.5 text-sm";
  const sectionClass = "flex flex-col gap-4 rounded-2xl border border-walnut-100 bg-white/60 p-6";
  const sectionTitleClass = "font-serif text-base font-semibold text-ink";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSaved(false);

    const body = {
      name,
      shortName,
      tagline,
      description,
      email,
      phone,
      telegramUsername,
      address,
      freeShippingThreshold: Number(freeShippingThreshold),
      hero: {
        heading: heroHeading,
        subheading: heroSubheading,
        imageUrl: heroImageUrl,
        ctaLabel: heroCtaLabel,
        ctaHref: heroCtaHref,
      },
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
      assembly: {
        requiredByDefault: assemblyRequired,
        typicalMinutes: Number(assemblyMinutes),
        installationAvailable: installAvailable,
        installationFee: Number(assemblyInstallFee),
      },
      warranty: { tiers: warrantyTiers, notCovered: warrantyNotCovered },
      returns: {
        periodDays: Number(returnsPeriodDays),
        conditions: returnsConditions,
        customExclusion: returnsCustomExclusion,
        whoPaysReturn: returnsWhoPays,
        refundProcess: returnsRefundProcess,
        damagedProcedure: returnsDamaged,
      },
      paymentMethods,
      contact: {
        heading: contactHeading,
        subheading: contactSubheading,
        hoursWeekday: contactHoursWeekday,
        hoursWeekend: contactHoursWeekend,
      },
      bankDetails: {
        bankName,
        accountName: bankAccountName,
        accountNumber: bankAccountNumber,
        branch: bankBranch,
        instructions: bankInstructions,
      },
      translation: {
        enabled: translationEnabled,
        languages: translationLanguages,
      },
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Site &amp; contact</h2>
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
              placeholder="goldenwoodfurniture"
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

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Home page hero</h2>
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

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Delivery</h2>
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

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Assembly &amp; installation</h2>
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

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Warranty</h2>
        <label className={labelClass}>
          Tiers — one per line, formatted as "Part name | years"
          <textarea rows={4} value={warrantyTiers} onChange={(e) => setWarrantyTiers(e.target.value)} className={`${inputClass} resize-none font-mono text-xs`} placeholder="Frame & core material | 5" />
        </label>
        <label className={labelClass}>
          Not covered
          <textarea rows={2} value={warrantyNotCovered} onChange={(e) => setWarrantyNotCovered(e.target.value)} className={`${inputClass} resize-none`} />
        </label>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Returns &amp; exchanges</h2>
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

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Payment methods</h2>
        <label className={labelClass}>
          One per line
          <textarea rows={4} value={paymentMethods} onChange={(e) => setPaymentMethods(e.target.value)} className={`${inputClass} resize-none`} />
        </label>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Language &amp; translation</h2>
        <p className="text-xs text-ink/50">
          Manage which languages the storefront's language switcher offers. Fill in the actual
          translated text at <a href="/admin/translations" className="font-medium text-walnut-600 hover:underline">Translations</a>.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={translationEnabled}
            onChange={(e) => setTranslationEnabled(e.target.checked)}
          />
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

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Contact page</h2>
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

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Bank transfer details</h2>
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

      {error && (
        <p className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-500">{error}</p>
      )}
      {saved && !error && (
        <p className="rounded-lg bg-walnut-50 px-4 py-3 text-sm text-walnut-700">
          Settings saved.
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary self-start">
        {submitting ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
