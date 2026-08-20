import type { Metadata } from "next";
import AdminNav from "@/components/AdminNav";
import { getCurrentAdminUser } from "@/lib/admin-users";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentAdminUser();

  return (
    <div className="min-h-screen bg-cream md:flex">
      <AdminNav
        currentUserName={currentUser?.name ?? null}
        currentUserRole={currentUser?.role ?? null}
      />
      <main className="flex-1 px-6 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
