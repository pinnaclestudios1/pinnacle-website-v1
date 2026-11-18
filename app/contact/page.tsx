import { BriefForm } from "@/components/contact/BriefForm";
import { WhatsAppIcon } from "@/components/layout/StickyCta";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Todo } from "@/components/ui/Todo";
import { pageMetadata } from "@/lib/seo";
import { site, whatsappHref } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Start a project",
  description: "Tell us what you’re building. We reply within 24 hours.",
  path: "/contact",
});

/**
 * Contact — The Summit (brief §8). Left: who replies and how to reach us.
 * Right: the multi-step brief with the Dot climbing a progress pyramid.
 */
export default function ContactPage() {
  const wa = whatsappHref();
  const { contact } = site;

  return (
    <section aria-labelledby="contact-title" className="py-16 lg:py-24">
      <Container className="grid gap-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5 lg:pr-8">
          <p className="label text-ink-soft">Contact · The Summit</p>
          <h1 id="contact-title" className="mt-5 text-h1">
            Let&rsquo;s build your peak.
          </h1>
          <p className="mt-6 max-w-md text-lead text-ink-soft">
            Tell us what you&rsquo;re building. {contact.responsePromise} — from a real person, not
            a bot.
          </p>

          {/* The person who will reply (brief §8). */}
          <div className="mt-10 flex items-center gap-4">
            <span
              aria-hidden
              className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border border-node-stroke bg-node text-xs text-ink-soft"
            >
              {/* TODO: next/image of contact.replier.photo */}
              photo
            </span>
            <p className="text-sm">
              {contact.replier.name ?? <Todo>name of the person who replies</Todo>}
              <span className="mt-1 block text-ink-soft">
                {contact.replier.role ?? <Todo>role</Todo>}
              </span>
            </p>
          </div>

          <ul className="mt-10 space-y-3 text-[0.9375rem]">
            <li>
              <span className="label mr-3 inline-block w-20 text-ink-soft">Email</span>
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="underline underline-offset-4">
                  {contact.email}
                </a>
              ) : (
                <Todo>email</Todo>
              )}
            </li>
            <li>
              <span className="label mr-3 inline-block w-20 text-ink-soft">Phone</span>
              {contact.phone ? (
                <a href={`tel:${contact.phone}`} className="underline underline-offset-4">
                  {contact.phone}
                </a>
              ) : (
                <Todo>phone</Todo>
              )}
            </li>
            <li>
              <span className="label mr-3 inline-block w-20 text-ink-soft">Studio</span>
              {contact.address ?? <Todo>office address</Todo>}
            </li>
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/contact/book" variant="outline" size="sm" ctaLocation="contact">
              Book a 20-min call
            </Button>
            {wa ? (
              <Button
                href={wa}
                variant="outline"
                size="sm"
                target="_blank"
                ctaLocation="contact"
                aria-label="WhatsApp us (opens in a new tab)"
              >
                <WhatsAppIcon className="size-4" /> WhatsApp us
              </Button>
            ) : (
              <span className="self-center text-sm text-ink-soft">
                WhatsApp <Todo>number</Todo>
              </span>
            )}
          </div>

          <p className="mt-10 max-w-sm border-t border-line/40 pt-6 text-sm text-ink-soft">
            Need an NDA before you share details? Just say so in your brief — we&rsquo;re happy to
            sign one first.
          </p>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-md border border-line/40 bg-surface/60 p-6 sm:p-10">
            <BriefForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
