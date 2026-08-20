import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customers";
import ProfileForm from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function AccountProfilePage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/login?from=/account/profile");

  return (
    <div className="container-shop py-16">
      <Link href="/account" className="text-sm text-ink/50 hover:text-walnut-600">
        ← My account
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-ink">Profile</h1>
      <ProfileForm
        initial={{
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          postalCode: customer.postalCode,
        }}
      />
    </div>
  );
}
