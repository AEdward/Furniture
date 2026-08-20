"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import Logo from "@/components/Logo";
import LanguageSwitcher, { type LanguageOption } from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import AccountMenu from "@/components/AccountMenu";
import NotificationBell from "@/components/NotificationBell";
import { useT } from "@/lib/i18n/context";

type NavLink = { href: string; label: string };

export default function Header({
  siteName,
  navPages = [],
  translationEnabled = false,
  languages = [],
  customerName = null,
}: {
  siteName: string;
  navPages?: NavLink[];
  translationEnabled?: boolean;
  languages?: LanguageOption[];
  customerName?: string | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount, isReady } = useCart();
  const t = useT();

  const navLinks: NavLink[] = [
    { href: "/", label: t("Home") },
    { href: "/shop", label: t("Shop") },
    ...navPages,
    { href: "/contact", label: t("Contact") },
    { href: customerName ? "/account" : "/account/login", label: customerName ? t("My account") : t("Sign in") },
  ];

  return (
    <header className="bg-plank-grain sticky top-0 z-40 border-b border-terracotta-600/30 bg-walnut-700">
      <div className="container-shop flex h-20 items-center justify-between py-4">
        <Link href="/" onClick={() => setMenuOpen(false)}>
          <Logo name={siteName} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-medium uppercase tracking-[0.2em] transition-colors ${
                  active
                    ? "text-terracotta-200"
                    : "text-walnut-50/70 hover:text-terracotta-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle dark />
          <LanguageSwitcher enabled={translationEnabled} languages={languages} />

          {customerName ? (
            <>
              <NotificationBell apiBase="/api/account/notifications" />
              <AccountMenu customerName={customerName} />
            </>
          ) : (
            <Link
              href="/account/login"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-walnut-50/20 text-walnut-50/80 transition-colors hover:border-terracotta-400 hover:text-terracotta-200 sm:flex"
              aria-label={t("Sign in")}
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
            </Link>
          )}

          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-walnut-50/20 text-walnut-50/80 transition-colors hover:border-terracotta-400 hover:text-terracotta-200"
            aria-label={t("View cart")}
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
              <path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6" />
              <circle cx="9" cy="20" r="1.2" />
              <circle cx="17" cy="20" r="1.2" />
            </svg>
            {isReady && itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta-400 text-[11px] font-semibold text-walnut-700">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-walnut-50/20 text-walnut-50/80 md:hidden"
            aria-label={t("Toggle menu")}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              className="h-5 w-5"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-walnut-50/10 bg-walnut-700 md:hidden">
          <div className="container-shop flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-2 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-walnut-50/80 hover:bg-walnut-500/40 hover:text-terracotta-200"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
