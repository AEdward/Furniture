import Link from "next/link";
import { getDashboardStats, getUnreadContactMessageCount } from "@/lib/db";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, unreadMessages] = await Promise.all([
    getDashboardStats(),
    getUnreadContactMessageCount(),
  ]);

  const cards = [
    { label: "Products", value: stats.productCount, href: "/admin/products" },
    { label: "Orders", value: stats.orderCount, href: "/admin/orders" },
    { label: "Revenue", value: formatPrice(stats.revenueTotal), href: "/admin/orders" },
    { label: "Unread messages", value: unreadMessages, href: "/admin/messages" },
    { label: "Low stock", value: stats.lowStockProducts.length, href: "/admin/products" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink/60">
          Overview of your catalog and orders.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-2xl border border-walnut-100 bg-white/60 p-5 transition-shadow hover:shadow-soft"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
              {c.label}
            </p>
            <p className="mt-2 font-serif text-2xl font-semibold text-ink">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-walnut-100 bg-white/60 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-ink">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-walnut-600 hover:underline">
              View all →
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-ink/50">No orders yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-walnut-100">
              {stats.recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-ink hover:text-walnut-600"
                    >
                      Order #{order.id}
                    </Link>
                    <p className="text-ink/50">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-ink">{formatPrice(order.subtotal)}</p>
                    <p className="capitalize text-ink/50">{order.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-walnut-100 bg-white/60 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-ink">Low stock</h2>
            <Link href="/admin/products" className="text-sm text-walnut-600 hover:underline">
              View all →
            </Link>
          </div>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-sm text-ink/50">Nothing running low.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-walnut-100">
              {stats.lowStockProducts.map((product) => (
                <li key={product.slug} className="flex items-center justify-between py-3 text-sm">
                  <Link
                    href={`/admin/products/${product.slug}/edit`}
                    className="font-medium text-ink hover:text-walnut-600"
                  >
                    {product.name}
                  </Link>
                  <span
                    className={`font-medium ${
                      product.stock === 0 ? "text-danger-500" : "text-ink/70"
                    }`}
                  >
                    {product.stock === 0 ? "Sold out" : `${product.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
