import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customers";
import AccountLogoutButton from "@/components/AccountLogoutButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/login?from=/account");

  return (
    <div className="container-shop py-16">
      <h1 className="font-serif text-2xl font-semibold text-ink">My account</h1>
      <p className="mt-1 text-sm text-ink/60">
        {customer.name} — {customer.email}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:max-w-lg">
        <Link
          href="/account/orders"
          className="rounded-2xl border border-walnut-100 p-6 transition-shadow hover:shadow-soft"
        >
          <h2 className="font-serif text-lg font-semibold text-ink">Order history</h2>
          <p className="mt-1 text-sm text-ink/60">See your past orders and their status.</p>
        </Link>
        <Link
          href="/account/wishlist"
          className="rounded-2xl border border-walnut-100 p-6 transition-shadow hover:shadow-soft"
        >
          <h2 className="font-serif text-lg font-semibold text-ink">Wishlist</h2>
          <p className="mt-1 text-sm text-ink/60">Items you've saved for later.</p>
        </Link>
        <Link
          href="/account/profile"
          className="rounded-2xl border border-walnut-100 p-6 transition-shadow hover:shadow-soft"
        >
          <h2 className="font-serif text-lg font-semibold text-ink">Profile</h2>
          <p className="mt-1 text-sm text-ink/60">Your name, phone, and default delivery address.</p>
        </Link>
        <Link
          href="/account/settings"
          className="rounded-2xl border border-walnut-100 p-6 transition-shadow hover:shadow-soft"
        >
          <h2 className="font-serif text-lg font-semibold text-ink">Account settings</h2>
          <p className="mt-1 text-sm text-ink/60">Change your email or password.</p>
        </Link>
        <Link
          href="/account/notifications"
          className="rounded-2xl border border-walnut-100 p-6 transition-shadow hover:shadow-soft"
        >
          <h2 className="font-serif text-lg font-semibold text-ink">Notifications</h2>
          <p className="mt-1 text-sm text-ink/60">Updates on your orders and account.</p>
        </Link>
      </div>

      <div className="mt-8">
        <AccountLogoutButton />
      </div>
    </div>
  );
}
