import { cache } from "react";
import { createClient } from "next-sanity";
import { faqGroups as seedFaqs } from "@/content/seed/faqs";
import { jobs as seedJobs, team as seedTeam } from "@/content/seed/people";
import {
  projects as seedProjects,
  testimonials as seedTestimonials,
} from "@/content/seed/projects";
import { services as seedServices } from "@/content/seed/services";
import { demoProjects, demoTestimonials } from "@/content/demo/projects";
import { demoJobs, demoStudio, demoTeam } from "@/content/demo/studio";
import { demoMode } from "@/lib/demo";
import { apiVersion, cmsEnabled, dataset, projectId } from "@/sanity/env";
import * as q from "./queries";
import type { FaqGroup, Job, Media, Project, Service, TeamMember, Testimonial } from "./types";

/**
 * The content layer. Pages call these functions only.
 * - No Sanity project configured → the local seed (content/seed), or demo content
 *   (content/demo) in demo mode.
 * - Sanity configured → published content, cached and tagged "sanity" so the
 *   webhook at /api/revalidate refreshes pages the moment the team publishes.
 * If Sanity is configured but a fetch fails, we fall back to the seed rather than
 * breaking the page, and log the error.
 */

const client = cmsEnabled
  ? createClient({ projectId, dataset, apiVersion, useCdn: true, perspective: "published" })
  : null;

async function fetchOr<T>(
  query: string,
  fallback: T,
  params: Record<string, string> = {},
): Promise<T> {
  if (!client) return fallback;
  try {
    const data = await client.fetch<T>(query, params, {
      next: { revalidate: 3600, tags: ["sanity"] },
    });
    return data ?? fallback;
  } catch (err) {
    // One line per failure (the full error object floods build logs).
    console.error("[cms] fetch failed, serving seed:", err instanceof Error ? err.message : err);
    return fallback;
  }
}

const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

/**
 * The local fallback content. Without a Sanity project: demo content in demo mode
 * (lib/demo.ts — never on the live site), otherwise the TODO placeholders.
 */
const local = demoMode
  ? {
      projects: demoProjects,
      testimonials: demoTestimonials,
      team: demoTeam,
      jobs: demoJobs,
      services: seedServices.map((s) => ({
        ...s,
        startingPrice: s.startingPrice ?? demoStudio.pricing[s.slug]?.price ?? null,
        engagement: s.engagement ?? demoStudio.pricing[s.slug]?.engagement ?? null,
      })),
    }
  : {
      projects: seedProjects,
      testimonials: seedTestimonials,
      team: seedTeam,
      jobs: seedJobs,
      services: seedServices,
    };

/** Sanity returns empty media objects with a null url — make them `null` / drop them. */
const normalizeMedia = (m: Media | { url?: string | null } | null | undefined): Media =>
  m && "url" in m && m.url ? (m as Media) : null;
const normalizeMediaList = (list: (Media | null)[] | undefined) =>
  (list ?? []).map(normalizeMedia).filter((m): m is NonNullable<Media> => m !== null);

const normalizeTestimonial = (t: Testimonial | null): Testimonial | null =>
  t ? { ...t, photo: normalizeMedia(t.photo) } : null;

const normalizeProject = (p: Project): Project => ({
  ...p,
  hero: normalizeMedia(p.hero),
  preview: normalizeMedia(p.preview),
  design: { ...p.design, media: normalizeMediaList(p.design.media) },
  motion: normalizeMediaList(p.motion),
  testimonial: normalizeTestimonial(p.testimonial),
});

export const getProjects = cache(async () =>
  (await fetchOr<Project[]>(q.PROJECTS, [...local.projects].sort(byOrder))).map(normalizeProject),
);

export const getProject = cache(async (slug: string) => {
  const p = await fetchOr<Project | null>(
    q.PROJECT,
    local.projects.find((x) => x.slug === slug) ?? null,
    { slug },
  );
  return p ? normalizeProject(p) : null;
});

export const getFeaturedProjects = cache(async (limit = 3) =>
  (await getProjects()).filter((p) => p.featured).slice(0, limit),
);

/** Services: CMS content merged onto the fixed sitemap list (slugs are URLs, brief §4). */
export const getServices = cache(() => fetchOr<Service[]>(q.SERVICES, local.services));

export const getService = cache(
  async (slug: string) => (await getServices()).find((s) => s.slug === slug) ?? null,
);

export const getTeam = cache(async () =>
  (await fetchOr<TeamMember[]>(q.TEAM, [...local.team].sort(byOrder))).map((m) => ({
    ...m,
    photo: normalizeMedia(m.photo),
  })),
);

export const getTestimonials = cache(async () =>
  (await fetchOr<Testimonial[]>(q.TESTIMONIALS, local.testimonials)).map((t) =>
    normalizeTestimonial(t)!,
  ),
);

export const getJobs = cache(() => fetchOr<Job[]>(q.JOBS, local.jobs));

export const getJob = cache(async (slug: string) =>
  fetchOr<Job | null>(q.JOB, local.jobs.find((j) => j.slug === slug) ?? null, { slug }),
);

export const getFaqGroups = cache(() => fetchOr<FaqGroup[]>(q.FAQ_GROUPS, seedFaqs));

/** Platform keys (CMS values) → display labels. */
export const PLATFORM_LABELS: Record<string, string> = {
  web: "Web",
  ios: "iOS",
  android: "Android",
  desktop: "Desktop",
};
export const platformLabel = (v: string) => PLATFORM_LABELS[v] ?? v;

export { cmsEnabled };
export type * from "./types";
