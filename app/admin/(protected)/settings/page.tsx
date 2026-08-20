import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

const SECTIONS = [
  { href: "/admin/settings/general", title: "Site & contact", description: "Name, tagline, contact info, address, free shipping threshold." },
  { href: "/admin/settings/hero", title: "Home page hero", description: "The banner image and headline on the home page." },
  { href: "/admin/settings/delivery", title: "Delivery", description: "Delivery windows and fees for Addis Ababa and other cities." },
  { href: "/admin/settings/assembly", title: "Assembly & installation", description: "Installation defaults, availability, and fees." },
  { href: "/admin/settings/warranty", title: "Warranty", description: "Warranty tiers and what isn't covered." },
  { href: "/admin/settings/returns", title: "Returns & exchanges", description: "Return period, conditions, and refund process." },
  { href: "/admin/settings/payment", title: "Payment methods", description: "The list of accepted payment methods shown on the site." },
  { href: "/admin/settings/language", title: "Language & translation", description: "Which languages the storefront switcher offers." },
  { href: "/admin/settings/contact-page", title: "Contact page", description: "Heading, subheading, and hours shown on /contact." },
  { href: "/admin/settings/bank-details", title: "Bank transfer details", description: "Bank account info shown at checkout and on order confirmation." },
];

export default async function AdminSettingsHubPage() {
  await requireAdminPage();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink/60">Site-wide configuration, grouped by section.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-2xl border border-walnut-100 bg-white/60 p-6 transition-shadow hover:shadow-soft"
          >
            <h2 className="font-serif text-lg font-semibold text-ink">{section.title}</h2>
            <p className="mt-1 text-sm text-ink/60">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
