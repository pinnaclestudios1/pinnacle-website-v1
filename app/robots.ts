import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Only production is indexable. Vercel preview/staging deployments are blocked
 * so they never compete with the live site in search.
 */
export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.VERCEL_ENV
    ? process.env.VERCEL_ENV === "production"
    : process.env.NODE_ENV === "production";

  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/contact/thank-you", "/dot-lab", "/studio", "/api/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
