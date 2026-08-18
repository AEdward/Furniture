"use client";

import { useState } from "react";
import type { Review } from "@/lib/db";
import { useT } from "@/lib/i18n/context";

export default function ProductReviews({
  productSlug,
  reviews,
}: {
  productSlug: string;
  reviews: Review[];
}) {
  const t = useT();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", rating: 5, comment: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug, ...form }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong — please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {reviews.length === 0 ? (
        <p className="text-sm text-ink/60">{t("No reviews yet — be the first to share yours.")}</p>
      ) : (
        <ul className="flex flex-col gap-6">
          {reviews.map((review) => (
            <li key={review.id} className="border-b border-walnut-100 pb-6 last:border-none">
              <div className="flex items-center justify-between">
                <p className="font-medium text-ink">{review.customerName}</p>
                <p className="text-sm text-terracotta-500">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </p>
              </div>
              <p className="mt-1 text-xs text-ink/40">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink/70">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        {submitted ? (
          <p className="rounded-lg bg-walnut-50 px-4 py-3 text-sm text-walnut-700">
            {t("Thanks! Your review will appear once approved.")}
          </p>
        ) : showForm ? (
          <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              {t("Rating")}
              <select
                value={form.rating}
                onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {"★".repeat(n)}
                    {"☆".repeat(5 - n)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              {t("Name")}
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              {t("Email")}
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              {t("Your review")}
              <textarea
                required
                rows={4}
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                className="resize-none rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
              />
            </label>
            {error && (
              <p className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-500">{error}</p>
            )}
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? t("Submitting…") : t("Submit review")}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                {t("Cancel")}
              </button>
            </div>
          </form>
        ) : (
          <button type="button" onClick={() => setShowForm(true)} className="btn-secondary">
            {t("Write a review")}
          </button>
        )}
      </div>
    </div>
  );
}
