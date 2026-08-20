"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";
import type { AdminRole } from "@/lib/admin-users";

const links = [
  { href: "/portal2026", label: "Dashboard", adminOnly: false },
  { href: "/portal2026/products", label: "Products", adminOnly: false },
  { href: "/portal2026/orders", label: "Orders", adminOnly: true },
  { href: "/portal2026/coupons", label: "Coupons", adminOnly: true },
  { href: "/portal2026/messages", label: "Messages", adminOnly: false },
  { href: "/portal2026/reviews", label: "Reviews", adminOnly: false },
  { href: "/portal2026/pages", label: "Pages", adminOnly: false },
  { href: "/portal2026/translations", label: "Translations", adminOnly: false },
  { href: "/portal2026/analytics", label: "Analytics", adminOnly: false },
  { href: "/portal2026/customers", label: "Customers", adminOnly: true },
  { href: "/portal2026/users", label: "Users", adminOnly: true },
  { href: "/portal2026/audit-log", label: "Audit log", adminOnly: true },
  { href: "/portal2026/settings", label: "Settings", adminOnly: true },
];

export default function AdminNav({
  currentUserName,
  currentUserRole,
}: {
  currentUserName: string | null;
  currentUserRole: AdminRole | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleLinks = links.filter((link) => !link.adminOnly || currentUserRole === "admin");

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/portal2026/login");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/portal2026" ? pathname === "/portal2026" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile top bar — sidebar itself is an off-canvas drawer below md */}
      <header className="flex items-center justify-between border-b border-walnut-100 bg-white/60 px-4 py-3 md:hidden">
        <Link href="/portal2026" className="font-serif text-lg font-semibold text-walnut-600">
          Admin
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBell apiBase="/api/admin/notifications" align="left" />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-walnut-200 text-walnut-600"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="h-5 w-5">
              {mobileOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-walnut-700/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-walnut-100 bg-white/95 backdrop-blur transition-transform duration-200 md:sticky md:top-0 md:z-auto md:h-screen md:translate-x-0 md:bg-white/60 md:backdrop-blur-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <Link
            href="/portal2026"
            onClick={() => setMobileOpen(false)}
            className="font-serif text-lg font-semibold text-walnut-600"
          >
            Admin
          </Link>
          <div className="flex items-center gap-1.5">
            <NotificationBell apiBase="/api/admin/notifications" align="left" />
            <ThemeToggle />
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "bg-walnut-500 text-walnut-50"
                  : "text-ink/70 hover:bg-walnut-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2 border-t border-walnut-100 px-6 py-4">
          {currentUserName && (
            <p className="truncate text-xs text-ink/40">
              Signed in as {currentUserName}
              {currentUserRole && (
                <span className="ml-1.5 rounded-full bg-walnut-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-walnut-700">
                  {currentUserRole}
                </span>
              )}
            </p>
          )}
          <Link href="/portal2026/profile" className="text-sm text-ink/50 hover:text-walnut-600">
            My profile
          </Link>
          <Link href="/" className="text-sm text-ink/50 hover:text-walnut-600">
            View site ↗
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-walnut-200 px-4 py-1.5 text-sm font-medium text-walnut-600 hover:bg-walnut-100"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
