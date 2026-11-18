import { defineArrayMember, defineField, defineType } from "sanity";
import { services } from "../../lib/site";

/**
 * Document models (brief §10 "CMS content models"):
 * Project, Service, Team member, Testimonial, Post, Job, Site settings — plus FAQ groups.
 */

const SERVICE_OPTIONS = services.map((s) => ({ title: s.name, value: s.slug }));
const PLATFORMS = ["web", "ios", "android", "desktop"];

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  groups: [
    { name: "card", title: "Card & hero", default: true },
    { name: "story", title: "Case study" },
    { name: "results", title: "Results" },
  ],
  fields: [
    defineField({ name: "title", type: "string", group: "card", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      group: "card",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "client", type: "string", group: "card" }),
    defineField({ name: "industry", type: "string", group: "card" }),
    defineField({
      name: "services",
      type: "array",
      group: "card",
      of: [{ type: "string" }],
      options: { list: SERVICE_OPTIONS },
    }),
    defineField({
      name: "platforms",
      type: "array",
      group: "card",
      of: [{ type: "string" }],
      options: { list: PLATFORMS },
    }),
    defineField({ name: "year", type: "number", group: "card" }),
    defineField({ name: "liveUrl", title: "Live link", type: "url", group: "card" }),
    defineField({ name: "summary", type: "text", rows: 2, group: "card" }),
    defineField({ name: "hero", title: "Hero visual", type: "media", group: "card" }),
    defineField({
      name: "preview",
      title: "Card preview (short looping video)",
      type: "media",
      group: "card",
    }),
    defineField({
      name: "headlineResult",
      title: "Headline result (for cards)",
      type: "string",
      group: "card",
      description: "e.g. +180% conversions",
    }),
    defineField({
      name: "featured",
      type: "boolean",
      group: "card",
      initialValue: false,
      description: "Show on the home page (Peaks Conquered).",
    }),
    defineField({ name: "order", type: "number", group: "card" }),
    defineField({
      name: "glance",
      title: "At a glance",
      type: "object",
      group: "story",
      fields: [
        defineField({ name: "timeline", type: "string" }),
        defineField({ name: "teamSize", type: "string" }),
        defineField({
          name: "techStack",
          type: "array",
          of: [{ type: "string" }],
          options: { layout: "tags" },
        }),
      ],
    }),
    defineField({ name: "challenge", type: "richText", group: "story" }),
    defineField({ name: "approach", type: "richText", group: "story" }),
    defineField({
      name: "design",
      type: "object",
      group: "story",
      fields: [
        defineField({ name: "text", type: "richText" }),
        defineField({ name: "media", type: "array", of: [defineArrayMember({ type: "media" })] }),
      ],
    }),
    defineField({
      name: "build",
      type: "object",
      group: "story",
      fields: [
        defineField({ name: "text", type: "richText" }),
        defineField({ name: "highlights", type: "array", of: [{ type: "string" }] }),
      ],
    }),
    defineField({
      name: "motion",
      title: "Motion & details",
      type: "array",
      group: "story",
      of: [defineArrayMember({ type: "media" })],
    }),
    defineField({
      name: "results",
      type: "array",
      group: "results",
      of: [defineArrayMember({ type: "metric" })],
      validation: (r) => r.max(4),
    }),
    defineField({
      name: "testimonial",
      type: "reference",
      group: "results",
      to: [{ type: "testimonial" }],
    }),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "title", subtitle: "client", media: "hero.image" } },
});

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      description: "Must match a URL in the sitemap.",
      options: { source: "name" },
      validation: (r) =>
        r
          .required()
          .custom((s) =>
            s?.current && SERVICE_OPTIONS.some((o) => o.value === s.current)
              ? true
              : "Use one of the sitemap service URLs",
          ),
    }),
    defineField({ name: "order", type: "number" }),
    defineField({ name: "summary", type: "string" }),
    defineField({ name: "whatItIs", title: "What it is", type: "text", rows: 3 }),
    defineField({ name: "whoFor", title: "Who it’s for", type: "text", rows: 2 }),
    defineField({
      name: "problems",
      title: "Problems it solves",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "deliverables", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "process",
      title: "Process steps",
      type: "array",
      of: [defineArrayMember({ type: "step" })],
    }),
    defineField({
      name: "techStack",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "startingPrice",
      type: "string",
      description: "e.g. From ₹3L / $5k. Leave empty to hide.",
    }),
    defineField({ name: "engagement", title: "Engagement model", type: "string" }),
    defineField({ name: "faqs", type: "array", of: [defineArrayMember({ type: "faqItem" })] }),
    defineField({
      name: "relatedProjects",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "project" }] })],
    }),
  ],
  preview: { select: { title: "name", subtitle: "summary" } },
});

