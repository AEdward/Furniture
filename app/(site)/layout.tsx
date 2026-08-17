import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageViewTracker from "@/components/PageViewTracker";
import { CartProvider } from "@/lib/cart-context";
import { getNavPages, getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, navPages] = await Promise.all([getSettings(), getNavPages()]);
  const navLinks = navPages.map((p) => ({
    href: `/${p.slug}`,
    label: p.navLabel || p.title,
  }));

  return (
    <CartProvider>
      <PageViewTracker />
      <Header siteName={settings.name} navPages={navLinks} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </CartProvider>
  );
}
