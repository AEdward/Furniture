import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { getSettings } from "@/lib/db";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createT } from "@/lib/i18n/t";
import { translateSettings } from "@/lib/i18n/translate-content";

export const metadata: Metadata = { title: "Contact" };
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const locale = await getLocale();
  const [settingsRaw, dict] = await Promise.all([getSettings(), getDictionary(locale)]);
  const t = createT(dict);
  const settings = await translateSettings(settingsRaw, locale);

  return (
    <div className="container-shop py-16">
      <div className="mb-10 text-center">
        <p className="section-label">{settings.contact.subheading}</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink sm:text-4xl">
          {settings.contact.heading}
        </h1>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="rounded-2xl border border-walnut-100 p-6 sm:p-8">
          <ContactForm />
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">
              {t("Visit the showroom")}
            </h2>
            {settings.address.map((line) => (
              <p key={line} className="text-ink/70">
                {line}
              </p>
            ))}
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">
              {t("Talk to us")}
            </h2>
            <p className="text-ink/70">{settings.email}</p>
            <p className="text-ink/70">{settings.phone}</p>
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">
              {t("Hours")}
            </h2>
            <p className="text-ink/70">{settings.contact.hoursWeekday}</p>
            <p className="text-ink/70">{settings.contact.hoursWeekend}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
