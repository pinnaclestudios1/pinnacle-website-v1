import type { CSSProperties } from "react";
import { DotActorView } from "@/components/dot/DotActorView";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Todo } from "@/components/ui/Todo";
import { demo } from "@/lib/demo";
import { ridgePath, ridgeY, type RidgeOptions } from "@/lib/ridges";
import { ctaHref, site } from "@/lib/site";
import { CursorTrail } from "./CursorTrail";
import { SceneMotion } from "./SceneMotion";

/**
 * Stage 1 — Base Camp (brief §5): "Dawn".
 *
 * A centred, two-tone headline above layered ink-wash mountain ranges; the orange Dot
 * rises on the highest peak like a sun, with a soft peach glow (the only place peach
 * is used — behind the Dot).
 *
 * - The headline is plain server-rendered text and the LCP element: never hidden or
 *   animated in. Its last two words are set in Fraunces Light (the weight axis is
 *   already in the font file).
 * - Each range is its own layer: valleys fade into haze; on desktop the layers drift
 *   at different depths with the cursor (`data-tilt`, components/extras/tilt.ts); on
 *   every device they sink at different speeds as the hero scrolls away (CSS
 *   scroll-driven, compositor-only). The Dot lives inside the summit's layer, so it
 *   always stays on its peak.
 * - After the intro the ranges rise in one after another, like a sunrise (CSS).
 * Under reduced motion: no drift, no parallax, no entrance — the scene is simply there.
 */

const W = 1600;
const H = 600;
/** Demo-mode wordmarks (public/demo/logos, from `npm run demo:media`). */
const DEMO_LOGOS = [
  ["kestrel", "Kestrel"],
  ["saffron-salt", "Saffron & Salt"],
  ["tidewell", "Tidewell"],
  ["arcline", "Arcline"],
  ["folio", "Folio"],
  ["northbay", "Northbay"],
] as const;

const RANGES: (RidgeOptions & { tone: number; depth: number })[] = [
  {
    seed: 11,
    width: W,
    height: H,
    base: 0.6,
    peakX: 0.22,
    peakHeight: 0.2,
    spread: 0.17,
    tone: 0.05,
    depth: 0,
  },
  {
    seed: 23,
    width: W,
    height: H,
    base: 0.74,
    peakX: 0.5,
    peakHeight: 0.4,
    spread: 0.19,
    tone: 0.08,
    depth: 1,
  },
  {
    seed: 37,
    width: W,
    height: H,
    base: 0.8,
    peakX: 0.8,
    peakHeight: 0.26,
    spread: 0.2,
    tone: 0.115,
    depth: 2,
  },
  {
    seed: 41,
    width: W,
    height: H,
    base: 0.93,
    peakX: 0.1,
    peakHeight: 0.15,
    spread: 0.3,
    tone: 0.16,
    depth: 3,
  },
];
const SUMMIT_LAYER = 1;
const SUMMIT = RANGES[SUMMIT_LAYER]!;
/** The summit's top, as % of the art's height (the Dot sits exactly here). */
const SUMMIT_TOP = (ridgeY(SUMMIT, SUMMIT.peakX) / H) * 100;

/** Entrance order for the staggered arrival (CSS, after the intro). */
const inStep = (i: number) => ({ "data-hero-in": "", style: { "--i": i } as CSSProperties });

