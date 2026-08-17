import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSettings } from "@/lib/db";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
