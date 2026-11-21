import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { DotIllustration } from "@/components/dot/DotIllustration";
import { PageIntro } from "@/components/layout/PageIntro";
import { TransitionLink } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { DraftNotice } from "@/components/ui/DraftNotice";
import { Todo } from "@/components/ui/Todo";
import { careers } from "@/content/studio";
import { getJobs } from "@/lib/cms";
import { demo } from "@/lib/demo";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Careers",
  description: "Climb with us — open roles and life at Pinnacle Studios.",
  path: "/careers",
});

/** Careers (brief §6): why work here, benefits, hiring process, open roles, general application. */
export default async function CareersPage() {
  const openRoles = (await getJobs()).filter((j) => j.open);

  return (
    <>
      <PageIntro
        eyebrow="Careers"
        title="Climb with us."
        intro="We’re a small, design-led team building work people remember. If you care about craft, you’ll fit right in."
      >
        <DraftNotice what="careers copy" />
      </PageIntro>

      <Container as="section" aria-labelledby="why" className="pb-20">
        <h2 id="why" className="sr-only">
          Why work here
        </h2>
        <ul className="grid gap-6 md:grid-cols-3">
          {careers.why.map((w, i) => (
            <Reveal
              as="li"
              key={w.title}
              delay={i * 70}
              className="rounded-md border border-line/40 bg-surface p-7"
            >
              <h3 className="font-display text-h3">{w.title}</h3>
              <p className="mt-3 text-ink-soft">
                {w.text.includes("TODO:") ? (
                  <>
                    {w.text.split("TODO:")[0]}
                    <Todo>{w.text.split("TODO:")[1]!.trim()}</Todo>
                  </>
                ) : (
                  w.text
                )}
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>

      <Container as="section" aria-labelledby="roles" className="py-16">
        <h2 id="roles" className="text-h2">
          Open roles
        </h2>
        {openRoles.length ? (
          <ul className="mt-10 divide-y divide-line/40 border-y border-line/40">
            {openRoles.map((j) => (
              <li key={j.slug}>
                <TransitionLink
                  href={`/careers/${j.slug}`}
                  className="group flex flex-col gap-1 py-6 sm:flex-row sm:items-baseline sm:justify-between"
                  data-dot-curious=""
                >
                  <span className="font-display text-h3">
                    {j.placeholder ? <Todo>{j.title.replace(/^TODO:\s*/, "")}</Todo> : j.title}
                  </span>
                  <span className="text-ink-soft">
                    {[j.type, j.location].filter(Boolean).join(" · ") || (
                      <Todo>type · location</Todo>
                    )}{" "}
                    <span
                      aria-hidden
                      className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </TransitionLink>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 flex items-center gap-6 rounded-md border border-dashed border-line p-8">
            <DotIllustration pose="idle" id="no-roles" size="40px" />
            <p className="text-ink-soft">
              No open roles right now — but we always want to meet great people. Send a general
              application below.
            </p>
          </div>
        )}
      </Container>

      <Container className="grid gap-16 py-16 lg:grid-cols-2 lg:gap-8">
        <section aria-labelledby="benefits">
          <h2 id="benefits" className="font-display text-h3">
            Benefits
          </h2>
          <ul className="mt-6 space-y-3">
            {(demo?.benefits ?? careers.benefits).map((b, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-ink" />
                {b.startsWith("TODO:") ? <Todo>{b.slice(5).trim()}</Todo> : b}
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="hiring">
          <h2 id="hiring" className="font-display text-h3">
            How we hire
          </h2>
          <ol className="mt-6 space-y-5">
            {careers.hiring.map((h, i) => (
              <li key={h.title} className="flex gap-4">
                <span className="label mt-1 text-ink-soft">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="font-medium">{h.title}</span>
                  <span className="block text-sm text-ink-soft">{h.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </Container>

      <Container as="section" aria-labelledby="apply" className="pt-8 pb-28">
        <h2 id="apply" className="text-h2">
          General application
        </h2>
        <p className="mt-4 mb-10 max-w-xl text-ink-soft">
          Don’t see your role? Tell us what you’d bring to the climb.
        </p>
        <ApplicationForm />
      </Container>
    </>
  );
}
