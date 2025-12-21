import "server-only";
import type { Metadata } from "next";
import { getOrigin } from "@/lib/server/origin";

const SITE_NAME = "Plinth";
const DEFAULT_TITLE = "Plinth — Competitive analysis that ends in a decision";
const DEFAULT_DESCRIPTION =
  "Turn competitor signals into decision-ready outputs: Jobs-to-be-Done, scorecards, opportunities, and Strategic Bets—backed by live evidence and citations.";

/**
 * Generates the base URL for metadata.
 * Uses request headers to determine origin dynamically.
 * Falls back to a default for static contexts.
 */
export async function getMetadataBase(): Promise<string> {
  try {
    return await getOrigin();
  } catch {
    // Fallback for static contexts (shouldn't happen in normal usage)
    // This will be overridden by generateMetadata functions that need dynamic URLs
    return process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://plinth.com";
  }
}

/**
 * Creates default Open Graph image URL for a given variant.
 * Variants: "default", "results", "competitors"
 * Returns absolute URL if base is provided, otherwise relative.
 */
export function getOGImageUrl(
  variant: "default" | "results" | "competitors" = "default",
  base?: string
): string {
  const url = `/api/og?variant=${variant}`;
  if (base) {
    return `${base}${url}`;
  }
  return url;
}

/**
 * Creates base metadata object with sensible defaults.
 * Use this in generateMetadata function in layout.tsx.
 * Note: metadataBase will be set dynamically based on request headers.
 */
export async function createBaseMetadata(): Promise<Metadata> {
  const metadataBase = await getMetadataBase();

  return {
    metadataBase: new URL(metadataBase),
    title: {
      template: `%s — ${SITE_NAME}`,
      default: DEFAULT_TITLE,
    },
    description: DEFAULT_DESCRIPTION,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [
        {
          url: getOGImageUrl("default", metadataBase),
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [getOGImageUrl("default", metadataBase)],
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

/**
 * Creates metadata for a specific page.
 * Use this in generateMetadata functions for page-specific overrides.
 * The URL will be constructed using the request origin.
 */
export async function createPageMetadata({
  title,
  description,
  path = "/",
  ogVariant = "default",
  robots,
  canonical,
}: {
  title: string;
  description: string;
  path?: string;
  ogVariant?: "default" | "results" | "competitors";
  robots?: Metadata["robots"];
  canonical?: boolean;
}): Promise<Metadata> {
  const metadataBase = await getMetadataBase();
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${metadataBase}${normalizedPath}`;

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: getOGImageUrl(ogVariant, metadataBase),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [getOGImageUrl(ogVariant, metadataBase)],
    },
  };

  if (robots !== undefined) {
    metadata.robots = robots;
  }

  if (canonical !== false) {
    metadata.alternates = {
      canonical: url,
    };
  }

  return metadata;
}

