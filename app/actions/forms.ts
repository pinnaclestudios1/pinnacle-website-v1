"use server";

import { headers } from "next/headers";
import {
  labelOf,
  parseBrief,
  parseQuick,
  scoreBrief,
  validateBrief,
  validateQuick,
  type FormState,
} from "@/lib/forms/brief";
import { deliverLead, newRef, subscribe, type Lead } from "@/lib/server/leads";
import { checkSpam } from "@/lib/server/spam";
import { site } from "@/lib/site";

/**
 * Form server actions (brief §10: server actions + Resend + Turnstile).
 * Next.js checks the request Origin on server actions (CSRF protection).
 * Validation always runs here — the browser's checks are only for convenience.
 */

const FALLBACK = site.contact.email
  ? `Please email us at ${site.contact.email} instead.`
  : "Please try again in a few minutes."; // TODO: contact email

async function meta(fd: FormData, ip: string): Promise<Lead["meta"]> {
  const h = await headers();
  let utm: Record<string, string> = {};
  try {
    const raw = JSON.parse(String(fd.get("utm") ?? "{}")) as Record<string, unknown>;
    utm = Object.fromEntries(
      Object.entries(raw)
        .filter(([k, v]) => k.startsWith("utm_") && typeof v === "string")
        .map(([k, v]) => [k, String(v).slice(0, 100)]),
    );
  } catch {
    /* ignore malformed */
  }
  return {
    ip,
    userAgent: (h.get("user-agent") ?? "").slice(0, 200),
    referrer: String(fd.get("referrer") ?? "").slice(0, 300),
    utm,
  };
}

export async function submitBrief(_prev: FormState, fd: FormData): Promise<FormState> {
  const spam = await checkSpam(fd, "brief");
  if (!spam.ok) {
    if (spam.silent) return { status: "success", ref: newRef("brief") };
    return {
      status: "error",
      message:
        spam.reason === "rate-limited"
          ? "That’s a lot of briefs in a short time — please wait a few minutes and try again."
          : "We couldn’t confirm you’re human. Please try again.",
    };
  }

  const input = parseBrief(fd);
  const errors = validateBrief(input);
  if (Object.keys(errors).length) {
    return { status: "error", message: "A few answers need another look.", errors };
  }

  const score = scoreBrief(input);
  const ref = newRef("brief");
  const report = await deliverLead({
    kind: "brief",
    ref,
    createdAt: new Date().toISOString(),
    name: input.name,
    email: input.email,
    title: `New project brief from ${input.name}${input.company ? ` (${input.company})` : ""}`,
    score,
    rows: [
      { label: "Building", value: input.projectTypes.map(labelOf.projectType).join(", ") },
      { label: "About", value: input.about },
      {
        label: "Budget",
        value: `${labelOf.budget(input.currency, input.budget)} (${input.currency})`,
      },
      { label: "Timeline", value: labelOf.timeline(input.timeline) },
      { label: "Name", value: input.name },
      { label: "Email", value: input.email },
      { label: "Company", value: input.company },
      { label: "Phone", value: input.phone },
      { label: "Heard via", value: input.source ? labelOf.source(input.source) : "" },
      {
        label: "Lead score",
        value: `${score.score} (${score.tier}) — ${score.reasons.join(", ")}`,
      },
    ],
    data: {
      projectTypes: input.projectTypes,
      about: input.about,
      currency: input.currency,
      budget: input.budget,
      timeline: input.timeline,
      company: input.company,
      phone: input.phone,
      source: input.source,
      consent: {
        given: true,
        at: new Date().toISOString(),
        text: "Contact consent (contact form)",
      },
    },
    meta: await meta(fd, spam.ip),
  });

  if (!report.captured) {
    return { status: "error", message: `Sorry — your brief didn’t go through. ${FALLBACK}` };
  }
  return { status: "success", ref };
}

export async function submitQuick(_prev: FormState, fd: FormData): Promise<FormState> {
  const spam = await checkSpam(fd, "quick");
  if (!spam.ok) {
    if (spam.silent) return { status: "success", ref: newRef("quick") };
    return {
      status: "error",
      message:
        spam.reason === "rate-limited"
          ? "Please wait a few minutes before sending another message."
          : "We couldn’t confirm you’re human. Please try again.",
    };
  }
  const input = parseQuick(fd);
  const errors = validateQuick(input);
  if (Object.keys(errors).length)
    return { status: "error", message: "Please check the highlighted fields.", errors };

  const ref = newRef("quick");
  const report = await deliverLead({
    kind: "quick",
    ref,
    createdAt: new Date().toISOString(),
    name: input.name,
    email: input.email,
    title: `Quick enquiry from ${input.name}`,
    score: null,
    rows: [
      { label: "Building", value: input.what },
      { label: "Name", value: input.name },
      { label: "Email", value: input.email },
    ],
    data: {
      what: input.what,
      consent: { given: true, at: new Date().toISOString(), text: "Contact consent (home)" },
    },
    meta: await meta(fd, spam.ip),
  });
  if (!report.captured)
    return { status: "error", message: `Sorry — that didn’t go through. ${FALLBACK}` };
  return { status: "success", ref };
}