export const teamMember = defineType({
  name: "teamMember",
  title: "Team member",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "photo", type: "media" }),
    defineField({ name: "funFact", type: "string" }),
    defineField({
      name: "socials",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", type: "string" }),
            defineField({ name: "url", type: "url" }),
          ],
        }),
      ],
    }),
    defineField({ name: "order", type: "number" }),
  ],
  preview: { select: { title: "name", subtitle: "role", media: "photo.image" } },
});

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({ name: "quote", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "company", type: "string" }),
    defineField({ name: "photo", type: "media" }),
    defineField({ name: "videoUrl", title: "Video testimonial URL", type: "url" }),
    defineField({ name: "project", type: "reference", to: [{ type: "project" }] }),
    defineField({
      name: "permission",
      title: "Client gave permission to publish",
      type: "boolean",
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "name", subtitle: "company" } },
});

export const job = defineType({
  name: "job",
  title: "Job",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "type",
      type: "string",
      options: { list: ["Full-time", "Part-time", "Contract", "Internship"] },
    }),
    defineField({ name: "location", type: "string" }),
    defineField({ name: "summary", type: "text", rows: 2 }),
    defineField({ name: "description", type: "richText" }),
    defineField({ name: "requirements", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "applyUrl",
      title: "Apply link (leave empty to use the site form)",
      type: "url",
    }),
    defineField({ name: "open", type: "boolean", initialValue: true }),
  ],
  preview: { select: { title: "title", subtitle: "location" } },
});

export const faqGroup = defineType({
  name: "faqGroup",
  title: "FAQ group",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "order", type: "number" }),
    defineField({ name: "items", type: "array", of: [defineArrayMember({ type: "faqItem" })] }),
  ],
});

/** Journal — version 2 (brief §12). Model ready so writing can start early. */
export const post = defineType({
  name: "post",
  title: "Journal post (v2)",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "author", type: "reference", to: [{ type: "teamMember" }] }),
    defineField({ name: "category", type: "string" }),
    defineField({ name: "publishedAt", type: "datetime" }),
    defineField({ name: "cover", type: "media" }),
    defineField({ name: "excerpt", type: "text", rows: 3 }),
    defineField({ name: "body", type: "richText" }),
    defineField({ name: "seo", type: "seo" }),
  ],
});

/** Site settings (singleton): contact details, socials, announcement bar. */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "email", type: "string" }),
    defineField({ name: "phone", type: "string" }),
    defineField({
      name: "whatsapp",
      type: "string",
      description: "Digits only, with country code",
    }),
    defineField({ name: "address", type: "text", rows: 3 }),
    defineField({ name: "legalName", type: "string" }),
    defineField({ name: "registrationNumber", title: "GST / registration number", type: "string" }),
    defineField({
      name: "socials",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", type: "string" }),
            defineField({ name: "url", type: "url" }),
          ],
        }),
      ],
    }),
    defineField({ name: "announcement", title: "Announcement bar", type: "string" }),
    defineField({ name: "seo", title: "Default SEO", type: "seo" }),
  ],
});