export function BaseCamp() {
  const words = site.headline.trim().split(/\s+/);
  const accent = words.slice(-2).join(" ");
  const lead = words.slice(0, -2).join(" ");

  return (
    <section
      id="base-camp"
      data-scene="hero"
      data-stage="1"
      data-tilt-area=""
      aria-labelledby="hero-title"
      className="relative overflow-hidden [--dawn-dot:2.75rem] lg:[--dawn-dot:clamp(3rem,3.6vw,4.25rem)]"
    >
      <CursorTrail />
      <SceneMotion scene="hero" />
      <div className="relative flex min-h-[calc(100svh-var(--pn-header-h))] flex-col">
        <Container className="relative z-10 flex flex-col items-center pt-12 pb-[calc(var(--dawn-dot)*1.9)] text-center lg:pt-[clamp(2.25rem,6vh,4.5rem)]">
          <p {...inStep(0)} className="label flex items-center gap-3 text-ink-soft">
            <span aria-hidden className="h-px w-8 bg-line" />
            Base Camp · 0m
            <span aria-hidden className="h-px w-8 bg-line" />
          </p>
          <h1 id="hero-title" className="mt-6 max-w-6xl text-display">
            {lead && <span className="block">{lead}</span>}{" "}
            <span className="block font-light">{accent}</span>
          </h1>
          <p {...inStep(1)} className="mt-6 max-w-lg text-lead text-ink-soft">
            {site.description}
          </p>
          <div {...inStep(2)} className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href={ctaHref} ctaLocation="hero">
              Start a project
            </Button>
            <Button href="/work" variant="outline" ctaLocation="hero">
              See our work
            </Button>
          </div>
          {/* Trust strip (brief §5): client logos or a countries line — TODO: real, permitted logos. */}
          {demo ? (
            <div {...inStep(3)} className="mt-7 flex flex-col items-center gap-3">
              <p className="label text-ink-soft">
                Trusted by teams in {demo.numbers["Countries served"]} countries
              </p>
              <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 opacity-70">
                {DEMO_LOGOS.map(([file, name]) => (
                  <li key={file}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVG wordmarks */}
                    <img
                      src={`/demo/logos/${file}.svg`}
                      alt={name}
                      height={20}
                      className="h-5 w-auto"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div {...inStep(3)} className="mt-6 text-sm text-ink-soft">
              <Todo>
                trust strip — client logos or &ldquo;Trusted by teams in N countries&rdquo;
              </Todo>
            </div>
          )}
        </Container>

        {/* The ranges fill whatever height is left, so the whole scene fits one screen. */}
        <div className="relative min-h-[14rem] w-full flex-1 lg:max-h-[52vh] lg:min-h-[16rem]">
          {/* The ranges. Three wrappers per layer, so the three motions never fight:
              arrival (CSS, once) → scroll parallax (CSS) → cursor drift (GSAP). */}
          <div aria-hidden className="absolute inset-0">
            {RANGES.map((r, i) => (
              <div
                key={r.seed}
                data-dawn-rise=""
                className="absolute inset-0"
                style={{ "--i": i } as CSSProperties}
              >
                <div data-dawn-depth={r.depth} className="absolute inset-0">
                  <div
                    data-tilt=""
                    data-tilt-max="0.4"
                    data-tilt-shift={String(4 + r.depth * 7)}
                    // A little wider than the screen, so drifting never shows an edge.
                    className="absolute inset-y-0 -right-[4%] -left-[4%]"
                  >
                    <svg
                      viewBox={`0 0 ${W} ${H}`}
                      preserveAspectRatio="none"
                      className="absolute inset-0 h-full w-full"
                    >
                      <defs>
                        {/* Valleys fade into haze: denser at the ridge, lighter below. */}
                        <linearGradient id={`dawn-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0.35" stopColor="#1e1e1e" stopOpacity={r.tone} />
                          <stop offset="1" stopColor="#1e1e1e" stopOpacity={r.tone * 0.55} />
                        </linearGradient>
                      </defs>
                      <path d={ridgePath(r, 72)} fill={`url(#dawn-${i})`} />
                    </svg>

                    {i === SUMMIT_LAYER && (
                      // The Dot on the summit, glowing like the sun coming up behind it.
                      <div
                        className="absolute -translate-x-1/2 -translate-y-full"
                        style={{ left: `${SUMMIT.peakX * 100}%`, top: `${SUMMIT_TOP}%` }}
                      >
                        <div className="pointer-events-none absolute top-1/2 left-1/2 size-[calc(var(--dawn-dot)*5.5)] -translate-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_217_198/0.85),rgb(255_217_198/0.25)_45%,transparent_68%)]" />
                        <div className="relative">
                          <DotActorView
                            size="var(--dawn-dot)"
                            name="hero"
                            priority={30}
                            attach="visible"
                            attachWithin="[data-stage]"
                            scrollReactions={false}
                            interactive
                          />
                          {/* Where the Dot rests (the hello re-lands here after a resize). */}
                          <span data-dot-anchor="hero-landing" className="absolute inset-0" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <a
            {...inStep(5)}
            href="#the-path"
            className="label absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 rounded-sm text-ink"
          >
            Let&rsquo;s climb
            <span aria-hidden className="scroll-cue" />
          </a>
        </div>
      </div>
    </section>
  );
}
