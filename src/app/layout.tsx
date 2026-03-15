
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AuthGate } from "@/components/layout/auth-gate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RetailPOS - Modern Point of Sale",
  description: "Advanced retail management system",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground`}>
        <Providers>
          <AuthGate>
            {children}
          </AuthGate>
        </Providers>
      </body>
    </html>
  );
}
