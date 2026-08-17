import Link from "next/link";
import { formatPrice } from "@/lib/products";
import { siteConfig } from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-walnut-100 bg-walnut-700 text-walnut-50">
      <div className="container-shop grid gap-10 py-14 md:grid-cols-4">
        <div>
          <span className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-dashed border-terracotta-200 text-[11px] font-bold uppercase tracking-wider text-terracotta-200">
              {siteConfig.shortName}
            </span>
            <span className="font-serif text-xl font-semibold uppercase tracking-[0.1em] text-cream">
              {siteConfig.name}
            </span>
          </span>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-walnut-100/80">
            {siteConfig.description}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-200">
            Shop
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-walnut-100/80">
            <li><Link href="/shop?category=Living+Room" className="hover:text-cream">Living Room</Link></li>
            <li><Link href="/shop?category=Bedroom" className="hover:text-cream">Bedroom</Link></li>
            <li><Link href="/shop?category=Dining" className="hover:text-cream">Dining</Link></li>
            <li><Link href="/shop?category=Office" className="hover:text-cream">Office</Link></li>
            <li><Link href="/shop?category=Outdoor" className="hover:text-cream">Outdoor</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-200">
            Company
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-walnut-100/80">
            <li><Link href="/about" className="hover:text-cream">Our Story</Link></li>
            <li><Link href="/contact" className="hover:text-cream">Contact</Link></li>
            <li><Link href="/shop" className="hover:text-cream">Shop All</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-200">
            Visit
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-walnut-100/80">
            {siteConfig.address.map((line) => (
              <li key={line}>{line}</li>
            ))}
            <li>{siteConfig.email}</li>
            <li>{siteConfig.phone}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-walnut-500/60">
        <div className="container-shop flex flex-col items-center justify-between gap-2 py-5 text-xs text-walnut-100/60 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p>Free shipping on orders over {formatPrice(siteConfig.freeShippingThreshold)}.</p>
            <Link href="/admin" className="hover:text-cream">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