export async function subscribeNewsletter(_prev: FormState, fd: FormData): Promise<FormState> {
  const spam = await checkSpam(fd, "newsletter", { count: 3, windowMs: 10 * 60_000 });
  if (!spam.ok) {
    if (spam.silent) return { status: "success", ref: "ok" };
    return { status: "error", message: "Please try again in a few minutes." };
  }
  const email = String(fd.get("email") ?? "")
    .trim()
    .toLowerCase();
  const consent = fd.get("consent") === "on";
  const errors: Record<string, string> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Enter a valid email address.";
  if (!consent) errors.consent = "Please agree to receive emails.";
  if (Object.keys(errors).length)
    return { status: "error", message: "Please check the form.", errors };

  const result = await subscribe(email);
  if (result === "failed")
    return { status: "error", message: "Sign-up didn’t work just now — please try again later." };
  return { status: "success", ref: "ok" };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Capabilities deck request (brief §8 CTA system: "Download capabilities deck — email required"). */
export async function requestDeck(_prev: FormState, fd: FormData): Promise<FormState> {
  const spam = await checkSpam(fd, "deck", { count: 3, windowMs: 10 * 60_000 });
  if (!spam.ok) {
    if (spam.silent) return { status: "success", ref: "ok" };
    return { status: "error", message: "Please try again in a few minutes." };
  }
  const email = String(fd.get("email") ?? "")
    .trim()
    .toLowerCase();
  const errors: Record<string, string> = {};
  if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
  if (fd.get("consent") !== "on") errors.consent = "Please agree so we can email you the deck.";
  if (Object.keys(errors).length)
    return { status: "error", message: "Please check the form.", errors };

  const ref = newRef("deck");
  const report = await deliverLead({
    kind: "deck",
    ref,
    createdAt: new Date().toISOString(),
    name: email,
    email,
    title: `Capabilities deck requested by ${email}`,
    score: null,
    rows: [{ label: "Email", value: email }],
    data: { consent: { given: true, at: new Date().toISOString(), text: "Deck request consent" } },
    meta: await meta(fd, spam.ip),
  });
  if (!report.captured) {
    return { status: "error", message: `The deck isn’t available just now. ${FALLBACK}` };
  }
  return { status: "success", ref };
}

/** General job application (brief §6 Careers). CV by link — no file uploads to store or scan. */
export async function submitApplication(_prev: FormState, fd: FormData): Promise<FormState> {
  const spam = await checkSpam(fd, "application", { count: 3, windowMs: 30 * 60_000 });
  if (!spam.ok) {
    if (spam.silent) return { status: "success", ref: newRef("application") };
    return { status: "error", message: "Please try again a little later." };
  }
  const s = (k: string, max = 200) =>
    String(fd.get(k) ?? "")
      .trim()
      .slice(0, max);
  const input = {
    name: s("name", 120),
    email: s("email", 120).toLowerCase(),
    role: s("role", 120),
    portfolio: s("portfolio", 300),
    message: s("message", 3000),
  };
  const errors: Record<string, string> = {};
  if (input.name.length < 2) errors.name = "Please tell us your name.";
  if (!EMAIL_RE.test(input.email)) errors.email = "Enter an email address like name@domain.com.";
  if (!/^https?:\/\/\S+\.\S+/.test(input.portfolio))
    errors.portfolio =
      "Add a link to your portfolio, GitHub, LinkedIn or CV (starting with https://).";
  if (input.message.length < 20)
    errors.message = "A few sentences about you — at least 20 characters.";
  if (fd.get("consent") !== "on")
    errors.consent = "Please agree so we can review your application.";
  if (Object.keys(errors).length)
    return { status: "error", message: "A few fields need another look.", errors };

  const ref = newRef("application");
  const report = await deliverLead({
    kind: "application",
    ref,
    createdAt: new Date().toISOString(),
    name: input.name,
    email: input.email,
    title: `Application from ${input.name}${input.role ? ` — ${input.role}` : ""}`,
    score: null,
    rows: [
      { label: "Role", value: input.role || "General application" },
      { label: "Name", value: input.name },
      { label: "Email", value: input.email },
      { label: "Portfolio / CV", value: input.portfolio },
      { label: "About", value: input.message },
    ],
    data: {
      ...input,
      consent: { given: true, at: new Date().toISOString(), text: "Application consent" },
    },
    meta: await meta(fd, spam.ip),
  });
  if (!report.captured)
    return { status: "error", message: `Your application didn’t go through. ${FALLBACK}` };
  return { status: "success", ref };
}
