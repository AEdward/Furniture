import Link from "next/link";
import { getAllCustomersAdmin } from "@/lib/customers";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await getAllCustomersAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Customers</h1>
        <p className="mt-1 text-sm text-ink/60">{customers.length} total</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-walnut-100 bg-white/60">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-walnut-100 text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Orders</th>
              <th className="px-5 py-3 font-medium">Total spent</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-walnut-100">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3">
                  <Link href={`/portal2026/customers/${c.id}`} className="font-medium text-ink hover:text-walnut-600">
                    {c.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-ink/70">{c.email}</td>
                <td className="px-5 py-3 text-ink/70">{c.orderCount}</td>
                <td className="px-5 py-3 text-ink/70">{formatPrice(c.totalSpent)}</td>
                <td className="px-5 py-3 text-ink/50">
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link href={`/portal2026/customers/${c.id}`} className="text-sm font-medium text-walnut-600 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-ink/50">
                  No customer accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
