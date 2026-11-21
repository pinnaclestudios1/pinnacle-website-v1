import { MarkWithDot } from "@/components/brand/MarkWithDot";
import { WhatsAppIcon } from "@/components/layout/StickyCta";
import { NightSky } from "@/components/layout/NightSky";
import { TransitionLink } from "@/components/motion/PageTransition";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Todo } from "@/components/ui/Todo";
import { site, whatsappHref } from "@/lib/site";
import { QuickEnquiry } from "./QuickEnquiry";

/**
 * Stage 7 — The Summit (brief §5): the pyramid is complete; the Dot waits at the
 * apex holding a tiny flag. Short inline form + "Book a call" + WhatsApp.
 * Below it, the sky fades to night before the footer.
 */
export function Summit() {
  const wa = whatsappHref();
  return (
    <>
      <section
        id="summit"
        data-stage="7"
        data-tilt-area=""
        aria-labelledby="summit-title"
        className="py-[var(--pn-section)]"
      >
        <Container className="grid items-center gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <p className="label text-ink-soft">
              Stage 7 · The Summit · {site.summitAltitude.toLocaleString("en-US")}m
            </p>
            <h2 id="summit-title" className="mt-4 text-h1">
              Your project could be the next peak.
            </h2>
            <p className="mt-6 max-w-md text-lead text-ink-soft">
              Tell us a little. {site.contact.responsePromise}.
            </p>
            <div className="mt-10">
              <QuickEnquiry />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button href="/contact/book" variant="outline" size="sm" ctaLocation="home-summit">
                <CalendarIcon /> Book a 20-min call
              </Button>
              {wa ? (
                <Button
                  href={wa}
                  variant="outline"
                  size="sm"
                  target="_blank"
                  ctaLocation="home-summit"
                  aria-label="WhatsApp us (opens in a new tab)"
                >
                  <WhatsAppIcon className="size-4" /> WhatsApp us
                </Button>
              ) : (
                <span className="text-sm text-ink-soft">
                  WhatsApp <Todo>number</Todo>
                </span>
              )}
              <TransitionLink
                href="/contact"
                className="rounded-sm text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
              >
                Prefer the full brief?
              </TransitionLink>
            </div>
          </div>
          <div className="relative flex justify-center lg:col-span-5 lg:justify-end">
            {/* The pyramid glows when an enquiry is sent (QuickEnquiry sets data-celebrate). */}
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-1/2 size-[26rem] -translate-1/2 scale-75 rounded-full bg-[radial-gradient(circle,var(--pn-peach),transparent_65%)] opacity-0 transition-[opacity,scale] duration-1000 ease-out-expo in-data-celebrate:scale-100 in-data-celebrate:opacity-90 lg:-right-16 lg:left-auto lg:translate-x-0"
            />
            <MarkWithDot
              width="min(22rem, 70vw)"
              name="summit"
              priority={30}
              attach="visible"
              attachWithin="[data-stage]"
              props={["flag"]}
              gaze={{ x: 2, y: -4 }}
              interactive
              tilt
              className="relative"
            />
          </div>
        </Container>
      </section>

      {/* The background fades to night as you reach the footer (brief §5 Footer). */}
      <div
        aria-hidden
        className="relative h-[45vh] bg-[linear-gradient(to_bottom,var(--pn-cream),var(--pn-night))]"
      >
        <NightSky className="absolute inset-x-0 bottom-0 h-1/2 [mask-image:linear-gradient(to_bottom,transparent,black)]" />
      </div>
    </>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <rect x="3.5" y="5" width="17" height="15" rx="1.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}
