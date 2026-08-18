import Link from "next/link";
import { getAllOrders } from "@/lib/db";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  placed: "bg-walnut-100 text-walnut-700",
  processing: "bg-terracotta-100 text-terracotta-500",
  shipped: "bg-walnut-100 text-walnut-700",
  delivered: "bg-walnut-500 text-walnut-50",
  cancelled: "bg-walnut-700/10 text-ink/50",
};

const paymentStyles: Record<string, string> = {
  paid: "bg-walnut-500 text-walnut-50",
  pending: "bg-terracotta-100 text-terracotta-500",
  failed: "bg-danger-50 text-danger-500",
};

const paymentMethodLabels: Record<string, string> = {
  chapa: "Chapa",
  cod: "Cash on delivery",
  bank_transfer: "Bank transfer",
};

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Orders</h1>
        <p className="mt-1 text-sm text-ink/60">{orders.length} total</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-walnut-100 bg-white/60">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-walnut-100 text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Items</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Payment</th>
              <th className="px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-walnut-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-ink/50">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-ink hover:text-walnut-600"
                    >
                      #{order.id}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink/70">
                    <div>{order.customerName}</div>
                    <div className="text-xs text-ink/40">{order.customerEmail}</div>
                  </td>
                  <td className="px-5 py-3 text-ink/70">{order.itemCount}</td>
                  <td className="px-5 py-3 text-ink/70">{formatPrice(order.subtotal)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        statusStyles[order.status] ?? "bg-walnut-100 text-walnut-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        paymentStyles[order.paymentStatus] ?? "bg-walnut-100 text-walnut-700"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                    <div className="mt-1 text-xs text-ink/40">
                      {paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink/50">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
