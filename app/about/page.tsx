import { TeamGrid } from "@/components/about/TeamGrid";
import { MediaFrame } from "@/components/cms/MediaFrame";
import { DotIllustration, type DotPose } from "@/components/dot/DotIllustration";
import { PageIntro } from "@/components/layout/PageIntro";
import { Reveal } from "@/components/motion/Reveal";
import { Trail } from "@/components/scenes/Trail";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DraftNotice } from "@/components/ui/DraftNotice";
import { Todo } from "@/components/ui/Todo";
import { values } from "@/content/studio";
import { getTeam } from "@/lib/cms";
import { demo } from "@/lib/demo";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description: "The Guides — the story, values and people behind Pinnacle Studios.",
  path: "/about",
});

/** About — The Guides (brief §6). Real story, people and numbers are TODO (never invented). */
export default async function AboutPage() {
  const team = await getTeam();

  return (
    <>
      <PageIntro
        eyebrow="About — The Guides"
        title="The guides."
        intro={demo?.story ?? <Todo>origin story — why Pinnacle exists (2–3 sentences)</Todo>}
      />

      <Container
        as="section"
        aria-labelledby="mission"
        className="grid gap-12 pb-20 lg:grid-cols-2"
      >
        <div>
          <h2 id="mission" className="label font-sans text-ink-soft">
            Mission
          </h2>
          <p className="mt-4 font-display text-h3">
            {demo?.mission ?? <Todo>mission statement</Todo>}
          </p>
        </div>
        <div>
          <h2 className="label font-sans text-ink-soft">Vision</h2>
          <p className="mt-4 font-display text-h3">
            {demo?.vision ?? <Todo>vision statement</Todo>}
          </p>
        </div>
      </Container>

      <section aria-labelledby="values" className="border-y border-line/40 bg-surface/60 py-20">
        <Container>
          <h2 id="values" className="text-h2">
            What we believe
          </h2>
          <DraftNotice what="values" />
          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal
                as="li"
                key={v.title}
                delay={i * 70}
                className="rounded-md border border-line/40 bg-bg p-7"
              >
                <DotIllustration pose={v.pose as DotPose} id={`value-${i}`} size="44px" />
                <h3 className="mt-6 font-display text-h3">{v.title}</h3>
                <p className="mt-3 text-sm text-ink-soft">{v.text}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <Container as="section" aria-labelledby="team" className="py-24">
        <h2 id="team" className="text-h2">
          The team
        </h2>
        <p className="mt-4 max-w-xl text-ink-soft">
          Hover or tap a node to meet the person behind it.
        </p>
        <div className="mt-14">
          <TeamGrid team={team} />
        </div>
      </Container>

      <Container as="section" aria-labelledby="life" className="pb-24">
        <h2 id="life" className="text-h2">
          Studio life
        </h2>
        <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              {demo ? (
                <MediaFrame
                  media={demo.studioPhotos[i]!}
                  ratio="4 / 3"
                  sizes={
                    i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"
                  }
                  className="h-full"
                />
              ) : (
                <div className="grid h-full min-h-40 place-items-center rounded-md border border-dashed border-line bg-surface p-6 text-center">
                  <Todo>studio photo</Todo>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Container>

      <Container as="section" aria-labelledby="milestones" className="pb-24">
        <h2 id="milestones" className="text-h2">
          Milestones
        </h2>
        <div className="mt-12 max-w-3xl">
          <Trail>
            <ol className="space-y-16 py-4">
              {[0, 1, 2].map((i) => (
                <li key={i}>
                  <p className="label text-ink-soft">
                    {demo?.milestones[i]?.year ?? <Todo>year</Todo>}
                  </p>
                  <p className="mt-2 font-display text-h3">
                    {demo?.milestones[i]?.text ?? <Todo>milestone (real numbers only)</Todo>}
                  </p>
                </li>
              ))}
            </ol>
          </Trail>
        </div>
      </Container>

      <Container as="section" aria-labelledby="recognition" className="pb-24">
        <h2 id="recognition" className="text-h2">
          Awards, press &amp; partners
        </h2>
        <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {["Award", "Press", "Partner badge", "Certification"].map((k) => (
            <li
              key={k}
              className="grid min-h-28 place-items-center rounded-md border border-dashed border-line p-4 text-center"
            >
              <Todo>{k.toLowerCase()}</Todo>
            </li>
          ))}
        </ul>
      </Container>

      <Container as="section" aria-label="Join or hire us" className="pb-28">
        <div className="flex flex-col items-start gap-6 border-t border-line/40 pt-14 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-xl font-display text-h2">Climb with us — as a client or a guide.</p>
          <div className="flex flex-wrap gap-3">
            <Button href="/contact" ctaLocation="about">
              Start a project
            </Button>
            <Button href="/careers" variant="outline" ctaLocation="about">
              See careers
            </Button>
          </div>
        </div>
      </Container>
    </>
  );
}
