import type { FaqGroup } from "../../lib/cms/types";

/**
 * FAQ — DRAFT answers (brief §6: Pricing, Timelines, Process, Tech, Ownership, Support).
 * These describe how the studio works, so every answer needs sign-off: "TODO: confirm".
 * No prices, durations or guarantees are stated — those are marked TODO.
 */
const d = (question: string, ...answer: string[]) => ({ question, answer, draft: true });

export const faqGroups: FaqGroup[] = [
  {
    id: "pricing",
    title: "Pricing",
    items: [
      d(
        "How much does a project cost?",
        "It depends on scope. After a short call we send a clear, fixed proposal. TODO: add “projects from …” ranges if the studio decides to publish them.",
      ),
      d(
        "Do you work with fixed prices?",
        "Yes — most projects are fixed price. Ongoing work runs as a dedicated team or a monthly retainer.",
      ),
      d("Do you take payment in INR and USD?", "TODO: confirm currencies and payment terms."),
    ],
  },
  {
    id: "timelines",
    title: "Timelines",
    items: [
      d("How long does a website take?", "TODO: typical range for a marketing site."),
      d("How long does an app take?", "TODO: typical range for a first release."),
      d(
        "Can you work to a tight deadline?",
        "Often, yes — tell us the date in your brief and we’ll say honestly what’s possible.",
      ),
    ],
  },
  {
    id: "process",
    title: "Process",
    items: [
      d(
        "What happens after I send a brief?",
        "We reply within 24 hours, book a discovery call, and send a proposal within 3–5 days.",
      ),
      d(
        "How involved will I be?",
        "As much as you like. You’ll get weekly updates, a demo every sprint and a dedicated project manager.",
      ),
      d("Will you sign an NDA?", "Yes — just ask, and we’ll sign one before you share details."),
    ],
  },
  {
    id: "tech",
    title: "Tech",
    items: [
      d(
        "What do you build with?",
        "Mostly React, Next.js, Node.js and Flutter, with headless CMSs and modern hosting. We pick tools to fit your product, not the other way round.",
      ),
      d(
        "Will my site be fast and accessible?",
        "Yes — we design to Core Web Vitals and WCAG 2.2 AA from the start.",
      ),
    ],
  },
  {
    id: "ownership",
    title: "Ownership",
    items: [
      d(
        "Who owns the design and code?",
        "TODO: confirm IP-transfer terms (e.g. on final payment).",
      ),
      d(
        "Do I get access to the source code and accounts?",
        "TODO: confirm — repositories, hosting and CMS access.",
      ),
    ],
  },
  {
    id: "support",
    title: "Support",
    items: [
      d(
        "What happens after launch?",
        "We stay with you through launch, then offer care plans for updates, monitoring and improvements.",
      ),
      d(
        "Do you support sites you didn’t build?",
        "Often — after a short onboarding audit. TODO: confirm.",
      ),
    ],
  },
];
