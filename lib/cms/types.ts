/**
 * Content models (brief §10 "CMS content models"). Every page reads these shapes,
 * whether the data comes from the local seed (content/seed) or from Sanity.
 *
 * `placeholder: true` → stand-in content the studio must replace (renders TODO markers).
 * `draft: true` → real-looking draft copy that still needs sign-off ("TODO: confirm").
 */

/** Rich text: plain paragraphs (seed) or Portable Text blocks (Sanity). */
export type RichText = Array<string | { _type: string; _key?: string; [k: string]: unknown }>;

export type Media =
  | { kind: "image"; url: string; alt: string; width?: number; height?: number }
  | { kind: "video"; url: string; poster?: string; alt: string }
  | null;

export type Metric = { value: string; label: string };

export type Testimonial = {
  id: string;
  quote: string | null;
  name: string | null;
  role: string | null;
  company: string | null;
  photo: Media;
  videoUrl: string | null;
  projectSlug: string | null;
  placeholder: boolean;
};

export type Project = {
  slug: string;
  title: string;
  client: string | null;
  industry: string | null;
  /** Service slugs (see lib/site.ts services). */
  services: string[];
  platforms: string[];
  year: number | null;
  liveUrl: string | null;
  summary: string;
  hero: Media;
  preview: Media;
  /** One result metric for cards, e.g. "+180% conversions". */
  headlineResult: string | null;
  glance: { timeline: string | null; teamSize: string | null; techStack: string[] };
  challenge: RichText;
  approach: RichText;
  design: { text: RichText; media: Media[] };
  build: { text: RichText; highlights: string[] };
  motion: Media[];
  results: Metric[];
  testimonial: Testimonial | null;
  featured: boolean;
  order: number;
  placeholder: boolean;
};

export type Faq = { question: string; answer: RichText; draft?: boolean };
export type FaqGroup = { id: string; title: string; items: Faq[] };

export type ServiceStep = { title: string; text: string };

export type Service = {
  slug: string;
  name: string;
  summary: string;
  whatItIs: string;
  whoFor: string;
  problems: string[];
  deliverables: string[];
  process: ServiceStep[];
  techStack: string[];
  /** e.g. "From ₹3L / $5k" — TODO: pricing decision (brief §12 open decisions). */
  startingPrice: string | null;
  engagement: string | null;
  faqs: Faq[];
  relatedProjects: string[];
  draft: boolean;
};

export type TeamMember = {
  id: string;
  name: string | null;
  role: string | null;
  photo: Media;
  funFact: string | null;
  socials: { label: string; url: string }[];
  order: number;
  placeholder: boolean;
};

export type Job = {
  slug: string;
  title: string;
  type: string | null;
  location: string | null;
  summary: string;
  description: RichText;
  requirements: string[];
  applyUrl: string | null;
  open: boolean;
  placeholder: boolean;
};

/** Journal post — version 2 (brief §12). Model ready; pages not built yet. */
export type Post = {
  slug: string;
  title: string;
  author: string | null;
  category: string | null;
  publishedAt: string | null;
  cover: Media;
  excerpt: string;
  body: RichText;
  seo: { title: string | null; description: string | null };
};
