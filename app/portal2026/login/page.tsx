"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        setSubmitting(false);
        return;
      }
      const from = searchParams.get("from");
      router.push(from && from.startsWith("/portal2026") ? from : "/portal2026");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-2xl border border-walnut-100 bg-white/60 p-8"
    >
      <h1 className="font-serif text-2xl font-semibold text-ink">
        Admin sign in
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        Sign in with your admin email and password.
      </p>

      <label className="mt-6 flex flex-col gap-1.5 text-sm">
        Email
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
        />
      </label>

      <label className="mt-4 flex flex-col gap-1.5 text-sm">
        Password
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-walnut-200 px-3 py-2.5 focus:border-walnut-400 focus:outline-none"
        />
      </label>

      {error && (
        <p className="mt-3 rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-500">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full">
        {submitting ? "Signing in…" : "Sign in"}
      </button>

      <p className="mt-4 text-center text-sm text-ink/50">
        <Link href="/portal2026/forgot-password" className="hover:text-walnut-600">
          Forgot password?
        </Link>
      </p>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="mb-8">
        <Logo variant="stacked" />
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
