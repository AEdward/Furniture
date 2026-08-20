import Link from "next/link";
import { getSettings } from "@/lib/db";
import { requireAdminPage } from "@/lib/admin-guard";
import PaymentSettingsForm from "@/components/settings/PaymentSettingsForm";

export const dynamic = "force-dynamic";

export default async function PaymentSettingsPage() {
  await requireAdminPage();
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/settings" className="text-sm text-ink/50 hover:text-walnut-600">
          ← Settings
        </Link>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-ink">Payment methods</h1>
      </div>
      <PaymentSettingsForm initial={settings} />
    </div>
  );
}
