"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/products";
import type { SiteSettings } from "@/lib/settings";
import { useT } from "@/lib/i18n/context";

export default function Footer({ settings }: { settings: SiteSettings }) {
  const t = useT();
  return (
    <footer className="mt-24 border-t border-walnut-100 bg-walnut-700 text-walnut-50">
      <div className="container-shop grid gap-10 py-14 md:grid-cols-4">
        <div>
          <span className="inline-flex items-center gap-2.5">
            {/* Light chip behind the mark — its strokes are dark and
                would disappear directly on this dark footer background. */}
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream p-1">
              <Image
                src="/brand/zemenay-mark-transparent.png"
                alt=""
                width={352}
                height={352}
                className="h-full w-full object-contain"
              />
            </span>
            <span className="font-serif text-xl font-semibold uppercase tracking-[0.1em] text-cream">
              {settings.name}
            </span>
          </span>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-walnut-100/80">
            {settings.description}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-200">
            {t("Shop")}
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-walnut-100/80">
            <li><Link href="/shop?category=Doors" className="hover:text-cream">{t("Doors")}</Link></li>
            <li><Link href="/shop?category=Kitchen+Cabinets" className="hover:text-cream">{t("Kitchen Cabinets")}</Link></li>
            <li><Link href="/shop?category=Closets" className="hover:text-cream">{t("Closets")}</Link></li>
            <li><Link href="/shop?category=Sofas" className="hover:text-cream">{t("Sofas")}</Link></li>
            <li><Link href="/shop?category=Dining+Tables+%26+Chairs" className="hover:text-cream">{t("Dining Tables & Chairs")}</Link></li>
            <li><Link href="/shop?category=Beds" className="hover:text-cream">{t("Beds")}</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-200">
            {t("Company")}
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-walnut-100/80">
            <li><Link href="/about" className="hover:text-cream">{t("Our Story")}</Link></li>
            <li><Link href="/contact" className="hover:text-cream">{t("Contact")}</Link></li>
            <li><Link href="/shop" className="hover:text-cream">{t("Shop All")}</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-200">
            {t("Visit")}
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-walnut-100/80">
            {settings.address.map((line) => (
              <li key={line}>{line}</li>
            ))}
            <li>{settings.email}</li>
            <li>{settings.phone}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-walnut-500/60">
        <div className="container-shop flex flex-col items-center justify-between gap-2 py-5 text-xs text-walnut-100/60 sm:flex-row">
          <p>
            {t("© {year} {name}. All rights reserved.", {
              year: new Date().getFullYear(),
              name: settings.name,
            })}
          </p>
          <div className="flex items-center gap-4">
            <p>
              {t("Free shipping on orders over {amount}.", {
                amount: formatPrice(settings.freeShippingThreshold),
              })}
            </p>
            <Link href="/admin" className="hover:text-cream">
              {t("Admin")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
