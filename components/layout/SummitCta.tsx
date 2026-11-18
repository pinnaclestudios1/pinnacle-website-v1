"use client";

import { usePathname } from "next/navigation";
import { MarkWithDot } from "@/components/brand/MarkWithDot";
import { Button } from "@/components/ui/Button";
import { ctaHref } from "@/lib/site";

/**
 * Every page ends with a summit CTA (brief §6). Lives at the top of the night-sky footer.
 * Hidden on /contact (the summit itself). On the home page, whose Stage 7 is the summit,
 * only the peak and the Dot remain.
 *
 * When the summit scrolls into view the Dot takes its place on the peak, looking
 * up at the sky (brief §5 Footer).
 */
export function SummitCta() {
  const pathname = usePathname();
  if (pathname.startsWith("/contact")) return null;

  // Home: Stage 7 already holds the CTA, so the footer just shows the Dot on the peak,
  // looking up at the night sky (brief §5 Footer).
  if (pathname === "/") {
    return (
      <div className="flex justify-center pt-20 pb-16 lg:pt-28">
        <MarkWithDot
          width="clamp(8rem, 14vw, 11rem)"
          priority={20}
          attach="visible"
          gaze={{ x: 2, y: -5 }}
          interactive
        />
      </div>
    );
  }

  return (
    <div className="grid items-end gap-12 pt-24 pb-20 lg:grid-cols-12 lg:pt-36 lg:pb-28">
      <div className="lg:col-span-7">
        <p className="label text-ink-soft">The Summit</p>
        <h2 className="mt-4 text-h1">Your project could be the next peak.</h2>
        <p className="mt-6 max-w-md text-lead text-ink-soft">
          Tell us what you&rsquo;re building. We reply within 24 hours.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href={ctaHref} ctaLocation="footer">
            Start a project
          </Button>
          <Button
            href="/contact/book"
            variant="outline"
            ctaLocation="footer"
            className="border-ink"
          >
            Book a 20-min call
          </Button>
        </div>
      </div>
      <div className="hidden justify-end lg:col-span-5 lg:flex">
        <MarkWithDot
          width="clamp(18rem, 22vw, 20rem)"
          priority={20}
          attach="visible"
          gaze={{ x: 2, y: -5 }}
          interactive
        />
      </div>
    </div>
  );
}
