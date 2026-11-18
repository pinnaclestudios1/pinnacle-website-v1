import { analyticsConfig } from "@/lib/analytics";

/**
 * Analytics runtime — loaded only after consent (or for cookieless Plausible).
 * Providers: GA4 (Consent Mode v2), Microsoft Clarity, Plausible — whichever IDs are set.
 *
 * Events (brief §11): CTA clicks by location, WhatsApp clicks, form steps, form
 * submissions, bookings, case-study views, scroll depth per home stage, video plays,
 * deck requests. Page views are sent on every client-side navigation.
 */
type Props = Record<string, string | number | boolean | undefined>;
type Win = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
  plausible?: ((event: string, opts?: { props?: Props }) => void) & { q?: unknown[] };
  __pnTrack?: (event: string, props: Props) => void;
  __pnQueue?: [string, Props][];
};

let started = false;

function addScript(src: string, attrs: Record<string, string> = {}) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.appendChild(s);
}

export function start({ withCookies }: { withCookies: boolean }) {
  if (started) return;
  started = true;
  const w = window as Win;
  const { ga, clarity, plausible } = analyticsConfig;

  if (ga && withCookies) {
    w.dataLayer = w.dataLayer ?? [];
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
    w.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
    w.gtag("consent", "update", { analytics_storage: "granted" });
    w.gtag("js", new Date());
    w.gtag("config", ga, { send_page_view: false, anonymize_ip: true });
    addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`);
  }
  if (clarity && withCookies) {
    w.clarity =
      w.clarity ??
      Object.assign(
        (...args: unknown[]) => {
          (w.clarity!.q = w.clarity!.q ?? []).push(args);
        },
        { q: [] as unknown[] },
      );
    w.clarity("consent");
    addScript(`https://www.clarity.ms/tag/${encodeURIComponent(clarity)}`);
  }
  if (plausible) {
    w.plausible =
      w.plausible ??
      Object.assign(
        (...args: unknown[]) => {
          (w.plausible!.q = w.plausible!.q ?? []).push(args);
        },
        { q: [] as unknown[] },
      );
    addScript("https://plausible.io/js/script.manual.js", { "data-domain": plausible });
  }

  const send = (event: string, props: Props) => {
    if (event === "page_view") {
      w.gtag?.("event", "page_view", {
        page_path: props.path,
        page_location: location.href,
        page_title: document.title,
      });
      w.plausible?.("pageview");
      if (typeof props.path === "string" && /^\/work\/[^/]+$/.test(props.path))
        send("case_study_viewed", { slug: props.path.split("/").pop() });
      return;
    }
    w.gtag?.("event", event, props);
    w.clarity?.("event", event);
    w.plausible?.(event, { props });
  };
  w.__pnTrack = send;
  // Replay anything tracked before consent / before this loaded.
  (w.__pnQueue ?? []).splice(0).forEach(([e, p]) => send(e, p));

  installListeners(send);
}

/** Visitor withdrew consent: stop sending and clear analytics cookies we can reach. */
export function revoke() {
  const w = window as Win;
  w.gtag?.("consent", "update", { analytics_storage: "denied" });
  w.__pnTrack = undefined;
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0]!.trim();
    if (/^(_ga|_gid|_clck|_clsk|CLID|MUID)/.test(name)) {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${location.hostname.replace(/^www\./, ".")}`;
      document.cookie = `${name}=; Max-Age=0; path=/`;
    }
  });
}

function installListeners(send: (event: string, props: Props) => void) {
  // CTA clicks by location (+ WhatsApp, booking buttons) — every CTA carries data-cta.
  document.addEventListener(
    "click",
    (e) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-cta]");
      if (!el) return;
      const cta = el.dataset.cta ?? "cta";
      send(cta === "whatsapp" ? "whatsapp_click" : "cta_click", {
        cta,
        location: el.dataset.ctaLocation ?? "unknown",
        text: el.textContent?.trim().slice(0, 40),
      });
    },
    { capture: true },
  );

  // Bookings from the Cal.com / Calendly embed.
  window.addEventListener("message", (e) => {
    const d = e.data as { type?: string; event?: string; originator?: string } | null;
    if (!d || typeof d !== "object") return;
    if (
      d.event === "calendly.event_scheduled" ||
      (d.originator === "CAL" && d.type === "bookingSuccessful")
    ) {
      send("booking_made", { provider: d.event ? "calendly" : "cal.com" });
    }
  });

  // Scroll depth: each home stage reached (once per page view).
  const seen = new Set<string>();
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        const stage = (en.target as HTMLElement).dataset.stage;
        if (en.isIntersecting && stage && /^\d$/.test(stage) && !seen.has(stage)) {
          seen.add(stage);
          send("stage_reached", { stage: Number(stage) });
        }
      }),
    { threshold: 0.35 },
  );
  const observe = () => document.querySelectorAll("[data-stage]").forEach((s) => io.observe(s));
  observe();
  new MutationObserver(observe).observe(document.querySelector("main") ?? document.body, {
    childList: true,
  });
}
