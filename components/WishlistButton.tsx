"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function WishlistButton({
  productSlug,
  initialWishlisted,
  loggedIn,
}: {
  productSlug: string;
  initialWishlisted: boolean;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!loggedIn) {
      router.push(`/account/login?from=${encodeURIComponent(pathname)}`);
      return;
    }
    setPending(true);
    const method = wishlisted ? "DELETE" : "POST";
    const res = await fetch("/api/account/wishlist", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productSlug }),
    });
    if (res.ok) {
      setWishlisted((v) => !v);
      router.refresh();
    }
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
        wishlisted
          ? "border-terracotta-300 bg-terracotta-50 text-terracotta-500"
          : "border-walnut-200 text-ink/70 hover:border-walnut-400"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={wishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M12 20.5s-7.5-4.6-9.8-9.1C.6 8 2 4.5 5.3 3.7c2-.5 4 .3 5.2 2 1.2-1.7 3.2-2.5 5.2-2 3.3.8 4.7 4.3 3.1 7.7-2.3 4.5-9.8 9.1-9.8 9.1Z" />
      </svg>
      {wishlisted ? "Saved" : "Save"}
    </button>
  );
}
