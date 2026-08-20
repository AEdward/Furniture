"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function AccountLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(searchParams.get("from") || "/account");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-shop flex justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-2xl font-semibold text-ink">Sign in</h1>
        <p className="mt-1 text-sm text-ink/60">
          Track orders, save items to your wishlist, and check out faster.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
            Password
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
            />
          </label>
          {error && (
            <p className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-500">{error}</p>
          )}
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-center text-sm text-ink/50">
            <Link href="/account/forgot-password" className="hover:text-walnut-600">
              Forgot password?
            </Link>
          </p>
        </form>

        <p className="mt-6 text-sm text-ink/60">
          Don&apos;t have an account?{" "}
          <Link href="/account/signup" className="font-medium text-walnut-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
