import type { ReactNode } from "react";
import { PageIntro } from "@/components/layout/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { Trail } from "@/components/scenes/Trail";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DraftNotice } from "@/components/ui/DraftNotice";
import { Todo } from "@/components/ui/Todo";
import { collaborationTools, communicationPromise, processPhases } from "@/content/studio";
import { demo } from "@/lib/demo";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Process",
  description:
    "How we climb — Discover, Strategy, Design, Build, Test, Launch, Grow. What happens, what you get and how you’re involved.",
  path: "/process",
});

/** Process — How We Climb (brief §6): one phase per section, the Dot riding the trail. */
export default function ProcessPage() {
  return (
    <>
      <PageIntro
        eyebrow="Process — How We Climb"
        title="How we climb."
        intro="Seven stages from first conversation to steady growth. You always know where we are, what’s next and what we need from you."
      >
        <DraftNotice what="process copy and durations" />
      </PageIntro>

      <Container as="section" aria-label="The seven phases" className="pb-24">
        <Trail>
          <ol className="space-y-24 py-6 lg:space-y-32">
            {processPhases.map((p, i) => (
              <Reveal as="li" key={p.id} aria-labelledby={`phase-${p.id}`}>
                <p className="label text-ink-soft">
                  {String(i + 1).padStart(2, "0")} / {String(processPhases.length).padStart(2, "0")}
                </p>
                <h2 id={`phase-${p.id}`} className="mt-3 text-h2">
                  {p.name}
                </h2>
                <dl className="mt-8 grid gap-6 md:grid-cols-2">
                  <Item label="What happens">{p.what}</Item>
                  <Item label="What you get">{p.get}</Item>
                  <Item label="How long">
                    {demo?.processDurations[p.name] ?? <Todo>typical duration</Todo>}
                  </Item>
                  <Item label="How you’re involved">{p.you}</Item>
                </dl>
              </Reveal>
            ))}
          </ol>
        </Trail>
      </Container>

      <section aria-labelledby="promise" className="border-y border-line/40 bg-surface/60 py-20">
        <Container>
          <h2 id="promise" className="text-h2">
            Our communication promise
          </h2>
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {communicationPromise.map((c) => (
              <li key={c.title} className="rounded-md border border-line/40 bg-bg p-7">
                <h3 className="font-display text-h3">{c.title}</h3>
                <p className="mt-3 text-ink-soft">{c.text}</p>
              </li>
            ))}
          </ul>
          <h3 className="label mt-16 font-sans text-ink-soft">Tools we collaborate in</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {collaborationTools.map((t) => (
              <li key={t} className="rounded-md border border-line/60 bg-bg px-3 py-1.5 text-sm">
                {t}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Container as="section" aria-label="Start a project" className="py-24">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-xl font-display text-h2">Ready for base camp?</p>
          <div className="flex flex-wrap gap-3">
            <Button href="/contact" ctaLocation="process">
              Start a project
            </Button>
            <Button href="/contact/book" variant="outline" ctaLocation="process">
              Book a 20-min call
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-line/40 bg-surface p-5">
      <dt className="label text-ink-soft">{label}</dt>
      <dd className="mt-2">{children}</dd>
    </div>
  );
}
