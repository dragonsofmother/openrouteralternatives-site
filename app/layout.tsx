import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { SITE } from "@/data/site";
import { changelog } from "@/data/changelog";
import { fetchStarCount } from "@/lib/github";
import { THEME_SCRIPT } from "@/lib/theme";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Compare AI Gateways and Model Routers`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: SITE.url },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — Compare AI Gateways and Model Routers`,
    description: SITE.description,
    url: SITE.url,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Compare AI Gateways and Model Routers`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#08080a" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The footer shows the date of the newest logged change, dataset or site.
  const lastUpdated = changelog.map((entry) => entry.date).sort().pop() ?? "";
  // Read once at build time; see lib/github.ts.
  const stars = await fetchStarCount();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:border focus:border-line focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:text-ink focus:shadow-pop"
        >
          Skip to content
        </a>
        {/* One provider at the root so any tooltip works on any page; nested
            providers inside the table are harmless. */}
        <TooltipProvider delayDuration={120}>
          <Header stars={stars} />
          <main id="main">{children}</main>
          <Footer updatedAt={lastUpdated} />
        </TooltipProvider>
        <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />
      </body>
    </html>
  );
}
