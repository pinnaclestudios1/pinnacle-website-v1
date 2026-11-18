/**
 * Project brief + quick enquiry: options, parsing, validation and lead scoring.
 * Pure TypeScript, shared by the browser (step-by-step validation) and the server
 * (authoritative validation). Brief §8 "The Summit contact page".
 */

export const PROJECT_TYPES = [
  { id: "website", label: "Website" },
  { id: "web-app", label: "Web app" },
  { id: "mobile-app", label: "Mobile app" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "branding", label: "Branding" },
  { id: "not-sure", label: "Not sure yet" },
] as const;

export const TIMELINES = [
  { id: "asap", label: "ASAP", points: 3 },
  { id: "1-3m", label: "1–3 months", points: 3 },
  { id: "3-6m", label: "3–6 months", points: 2 },
  { id: "flexible", label: "Flexible", points: 1 },
] as const;

export type Currency = "INR" | "USD";

/**
 * Budget chips with an INR / USD toggle. `tier` (0–4) drives lead scoring.
 * TODO: confirm — ranges are placeholders; set them to the studio's real bands.
 */
export const BUDGETS: Record<Currency, { id: string; label: string; tier: number }[]> = {
  INR: [
    { id: "inr-lt-1l", label: "Under ₹1L", tier: 0 },
    { id: "inr-1-3l", label: "₹1–3L", tier: 1 },
    { id: "inr-3-8l", label: "₹3–8L", tier: 2 },
    { id: "inr-8-20l", label: "₹8–20L", tier: 3 },
    { id: "inr-20l-plus", label: "₹20L+", tier: 4 },
    { id: "inr-not-sure", label: "Not sure yet", tier: 1 },
  ],
  USD: [
    { id: "usd-lt-2k", label: "Under $2k", tier: 0 },
    { id: "usd-2-5k", label: "$2k–5k", tier: 1 },
    { id: "usd-5-15k", label: "$5k–15k", tier: 2 },
    { id: "usd-15-40k", label: "$15k–40k", tier: 3 },
    { id: "usd-40k-plus", label: "$40k+", tier: 4 },
    { id: "usd-not-sure", label: "Not sure yet", tier: 1 },
  ],
};

export const SOURCES = [
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "google", label: "Google search" },
  { id: "referral", label: "A friend or colleague" },
  { id: "directory", label: "Clutch / GoodFirms" },
  { id: "other", label: "Somewhere else" },
] as const;

/** The six steps, in order (brief §8). */
export const STEPS = [
  { id: "what", title: "What are you building?", fields: ["projectTypes"] },
  { id: "about", title: "Tell us a bit about it", fields: ["about"] },
  { id: "budget", title: "What’s your budget range?", fields: ["budget"] },
  { id: "timeline", title: "When do you want to launch?", fields: ["timeline"] },
  { id: "details", title: "Your details", fields: ["name", "email", "company", "phone", "source"] },
  { id: "send", title: "Ready to send?", fields: ["consent"] },
] as const;

export type BriefInput = {
  projectTypes: string[];
  about: string;
  currency: Currency;
  budget: string;
  timeline: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  source: string;
  consent: boolean;
};

// Shared form contract and the quick enquiry live in tiny modules of their own (bundle size).
export { IDLE, type FieldErrors, type FormState } from "./state";
export { parseQuick, validateQuick, type QuickInput } from "./quick";
import type { FieldErrors } from "./state";

const LIMITS = { short: 120, about: 4000, what: 300 } as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\-.\s\d]{6,20}$/;

const str = (v: FormDataEntryValue | null | undefined) => (typeof v === "string" ? v.trim() : "");

export function parseBrief(fd: FormData): BriefInput {
  const currency = str(fd.get("currency")) === "USD" ? "USD" : "INR";
  return {
    projectTypes: fd
      .getAll("projectTypes")
      .map((v) => str(v))
      .filter(Boolean),
    about: str(fd.get("about")).slice(0, LIMITS.about),
    currency,
    budget: str(fd.get("budget")),
    timeline: str(fd.get("timeline")),
    name: str(fd.get("name")).slice(0, LIMITS.short),
    email: str(fd.get("email")).slice(0, LIMITS.short).toLowerCase(),
    company: str(fd.get("company")).slice(0, LIMITS.short),
    phone: str(fd.get("phone")).slice(0, 30),
    source: str(fd.get("source")),
    consent: fd.get("consent") === "on" || fd.get("consent") === "true",
  };
}

/** Errors for one step's fields (the browser checks before moving on). */
export function validateBriefFields(input: BriefInput, fields: readonly string[]): FieldErrors {
  const e: FieldErrors = {};
  const want = (f: string) => fields.includes(f);
  const typeIds = PROJECT_TYPES.map((t) => t.id as string);

  if (want("projectTypes")) {
    if (input.projectTypes.length === 0)
      e.projectTypes = "Pick at least one — “Not sure yet” is fine.";
    else if (input.projectTypes.some((t) => !typeIds.includes(t)))
      e.projectTypes = "Please choose from the options.";
  }
  if (want("about") && input.about.length < 20) {
    e.about = "A couple of sentences helps us prepare — at least 20 characters.";
  }
  if (want("budget") && !BUDGETS[input.currency].some((b) => b.id === input.budget)) {
    e.budget = "Choose a range (or “Not sure yet”).";
  }
  if (want("timeline") && !TIMELINES.some((t) => t.id === input.timeline)) {
    e.timeline = "Choose a timeline.";
  }
  if (want("name") && input.name.length < 2) e.name = "Please tell us your name.";
  if (want("email") && !EMAIL.test(input.email))
    e.email = "Enter an email address like name@company.com.";
  if (want("phone") && input.phone && !PHONE.test(input.phone))
    e.phone = "That phone number doesn’t look right.";
  if (want("source") && input.source && !SOURCES.some((s) => s.id === input.source))
    e.source = "Please choose from the list.";
  if (want("consent") && !input.consent) e.consent = "Please agree so we can reply to you.";
  return e;
}

export function validateBrief(input: BriefInput): FieldErrors {
  return validateBriefFields(
    input,
    STEPS.flatMap((s) => [...s.fields]),
  );
}

export type LeadScore = { score: number; tier: "high" | "medium" | "low"; reasons: string[] };

/**
 * Lead scoring by budget and timeline (brief §8): high-value leads get a call within 2 hours.
 * TODO: confirm thresholds with the studio after the first month's baseline.
 */
export function scoreBrief(input: BriefInput): LeadScore {
  const budget = BUDGETS[input.currency].find((b) => b.id === input.budget);
  const timeline = TIMELINES.find((t) => t.id === input.timeline);
  const budgetPts = (budget?.tier ?? 0) * 2; // 0–8
  const timePts = timeline?.points ?? 0; // 1–3
  const score = budgetPts + timePts;
  const reasons = [
    budget ? `Budget ${budget.label}` : "No budget",
    timeline ? `Timeline ${timeline.label}` : "No timeline",
  ];
  const tier = score >= 8 ? "high" : score >= 5 ? "medium" : "low";
  return { score, tier, reasons };
}

export const labelOf = {
  projectType: (id: string) => PROJECT_TYPES.find((t) => t.id === id)?.label ?? id,
  budget: (currency: Currency, id: string) =>
    BUDGETS[currency].find((b) => b.id === id)?.label ?? id,
  timeline: (id: string) => TIMELINES.find((t) => t.id === id)?.label ?? id,
  source: (id: string) => SOURCES.find((s) => s.id === id)?.label ?? id,
};
