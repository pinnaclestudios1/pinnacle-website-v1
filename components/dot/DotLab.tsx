"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "@/lib/motion/gsap";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";
import { dot } from "./controller";
import { DotActorView } from "./DotActorView";
import { useDotSnapshot } from "./use-dot";
import { ACCESSORIES, type Accessory, type DotState } from "./types";

/**
 * Dot Lab — trigger every state from the character bible (brief §3) by hand,
 * and check the automatic triggers and easter eggs.
 */

const STATES: { state: DotState; trigger: string; behaviour: string }[] = [
  { state: "idle", trigger: "Default", behaviour: "Gentle breathing bounce, blinks every 3–6s" },
  { state: "look", trigger: "Cursor moves", behaviour: "Eyes follow the cursor" },
  { state: "guide", trigger: "Scrolling down", behaviour: "Hops ahead to the next node" },
  { state: "rollBack", trigger: "Scrolling up", behaviour: "Rolls backwards, slightly flustered" },
  { state: "dizzy", trigger: "Very fast scroll", behaviour: "Spiral eyes for 1s" },
  { state: "curious", trigger: "Hover on project", behaviour: "Leans toward it, eyes widen" },
  {
    state: "excited",
    trigger: "Hover on any CTA",
    behaviour: "Quick double bounce, glow brightens",
  },
  { state: "sleepy", trigger: "10s with no input", behaviour: "Yawns, eyes close, tiny “z”" },
  { state: "wake", trigger: "Any input after sleep", behaviour: "Startled hop, then smile" },
  {
    state: "celebrate",
    trigger: "Form submitted",
    behaviour: "Big jump, confetti in orange and cream",
  },
  { state: "lost", trigger: "404 page", behaviour: "Holds a tiny map, looks around" },
  {
    state: "loading",
    trigger: "Page transitions",
    behaviour: "Rolls along a line across the screen",
  },
];

const EXTRAS: { state: DotState; label: string; note: string }[] = [
  { state: "backflip", label: "Backflip", note: "Easter egg: click the Dot 5 times" },
  { state: "drop", label: "Drop in", note: "Entrance used by the mobile menu" },
];

const ACCESSORY_NOTES: Record<Accessory, string> = {
  sunglasses: "Type “pinnacle” anywhere",
  nightcap: "Automatic after 10pm local time",
  flag: "Summit moments (phase 3)",
  map: "Shown automatically when lost",
};

const LABELS: Record<string, string> = { rollBack: "Roll back" };
const label = (s: string) => LABELS[s] ?? s.charAt(0).toUpperCase() + s.slice(1);

