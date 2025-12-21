import { MetadataRoute } from "next";
import { getOrigin } from "@/lib/server/origin";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await getOrigin();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/projects/",
          "/dashboard",
          "/auth/",
          "/login", // Keep login private
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
  };
}

