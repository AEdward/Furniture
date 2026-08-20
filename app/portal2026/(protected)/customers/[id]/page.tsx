import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerById } from "@/lib/customers";
import { getOrdersByCustomerId, getWishlist } from "@/lib/db";
import { formatPrice } from "@/lib/products";
import SendPasswordResetButton from "@/components/SendPasswordResetButton";

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();

  const customer = await getCustomerById(id);
  if (!customer) notFound();

  const [orders, wishlist] = await Promise.all([getOrdersByCustomerId(id), getWishlist(id)]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/portal2026/customers" className="text-sm text-ink/50 hover:text-walnut-600">
          ← Customers
        </Link>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-ink">{customer.name}</h1>
        <p className="mt-1 text-sm text-ink/60">
          {customer.email}
          {customer.phone && ` · ${customer.phone}`}
        </p>
        {customer.address && (
          <p className="mt-1 text-sm text-ink/60">
            {customer.address}, {customer.city} {customer.postalCode}
          </p>
        )}
        <p className="mt-1 text-xs text-ink/40">
          Joined {new Date(customer.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="rounded-2xl border border-walnut-100 bg-white/60 p-6">
        <p className="text-sm font-semibold text-ink">Account help</p>
        <p className="mt-1 text-sm text-ink/60">
          Send this customer a password reset code by email. Admins can view and assist with
          accounts, but never sign in as a customer.
        </p>
        <div className="mt-4">
          <SendPasswordResetButton customerId={customer.id} />
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-ink">Orders ({orders.length})</p>
        {orders.length === 0 ? (
          <p className="text-sm text-ink/50">No orders yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-walnut-100 bg-white/60">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-walnut-100 text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-walnut-100">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-5 py-3">
                      <Link href={`/portal2026/orders/${o.id}`} className="font-medium text-walnut-600 hover:underline">
                        #{o.id}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ink/70">{o.status}</td>
                    <td className="px-5 py-3 text-ink/70">{o.paymentStatus}</td>
                    <td className="px-5 py-3 text-ink/70">
                      {formatPrice(Math.max(0, o.subtotal - o.discountAmount))}
                    </td>
                    <td className="px-5 py-3 text-ink/50">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-ink">Wishlist ({wishlist.length})</p>
        {wishlist.length === 0 ? (
          <p className="text-sm text-ink/50">Nothing saved.</p>
        ) : (
          <ul className="flex flex-col gap-1.5 text-sm text-ink/70">
            {wishlist.map((p) => (
              <li key={p.id}>
                <Link href={`/shop/${p.slug}`} className="hover:text-walnut-600">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
