import type { Faq, Project, RichText, Service } from "@/lib/cms/types";
import { site } from "@/lib/site";

/**
 * schema.org JSON-LD builders (brief §11 SEO: structured data).
 * Rule: only facts that are actually published. Anything still marked TODO, and every
 * placeholder case study, is left out rather than guessed.
 */

type Thing = Record<string, unknown>;

const abs = (path: string) => (path.startsWith("http") ? path : `${site.url}${path}`);
const ORG_ID = `${site.url}/#organization`;
const isTodo = (s: string | null | undefined) => !s || /TODO/i.test(s);

/** Portable Text / seed paragraphs → plain text. */
export function plainText(value: RichText): string {
  return value
    .map((b) => {
      if (typeof b === "string") return b;
      const children = (b as { children?: { text?: string }[] }).children;
      return Array.isArray(children) ? children.map((c) => c.text ?? "").join("") : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

export function organization(): Thing {
  const sameAs = site.socials.map((s) => s.href).filter(Boolean);
  const { email, phone, address } = site.contact;
  return {
    "@context": "https://schema.org",
    "@type": address ? ["Organization", "ProfessionalService"] : "Organization",
    "@id": ORG_ID,
    name: site.name,
    ...(site.legalName ? { legalName: site.legalName } : {}),
    url: site.url,
    logo: abs("/icons/512.png"),
    description: site.description,
    ...(sameAs.length ? { sameAs } : {}),
    ...(email ? { email } : {}),
    ...(phone ? { telephone: phone } : {}),
    // LocalBusiness-style address only once a real one is supplied (TODO in lib/site.ts).
    ...(address ? { address: { "@type": "PostalAddress", streetAddress: address } } : {}),
  };
}

export function website(): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    url: site.url,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  };
}

export function breadcrumbs(items: { name: string; path: string }[]): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

/** FAQPage — only questions whose answers are signed off (no TODO). Null when none. */
export function faqPage(faqs: Faq[]): Thing | null {
  const items = faqs
    .map((f) => ({ q: f.question, a: plainText(f.answer) }))
    .filter((f) => !isTodo(f.q) && !isTodo(f.a));
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function service(s: Service): Thing {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    serviceType: s.name,
    description: s.whatItIs || s.summary,
    url: abs(`/services/${s.slug}`),
    provider: { "@id": ORG_ID },
    // TODO: add areaServed once the studio confirms its markets.
  };
}

/** CreativeWork for a real case study. Null for placeholders — they are never described. */
export function caseStudy(p: Project): Thing | null {
  if (p.placeholder) return null;
  const image =
    p.hero?.kind === "image" ? p.hero.url : p.preview?.kind === "image" ? p.preview.url : null;
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.title,
    headline: p.title,
    description: p.summary,
    url: abs(`/work/${p.slug}`),
    creator: { "@id": ORG_ID },
    ...(p.year ? { dateCreated: String(p.year) } : {}),
    ...(p.client ? { sourceOrganization: { "@type": "Organization", name: p.client } } : {}),
    ...(image ? { image } : {}),
    ...(p.liveUrl ? { sameAs: p.liveUrl } : {}),
  };
}