export function DotLab() {
  const snap = useDotSnapshot();
  const [size, setSize] = useState(160);
  const [speed, setSpeed] = useState(1);
  const curiousRef = useRef<HTMLDivElement>(null);

  // Console access for reviewing motion: `pinnacleDot.setState("celebrate")`.
  useEffect(() => {
    const w = window as unknown as { pinnacleDot?: typeof dot };
    w.pinnacleDot = dot;
    return () => {
      delete w.pinnacleDot;
      gsap.globalTimeline.timeScale(1);
    };
  }, []);

  const changeSpeed = (value: number) => {
    setSpeed(value);
    gsap.globalTimeline.timeScale(value);
  };

  const trigger = (state: DotState) => {
    if (state === "curious")
      void dot.setState("curious", { toward: curiousRef.current ?? undefined });
    else if (state === "look") void dot.setState("idle");
    else void dot.setState(state);
  };

  return (
    <>
      <Container as="section" className="pt-16 pb-10 lg:pt-24">
        <p className="label text-ink-soft">Dot Lab · Phase 2 · internal (noindex)</p>
        <h1 className="mt-5 text-h1">Meet the Dot.</h1>
        <p className="mt-6 max-w-2xl text-lead text-ink-soft">
          Every state from the character bible, driven by the same global controller the site uses:{" "}
          <code className="font-mono text-[0.85em]">dot.setState()</code>,{" "}
          <code className="font-mono text-[0.85em]">dot.goTo()</code>. Name on hold — working name
          “the Dot”.
        </p>
      </Container>

      <Container as="section" aria-label="Dot playground" className="pb-24">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Stage */}
          <div className="lg:col-span-7">
            <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-md border border-line/40 bg-surface">
              {/* Nodes for dot.goTo() */}
              {(["a", "b", "c"] as const).map((n, i) => (
                <span
                  key={n}
                  data-dot-anchor={`lab-${n}`}
                  aria-hidden
                  className="absolute size-4 rounded-full border border-node-stroke bg-node"
                  style={{ left: ["14%", "50%", "84%"][i], top: ["26%", "16%", "30%"][i] }}
                />
              ))}
              <span aria-hidden className="absolute inset-x-[10%] bottom-[22%] h-px bg-line/50" />
              <DotActorView size={`${size}px`} priority={60} interactive />
              <p
                role="status"
                aria-live="polite"
                className="label absolute bottom-4 left-4 text-ink-soft"
              >
                State: <span className="text-ink">{label(snap.state)}</span>
                {snap.reaction && <> · base {label(snap.base)}</>}
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Panel title="Move — dot.goTo()">
                <div className="flex flex-wrap gap-2">
                  {(["a", "b", "c"] as const).map((n) => (
                    <LabButton key={n} onClick={() => void dot.goTo(`lab-${n}`)}>
                      Node {n.toUpperCase()}
                    </LabButton>
                  ))}
                  <LabButton onClick={() => void dot.goHome()}>Home</LabButton>
                </div>
              </Panel>
              <Panel title={`Size — ${size}px`}>
                <input
                  type="range"
                  min={24}
                  max={200}
                  step={4}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  aria-label="Dot size in pixels"
                  className="w-full accent-[var(--pn-ink)]"
                />
                <p className="mt-2 text-xs text-ink-soft">
                  Guide 24–48px · hero and summit up to 200px
                </p>
              </Panel>
              <Panel title="Playback speed (all site motion)">
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      [1, "1×"],
                      [0.5, "½×"],
                      [0.25, "¼×"],
                      [0, "Pause"],
                    ] as const
                  ).map(([value, text]) => (
                    <LabButton
                      key={text}
                      active={speed === value}
                      onClick={() => changeSpeed(value)}
                    >
                      {text}
                    </LabButton>
                  ))}
                </div>
              </Panel>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6 lg:col-span-5">
            <Panel title="States">
              <ul className="divide-y divide-line/30">
                {STATES.map((s) => (
                  <li key={s.state} className="flex items-center gap-4 py-2.5">
                    <LabButton
                      onClick={() => trigger(s.state)}
                      active={snap.state === s.state}
                      className="w-28 shrink-0"
                    >
                      {label(s.state)}
                    </LabButton>
                    <span className="text-sm leading-snug">
                      {s.behaviour}
                      <span className="block text-xs text-ink-soft">Trigger: {s.trigger}</span>
                    </span>
                  </li>
                ))}
                {EXTRAS.map((s) => (
                  <li key={s.state} className="flex items-center gap-4 py-2.5">
                    <LabButton
                      onClick={() => trigger(s.state)}
                      active={snap.state === s.state}
                      className="w-28 shrink-0"
                    >
                      {s.label}
                    </LabButton>
                    <span className="text-sm text-ink-soft">{s.note}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Accessories">
              <ul className="space-y-2">
                {ACCESSORIES.map((a) => (
                  <li key={a}>
                    <label className="flex items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={snap.accessories.includes(a)}
                        onChange={(e) => dot.setAccessory(a, e.target.checked)}
                        className="size-4 accent-[var(--pn-ink)]"
                      />
                      <span className="w-24">{label(a)}</span>
                      <span className="text-xs text-ink-soft">{ACCESSORY_NOTES[a]}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Settings">
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={snap.autoBehaviours}
                  onChange={(e) => dot.setAutoBehaviours(e.target.checked)}
                  className="mt-0.5 size-4 accent-[var(--pn-ink)]"
                />
                <span>
                  Automatic triggers
                  <span className="block text-xs text-ink-soft">
                    Turn off to hold a state (otherwise moving the mouse wakes it from sleep).
                  </span>
                </span>
              </label>
              <fieldset className="mt-5">
                <legend className="text-sm">Reduced motion</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      [null, "Follow system"],
                      [true, "Preview on"],
                      [false, "Preview off"],
                    ] as const
                  ).map(([value, text]) => (
                    <LabButton
                      key={text}
                      active={snap.reducedOverride === value}
                      onClick={() => dot.setReducedMotionOverride(value)}
                    >
                      {text}
                    </LabButton>
                  ))}
                </div>
                <p className="mt-2 text-xs text-ink-soft">
                  Now:{" "}
                  {snap.reducedMotion
                    ? "reduced — the Dot stays still and only blinks"
                    : "full motion"}
                </p>
              </fieldset>
            </Panel>
          </div>
        </div>
      </Container>

      <Container as="section" aria-labelledby="try-title" className="pb-32">
        <h2 id="try-title" className="text-h2">
          Try the automatic triggers
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <TryCard title="Excited">
            Hover or tab to a primary CTA.
            <div className="mt-4">
              <Button href="/contact" ctaLocation="dot-lab">
                Start a project
              </Button>
            </div>
          </TryCard>
          <TryCard title="Curious">
            Hover the card below — it stands in for a project.
            <div
              ref={curiousRef}
              data-dot-curious=""
              className="mt-4 rounded-md border border-dashed border-line p-6 text-sm text-ink-soft"
            >
              A project window
            </div>
          </TryCard>
          <TryCard title="Guide · Roll back · Dizzy">
            Scroll down (hop), scroll up (roll back), or fling the page hard (spiral eyes).
          </TryCard>
          <TryCard title="Sleepy · Wake">
            Keep automatic triggers on and don&rsquo;t touch anything for 10 seconds. Then move.
          </TryCard>
          <TryCard title="Backflip">Click the Dot five times quickly.</TryCard>
          <TryCard title="Sunglasses">
            Type <kbd className="font-mono">pinnacle</kbd> anywhere outside a form field. Type it
            again to take them off.
          </TryCard>
        </div>
        <p className="mt-10 max-w-2xl text-sm text-ink-soft">
          Elsewhere on the site: the Dot rolls across page transitions, drops into the mobile menu,
          gets lost on the 404 page, and sits on the summit in the footer looking at the sky. On
          desktop a small guide Dot lives in the left margin so it never covers content.
        </p>
      </Container>
    </>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-md border border-line/40 bg-surface p-5">
      <h2 className="label font-sans text-ink-soft">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TryCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-line/40 p-6">
      <h3 className="font-display text-h3">{title}</h3>
      <div className="mt-3 text-sm text-ink-soft">{children}</div>
    </div>
  );
}

function LabButton({
  children,
  onClick,
  active,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-9 rounded-md border px-3 text-sm transition-transform duration-150 active:scale-[0.97]",
        active ? "border-ink bg-ink text-bg" : "border-line/60 bg-bg text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}
