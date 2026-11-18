import { Logo } from "@/components/brand/Logo";
import { TransitionLink } from "@/components/motion/PageTransition";
import { Container } from "@/components/ui/Container";
import { Todo } from "@/components/ui/Todo";
import { footerNav, legalNav, services, site, whatsappHref } from "@/lib/site";
import { NightSky } from "./NightSky";
import { Newsletter } from "./Newsletter";
import { SummitCta } from "./SummitCta";

/**
 * Footer — "Night sky at the summit" (brief §5 Footer, §4 Footer items).
 * On the home page the Summit stage fades from cream to night above it (Summit.tsx).
 */
export function Footer() {
  const year = new Date().getFullYear();
  const wa = whatsappHref();

  return (
    <footer className="theme-night relative overflow-hidden">
      <NightSky className="pointer-events-none absolute inset-x-0 top-0 h-[28rem]" />

      <Container className="relative">
        <SummitCta />

        <div className="grid gap-12 border-t border-line/50 py-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-3">
            <Logo className="w-44" />
            <p className="mt-6 max-w-xs text-sm text-ink-soft">{site.description}</p>
          </div>

          <nav aria-label="Services" className="lg:col-span-3">
            <h2 className="label font-sans text-ink-soft">Services</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {services.map((s) => (
                <li key={s.slug}>
                  <TransitionLink
                    href={`/services/${s.slug}`}
                    className="rounded-sm hover:underline"
                  >
                    {s.name}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>

          {footerNav.map((group) => (
            <nav key={group.heading} aria-label={group.heading} className="lg:col-span-2">
              <h2 className="label font-sans text-ink-soft">{group.heading}</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <TransitionLink href={item.href} className="rounded-sm hover:underline">
                      {item.label}
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="space-y-10 lg:col-span-4">
            <section aria-labelledby="footer-contact">
              <h2 id="footer-contact" className="label font-sans text-ink-soft">
                Contact
              </h2>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  {site.contact.email ? (
                    <a href={`mailto:${site.contact.email}`} className="hover:underline">
                      {site.contact.email}
                    </a>
                  ) : (
                    <Todo>email</Todo>
                  )}
                </li>
                <li>
                  {site.contact.phone ? (
                    <a href={`tel:${site.contact.phone}`} className="hover:underline">
                      {site.contact.phone}
                    </a>
                  ) : (
                    <Todo>phone</Todo>
                  )}
                </li>
                <li>
                  {wa ? (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cta="whatsapp"
                      data-cta-location="footer"
                      className="hover:underline"
                    >
                      WhatsApp us
                    </a>
                  ) : (
                    <Todo>WhatsApp number</Todo>
                  )}
                </li>
                <li>{site.contact.address ?? <Todo>office address</Todo>}</li>
                <li className="text-ink-soft">{site.contact.responsePromise}.</li>
              </ul>
            </section>

            <section aria-labelledby="footer-social">
              <h2 id="footer-social" className="label font-sans text-ink-soft">
                Follow the climb
              </h2>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                {site.socials.map((s) => (
                  <li key={s.label}>
                    {s.href ? (
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {s.label}
                      </a>
                    ) : (
                      <span className="text-ink-soft">
                        {s.label} <Todo>URL</Todo>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <Newsletter />
          </div>
        </div>

        <div className="flex flex-col gap-6 border-t border-line/50 py-8 text-xs text-ink-soft lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p>
              © {year} {site.legalName ?? <Todo>registered company name</Todo>}
            </p>
            <p>GST / Reg. no. {site.registrationNumber ?? <Todo>registration number</Todo>}</p>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legalNav.map((item) => (
              <li key={item.href}>
                <TransitionLink href={item.href} className="rounded-sm hover:underline">
                  {item.label}
                </TransitionLink>
              </li>
            ))}
            <li>
              {/* Reopens the cookie banner (components/extras/ConsentRoot). */}
              <button type="button" data-open-consent="" className="rounded-sm hover:underline">
                Cookie settings
              </button>
            </li>
          </ul>
          {/* Altitude easter egg line (brief §5). */}
          <p className="label">
            You reached {site.summitAltitude.toLocaleString("en-US")}m. Not many people scroll this
            far.
          </p>
        </div>
      </Container>
    </footer>
  );
}
