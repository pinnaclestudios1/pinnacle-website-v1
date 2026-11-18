"use client";

import { usePathname } from "next/navigation";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  anyAnalytics,
  needsConsent,
  OPEN_CONSENT_EVENT,
  readConsent,
  track,
  writeConsent,
} from "@/lib/analytics";

/**
 * Cookie consent + analytics bootstrap (brief §11: "analytics loads only after consent").
 * - Banner appears only when a cookie-setting tool (GA4 / Clarity) is configured and the
 *   visitor hasn't chosen yet. Its code loads lazily.
 * - The analytics runtime loads only after "Accept" (or straight away for cookieless
 *   Plausible). Until then track() calls queue in memory.
 * - Any element with [data-open-consent] (footer "Cookie settings") reopens the banner.
 */
const ConsentBanner = lazy(() => import("./ConsentBanner"));

async function startAnalytics(withCookies: boolean) {
  const m = await import("./analytics-runtime");
  m.start({ withCookies });
}

export function ConsentRoot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!anyAnalytics) return;
    const consent = readConsent();
    if (consent?.analytics) void startAnalytics(true);
    else if (!needsConsent) void startAnalytics(false);
    // Banner on the first visit (deferred so it never competes with the page's first paint).
    if (needsConsent && !consent) {
      const t = window.setTimeout(() => setOpen(true), 1200);
      return () => window.clearTimeout(t);
    }
  }, []);

  // "Cookie settings" anywhere on the page.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest("[data-open-consent]")) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener(OPEN_CONSENT_EVENT, onOpen);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener(OPEN_CONSENT_EVENT, onOpen);
      document.removeEventListener("click", onClick);
    };
  }, []);

  // Page views for client-side navigations (sent once analytics is running).
  useEffect(() => {
    track("page_view", { path: pathname });
  }, [pathname]);

  if (!open) return null;
  return (
    <Suspense fallback={null}>
      <ConsentBanner
        configured={needsConsent}
        current={readConsent()?.analytics ?? null}
        onChoose={(analytics) => {
          writeConsent(analytics);
          setOpen(false);
          if (analytics) void startAnalytics(true);
          else if (readConsent()) void import("./analytics-runtime").then((m) => m.revoke());
        }}
        onClose={() => setOpen(false)}
      />
    </Suspense>
  );
}
