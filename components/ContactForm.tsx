"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/context";

export default function ContactForm() {
  const t = useT();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder: no message-sending backend wired up yet.
    // Point this at an email service or an /api/contact route later.
    setSubmitted(true);
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
      <button type="submit" className="btn-primary mt-2">
        {t("Send message")}
      </button>
    </form>
  );
}
