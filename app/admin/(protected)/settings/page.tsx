import SettingsForm from "@/components/SettingsForm";
import { getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink/60">
          Site name, contact info, home page hero, and delivery/warranty/returns/payment
          policy shown across the site.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
