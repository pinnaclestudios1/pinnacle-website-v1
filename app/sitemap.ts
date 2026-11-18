import type { MetadataRoute } from "next";
import { getJobs, getProjects } from "@/lib/cms";
import { services, site } from "@/lib/site";

/**
 * XML sitemap. Case studies and job posts come from the CMS; placeholders and
 * closed roles are left out. Version 2 routes (journal, lab, pricing, city pages)
 * are added when they ship.
 */
const routes: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/work", priority: 0.9 },
  { path: "/services", priority: 0.9 },
  ...services.map((s) => ({ path: `/services/${s.slug}`, priority: 0.8 })),
  { path: "/process", priority: 0.7 },
  { path: "/about", priority: 0.7 },
  { path: "/careers", priority: 0.5 },
  { path: "/faq", priority: 0.6 },
  { path: "/contact", priority: 0.9 },
  { path: "/contact/book", priority: 0.6 },
  { path: "/hello", priority: 0.4 },
  { path: "/privacy", priority: 0.2 },
  { path: "/terms", priority: 0.2 },
  { path: "/cookies", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, jobs] = await Promise.all([getProjects(), getJobs()]);
  const dynamic = [
    ...projects
      .filter((p) => !p.placeholder)
      .map((p) => ({ path: `/work/${p.slug}`, priority: 0.8 })),
    ...jobs
      .filter((j) => j.open && !j.placeholder)
      .map((j) => ({ path: `/careers/${j.slug}`, priority: 0.5 })),
  ];
  const lastModified = new Date();
  return [...routes, ...dynamic].map(({ path, priority }) => ({
    url: `${site.url}${path === "/" ? "" : path}`,
    lastModified,
    priority,
  }));
}
