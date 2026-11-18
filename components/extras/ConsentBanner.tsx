"use client";

import { useEffect, useRef } from "react";

/**
 * Cookie banner (brief §7 Legal, §11). Non-blocking (the page stays usable), and
 * "Reject" is exactly as easy as "Accept" (DPDP Act / GDPR). Loaded lazily.
 */
export default function ConsentBanner({
  configured,
  current,
  onChoose,
  onClose,
}: {
  configured: boolean;
  current: boolean | null;
  onChoose: (analytics: boolean) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    // When reopened from "Cookie settings", move focus into the banner.
    if (current !== null) ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && current !== null && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, onClose]);

  const btn =
    "h-11 flex-1 rounded-md border border-ink px-4 text-sm font-medium text-ink transition-transform duration-150 active:scale-[0.97] motion-reduce:transition-none";

  return (
    <section
      ref={ref}
      data-consent-banner=""
      aria-labelledby="consent-title"
      className="fixed inset-x-[var(--pn-gutter)] bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[110] max-w-md rounded-md border border-line/50 bg-surface p-5 shadow-[0_18px_50px_-24px_rgb(30_30_30/0.5)] lg:right-auto lg:bottom-8 lg:left-[calc(var(--pn-dot-lane)+0.5rem)]"
    >
      <h2 id="consent-title" className="font-display text-xl">
        Cookies, briefly
      </h2>
      {configured ? (
        <p className="mt-2 text-sm text-ink-soft">
          We’d like to use analytics cookies to see which pages help and where people get stuck.
          Only if you say yes — the site works the same either way.{" "}
          <a href="/cookies" className="underline underline-offset-2">
            Cookie policy
          </a>
        </p>
      ) : (
        <p className="mt-2 text-sm text-ink-soft">This site doesn’t use tracking cookies.</p>
      )}
      {current !== null && (
        <p className="mt-2 text-xs text-ink-soft">
          Current choice: analytics {current ? "allowed" : "off"}.
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <button type="button" className={btn} onClick={() => onChoose(false)}>
          Reject
        </button>
        <button type="button" className={btn} onClick={() => onChoose(true)} disabled={!configured}>
          Accept analytics
        </button>
      </div>
    </section>
  );
}
