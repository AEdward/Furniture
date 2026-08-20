import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customers";
import AccountSettingsPanel from "@/components/AccountSettingsPanel";

export const dynamic = "force-dynamic";

export default async function AccountSettingsPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/login?from=/account/settings");

  return (
    <div className="container-shop py-16">
      <Link href="/account" className="text-sm text-ink/50 hover:text-walnut-600">
        ← My account
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-ink">Account settings</h1>

      <div className="mt-6 max-w-md">
        <AccountSettingsPanel
          currentEmail={customer.email}
          changePasswordApi="/api/account/settings/change-password"
          requestEmailChangeApi="/api/account/settings/request-email-change"
          confirmEmailChangeApi="/api/account/settings/confirm-email-change"
        />
      </div>
    </div>
  );
}
