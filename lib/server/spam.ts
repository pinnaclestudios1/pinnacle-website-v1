import { headers } from "next/headers";
import { config } from "./config";

/**
 * Spam protection without captcha puzzles (brief §8 "Reducing friction"):
 * 1. Honeypot — a hidden field people never fill.
 * 2. Time trap — a form completed in under 3 seconds is a bot.
 * 3. Rate limit — per IP, per form.
 * 4. Cloudflare Turnstile — invisible check, verified server-side when keys are set.
 *
 * Rate limiting uses Upstash Redis when it's configured (shared by every server
 * instance on Vercel), and falls back to an in-memory limit (per instance) when it
 * isn't, or when Redis doesn't answer within 1.5s.
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

/**
 * Fixed-window counter in Redis: INCR the key, and start its expiry on the first hit.
 * Returns null when Redis isn't configured or fails, so the caller falls back.
 */
async function redisRateLimited(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean | null> {
  const { url, token } = config.redis;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify([
        ["INCR", `rl:${key}`],
        ["PEXPIRE", `rl:${key}`, String(windowMs), "NX"],
      ]),
      signal: AbortSignal.timeout(1500),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const [count] = (await res.json()) as [{ result?: number }, unknown];
    return typeof count?.result === "number" ? count.result > limit : null;
  } catch {
    return null;
  }
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
  const key = `${form}:${ip}`;
  const limited =
    (await redisRateLimited(key, limit.count, limit.windowMs)) ??
    rateLimited(key, limit.count, limit.windowMs);
  if (limited) {
    return { ok: false, reason: "rate-limited", silent: false };
  }
  if (!(await verifyTurnstile(String(fd.get(TURNSTILE_FIELD) ?? ""), ip))) {
    return { ok: false, reason: "turnstile", silent: false };
  }
  return { ok: true, ip };
}
