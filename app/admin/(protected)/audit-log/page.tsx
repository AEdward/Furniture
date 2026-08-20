import { requireAdminPage } from "@/lib/admin-guard";
import { getAuditLog } from "@/lib/audit-log";

export const dynamic = "force-dynamic";

function formatDetails(details: string | null): string {
  if (!details) return "";
  try {
    const obj = JSON.parse(details);
    return Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
  } catch {
    return details;
  }
}

export default async function AdminAuditLogPage() {
  await requireAdminPage();
  const entries = await getAuditLog();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Audit log</h1>
        <p className="mt-1 text-sm text-ink/60">
          A record of admin actions across products, orders, coupons, settings, and accounts.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-walnut-100 bg-white/60">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-walnut-100 text-xs uppercase tracking-wide text-ink/50">
            <tr>
              <th className="px-5 py-3 font-medium">When</th>
              <th className="px-5 py-3 font-medium">Admin</th>
              <th className="px-5 py-3 font-medium">Action</th>
              <th className="px-5 py-3 font-medium">Entity</th>
              <th className="px-5 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-walnut-100">
            {entries.map((e) => (
              <tr key={e.id}>
                <td className="whitespace-nowrap px-5 py-3 text-ink/50">
                  {new Date(e.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-5 py-3 font-medium text-ink">{e.adminName}</td>
                <td className="px-5 py-3 text-ink/70">{e.action}</td>
                <td className="px-5 py-3 text-ink/70">
                  {e.entityType}
                  {e.entityId ? ` #${e.entityId}` : ""}
                </td>
                <td className="px-5 py-3 text-ink/50">{formatDetails(e.details)}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-ink/50">
                  No admin actions logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
