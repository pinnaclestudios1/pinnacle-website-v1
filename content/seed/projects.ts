import type { Project, Testimonial } from "../../lib/cms/types";

/**
 * Seed projects — PLACEHOLDERS ONLY. No real clients, results or quotes are invented.
 * TODO: replace with the 3–5 launch case studies (brief §12 open decisions) in the CMS.
 */
const placeholderProject = (
  n: number,
  slug: string,
  services: string[],
  platforms: string[],
): Project => ({
  slug,
  title: `TODO: Project ${n}`,
  client: null,
  industry: null,
  services,
  platforms,
  year: null,
  liveUrl: null,
  summary: "TODO: one-sentence summary of the project and the outcome.",
  hero: null,
  preview: null,
  headlineResult: null,
  glance: { timeline: null, teamSize: null, techStack: [] },
  challenge: ["TODO: the client’s problem in 2–3 short paragraphs."],
  approach: ["TODO: research, strategy and the key decisions we made."],
  design: {
    text: ["TODO: moodboard, wireframes, final screens, design-system snippets."],
    media: [],
  },
  build: {
    text: ["TODO: architecture highlights and interesting engineering problems solved."],
    highlights: [],
  },
  motion: [],
  results: [],
  testimonial: null,
  featured: true,
  order: n,
  placeholder: true,
});

export const projects: Project[] = [
  placeholderProject(1, "project-one", ["web-development", "branding-motion"], ["web"]),
  placeholderProject(2, "project-two", ["web-apps", "ui-ux-design"], ["web"]),
  placeholderProject(3, "project-three", ["mobile-apps", "ui-ux-design"], ["ios", "android"]),
];

export const testimonials: Testimonial[] = [1, 2, 3].map((n) => ({
  id: `testimonial-${n}`,
  quote: null,
  name: null,
  role: null,
  company: null,
  photo: null,
  videoUrl: null,
  projectSlug: null,
  placeholder: true,
}));
