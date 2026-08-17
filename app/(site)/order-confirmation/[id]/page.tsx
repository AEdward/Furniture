import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/db";
import { formatPrice } from "@/lib/products";

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  const order = Number.isInteger(id) ? await getOrderById(id) : undefined;
  if (!order) notFound();

  return (
    <div className="container-shop py-16">
      <div className="mx-auto max-w-xl text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-walnut-500 text-2xl text-cream">
          ✓
        </span>
        <h1 className="mt-6 font-serif text-3xl font-semibold text-ink">
          Order placed
        </h1>
        <p className="mt-2 text-ink/70">
          Thanks, {order.customerName.split(" ")[0]} — order #{order.id} is
          confirmed. A receipt has been sent to {order.customerEmail}.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-walnut-100 p-6">
        <h2 className="font-serif text-lg font-semibold text-ink">
          Order #{order.id}
        </h2>
        <ul className="mt-4 flex flex-col gap-3 text-sm">
          {order.items.map((item) => (
            <li key={`${item.slug}::${item.variant ?? ""}`} className="flex justify-between text-ink/70">
              <span>
                {item.name}
                {item.variant && <span className="text-ink/40"> — {item.variant}</span>} ×{" "}
                {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-walnut-100 pt-4 font-semibold text-ink">
          <span>Total</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>

        <div className="mt-6 border-t border-walnut-100 pt-4 text-sm text-ink/70">
          <p className="font-medium text-ink">Shipping to</p>
          <p>{order.address}</p>
          <p>
            {order.city}, {order.postalCode}
          </p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link href="/shop" className="btn-primary">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
