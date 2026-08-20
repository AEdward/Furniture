import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customers";
import NotificationsList from "@/components/NotificationsList";

export const dynamic = "force-dynamic";

export default async function AccountNotificationsPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/login?from=/account/notifications");

  return (
    <div className="container-shop py-16">
      <Link href="/account" className="text-sm text-ink/50 hover:text-walnut-600">
        ← My account
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-ink">Notifications</h1>

      <div className="mt-6">
        <NotificationsList apiBase="/api/account/notifications" />
      </div>
    </div>
  );
}
