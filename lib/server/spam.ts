import { headers } from "next/headers";
import { config } from "./config";

/**
 * Spam protection without captcha puzzles (brief §8 "Reducing friction"):
 * 1. Honeypot — a hidden field people never fill.
 * 2. Time trap — a form completed in under 3 seconds is a bot.
 * 3. Rate limit — per IP, per form.
 * 4. Cloudflare Turnstile — invisible check, verified server-side when keys are set.
 *
 * Rate limiting here is in-memory, which is per server instance. On serverless
 * hosting add a shared store (e.g. Upstash Redis) before launch. TODO(launch).
 */

export const HONEYPOT_FIELD = "website";
export const STARTED_FIELD = "startedAt";
export const TURNSTILE_FIELD = "cf-turnstile-response";

const MIN_FILL_MS = 3000;
const buckets = new Map<string, number[]>();

export async function clientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function rateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return true;
  }
  hits.push(now);
  buckets.set(key, hits);
  return false;
}

async function verifyTurnstile(token: string, ip: string) {
  if (!config.turnstileSecret) return true; // not configured yet — TODO(keys)
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: config.turnstileSecret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export type SpamVerdict = { ok: true; ip: string } | { ok: false; reason: string; silent: boolean };

/**
 * `silent: true` → pretend success (don't teach bots what tripped them).
 * `silent: false` → tell the person (rate limit, failed human check).
 */
export async function checkSpam(
  fd: FormData,
  form: string,
  limit = { count: 5, windowMs: 10 * 60_000 },
): Promise<SpamVerdict> {
  const ip = await clientIp();

  if (String(fd.get(HONEYPOT_FIELD) ?? "").trim() !== "") {
    return { ok: false, reason: "honeypot", silent: true };
  }
  const started = Number(fd.get(STARTED_FIELD));
  if (!Number.isFinite(started) || Date.now() - started < MIN_FILL_MS) {
    return { ok: false, reason: "too-fast", silent: true };
  }
  if (rateLimited(`${form}:${ip}`, limit.count, limit.windowMs)) {
    return { ok: false, reason: "rate-limited", silent: false };
  }
  if (!(await verifyTurnstile(String(fd.get(TURNSTILE_FIELD) ?? ""), ip))) {
    return { ok: false, reason: "turnstile", silent: false };
  }
  return { ok: true, ip };
}
