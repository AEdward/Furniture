"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import Logo from "@/components/Logo";
import LanguageSwitcher, { type LanguageOption } from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { useT } from "@/lib/i18n/context";

type NavLink = { href: string; label: string };

export default function Header({
  siteName,
  navPages = [],
  translationEnabled = false,
  languages = [],
}: {
  siteName: string;
  navPages?: NavLink[];
  translationEnabled?: boolean;
  languages?: LanguageOption[];
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
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-walnut-100/60 bg-cream/90 backdrop-blur">
      <div className="container-shop flex h-18 items-center justify-between py-4">
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
                className={`text-sm font-medium tracking-wide transition-colors ${
                  active
                    ? "text-walnut-600"
                    : "text-ink/70 hover:text-walnut-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageSwitcher enabled={translationEnabled} languages={languages} />

          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-walnut-200 text-walnut-600 transition-colors hover:bg-walnut-100"
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
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-walnut-700 text-[11px] font-semibold text-terracotta-200">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-walnut-200 text-walnut-600 md:hidden"
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
        <nav className="border-t border-walnut-100/60 bg-cream md:hidden">
          <div className="container-shop flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink/80 hover:bg-walnut-100"
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
