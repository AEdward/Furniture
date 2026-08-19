import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customers";
import { getOrdersByCustomerId } from "@/lib/db";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/account/login?from=/account/orders");

  const orders = await getOrdersByCustomerId(customer.id);

  return (
    <div className="container-shop py-16">
      <Link href="/account" className="text-sm text-ink/50 hover:text-walnut-600">
        ← My account
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-semibold text-ink">Order history</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-ink/60">
          No orders yet.{" "}
          <Link href="/shop" className="font-medium text-walnut-600 hover:underline">
            Start shopping
          </Link>
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-walnut-100">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-walnut-100 bg-walnut-50/50 text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-walnut-100">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-5 py-3">
                    <Link
                      href={`/order-confirmation/${order.id}`}
                      className="font-medium text-ink hover:text-walnut-600"
                    >
                      #{order.id}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink/60">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-ink/70">
                    {formatPrice(order.subtotal - order.discountAmount)}
                  </td>
                  <td className="px-5 py-3 capitalize text-ink/70">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
