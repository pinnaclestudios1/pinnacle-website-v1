/**
 * GROQ queries that project Sanity documents into the shapes in lib/cms/types.ts,
 * so pages never know where content came from.
 * NOTE: written against sanity/schemaTypes; first run them against a real dataset
 * (Vision tool in /studio) when the project is created. TODO(keys).
 */

/**
 * Media object projection. Empty media (no image, no video URL) come back with a
 * null url and are turned into `null` by normalizeMedia() in lib/cms/index.ts.
 */
const mediaFields = `
  "kind": select(kind == "video" => "video", "image"),
  "url": select(kind == "video" => videoUrl, image.asset->url),
  "poster": poster.asset->url,
  "alt": coalesce(alt, ""),
  "width": image.asset->metadata.dimensions.width,
  "height": image.asset->metadata.dimensions.height`;

const media = (field: string) => `${field}{${mediaFields}}`;
const mediaList = (field: string) => `coalesce(${field}[]{${mediaFields}}, [])`;

const testimonial = `{
  "id": _id, quote, name, role, company,
  "photo": ${media("photo")},
  videoUrl, "projectSlug": project->slug.current, "placeholder": false
}`;

const project = `{
  "slug": slug.current, title, client, industry,
  "services": coalesce(services, []), "platforms": coalesce(platforms, []),
  year, liveUrl, "summary": coalesce(summary, ""),
  "hero": ${media("hero")}, "preview": ${media("preview")},
  headlineResult,
  "glance": { "timeline": glance.timeline, "teamSize": glance.teamSize, "techStack": coalesce(glance.techStack, []) },
  "challenge": coalesce(challenge, []), "approach": coalesce(approach, []),
  "design": { "text": coalesce(design.text, []), "media": ${mediaList("design.media")} },
  "build": { "text": coalesce(build.text, []), "highlights": coalesce(build.highlights, []) },
  "motion": ${mediaList("motion")},
  "results": coalesce(results[]{ value, label }, []),
  "testimonial": testimonial->${testimonial},
  "featured": coalesce(featured, false), "order": coalesce(order, 999), "placeholder": false
}`;

export const PROJECTS = `*[_type == "project" && defined(slug.current)] | order(order asc) ${project}`;
export const PROJECT = `*[_type == "project" && slug.current == $slug][0] ${project}`;

export const SERVICES = `*[_type == "service" && defined(slug.current)] | order(order asc) {
  "slug": slug.current, name, "summary": coalesce(summary, ""),
  "whatItIs": coalesce(whatItIs, ""), "whoFor": coalesce(whoFor, ""),
  "problems": coalesce(problems, []), "deliverables": coalesce(deliverables, []),
  "process": coalesce(process[]{ title, text }, []), "techStack": coalesce(techStack, []),
  startingPrice, engagement,
  "faqs": coalesce(faqs[]{ question, "answer": coalesce(answer, []) }, []),
  "relatedProjects": coalesce(relatedProjects[]->slug.current, []), "draft": false
}`;

export const TEAM = `*[_type == "teamMember"] | order(order asc) {
  "id": _id, name, role, "photo": ${media("photo")}, funFact,
  "socials": coalesce(socials[]{ label, url }, []), "order": coalesce(order, 999), "placeholder": false
}`;

export const TESTIMONIALS = `*[_type == "testimonial"] | order(_createdAt desc) ${testimonial}`;

const job = `{
  "slug": slug.current, title, type, location, "summary": coalesce(summary, ""),
  "description": coalesce(description, []), "requirements": coalesce(requirements, []),
  applyUrl, "open": coalesce(open, false), "placeholder": false
}`;
export const JOBS = `*[_type == "job" && defined(slug.current)] | order(_createdAt desc) ${job}`;
export const JOB = `*[_type == "job" && slug.current == $slug][0] ${job}`;

export const FAQ_GROUPS = `*[_type == "faqGroup"] | order(order asc) {
  "id": _id, title, "items": coalesce(items[]{ question, "answer": coalesce(answer, []) }, [])
}`;
