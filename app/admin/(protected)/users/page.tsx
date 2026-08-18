import { getAllAdminUsers, getCurrentAdminUser } from "@/lib/admin-users";
import AdminUsersTable from "@/components/AdminUsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [users, currentUser] = await Promise.all([getAllAdminUsers(), getCurrentAdminUser()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Admin users</h1>
        <p className="mt-1 text-sm text-ink/60">
          Everyone here can manage the whole store — there are no separate roles. At least one
          admin must always exist.
        </p>
      </div>

      <AdminUsersTable initialUsers={users} currentUserId={currentUser?.id ?? null} />
    </div>
  );
}
