/**
 * Server-side integration settings, read at request time from the environment.
 * Every integration is optional: unset → that channel is skipped (logged).
 * See .env.example for the full list.
 */
const env = (k: string) => process.env[k]?.trim() || undefined;

export const config = {
  resend: {
    apiKey: env("RESEND_API_KEY"),
    /** Overridable for tests (the QA script points it at a local mock). */
    apiUrl: env("RESEND_API_URL") ?? "https://api.resend.com",
    from: env("CONTACT_FROM_EMAIL"), // e.g. "Asha at Pinnacle <hello@pinnacle.studio>" — TODO
    to: env("CONTACT_TO_EMAIL"), // team inbox — TODO
  },
  slackWebhook: env("SLACK_WEBHOOK_URL"),
  /** Capabilities deck PDF link emailed on request (brief §8 CTA system). TODO: the deck. */
  deckUrl: env("DECK_URL"),
  /** Job applications inbox; falls back to CONTACT_TO_EMAIL. */
  careersTo: env("CAREERS_TO_EMAIL"),
  crm: {
    webhook: env("CRM_WEBHOOK_URL"), // HubSpot / Zoho / Notion via Zapier/Make, or a direct endpoint — TODO: choose
    secret: env("CRM_WEBHOOK_SECRET"),
  },
  turnstileSecret: env("TURNSTILE_SECRET_KEY"),
  /**
   * Shared rate-limit store (Upstash Redis over HTTP). Vercel's Upstash integration sets
   * KV_REST_API_URL / KV_REST_API_TOKEN; a direct Upstash database gives UPSTASH_REDIS_REST_*.
   * Unset → the in-memory limit (per server instance) is used.
   */
  redis: {
    url: env("UPSTASH_REDIS_REST_URL") ?? env("KV_REST_API_URL"),
    token: env("UPSTASH_REDIS_REST_TOKEN") ?? env("KV_REST_API_TOKEN"),
  },
  brevo: {
    apiKey: env("BREVO_API_KEY"),
    listId: env("BREVO_LIST_ID"),
    apiUrl: env("BREVO_API_URL") ?? "https://api.brevo.com/v3",
  },
  /**
   * When NO channel is configured: log the lead and report success (local dev, or
   * staging with CONTACT_DRY_RUN=1). In production with nothing configured the form
   * fails loudly instead, so a real lead is never silently lost.
   */
  dryRun: env("CONTACT_DRY_RUN") === "1" || process.env.NODE_ENV !== "production",
};

/** True when at least one channel can actually capture a lead. */
export function canCaptureLeads() {
  return Boolean(
    (config.resend.apiKey && config.resend.to) || config.slackWebhook || config.crm.webhook,
  );
}
