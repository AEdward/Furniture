import { getAllReviews } from "@/lib/db";
import AdminReviewsTable from "@/components/AdminReviewsTable";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();
  const pendingCount = reviews.filter((r) => !r.approved).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Reviews</h1>
        <p className="mt-1 text-sm text-ink/60">
          Customer-submitted reviews. {pendingCount} awaiting approval. New reviews are hidden
          from the site until approved here.
        </p>
      </div>

      <AdminReviewsTable initialReviews={reviews} />
    </div>
  );
}
