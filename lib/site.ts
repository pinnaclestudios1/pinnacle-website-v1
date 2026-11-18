/**
 * Site-wide settings. In phase 5 this moves into the CMS "Site settings" model;
 * until then it is the single place to fill in real details.
 *
 * Rules: never invent facts. `null` means "studio must supply" and renders as a
 * visible TODO marker. Copy taken from the brief is marked "TODO: confirm".
 */

export type NavItem = { label: string; href: string };

export type Social = {
  label: "Instagram" | "LinkedIn" | "Behance" | "Dribbble" | "GitHub";
  href: string | null; // TODO: provide profile URLs
};

export const site = {
  name: "Pinnacle Studios",
  legalName: null as string | null, // TODO: registered company name
  registrationNumber: null as string | null, // TODO: GST / registration number
  // Brief §5 Stage 1 headline — TODO: confirm
  headline: "We build websites people remember.",
  // Brief §5 Stage 1 subline (paraphrased) — TODO: confirm final wording
  description:
    "Pinnacle Studios is a design-led studio building websites, apps and digital products.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_IN",
  contact: {
    email: null as string | null, // TODO: provide
    phone: null as string | null, // TODO: provide (E.164, e.g. +91…)
    whatsapp: null as string | null, // TODO: provide (digits only, with country code, for wa.me)
    address: null as string | null, // TODO: provide office address
    responsePromise: "We reply within 24 hours", // brief §7/§8 — TODO: confirm
    /** The real person who replies to leads (contact page + auto-reply signature). */
    replier: {
      name: null as string | null, // TODO: provide
      role: null as string | null, // TODO: provide
      photo: null as string | null, // TODO: provide (path under /public, square, ≥ 240px)
    },
  },
  socials: [
    { label: "Instagram", href: null },
    { label: "LinkedIn", href: null },
    { label: "Behance", href: null },
    { label: "Dribbble", href: null },
    { label: "GitHub", href: null },
  ] as Social[],
  summitAltitude: 8848, // metres — the altitude meter's summit (brief §5)
} as const;

/** Top navigation (brief §4 Navigation). "Start a project" is rendered separately as the CTA. */
export const primaryNav: NavItem[] = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Process", href: "/process" },
  { label: "About", href: "/about" },
];

export const ctaHref = "/contact";

export type Service = {
  slug: string;
  name: string;
  /** One-line summary — TODO: confirm all copy (drafted from service names). */
  summary: string;
};

/** Services and their URLs exactly as in the sitemap (brief §4). */
export const services: Service[] = [
  {
    slug: "web-development",
    name: "Web Design & Development",
    summary: "Fast, memorable websites designed and built in-house.",
  },
  {
    slug: "web-apps",
    name: "Web Apps & SaaS",
    summary: "Product-grade web applications, from first release to scale.",
  },
  {
    slug: "mobile-apps",
    name: "Mobile Apps",
    summary: "iOS and Android apps that feel at home on every device.",
  },
  {
    slug: "ui-ux-design",
    name: "UI/UX & Product Design",
    summary: "Research-led interfaces people understand at first glance.",
  },
  {
    slug: "ecommerce",
    name: "E-commerce",
    summary: "Online stores built to convert and easy to run.",
  },
  {
    slug: "branding-motion",
    name: "Branding & Motion",
    summary: "Identities and motion systems with character.",
  },
  {
    slug: "care-plans",
    name: "Maintenance & Growth",
    summary: "Care plans that keep your product fast, secure and improving.",
  },
];

export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Studio",
    items: [
      { label: "Work", href: "/work" },
      { label: "Process", href: "/process" },
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
      { label: "Capabilities deck", href: "/services#capabilities-deck" },
      // Journal is version 2 (brief §12) — link added when it ships.
    ],
  },
];

export const legalNav: NavItem[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

export function whatsappHref(message = "Hi Pinnacle Studios — I'd like to talk about a project.") {
  if (!site.contact.whatsapp) return null;
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}
