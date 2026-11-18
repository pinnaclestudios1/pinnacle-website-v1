import { MarkWithDot } from "@/components/brand/MarkWithDot";
import { Button } from "@/components/ui/Button";
import { Container, grid } from "@/components/ui/Container";
import { Todo } from "@/components/ui/Todo";
import { cn } from "@/lib/cn";
import { ctaHref, site } from "@/lib/site";
import { CursorTrail } from "./CursorTrail";
import { SceneMotion } from "./SceneMotion";

/**
 * Stage 1 — Base Camp (brief §5). The headline is plain server-rendered text and
 * the LCP element: it is never hidden or animated in.
 */
export function BaseCamp() {
  return (
    <section
      id="base-camp"
      data-scene="hero"
      data-stage="1"
      aria-labelledby="hero-title"
      className="relative [--hero-mark-w:13rem] lg:[--hero-mark-w:min(23rem,25vw)]"
    >
      <CursorTrail />
      <SceneMotion scene="hero" />
      <Container
        className={cn(
          grid,
          "relative min-h-[calc(100svh-var(--pn-header-h))] content-center gap-y-0 py-16",
        )}
      >
        <div className="col-span-full lg:col-span-8">
          <p className="label text-ink-soft">Base Camp · 0m</p>
          <h1 id="hero-title" className="mt-6 text-display">
            {site.headline}
          </h1>
          <p className="mt-8 max-w-xl text-lead text-ink-soft">{site.description}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href={ctaHref} ctaLocation="hero">
              Start a project
            </Button>
            <Button href="/work" variant="outline" ctaLocation="hero">
              See our work
            </Button>
          </div>
          {/* Trust strip (brief §5): client logos or a countries line — TODO: real, permitted logos. */}
          <p className="mt-14 text-sm text-ink-soft">
            <Todo>trust strip — client logos or &ldquo;Trusted by teams in N countries&rdquo;</Todo>
          </p>
        </div>

        <div className="col-span-full mt-16 flex flex-col items-center lg:col-span-4 lg:mt-0 lg:items-end">
          <MarkWithDot
            width="var(--hero-mark-w)"
            name="hero"
            priority={30}
            attach="visible"
            attachWithin="[data-stage]"
            keepApexEmpty
            scrollReactions={false}
            interactive
          />
          {/* Where the Dot lands after hopping off the logo. */}
          <div className="mt-14 flex items-center gap-8 self-center lg:self-end lg:pr-[4%]">
            <span
              data-dot-anchor="hero-landing"
              aria-hidden
              className="block shrink-0"
              style={{
                width: "calc(var(--hero-mark-w) * 0.1573)",
                height: "calc(var(--hero-mark-w) * 0.1573)",
              }}
            />
            <a href="#the-path" className="label rounded-sm text-ink-soft hover:text-ink">
              Let&rsquo;s climb ↓
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
