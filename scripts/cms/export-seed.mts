/**
 * Converts the local seed (content/seed) into a Sanity import file, so the CMS starts
 * with the same structure the site shows today — placeholders and drafts included.
 *
 *   npm run cms:seed
 *   npx sanity dataset import content/seed/sanity-seed.ndjson production
 *
 * Runs on Node's built-in TypeScript support (Node ≥ 22.18).
 */
import { writeFileSync } from "node:fs";
import { faqGroups } from "../../content/seed/faqs.ts";
import { jobs, team } from "../../content/seed/people.ts";
import { projects, testimonials } from "../../content/seed/projects.ts";
import { services } from "../../content/seed/services.ts";

let k = 0;
const key = () => `k${(k++).toString(36)}`;

/** Plain paragraphs → Portable Text blocks. */
const blocks = (paras: unknown[]) =>
  paras
    .filter((p): p is string => typeof p === "string")
    .map((text) => ({
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: key(), text, marks: [] }],
    }));

const docs: Record<string, unknown>[] = [];

services.forEach((s, i) =>
  docs.push({
    _id: `service-${s.slug}`,
    _type: "service",
    name: s.name,
    slug: { _type: "slug", current: s.slug },
    order: i + 1,
    summary: s.summary,
    whatItIs: s.whatItIs,
    whoFor: s.whoFor,
    problems: s.problems,
    deliverables: s.deliverables,
    process: s.process.map((p) => ({ _type: "step", _key: key(), ...p })),
    techStack: s.techStack,
    engagement: s.engagement,
    faqs: s.faqs.map((f) => ({
      _type: "faqItem",
      _key: key(),
      question: f.question,
      answer: blocks(f.answer),
    })),
  }),
);

projects.forEach((p) =>
  docs.push({
    _id: `drafts.project-${p.slug}`, // imported as drafts: placeholders must not go live
    _type: "project",
    title: p.title,
    slug: { _type: "slug", current: p.slug },
    services: p.services,
    platforms: p.platforms,
    summary: p.summary,
    featured: p.featured,
    order: p.order,
    challenge: blocks(p.challenge),
    approach: blocks(p.approach),
    design: { text: blocks(p.design.text) },
    build: { text: blocks(p.build.text), highlights: p.build.highlights },
  }),
);

faqGroups.forEach((g, i) =>
  docs.push({
    _id: `faq-${g.id}`,
    _type: "faqGroup",
    title: g.title,
    order: i + 1,
    items: g.items.map((f) => ({
      _type: "faqItem",
      _key: key(),
      question: f.question,
      answer: blocks(f.answer),
    })),
  }),
);

jobs.forEach((j) =>
  docs.push({
    _id: `drafts.job-${j.slug}`,
    _type: "job",
    title: j.title,
    slug: { _type: "slug", current: j.slug },
    summary: j.summary,
    description: blocks(j.description),
    requirements: j.requirements,
    open: j.open,
  }),
);

// Team and testimonials are pure placeholders — create empty drafts as reminders.
team.forEach((m, i) =>
  docs.push({
    _id: `drafts.${m.id}`,
    _type: "teamMember",
    name: `TODO: team member ${i + 1}`,
    order: m.order,
  }),
);
testimonials.forEach((t, i) =>
  docs.push({
    _id: `drafts.${t.id}`,
    _type: "testimonial",
    name: `TODO: client ${i + 1}`,
    quote: "TODO: quote (with permission)",
  }),
);

docs.push({ _id: "siteSettings", _type: "siteSettings" });

const out = "content/seed/sanity-seed.ndjson";
writeFileSync(out, docs.map((d) => JSON.stringify(d)).join("\n") + "\n");
console.log(`Wrote ${docs.length} documents to ${out}`);
