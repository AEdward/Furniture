import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/db";
import { formatPrice } from "@/lib/products";
import OrderStatusSelect from "@/components/OrderStatusSelect";
import PaymentStatusActions from "@/components/PaymentStatusActions";
import { requireAdminPage } from "@/lib/admin-guard";

const paymentStyles: Record<string, string> = {
  paid: "bg-walnut-500 text-walnut-50",
  pending: "bg-terracotta-100 text-terracotta-500",
  failed: "bg-danger-50 text-danger-500",
};

const paymentMethodLabels: Record<string, string> = {
  chapa: "Chapa (online)",
  cod: "Cash on delivery",
  bank_transfer: "Bank transfer",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdminPage();
  const id = Number(params.id);
  const order = Number.isInteger(id) ? await getOrderById(id) : undefined;
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl font-semibold text-ink">
        Order #{order.id}
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="rounded-2xl border border-walnut-100 bg-white/60 p-6">
          <h2 className="font-serif text-lg font-semibold text-ink">Items</h2>
          <ul className="mt-4 flex flex-col divide-y divide-walnut-100">
            {order.items.map((item) => (
              <li key={`${item.slug}::${item.variant ?? ""}`} className="flex justify-between py-3 text-sm">
                <span className="text-ink/70">
                  {item.name}
                  {item.variant && <span className="text-ink/40"> — {item.variant}</span>} ×{" "}
                  {item.quantity}
                </span>
                <span className="font-medium text-ink">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-walnut-100 pt-4 font-semibold text-ink">
            <span>Total</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-walnut-100 bg-white/60 p-6">
            <h2 className="font-serif text-lg font-semibold text-ink">Status</h2>
            <div className="mt-3">
              <OrderStatusSelect orderId={order.id} status={order.status} />
            </div>
          </div>

          <div className="rounded-2xl border border-walnut-100 bg-white/60 p-6">
            <h2 className="font-serif text-lg font-semibold text-ink">Payment</h2>
            <p className="mt-3 text-sm text-ink/70">
              {paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}
            </p>
            <p
              className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                paymentStyles[order.paymentStatus] ?? "bg-walnut-100 text-walnut-700"
              }`}
            >
              {order.paymentStatus}
            </p>
            {order.paymentProvider && (
              <p className="mt-2 text-xs text-ink/50">
                Via {order.paymentProvider}
                {order.paymentRef && ` · ${order.paymentRef}`}
              </p>
            )}
            {order.paymentStatus === "pending" && <PaymentStatusActions orderId={order.id} />}
          </div>

          <div className="rounded-2xl border border-walnut-100 bg-white/60 p-6 text-sm">
            <h2 className="font-serif text-lg font-semibold text-ink">Customer</h2>
            <p className="mt-3 text-ink/70">{order.customerName}</p>
            <p className="text-ink/70">{order.customerEmail}</p>
            <p className="text-ink/70">{order.customerPhone}</p>
            <p className="mt-3 font-medium text-ink">Shipping to</p>
            <p className="text-ink/70">{order.address}</p>
            <p className="text-ink/70">
              {order.city}, {order.postalCode}
            </p>
            <p className="mt-3 text-xs text-ink/40">
              Placed {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
