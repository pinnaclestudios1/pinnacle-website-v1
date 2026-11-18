"use client";

import { useEffect, useState } from "react";
import { readUtm } from "@/lib/analytics";

/**
 * Hidden fields every public form includes (see lib/server/spam.ts):
 * honeypot, fill-start time, first-touch UTM + referrer, and the Turnstile widget
 * when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set.
 *
 * Without JavaScript the start time stays 0 (the time trap passes) — the honeypot,
 * rate limit and Turnstile still apply.
 */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function FormGuards() {
  const [{ startedAt, utm, referrer }, setValues] = useState({
    startedAt: "0",
    utm: "{}",
    referrer: "",
  });

  useEffect(() => {
    // Browser-only values, read once after mount (unavailable during server render).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues({ startedAt: String(Date.now()), utm: readUtm(), referrer: document.referrer });
    // Turnstile's script, injected once, only when a site key is configured
    // (no next/script — it would add to every page's bundle).
    if (SITE_KEY && !document.getElementById("cf-turnstile-api")) {
      const s = document.createElement("script");
      s.id = "cf-turnstile-api";
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <>
      {/* Honeypot: invisible to people and assistive tech, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />
      <input type="hidden" name="utm" value={utm} />
      <input type="hidden" name="referrer" value={referrer} />
      {SITE_KEY && (
        <div
          className="cf-turnstile"
          data-sitekey={SITE_KEY}
          data-appearance="interaction-only"
          data-theme="light"
        />
      )}
    </>
  );
}
