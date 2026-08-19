import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customers";
import { getWishlist } from "@/lib/db";
import WishlistGrid from "@/components/WishlistGrid";

export const dynamic = "force-dynamic";

export default async function AccountWishlistPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/login?from=/account/wishlist");

  const items = await getWishlist(customer.id);

  return (
    <div className="container-shop py-16">
      <Link href="/account" className="text-sm text-ink/50 hover:text-walnut-600">
        ← My account
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-ink">Wishlist</h1>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-ink/60">
          Nothing saved yet.{" "}
          <Link href="/shop" className="font-medium text-walnut-600 hover:underline">
            Browse the shop
          </Link>
        </p>
      ) : (
        <div className="mt-6">
          <WishlistGrid items={items} />
        </div>
      )}
    </div>
  );
}
