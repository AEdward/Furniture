import { getCurrentAdminUser } from "@/lib/admin-users";
import AdminProfileNameForm from "@/components/AdminProfileNameForm";
import AccountSettingsPanel from "@/components/AccountSettingsPanel";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const user = await getCurrentAdminUser();
  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">My profile</h1>
        <p className="mt-1 text-sm text-ink/60">Manage your own admin account.</p>
      </div>

      <div className="rounded-2xl border border-walnut-100 bg-white/60 p-6">
        <h2 className="font-serif text-lg font-semibold text-ink">Name</h2>
        <div className="mt-4">
          <AdminProfileNameForm initialName={user.name} />
        </div>
      </div>

      <AccountSettingsPanel
        currentEmail={user.email}
        changePasswordApi="/api/admin/profile/change-password"
        requestEmailChangeApi="/api/admin/profile/request-email-change"
        confirmEmailChangeApi="/api/admin/profile/confirm-email-change"
      />
    </div>
  );
}
