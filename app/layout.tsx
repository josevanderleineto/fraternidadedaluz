import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { getSiteSettings } from "@/lib/services/settings";
import { absoluteUrl } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings.metaTitle || settings.siteName;
  const description = settings.metaDescription || settings.description || "";

  return {
    metadataBase: new URL(absoluteUrl()),
    title: {
      default: title,
      template: `%s | ${settings.siteName}`,
    },
    description,
    applicationName: settings.siteName,
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: settings.siteName,
      title,
      description,
      url: absoluteUrl(),
      images: settings.logoUrl ? [{ url: settings.logoUrl }] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: settings.logoUrl ? { icon: settings.logoUrl } : undefined,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full bg-white text-brand-950">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
