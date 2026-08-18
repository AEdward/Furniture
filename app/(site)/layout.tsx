import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageViewTracker from "@/components/PageViewTracker";
import { CartProvider } from "@/lib/cart-context";
import { getNavPages, getSettings } from "@/lib/db";
import { I18nProvider } from "@/lib/i18n/context";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { translateLabels, translateSettings } from "@/lib/i18n/translate-content";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const [settings, navPages, dict] = await Promise.all([
    getSettings(),
    getNavPages(),
    getDictionary(locale),
  ]);
  const rawNavLinks = navPages.map((p) => ({
    href: `/${p.slug}`,
    label: p.navLabel || p.title,
  }));
  const [navLinks, translatedSettings] = await Promise.all([
    translateLabels(rawNavLinks, locale),
    translateSettings(settings, locale),
  ]);

  return (
    <I18nProvider locale={locale} dict={dict}>
      <CartProvider>
        <PageViewTracker />
        <Header
          siteName={settings.name}
          navPages={navLinks}
          translationEnabled={settings.translation.enabled}
          languages={settings.translation.languages}
        />
        <main className="flex-1">{children}</main>
        <Footer settings={translatedSettings} />
      </CartProvider>
    </I18nProvider>
  );
}
