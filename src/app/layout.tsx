
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AuthGate } from "@/components/layout/auth-gate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Retail Master — Modern Platform for Online Retailers",
    template: "%s | Retail Master",
  },
  description:
    "Retail Master is an all-in-one platform for modern online retailers and social commerce. Manage sales, inventory, customers, and digital receipts from a single interface.",
  keywords: [
    "POS system",
    "point of sale",
    "retail management",
    "inventory management",
    "sales analytics",
    "receipt sharing",
    "shift management",
    "customer CRM",
    "multi-store POS",
    "retail software",
  ],
  authors: [{ name: "Retail Master" }],
  creator: "Retail Master",
  metadataBase: new URL("https://retailmaster.store"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://retailmaster.store",
    siteName: "Retail Master",
    title: "Retail Master — Platform for Online Retailers",
    description:
      "The all-in-one platform for modern online retailers. Sales, inventory, staff, customers, and digital receipts — beautifully unified.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Retail Master POS Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Retail Master — Modern Point of Sale System",
    description:
      "The premium POS platform: Lightning-fast checkout, real-time analytics, receipt sharing, and multi-store management.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Retail Master",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "An all-in-one Point of Sale and retail management platform with inventory, customer CRM, advanced analytics, staff management, receipt sharing, and multi-store support.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Lightning-fast POS Terminal",
    "Inventory Management with low-stock alerts",
    "Customer CRM and purchase history",
    "Advanced Analytics Dashboard",
    "Report Center with Excel/PDF export",
    "Staff and Role Management",
    "Transaction History with receipt regeneration",
    "Receipt sharing via WhatsApp and Messenger",
    "Shift Management and cash reconciliation",
    "Multi-Store Support",
    "Dynamic Currency and Tax configuration",
    "Configurable App Settings",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-background text-foreground`}>
        <Providers>
          <AuthGate>{children}</AuthGate>
        </Providers>
      </body>
    </html>
  );
}
