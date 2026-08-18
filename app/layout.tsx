import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSettings } from "@/lib/db";
import { getLocale } from "@/lib/i18n/get-locale";

// Settings (and most page content) are DB-backed and admin-editable at
// any time, so nothing in this app should be statically cached at build
// time — every request reads current data.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: `${settings.name} — ${settings.tagline}`,
      template: `%s | ${settings.name}`,
    },
    description: settings.description,
    manifest: "/site.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Reflects the storefront's selected language (see lib/i18n). The
  // admin panel isn't translated, so this cookie-based value is only
  // meaningfully accurate for (site) pages, not /admin ones.
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-cream font-sans text-ink antialiased">
        {/* Sets data-theme from localStorage before first paint, so a
            returning visitor's dark-mode choice never flashes light
            first. See components/ThemeToggle.tsx and globals.css. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
