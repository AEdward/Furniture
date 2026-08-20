"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/context";

// Signed-in account icon in the storefront header — a dropdown of
// account sub-pages (item 4) instead of a single "My account" link.
export default function AccountMenu({ customerName }: { customerName: string }) {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/api/account/logout", { method: "POST" });
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const links = [
    { href: "/account", label: "My account" },
    { href: "/account/profile", label: "Profile" },
    { href: "/account/settings", label: "Account settings" },
    { href: "/account/orders", label: "Order history" },
    { href: "/account/wishlist", label: "Wishlist" },
    { href: "/account/notifications", label: "Notifications" },
  ];

  return (
    <div className="relative hidden sm:block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-walnut-200 text-walnut-600 transition-colors hover:bg-walnut-100"
        aria-label={t("My account")}
        title={customerName}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <circle cx="12" cy="8" r="3.5" />
          <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-walnut-100 bg-white shadow-xl">
          <div className="border-b border-walnut-100 px-4 py-3">
            <p className="truncate text-sm font-medium text-ink">{customerName}</p>
          </div>
          <div className="py-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-ink/80 hover:bg-walnut-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-walnut-100 py-1">
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full px-4 py-2 text-left text-sm font-medium text-danger-500 hover:bg-walnut-50"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
