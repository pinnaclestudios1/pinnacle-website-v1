import { DotActorView } from "@/components/dot/DotActorView";
import { Reveal } from "@/components/motion/Reveal";
import { TransitionLink } from "@/components/motion/PageTransition";
import { Container } from "@/components/ui/Container";
import { ProjectCard } from "@/components/cms/ProjectCard";
import { getFeaturedProjects } from "@/lib/cms";
import { cn } from "@/lib/cn";
import { SceneMotion } from "./SceneMotion";

/**
 * Stage 4 — Peaks Conquered (brief §5): 3–5 flagship projects as large windows on
 * the mountainside. The Dot rides an elevator past them (desktop); hovering a window
 * makes it curious; clicking dives into the case study.
 *
 * Projects come from the CMS ("featured"); the seed holds marked placeholders.
 */
export async function PeaksConquered() {
  const projects = await getFeaturedProjects(5);
  return (
    <section
      id="peaks"
      data-scene="peaks"
      data-stage="4"
      aria-labelledby="peaks-title"
      className="py-[var(--pn-section)]"
    >
      <SceneMotion scene="peaks" />
      <Container>
        <p className="label text-ink-soft">Stage 4 · Peaks Conquered</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <h2 id="peaks-title" className="max-w-xl text-h2">
            Peaks we&rsquo;ve conquered.
          </h2>
          <TransitionLink href="/work" className="label rounded-sm text-ink-soft hover:text-ink">
            All work →
          </TransitionLink>
        </div>

        <div className="relative mt-16 lg:mt-24 lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Elevator shaft: the Dot's car is scrubbed down it by scroll.
              Mobile: a slim lane left of the windows. Desktop: its own grid column. */}
          <div
            data-peaks-shaft=""
            aria-hidden
            className="absolute inset-y-0 left-0 w-8 [--car-dot:24px] lg:relative lg:col-span-1 lg:w-auto lg:[--car-dot:36px]"
          >
            <span className="absolute inset-y-0 left-1/2 w-px bg-line/60" />
            {/* Reduced motion: no scrubbing — the car simply stays level with the reader (sticky). */}
            <div
              data-peaks-car=""
              className="absolute top-0 left-1/2 -translate-x-1/2 motion-reduce:sticky motion-reduce:top-[50svh]"
            >
              <DotActorView
                size="var(--car-dot)"
                name="peaks"
                priority={30}
                attach="visible"
                attachWithin="[data-stage]"
                scrollReactions={false}
                interactive
              />
              <span className="mx-auto mt-0.5 block h-px w-8 bg-ink lg:w-12" />
            </div>
          </div>

          <ul className="space-y-16 pl-12 lg:col-span-11 lg:space-y-28 lg:pl-0">
            {projects.map((p, i) => (
              <Reveal
                as="li"
                key={p.slug}
                className={cn("lg:w-[82%]", i % 2 === 1 && "lg:ml-auto")}
              >
                <ProjectCard project={p} index={i} />
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
