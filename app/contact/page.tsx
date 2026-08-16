"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/site-config";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder: no message-sending backend wired up yet.
    // Point this at an email service or an /api/contact route later.
    setSubmitted(true);
  }

  return (
    <div className="container-shop py-16">
      <div className="mb-10 text-center">
        <p className="section-label">Get in touch</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink sm:text-4xl">
          Contact us
        </h1>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="rounded-2xl border border-walnut-100 p-6 sm:p-8">
          {submitted ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-walnut-500 text-xl text-cream">
                ✓
              </span>
              <p className="mt-4 font-medium text-ink">Message sent</p>
              <p className="mt-1 text-sm text-ink/60">
                We&apos;ll get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm">
                Name
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                Message
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  className="resize-none rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
                />
              </label>
              <button type="submit" className="btn-primary mt-2">
                Send message
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">
              Visit the showroom
            </h2>
            {siteConfig.address.map((line) => (
              <p key={line} className="text-ink/70">
                {line}
              </p>
            ))}
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">
              Talk to us
            </h2>
            <p className="text-ink/70">{siteConfig.email}</p>
            <p className="text-ink/70">{siteConfig.phone}</p>
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink">
              Hours
            </h2>
            <p className="text-ink/70">Mon–Fri: 10am–6pm</p>
            <p className="text-ink/70">Sat–Sun: 11am–5pm</p>
          </div>
        </div>
      </div>
    </div>
  );
}
