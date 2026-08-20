import { getAllCoupons } from "@/lib/db";
import AdminCouponsTable from "@/components/AdminCouponsTable";
import { requireAdminPage } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await requireAdminPage();
  const coupons = await getAllCoupons();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Coupons</h1>
        <p className="mt-1 text-sm text-ink/60">
          Discount codes customers can apply at checkout.
        </p>
      </div>

      <AdminCouponsTable initialCoupons={coupons} />
    </div>
  );
}
