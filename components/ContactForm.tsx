"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/context";

export default function ContactForm() {
  const t = useT();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  if (submitted) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-walnut-500 text-xl text-walnut-50">
          ✓
        </span>
        <p className="mt-4 font-medium text-ink">{t("Message sent")}</p>
        <p className="mt-1 text-sm text-ink/60">{t("We'll get back to you soon.")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        {t("Message")}
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="resize-none rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
        />
      </label>
      {error && (
        <p className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-500">{error}</p>
      )}
      <button type="submit" disabled={submitting} className="btn-primary mt-2">
        {submitting ? t("Sending…") : t("Send message")}
      </button>
    </form>
  );
}
