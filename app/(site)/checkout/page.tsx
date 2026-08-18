import { getSettings } from "@/lib/db";
import { getLocale } from "@/lib/i18n/get-locale";
import { translateSettings } from "@/lib/i18n/translate-content";
import CheckoutForm from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const locale = await getLocale();
  const settingsRaw = await getSettings();
  const settings = await translateSettings(settingsRaw, locale);

  return <CheckoutForm bankDetails={settings.bankDetails} />;
}
