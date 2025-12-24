/**
 * Marketing Layout
 * 
 * Standalone layout for marketing pages.
 * NO auth, NO Supabase, NO server actions, NO app dependencies.
 * Pure presentational layout only.
 */
import type { Metadata } from "next"
import { MarketingNav } from "@/components/marketing/MarketingNav"
import { createBaseMetadata } from "@/lib/seo/metadata"

export async function generateMetadata(): Promise<Metadata> {
  return createBaseMetadata()
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <MarketingNav />
      {children}
    </>
  )
}

