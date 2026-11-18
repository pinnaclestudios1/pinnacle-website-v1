import { DotActorView } from "@/components/dot/DotActorView";
import { TransitionLink } from "@/components/motion/PageTransition";
import { Container } from "@/components/ui/Container";
import { Todo } from "@/components/ui/Todo";
import { SceneMotion } from "./SceneMotion";

/**
 * Stage 5 — The Blueprint Room (brief §5): a pinned scene where a website builds
 * itself — sketch → wireframe → design → code → launch — while the Dot carries
 * blocks, paints colour in and types the code. Five captions explain each phase.
 *
 * Default (mobile, reduced motion, no JS): the finished window and all captions.
 * Desktop + motion: blueprint.ts pins the section and scrubs the build.
 */

// TODO: confirm caption copy; durations must be the studio's real typical timings.
const PHASES = [
  { name: "Sketch", line: "Rough ideas on paper: structure, story and what matters most." },
  { name: "Wireframe", line: "Every page laid out in grey boxes, so flow is right before style." },
  { name: "Design", line: "Colour, type and motion bring the brand to life, screen by screen." },
  { name: "Code", line: "Built in modern, fast, accessible code — and tested as we go." },
  { name: "Launch", line: "Go live, measure, and keep climbing together." },
];

/** Shared page geometry for the wireframe and design layers (% of the window body). */
const BLOCKS = [
  { x: 6, y: 6, w: 88, h: 7, kind: "nav" },
  { x: 6, y: 22, w: 50, h: 7, kind: "title" },
  { x: 6, y: 32, w: 38, h: 7, kind: "title" },
  { x: 6, y: 44, w: 44, h: 3, kind: "text" },
  { x: 6, y: 52, w: 16, h: 6, kind: "button" },
  { x: 60, y: 22, w: 34, h: 36, kind: "image" },
  { x: 6, y: 68, w: 27, h: 24, kind: "card" },
  { x: 37, y: 68, w: 27, h: 24, kind: "card" },
  { x: 68, y: 68, w: 26, h: 24, kind: "card" },
] as const;

const CODE = [
  "<Page>",
  "  <Nav />",
  '  <Hero title="Your peak" />',
  "  <Button>Start</Button>",
  "  <Cards items={work} />",
  "</Page>",
  "",
  "npm run build ✓",
];

const fillClass: Record<(typeof BLOCKS)[number]["kind"], string> = {
  nav: "bg-cream",
  title: "bg-charcoal",
  text: "bg-line/50",
  button: "bg-accent",
  image: "bg-cream",
  card: "bg-cream",
};

export function BlueprintRoom() {
  return (
    <section id="blueprint" data-scene="blueprint" data-stage="5" aria-labelledby="blueprint-title">
      <SceneMotion scene="blueprint" />
      <div
        data-bp-pin=""
        className="flex min-h-svh items-center py-[var(--pn-section)] lg:pt-[calc(var(--pn-header-h)+2rem)] lg:pb-8"
      >
        {/* Mobile order: heading → window → captions (the Dot stays in view while it works).
            Desktop: heading + captions on the left, the window spanning both rows on the right. */}
        <Container className="grid items-center gap-x-8 gap-y-12 lg:grid-cols-12 lg:grid-rows-[auto_auto] lg:gap-y-10">
          <div className="lg:col-span-4 lg:row-start-1 lg:self-end">
            <p className="label text-ink-soft">Stage 5 · The Blueprint Room</p>
            <h2 id="blueprint-title" className="mt-4 text-h2">
              Watch a website build itself.
            </h2>
          </div>

          <BlueprintWindow />

          <div className="lg:col-span-4 lg:row-start-2 lg:self-start">
            {/* Desktop while the room builds: a five-part progress bar, and one caption at
                a time (stacked) so the whole room fits on one screen. */}
            <div data-bp-steps="" aria-hidden className="mb-6 hidden gap-1.5">
              {PHASES.map((p) => (
                <span
                  key={p.name}
                  data-bp-step=""
                  className="h-0.5 flex-1 rounded-full bg-line/40 transition-colors duration-300 data-[on]:bg-ink motion-reduce:transition-none"
                />
              ))}
            </div>
            <ol data-bp-captions="" className="space-y-5 max-lg:pt-4">
              {PHASES.map((p, i) => (
                <li
                  key={p.name}
                  data-bp-caption=""
                  className="border-l border-ink/60 pl-5 transition-colors duration-300 data-[dim]:border-line/40 motion-reduce:transition-none data-[dim]:[&>p]:text-ink-soft"
                >
                  <p className="label text-ink-soft">
                    {String(i + 1).padStart(2, "0")} · {p.name}
                  </p>
                  <p className="mt-1.5 text-[0.9375rem]">{p.line}</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    Typical: <Todo>duration</Todo>
                  </p>
                </li>
              ))}
            </ol>
            <TransitionLink
              href="/process"
              className="mt-8 inline-block rounded-sm text-[0.9375rem] underline decoration-line underline-offset-[6px] hover:decoration-ink"
            >
              How we climb, in detail →
            </TransitionLink>
          </div>
        </Container>
      </div>
    </section>
  );
}

