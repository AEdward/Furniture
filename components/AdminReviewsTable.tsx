"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Review } from "@/lib/db";

type ReviewRow = Review & { productName: string; productSlug: string };

export default function AdminReviewsTable({
  initialReviews,
}: {
  initialReviews: ReviewRow[];
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);

  async function handleApprove(review: ReviewRow, approved: boolean) {
    const res = await fetch(`/api/admin/reviews/${review.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to update review.");
      return;
    }
    setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, approved } : r)));
    router.refresh();
  }

  async function handleDelete(review: ReviewRow) {
    if (!confirm(`Delete this review from ${review.customerName}?`)) return;
    const res = await fetch(`/api/admin/reviews/${review.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to delete review.");
      return;
    }
    setReviews((prev) => prev.filter((r) => r.id !== review.id));
    router.refresh();
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-walnut-100 bg-white/60 p-8 text-center text-sm text-ink/50">
        No reviews yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((review) => (
        <div
          key={review.id}
          className={`rounded-2xl border bg-white/60 p-5 ${
            review.approved ? "border-walnut-100" : "border-terracotta-300"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">
                {review.customerName}
                <span className="ml-2 font-normal text-ink/50">{review.customerEmail}</span>
              </p>
              <Link
                href={`/shop/${review.productSlug}`}
                target="_blank"
                className="text-sm text-walnut-600 hover:underline"
              >
                {review.productName}
              </Link>
              <p className="mt-1 text-sm text-terracotta-500">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                review.approved
                  ? "bg-walnut-500 text-walnut-50"
                  : "bg-terracotta-100 text-terracotta-500"
              }`}
            >
              {review.approved ? "Approved" : "Pending"}
            </span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm text-ink/80">{review.comment}</p>
          <div className="mt-4 flex items-center gap-4">
            {review.approved ? (
              <button
                type="button"
                onClick={() => handleApprove(review, false)}
                className="text-sm font-medium text-ink/60 hover:underline"
              >
                Unapprove
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleApprove(review, true)}
                className="text-sm font-medium text-walnut-600 hover:underline"
              >
                Approve
              </button>
            )}
            <button
              type="button"
              onClick={() => handleDelete(review)}
              className="text-sm font-medium text-danger-500 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
