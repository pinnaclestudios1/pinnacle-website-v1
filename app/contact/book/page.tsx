import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Todo } from "@/components/ui/Todo";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Book a call",
  description: "Book a 20-minute call with Pinnacle Studios.",
  path: "/contact/book",
});

/**
 * Book a call (brief §7/§8): Cal.com or Calendly embed.
 * Set NEXT_PUBLIC_BOOKING_URL to the scheduling link, e.g.
 *   https://cal.com/pinnacle/20min?embed=true   or   https://calendly.com/pinnacle/20min
 * TODO(keys): choose the provider. Its origin is added to the CSP automatically (next.config.ts).
 */
const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL;

export default function BookPage() {
  return (
    <section aria-labelledby="book-title" className="py-16 lg:py-24">
      <Container>
        <p className="label text-ink-soft">Contact · Book a call</p>
        <h1 id="book-title" className="mt-5 text-h1">
          Book a 20-minute call.
        </h1>
        <p className="mt-6 max-w-xl text-lead text-ink-soft">
          Pick a time that suits you. We&rsquo;ll talk through your idea, answer questions and
          suggest next steps — no pressure.
        </p>

        <div className="mt-12 overflow-hidden rounded-md border border-line/40 bg-surface">
          {BOOKING_URL ? (
            <iframe
              src={BOOKING_URL}
              title="Booking calendar"
              loading="lazy"
              className="block h-[760px] w-full"
              data-cta="booking"
            />
          ) : (
            <div className="grid min-h-80 place-items-center p-10 text-center">
              <div>
                <p className="text-ink-soft">
                  <Todo>Cal.com or Calendly link (NEXT_PUBLIC_BOOKING_URL)</Todo>
                </p>
                <p className="mt-6 text-sm text-ink-soft">
                  Meanwhile, send us a brief and we&rsquo;ll find a time together.
                </p>
                <div className="mt-6">
                  <Button href="/contact" ctaLocation="book">
                    Start a project
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        {site.contact.email && (
          <p className="mt-6 text-sm text-ink-soft">
            Prefer email?{" "}
            <a href={`mailto:${site.contact.email}`} className="underline underline-offset-4">
              {site.contact.email}
            </a>
          </p>
        )}
      </Container>
    </section>
  );
}
