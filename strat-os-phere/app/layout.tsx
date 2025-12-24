import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/layout/nav";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { createClient } from "@/lib/supabase/server";
import { createBaseMetadata } from "@/lib/seo/metadata";
import { ToastProvider } from "@/components/toast/toast-provider";
import { RunToasts } from "@/components/toasts/RunToasts";
import { Toaster } from "@/components/ui/toaster";

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
  // Only check auth for app routes, not marketing pages
  // Marketing pages should never call Supabase
  let user = null;
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (error) {
    // Silently fail for marketing pages - they don't need auth
    // This prevents crashes when logged out
    user = null;
  }

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
          <RunToasts />
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}
