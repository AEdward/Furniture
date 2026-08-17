import Link from "next/link";
import { notFound } from "next/navigation";
import { confirmOrderPayment, getOrderById, markOrderPaymentFailed } from "@/lib/db";
import { formatPrice } from "@/lib/products";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createT } from "@/lib/i18n/t";
import { isChapaConfigured, verifyChapaTransaction } from "@/lib/chapa";
import RetryPaymentButton from "@/components/RetryPaymentButton";

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tx_ref?: string };
}) {
  const id = Number(params.id);
  const initialOrder = Number.isInteger(id) ? await getOrderById(id) : undefined;
  if (!initialOrder) notFound();

  let order = initialOrder;

  // Chapa's return_url lands the customer back here before the webhook
  // necessarily has — actively verify right now so they see an accurate
  // result immediately, rather than a stale "pending" until the async
  // webhook catches up. The webhook remains the authoritative fallback
  // (e.g. if the customer closes the tab before the redirect completes).
  if (order.paymentStatus === "pending" && searchParams.tx_ref && isChapaConfigured()) {
    try {
      const result = await verifyChapaTransaction(searchParams.tx_ref);
      if (result.success) {
        await confirmOrderPayment(order.id, "chapa", searchParams.tx_ref);
        order = (await getOrderById(order.id)) ?? order;
      } else if (result.status !== "unknown") {
        await markOrderPaymentFailed(order.id, searchParams.tx_ref);
        order = (await getOrderById(order.id)) ?? order;
      }
    } catch {
      // Verification call itself failed (network/Chapa outage) — leave
      // payment_status as pending, the webhook or a page refresh will
      // resolve it.
    }
  }

  const locale = getLocale();
  const t = createT(await getDictionary(locale));

  if (order.paymentStatus !== "paid") {
    const failed = order.paymentStatus === "failed";
    return (
      <div className="container-shop py-16">
        <div className="mx-auto max-w-xl text-center">
          <span
            className={`inline-flex h-14 w-14 items-center justify-center rounded-full text-2xl text-cream ${
              failed ? "bg-danger-500" : "bg-terracotta-400"
            }`}
          >
            {failed ? "!" : "…"}
          </span>
          <h1 className="mt-6 font-serif text-3xl font-semibold text-ink">
            {failed ? t("Payment failed") : t("Payment pending")}
          </h1>
          <p className="mt-2 text-ink/70">
            {failed
              ? t(
                  "The payment for this order wasn't completed. You can try again below, or contact us if you were charged."
                )
              : t(
                  "We haven't received payment confirmation for this order yet. If you completed payment, this can take a minute to update — refresh the page, or try the button below."
                )}
          </p>
          <div className="mt-8">
            <RetryPaymentButton orderId={order.id} />
          </div>
          <p className="mt-4 text-sm text-ink/50">
            {t("Order #{id}", { id: order.id })} · {formatPrice(order.subtotal)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-shop py-16">
      <div className="mx-auto max-w-xl text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-walnut-500 text-2xl text-cream">
          ✓
        </span>
        <h1 className="mt-6 font-serif text-3xl font-semibold text-ink">
          {t("Order placed")}
        </h1>
        <p className="mt-2 text-ink/70">
          {t("Thanks, {name} — order #{id} is confirmed. A receipt has been sent to {email}.", {
            name: order.customerName.split(" ")[0],
            id: order.id,
            email: order.customerEmail,
          })}
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-walnut-100 p-6">
        <h2 className="font-serif text-lg font-semibold text-ink">
          {t("Order #{id}", { id: order.id })}
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
          <span>{t("Total")}</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>

        <div className="mt-6 border-t border-walnut-100 pt-4 text-sm text-ink/70">
          <p className="font-medium text-ink">{t("Shipping to")}</p>
          <p>{order.address}</p>
          <p>
            {order.city}, {order.postalCode}
          </p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link href="/shop" className="btn-primary">
          {t("Continue shopping")}
        </Link>
      </div>
    </div>
  );
}
