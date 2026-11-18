"use client";

/**
 * Analytics event hook (brief §11 "Analytics and tracking"). Tiny and always loaded.
 * Events queue here until the analytics runtime (components/extras/analytics-runtime)
 * loads — which happens only after cookie consent, or immediately for cookieless
 * Plausible. If no analytics is configured, events go nowhere.
 */
type Props = Record<string, string | number | boolean | undefined>;
type Win = Window & {
  __pnTrack?: (event: string, props: Props) => void;
  __pnQueue?: [string, Props][];
};

export function track(event: string, props: Props = {}) {
  if (typeof window === "undefined") return;
  const w = window as Win;
  if (w.__pnTrack) return w.__pnTrack(event, props);
  const q = (w.__pnQueue ??= []);
  if (q.length < 50) q.push([event, props]);
  if (process.env.NODE_ENV !== "production") console.debug("[track]", event, props);
}

const UTM_KEY = "pn-utm";

/** First-touch UTM parameters for this browsing session (Instagram reels, ads — brief §11). */
export function captureUtm() {
  try {
    if (sessionStorage.getItem(UTM_KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    params.forEach((v, k) => {
      if (k.startsWith("utm_")) utm[k] = v.slice(0, 100);
    });
    if (Object.keys(utm).length) sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
  } catch {
    /* storage blocked — fine */
  }
}

export function readUtm(): string {
  try {
    return sessionStorage.getItem(UTM_KEY) ?? "{}";
  } catch {
    return "{}";
  }
}

/* ---------------------------------------------------------------- consent */

export const CONSENT_KEY = "pn-consent";
export const OPEN_CONSENT_EVENT = "pn:open-consent";
export type Consent = { v: 1; analytics: boolean; at: string };

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    const c = raw ? (JSON.parse(raw) as Consent) : null;
    return c?.v === 1 ? c : null;
  } catch {
    return null;
  }
}

export function writeConsent(analytics: boolean): Consent {
  const c: Consent = { v: 1, analytics, at: new Date().toISOString() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(c));
  } catch {
    /* storage blocked: the choice applies to this visit only */
  }
  return c;
}

/** Which analytics tools are configured (public IDs, inlined at build). */
export const analyticsConfig = {
  ga: process.env.NEXT_PUBLIC_GA_ID,
  clarity: process.env.NEXT_PUBLIC_CLARITY_ID,
  plausible: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
};
/** GA4 and Clarity set cookies → they need consent. Plausible is cookieless. */
export const needsConsent = Boolean(analyticsConfig.ga || analyticsConfig.clarity);
export const anyAnalytics = needsConsent || Boolean(analyticsConfig.plausible);
