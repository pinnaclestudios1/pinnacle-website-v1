import { defineArrayMember, defineField, defineType } from "sanity";

/** Rich text used across case studies, jobs and FAQs. */
export const richText = defineType({
  name: "richText",
  title: "Rich text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullets", value: "bullet" },
        { title: "Numbers", value: "number" },
      ],
    }),
  ],
});

/** Image or looping video (Mux / Cloudinary URL), always with alt text (brief §11). */
export const media = defineType({
  name: "media",
  title: "Media",
  type: "object",
  fields: [
    defineField({
      name: "kind",
      type: "string",
      options: { list: ["image", "video"], layout: "radio" },
      initialValue: "image",
    }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.kind === "video",
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL (muted, looping MP4 from Mux or Cloudinary)",
      type: "url",
      hidden: ({ parent }) => parent?.kind !== "video",
    }),
    defineField({
      name: "poster",
      title: "Video poster image",
      type: "image",
      hidden: ({ parent }) => parent?.kind !== "video",
    }),
    defineField({
      name: "alt",
      title: "Alternative text",
      type: "string",
      description: "Describe what's shown, for people using screen readers. Required.",
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "alt", media: "image" } },
});

export const metric = defineType({
  name: "metric",
  title: "Result",
  type: "object",
  fields: [
    defineField({
      name: "value",
      type: "string",
      description: "e.g. +180%",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "label",
      type: "string",
      description: "e.g. conversions",
      validation: (r) => r.required(),
    }),
  ],
  preview: { select: { title: "value", subtitle: "label" } },
});

export const faqItem = defineType({
  name: "faqItem",
  title: "Question",
  type: "object",
  fields: [
    defineField({ name: "question", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", type: "richText" }),
  ],
  preview: { select: { title: "question" } },
});

export const step = defineType({
  name: "step",
  title: "Step",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "text", type: "text", rows: 2 }),
  ],
});

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.max(60) }),
    defineField({ name: "description", type: "text", rows: 3, validation: (r) => r.max(160) }),
  ],
});
