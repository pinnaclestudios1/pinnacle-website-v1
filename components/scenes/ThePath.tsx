import { DotActorView } from "@/components/dot/DotActorView";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { Todo } from "@/components/ui/Todo";
import { cn } from "@/lib/cn";
import { demo } from "@/lib/demo";
import { SceneMotion } from "./SceneMotion";

/**
 * Stage 2 — The Path (brief §5): a trail draws itself as you scroll, the Dot
 * climbing along its tip; three short statements sit along it, then the key numbers.
 * Without JS (or with reduced motion) the trail is simply drawn and the Dot rests at its end.
 */

// TODO: confirm — statement copy drafted from the brief's three prompts.
const STATEMENTS = [
  {
    kicker: "What we do",
    text: "We design and build websites, web apps and mobile products — strategy to launch, under one roof.",
  },
  {
    kicker: "Who we do it for",
    text: "Founders and teams who want a product people remember, not another template.",
  },
  {
    kicker: "Why we’re different",
    text: "Design-led and engineered with care: every detail is crafted, every page is fast.",
  },
];

/** A winding mountain trail, top → bottom (viewBox 200 × 1000). */
const TRAIL =
  "M100 0 C170 150, 170 250, 100 360 C30 470, 30 580, 100 690 C170 800, 30 900, 100 1000";

// Brief §5: projects shipped, years, client rating, countries served — real numbers only.
const NUMBERS = ["Projects shipped", "Years climbing", "Client rating", "Countries served"];

export function ThePath() {
  return (
    <section
      id="the-path"
      data-scene="path"
      data-stage="2"
      aria-labelledby="path-title"
      className="relative overflow-hidden py-[var(--pn-section)]"
    >
      <SceneMotion scene="path" />

      <Container className="relative">
        <p className="label text-ink-soft">Stage 2 · The Path</p>
        <h2 id="path-title" className="mt-4 max-w-xl text-h2">
          Every peak starts with a path.
        </h2>

        {/* The trail runs only alongside the statements and draws itself as you scroll,
            with the Dot climbing along its tip — so the Dot stays with the reader.
            Small screens: a narrow lane left of the text (curve stays inside the 4rem indent).
            Desktop: the gap between the alternating statements. */}
        <div data-path-lane="" className="relative mt-20 lg:mt-28">
          {/* Clip box for the transform-only reveal (path.ts); the svg sits inside it. */}
          <div
            aria-hidden
            data-path-clip=""
            className={
              "pointer-events-none absolute inset-y-0 left-0 h-full w-10 overflow-hidden lg:left-1/2 lg:w-40 lg:-translate-x-1/2"
            }
          >
            <svg
              aria-hidden
              data-path-svg=""
              className="block h-full w-full"
              viewBox="0 0 200 1000"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                data-path-trail=""
                d={TRAIL}
                stroke="var(--pn-line)"
                strokeWidth={1.25}
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
              />
              {/* Same geometry, used only to measure the tip position. */}
              <path data-path-measure="" d={TRAIL} visibility="hidden" />
            </svg>
          </div>

          {/* The Dot riding the trail. path.ts moves this wrapper to the trail's tip. */}
          <div
            data-path-dot=""
            className="pointer-events-none absolute top-0 left-0 z-10 [--path-dot:24px] lg:[--path-dot:36px]"
            style={{ translate: "-50% -50%" }}
          >
            <DotActorView
              size="var(--path-dot)"
              name="path"
              priority={30}
              attach="visible"
              attachWithin="[data-stage]"
              scrollReactions={false}
              interactive
            />
          </div>

          <ol className="space-y-24 pl-16 lg:space-y-40 lg:pl-0">
            {STATEMENTS.map((s, i) => (
              <Reveal
                as="li"
                key={s.kicker}
                className={cn("max-w-md lg:w-[38%] lg:max-w-none", i % 2 === 1 && "lg:ml-auto")}
              >
                <p className="label text-ink-soft">
                  {String(i + 1).padStart(2, "0")} · {s.kicker}
                </p>
                <p className="mt-4 font-display text-h3">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal
          as="dl"
          className="mt-28 grid grid-cols-2 gap-x-6 gap-y-12 border-t border-line/40 pt-12 lg:mt-40 lg:grid-cols-4"
        >
          {NUMBERS.map((label) => (
            <div key={label}>
              <dt className="label text-ink-soft">{label}</dt>
              <dd className="mt-3 font-display text-h2">
                {demo?.numbers[label] ?? (
                  <span className="align-middle text-base">
                    <Todo>number</Todo>
                  </span>
                )}
              </dd>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
