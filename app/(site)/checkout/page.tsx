import { getSettings } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/customers";
import { getLocale } from "@/lib/i18n/get-locale";
import { translateSettings } from "@/lib/i18n/translate-content";
import CheckoutForm from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const locale = await getLocale();
  const [settingsRaw, customer] = await Promise.all([getSettings(), getCurrentCustomer()]);
  const settings = await translateSettings(settingsRaw, locale);

  return (
    <CheckoutForm
      bankDetails={settings.bankDetails}
      prefill={
        customer
          ? {
              customerName: customer.name,
              customerEmail: customer.email,
              customerPhone: customer.phone,
              address: customer.address,
              city: customer.city,
              postalCode: customer.postalCode,
            }
          : undefined
      }
    />
  );
}
