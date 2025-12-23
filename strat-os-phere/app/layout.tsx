import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/layout/nav";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { createClient } from "@/lib/supabase/server";
import { createBaseMetadata } from "@/lib/seo/metadata";
import { ToastProvider } from "@/components/toast/toast-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  return createBaseMetadata();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased plinth-page`}
      >
        <ToastProvider>
          {user ? <Nav /> : <MarketingNav />}
          <div className="min-h-screen">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
