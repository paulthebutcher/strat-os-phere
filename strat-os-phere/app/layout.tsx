import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/layout/nav";
import { createBaseMetadata } from "@/lib/seo/metadata";
import { ToastProvider } from "@/components/toast/toast-provider";
import { RunToasts } from "@/components/toasts/RunToasts";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  return createBaseMetadata();
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Render layout immediately - Nav handles its own auth check
  // This prevents blocking the initial paint while auth is verified
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased plinth-page`}
      >
        <ToastProvider>
          {/* Nav handles its own auth check - wrap in Suspense to avoid blocking layout */}
          <Suspense fallback={null}>
            <Nav />
          </Suspense>
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
