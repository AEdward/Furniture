"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileForm({
  initial,
}: {
  initial: { name: string; phone: string; address: string; city: string; postalCode: string };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [address, setAddress] = useState(initial.address);
  const [city, setCity] = useState(initial.city);
  const [postalCode, setPostalCode] = useState(initial.postalCode);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address, city, postalCode }),
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
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 sm:max-w-md">
      <label className="flex flex-col gap-1.5 text-sm">
        Name
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-walnut-200 px-3 py-2 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Phone
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-lg border border-walnut-200 px-3 py-2 text-sm"
        />
      </label>

      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
        Default delivery address
      </p>
      <p className="text-xs text-ink/50">Used to pre-fill checkout — you can still change it per order.</p>
      <label className="flex flex-col gap-1.5 text-sm">
        Address
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="rounded-lg border border-walnut-200 px-3 py-2 text-sm"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          City
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-lg border border-walnut-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Postal code
          <input
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="rounded-lg border border-walnut-200 px-3 py-2 text-sm"
          />
        </label>
      </div>

      {success && <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">Profile updated.</p>}
      {error && <p className="text-sm text-danger-500">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary self-start">
        {submitting ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
