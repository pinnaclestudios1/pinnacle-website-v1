/**
 * Demo mode — sample content so the whole site can be reviewed before the studio's
 * real case studies, people and numbers exist (content/demo).
 *
 * It must never reach the live site by accident, because invented clients, quotes and
 * numbers would mislead real visitors (brief rule: never invent them for real). So:
 *   - on:  local development and builds, and Vercel preview deployments
 *   - off: the Vercel *production* deployment
 *   - NEXT_PUBLIC_DEMO_CONTENT=1 forces it on, =0 forces it off, anywhere
 * While it's on, every page is marked noindex and a small "Demo content" badge shows.
 * Contact details, company/legal details, awards and review ratings are never faked.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so server and client agree.
 */
import { demoStudio } from "@/content/demo/studio";

const flag = process.env.NEXT_PUBLIC_DEMO_CONTENT;
const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV;

export const demoMode = flag === "1" || (flag !== "0" && vercelEnv !== "production");

/** The studio's demo story, numbers and timings — `null` outside demo mode. */
export const demo = demoMode ? demoStudio : null;
