import { MetadataRoute } from "next";
import { getOrigin } from "@/lib/server/origin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await getOrigin();

  // Only include public marketing pages
  // Private routes (projects, dashboard, login) are excluded
  return [
    {
      url: origin,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}

