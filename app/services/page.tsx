import { DeckRequest } from "@/components/forms/DeckRequest";
import { PageIntro } from "@/components/layout/PageIntro";
import { TransitionLink } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { ServiceIcon } from "@/components/scenes/ServiceIcon";
import { Trail } from "@/components/scenes/Trail";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DraftNotice } from "@/components/ui/DraftNotice";
import { Todo } from "@/components/ui/Todo";
import { engagementModels, industries } from "@/content/studio";
import { getServices } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "The Climb — web design and development, web apps, mobile apps, product design, e-commerce, branding and care plans.",
  path: "/services",
});

/** Services — The Climb (brief §6): every service as a node on one mountain path. */
export default async function ServicesPage() {
  const services = await getServices();
  const draft = services.some((s) => s.draft);

  return (
    <>
      <PageIntro
        eyebrow="Services — The Climb"
        title="Every route to the top."
        intro="Design and engineering under one roof — pick a route, or tell us where you want to go and we’ll plan the climb."
      >
        {draft && <DraftNotice what="service copy" />}
      </PageIntro>

      <Container as="section" aria-label="All services" className="pb-24">
        <Trail>
          <ol className="space-y-20 py-6 lg:space-y-28">
            {services.map((s, i) => (
              <Reveal as="li" key={s.slug} className="grid gap-6 lg:grid-cols-12 lg:items-start">
                <div className="flex items-center gap-5 lg:col-span-5">
                  <span className="grid size-16 shrink-0 place-items-center rounded-full border border-node-stroke bg-node">
                    <ServiceIcon slug={s.slug} />
                  </span>
                  <div>
                    <p className="label text-ink-soft">{String(i + 1).padStart(2, "0")}</p>
                    <h2 className="mt-1 font-display text-h3">{s.name}</h2>
                  </div>
                </div>
                <div className="lg:col-span-7">
                  <p className="text-lead text-ink-soft">{s.summary}</p>
                  <p className="mt-3 text-ink-soft">{s.whoFor}</p>
                  <TransitionLink
                    href={`/services/${s.slug}`}
                    className="mt-5 inline-block rounded-sm underline decoration-line underline-offset-[6px] hover:decoration-ink"
                  >
                    Explore <span className="sr-only">{s.name}</span> →
                  </TransitionLink>
                </div>
              </Reveal>
            ))}
          </ol>
        </Trail>
      </Container>

      <section aria-labelledby="engage" className="border-y border-line/40 bg-surface/60 py-20">
        <Container>
          <h2 id="engage" className="text-h2">
            How we work together
          </h2>
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {engagementModels.map((m) => (
              <li key={m.title} className="rounded-md border border-line/40 bg-bg p-7">
                <h3 className="font-display text-h3">{m.title}</h3>
                <p className="mt-3 text-ink-soft">{m.text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-ink-soft">
            Projects from <Todo>“from ₹X / $X” — pricing decision</Todo>
          </p>
        </Container>
      </section>

      <Container as="section" aria-labelledby="industries" className="py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 id="industries" className="text-h2">
              Industries we climb with
            </h2>
            {industries.length ? (
              <ul className="mt-8 flex flex-wrap gap-2">
                {industries.map((i) => (
                  <li key={i} className="rounded-md border border-line/60 px-3 py-1.5 text-sm">
                    {i}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-8">
                <Todo>industries served</Todo>
              </p>
            )}
          </div>
          <div id="capabilities-deck" className="scroll-mt-28 lg:col-span-6">
            <h2 className="text-h2">Capabilities deck</h2>
            <p className="mt-4 mb-6 max-w-md text-ink-soft">
              Who we are, what we build and how we work — in one PDF for your team.
            </p>
            <DeckRequest />
          </div>
        </div>
      </Container>

      <Container as="section" aria-label="Start a project" className="pb-28">
        <div className="flex flex-col items-start gap-6 border-t border-line/40 pt-14 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-xl font-display text-h2">
            Not sure which route fits? Tell us the summit.
          </p>
          <Button href="/contact" ctaLocation="services">
            Start a project
          </Button>
        </div>
      </Container>
    </>
  );
}
