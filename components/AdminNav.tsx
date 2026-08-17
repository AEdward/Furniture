"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-walnut-100 bg-white/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="font-serif text-lg font-semibold text-walnut-600">
            Admin
          </Link>
          <nav className="flex items-center gap-6">
            {links.map((link) => {
              const active =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    active ? "text-walnut-600" : "text-ink/60 hover:text-walnut-600"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
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
      </div>
    </header>
  );
}