function BlueprintWindow() {
  return (
    // Mobile: sticky under the header, so the window keeps building (and the Dot keeps
    // working) while the captions scroll beneath it. Desktop: GSAP pins the whole room.
    // Desktop width is capped by the screen height, so the whole window (and the Dot
    // perched on it) always fits inside the pinned room — any screen, any zoom.
    <div className="sticky top-[calc(var(--pn-header-h)+0.75rem)] z-10 lg:relative lg:top-auto lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1 lg:w-full lg:max-w-[calc((100svh-var(--pn-header-h)-9rem)*1.6)] lg:justify-self-end">
      {/* Where the Dot starts: perched on the window's top edge. */}
      <div className="absolute -top-[calc(40px*1.125)] left-8 z-10">
        <DotActorView
          size="40px"
          name="blueprint"
          priority={30}
          attach="visible"
          attachWithin="[data-stage]"
          scrollReactions={false}
          interactive
        />
      </div>

      <div
        data-bp-window=""
        aria-hidden
        className="relative overflow-hidden rounded-md border border-line/60 bg-surface shadow-[0_24px_60px_-40px_rgb(30_30_30/0.45)]"
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 border-b border-line/40 px-4 py-3">
          {[0, 1, 2].map((d) => (
            <span key={d} className="size-2 rounded-full border border-line" />
          ))}
          <span className="ml-4 h-4 w-40 rounded-sm bg-cream" />
          <span
            data-bp-live=""
            className="ml-auto rounded-full bg-ink px-2.5 py-1 font-mono text-[10px] tracking-wider text-bg uppercase"
          >
            Live
          </span>
        </div>

        <div className="relative aspect-[16/10]">
          {/* Sketch: rough, hand-drawn strokes */}
          <svg
            data-bp-sketch=""
            viewBox="0 0 100 62.5"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full opacity-0"
          >
            {BLOCKS.map((b, i) => (
              <rect
                key={i}
                x={b.x + (i % 2 ? 0.6 : -0.4)}
                y={(b.y + (i % 3 ? 0.5 : -0.3)) * 0.625}
                width={b.w}
                height={b.h * 0.625}
                rx={0.8}
                fill="none"
                stroke="var(--pn-line)"
                strokeWidth={0.35}
                strokeDasharray="1.6 1.1"
                transform={`rotate(${i % 2 ? 0.6 : -0.5} ${b.x} ${b.y * 0.625})`}
              />
            ))}
          </svg>

          {/* Wireframe + design share geometry */}
          {BLOCKS.map((b, i) => (
            <div
              key={i}
              className="absolute"
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
            >
              <span
                data-bp-wire=""
                className="absolute inset-0 rounded-[3px] border border-line/80"
              />
              <span
                data-bp-fill=""
                className={`absolute inset-0 origin-left rounded-[3px] ${fillClass[b.kind]}`}
              />
            </div>
          ))}

          {/* Code panel */}
          <div
            data-bp-code=""
            className="absolute inset-y-0 right-0 w-[46%] bg-charcoal p-5 font-mono text-[11px] leading-relaxed text-cream-light lg:text-xs"
            // Off-canvas by default; GSAP owns `transform` here (no Tailwind translate-*).
            style={{ transform: "translateX(101%)" }}
          >
            {CODE.map((line, i) => (
              <p key={i} data-bp-line="" className="whitespace-pre opacity-0">
                {line || " "}
              </p>
            ))}
          </div>

          {/* Dot anchors for each phase */}
          {[
            [22, 30],
            [38, 80],
            [70, 40],
            [78, 60],
            [92, 8],
          ].map(([x, y], i) => (
            <span
              key={i}
              data-dot-anchor={`bp-${i}`}
              className="absolute size-0"
              style={{ left: `${x}%`, top: `${y}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
