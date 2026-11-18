import { DotActorView } from "@/components/dot/DotActorView";
import { TransitionLink } from "@/components/motion/PageTransition";
import { Container } from "@/components/ui/Container";
import { services } from "@/lib/site";
import { SceneMotion } from "./SceneMotion";
import { ServiceIcon } from "./ServiceIcon";

/**
 * Stage 3 — The Climb (brief §5): services sit on cream nodes along the trail and
 * bloom open when the Dot lands on them. Pinned horizontal scroll on desktop,
 * vertical stack on mobile / reduced motion (layout switch lives in globals.css).
 */
export function TheClimb() {
  return (
    <section id="the-climb" data-scene="climb" data-stage="3" aria-labelledby="climb-title">
      <SceneMotion scene="climb" />
      <div data-climb-pin="" className="relative py-[var(--pn-section)] lg:py-0">
        <Container>
          <p className="label text-ink-soft">Stage 3 · The Climb</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <h2 id="climb-title" className="max-w-xl text-h2">
              Every route to the top.
            </h2>
            <TransitionLink
              href="/services"
              className="label rounded-sm text-ink-soft hover:text-ink"
            >
              All services →
            </TransitionLink>
          </div>
        </Container>

        <div className="relative mt-16 lg:mt-20">
          {/* The Dot. Desktop: fixed above the trail while nodes slide beneath it (CSS).
              Mobile / reduced motion: climb.ts hops it onto the node at the middle of the screen. */}
          <div
            data-climb-dot=""
            className="pointer-events-none absolute top-0 left-0 z-10 hidden [--climb-dot-size:30px] lg:[--climb-dot-size:40px]"
          >
            <DotActorView
              size="var(--climb-dot-size)"
              name="climb"
              priority={30}
              attach="visible"
              attachWithin="[data-stage]"
              scrollReactions={false}
              interactive
            />
          </div>

          <div className="overflow-hidden lg:overflow-visible">
            <ol
              data-climb-track=""
              className="relative grid gap-12 px-[var(--pn-gutter)] sm:grid-cols-2 lg:mx-auto lg:max-w-[calc(var(--pn-max)+2*var(--pn-gutter))] lg:grid-cols-3"
            >
              {/* Dashed trail through the node centres (horizontal mode only). */}
              <span
                data-climb-trail=""
                aria-hidden
                className="pointer-events-none absolute top-8 right-0 left-0 hidden border-t border-dashed border-line/70"
              />
              {services.map((s, i) => (
                <li key={s.slug} data-node="" className="relative">
                  <div
                    data-node-circle=""
                    className="relative grid size-16 place-items-center rounded-full border border-node-stroke bg-node text-ink transition-transform duration-500 ease-dot motion-reduce:transition-none"
                  >
                    <ServiceIcon slug={s.slug} />
                  </div>
                  <div
                    data-node-body=""
                    className="mt-6 transition-transform duration-500 ease-out-expo motion-reduce:transition-none"
                  >
                    <p className="label text-ink-soft">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="mt-2 font-display text-h3 transition-colors duration-500">
                      {s.name}
                    </h3>
                    {/* Inactive nodes show number + name; the active one adds the detail. */}
                    <div
                      data-node-more=""
                      className="transition-opacity duration-500 motion-reduce:transition-none"
                    >
                      <p className="mt-3 text-ink-soft">{s.summary}</p>
                      <TransitionLink
                        href={`/services/${s.slug}`}
                        className="mt-5 inline-block rounded-sm text-[0.9375rem] underline decoration-line underline-offset-[6px] hover:decoration-ink"
                      >
                        Explore <span className="sr-only">{s.name}</span> →
                      </TransitionLink>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
