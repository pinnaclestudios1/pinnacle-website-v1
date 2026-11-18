import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const originOf = (url: string | undefined) => {
  try {
    return url ? new URL(url).origin : null;
  } catch {
    return null;
  }
};

/**
 * Content-Security-Policy (brief §11 "Security and legal").
 *
 * An allowlist rather than nonces: a nonce forces every page to render per request,
 * which would throw away static generation (and the LCP / TTFB targets). Inline scripts
 * are Next's own hydration payloads plus HEAD_SCRIPT and JSON-LD, all authored here.
 * Third-party origins are added only for services that are actually configured.
 * Decision log: docs/DECISIONS.md.
 */
function contentSecurityPolicy() {
  const ga = Boolean(process.env.NEXT_PUBLIC_GA_ID);
  const clarity = Boolean(process.env.NEXT_PUBLIC_CLARITY_ID);
  const plausible = Boolean(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN);
  const turnstile = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const booking = originOf(process.env.NEXT_PUBLIC_BOOKING_URL);

  const script = ["'self'", "'unsafe-inline'"];
  const connect = ["'self'"];
  const img = ["'self'", "data:", "blob:", "https://cdn.sanity.io"];
  const frame: string[] = [];

  if (isDev) {
    script.push("'unsafe-eval'"); // React dev tooling / Turbopack HMR
    connect.push("ws:", "wss:");
  }
  if (ga) {
    script.push("https://www.googletagmanager.com");
    connect.push(
      "https://*.google-analytics.com",
      "https://*.analytics.google.com",
      "https://www.googletagmanager.com",
    );
    img.push("https://*.google-analytics.com", "https://www.googletagmanager.com");
  }
  if (clarity) {
    script.push("https://*.clarity.ms");
    connect.push("https://*.clarity.ms", "https://c.bing.com");
    img.push("https://*.clarity.ms", "https://c.bing.com");
  }
  if (plausible) {
    script.push("https://plausible.io");
    connect.push("https://plausible.io");
  }
  if (turnstile) {
    script.push("https://challenges.cloudflare.com");
    frame.push("https://challenges.cloudflare.com");
  }
  if (booking) frame.push(booking);

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": script,
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": img,
    "media-src": ["'self'", "blob:", "https://cdn.sanity.io"],
    "font-src": ["'self'"],
    "connect-src": connect,
    "frame-src": frame.length ? frame : ["'none'"],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "manifest-src": ["'self'"],
  };
  return Object.entries(directives)
    .map(([k, v]) => `${k} ${v.join(" ")}`)
    .join("; ");
}

/**
 * Sanity Studio (/studio) is a large client app that talks to *.sanity.io over HTTPS and
 * WebSockets and evaluates code; it gets its own looser policy, still framing-proof.
 */
const studioCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.sanity-cdn.com",
  "style-src 'self' 'unsafe-inline' https://*.sanity.io https://*.sanity-cdn.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data: https://*.sanity.io https://*.sanity-cdn.com", // Studio UI fonts
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://*.sanity-cdn.com",
  "frame-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
].join("; ");

/**
 * Baseline security headers.
 * TODO: confirm — add `preload` to HSTS only after the production domain is final.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Sanity's image CDN (case studies, team photos). Cloudinary/Mux: add when chosen.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/((?!studio).*)",
        headers: [{ key: "Content-Security-Policy", value: contentSecurityPolicy() }],
      },
      { source: "/studio/:path*", headers: [{ key: "Content-Security-Policy", value: studioCsp }] },
    ];
  },
};

export default nextConfig;
