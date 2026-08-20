"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminProfileNameForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSuccess(true);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:max-w-sm">
      <label className="flex flex-col gap-1.5 text-sm">
        Name
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-walnut-200 px-3 py-2 text-sm"
        />
      </label>
      {success && <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">Saved.</p>}
      {error && <p className="text-sm text-danger-500">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary self-start">
        {submitting ? "Saving…" : "Save name"}
      </button>
    </form>
  );
}
