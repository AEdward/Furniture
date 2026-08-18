import { getAllAdminUsers, getCurrentAdminUser } from "@/lib/admin-users";
import AdminUsersTable from "@/components/AdminUsersTable";
import { requireAdminPage } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdminPage();
  const [users, currentUser] = await Promise.all([getAllAdminUsers(), getCurrentAdminUser()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Admin users</h1>
        <p className="mt-1 text-sm text-ink/60">
          Admins can manage the whole store, including other admin accounts, settings, and
          orders. Editors can manage products, pages, and translations only. At least one admin
          must always exist.
        </p>
      </div>

      <AdminUsersTable initialUsers={users} currentUserId={currentUser?.id ?? null} />
    </div>
  );
}
