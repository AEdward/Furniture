"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeletePageButton({ slug, title }: { slug: string; title: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/pages/${slug}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to delete page.");
      setDeleting(false);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="text-sm font-medium text-danger-500 hover:underline disabled:opacity-50"
    >
      {deleting ? "Deleting…" : "Delete"}
    </button>
  );
}
