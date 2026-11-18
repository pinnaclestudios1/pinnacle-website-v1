"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ctaHref, whatsappHref } from "@/lib/site";

/**
 * Mobile/tablet sticky "Start a project" pill (brief §4 + §8), plus WhatsApp once a
 * number is configured — one bar so the two never stack.
 *
 * A "Start a project" button is always on screen: this pill steps aside whenever another
 * primary CTA (hero, footer summit, menu) is visible, so orange is never doubled up
 * (brief §2: orange < 5% of any screen). Hidden on /contact, which is the summit itself.
 */
export function StickyCta() {
  const pathname = usePathname();
  const onContact = pathname.startsWith("/contact");
  const [othersVisible, setOthersVisible] = useState(true);

  useEffect(() => {
    if (onContact) return;
    const targets = document.querySelectorAll(
      '[data-cta="primary"]:not([data-cta-location="sticky"])',
    );
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        // Hidden CTAs (desktop nav, closed menu) have zero-size boxes that still report as
        // "intersecting" — only count ones that are actually rendered.
        const rendered = e.boundingClientRect.width > 0 && e.boundingClientRect.height > 0;
        if (e.isIntersecting && rendered) visible.add(e.target);
        else visible.delete(e.target);
      }
      setOthersVisible(visible.size > 0);
    });
    targets.forEach((t) => io.observe(t));
    // No other CTA on this page: show the pill (the observer won't call back with nothing to watch).
    const frame = targets.length === 0 ? requestAnimationFrame(() => setOthersVisible(false)) : 0;
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [pathname, onContact]);

  if (onContact) return null;
  const wa = whatsappHref();
  const hidden = othersVisible;

  return (
    <aside
      aria-label="Quick contact"
      inert={hidden}
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-[var(--pn-z-sticky)] flex justify-center px-[var(--pn-gutter)] pb-[calc(1rem+env(safe-area-inset-bottom))] lg:hidden",
        "transition-[translate,opacity] duration-400 ease-out-expo motion-reduce:transition-opacity",
        hidden ? "translate-y-[150%] opacity-0" : "translate-y-0 opacity-100",
      )}
    >
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-line/30 bg-surface p-1.5 shadow-[0_12px_32px_-14px_rgb(30_30_30/0.4)]">
        <Button href={ctaHref} ctaLocation="sticky" size="sm" className="rounded-full px-5">
          Start a project
        </Button>
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp (opens in a new tab)"
            data-cta="whatsapp"
            data-cta-location="sticky"
            className="grid size-10 shrink-0 place-items-center rounded-full text-ink"
          >
            <WhatsAppIcon />
          </a>
        )}
      </div>
    </aside>
  );
}

export function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor">
      <path
        strokeWidth={1.5}
        strokeLinejoin="round"
        d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4l-4.5 1.1Z"
      />
      <path
        strokeWidth={1.5}
        strokeLinecap="round"
        d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 .9c-1-.4-2.4-1.8-2.8-2.8l.9-1-1-2L9 8.5Z"
      />
    </svg>
  );
}
