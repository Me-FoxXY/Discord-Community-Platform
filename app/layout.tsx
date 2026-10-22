import type { Metadata, Viewport } from "next";
import { fraunces, jakarta } from "@/lib/fonts";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBackdrop } from "@/components/decor/nature";
import { site } from "@/config/site";
import "./globals.css";
import { prisma } from '@/lib/prisma';
import { themeVariables } from '@/lib/theme';
import { Suspense } from 'react';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Premium Discord Perks & Community`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: ["Discord perks", "Discord premium", "Discord membership", site.name, "community"],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — Premium Discord Perks & Community`,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Premium Discord Perks`,
    description: site.description,
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#2f855a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } });
  return (
    <html lang="en" style={themeVariables(settings?.primaryColor, settings?.accentColor)} className={`${fraunces.variable} ${jakarta.variable}`}>
      <body className="min-h-dvh antialiased">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-forest-600 focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
          >
            Skip to content
          </a>
          <PageBackdrop />
          <Navbar />
          <div className="flex min-h-dvh flex-col">
            <div id="main" className="flex-1">
              {children}
            </div>
            <Suspense fallback={<div className="h-24" />}><Footer /></Suspense>
          </div>
        </Providers>
      </body>
    </html>
  );
}
