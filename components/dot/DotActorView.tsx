"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type RefObject } from "react";
import { cn } from "@/lib/cn";
import { dot } from "./controller";
import { DotFigure } from "./DotFigure";
import { SvgDotActor } from "./svg-actor";
import type { Accessory, BaseState, DotActor, Point, Reaction } from "./types";

/**
 * One Dot build per idle slot: several builds landing in the same idle period would
 * merge into one long task (bad for INP / TBT on mobile).
 */
const idleQueue: (() => void)[] = [];
let idleScheduled = false;

function pumpIdle() {
  if (idleScheduled || !idleQueue.length) return;
  idleScheduled = true;
  const run = () => {
    idleScheduled = false;
    idleQueue.shift()?.();
    pumpIdle();
  };
  if (typeof window.requestIdleCallback === "function")
    window.requestIdleCallback(run, { timeout: 3000 });
  else window.setTimeout(run, 250); // Safari
}

function whenIdle(fn: () => void, first = false) {
  if (first) idleQueue.unshift(fn);
  else idleQueue.push(fn);
  pumpIdle();
  return () => {
    const i = idleQueue.indexOf(fn);
    if (i >= 0) idleQueue.splice(i, 1);
  };
}

export type DotActorViewProps = {
  /** Body diameter as a CSS length (the element is 1.25× this to fit glow). Brief: 24–48px guiding, up to 200px in hero/summit moments. */
  size: string;
  /** See AttachOptions in controller.ts. */
  priority?: number;
  base?: BaseState;
  /** Resting gaze offset, e.g. {x: 2, y: -4} to look up at the sky. */
  gaze?: Point;
  /**
   * When this actor takes control: on mount (true), while its spot is on screen
   * ("visible", narrowed by `attachMargin`), or never (false — attach it via `actorRef`).
   */
  attach?: boolean | "visible";
  /** IntersectionObserver rootMargin for attach="visible", e.g. "-35% 0px -35% 0px" = middle band. */
  attachMargin?: string;
  /**
   * Observe the closest ancestor matching this selector instead of the Dot's own spot.
   * With the default margin for this mode, the Dot takes over while that section
   * crosses the middle of the screen — so consecutive home stages hand over with no gaps.
   */
  attachWithin?: string;
  /** Name for `dot.activeName` checks in scene code. */
  name?: string;
  /** Props only this Dot carries (e.g. ["flag"] at the summit). */
  props?: Accessory[];
  /** False for choreographed scenes: generic scroll hops are switched off while this one is active. */
  scrollReactions?: boolean;
  /** Reaction to play right after taking control (e.g. "drop"). */
  enter?: Reaction;
  /** Clicking the Dot pokes it (5 pokes → backflip). */
  interactive?: boolean;
  actorRef?: RefObject<DotActor | null>;
  /** Fires when this actor becomes / stops being the one on screen. */
  onActiveChange?: (active: boolean) => void;
  className?: string;
  style?: CSSProperties;
};

/**
 * Mounts one Dot in the page and hands it to the global controller.
 * The outer element is the Dot's fixed "spot" (used for visibility); the inner
 * element is what moves when the Dot hops elsewhere.
 * Decorative for screen readers (brief §11): aria-hidden, never focusable.
 */
export function DotActorView({
  size,
  priority = 0,
  base = "idle",
  gaze,
  attach = true,
  attachMargin,
  attachWithin,
  name,
  props,
  scrollReactions = true,
  enter,
  interactive = false,
  actorRef,
  onActiveChange,
  className,
  style,
}: DotActorViewProps) {
  const spotRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const actor = useRef<SvgDotActor | null>(null);
  const uid = `dot${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [inView, setInView] = useState(false);
  // Renderers are created on demand: a page can hold a dozen Dots (the home page does),
  // and building each one's animation rig costs main-thread time on mobile.
  // - attach="visible": the first time its spot is on screen (it is needed right now).
  // - Everything else (the guide, the curtain, the closed menu): in idle time after load,
  //   one per idle slot, so no single task gets long. A Dot switched on before that
  //   (e.g. the menu opened very early) is built straight away.
  const [needed, setNeeded] = useState(false);
  const [initialAttach] = useState(attach);
  if (!needed && ((attach === "visible" && inView) || (attach === true && initialAttach !== true)))
    setNeeded(true);
  useEffect(() => {
    if (needed || attach === "visible") return;
    // The guide (always attached) goes to the front of the queue.
    return whenIdle(() => setNeeded(true), attach === true);
  }, [needed, attach]);

  // Create the renderer once the SVG is in the DOM (and this Dot is needed).
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !needed) return;
    const a = new SvgDotActor(el);
    actor.current = a;
    if (actorRef) actorRef.current = a;
    return () => {
      a.destroy();
      actor.current = null;
      if (actorRef) actorRef.current = null;
    };
  }, [actorRef, needed]);

  // attach="visible": take control only while the Dot's spot is actually rendered on screen.
  useEffect(() => {
    if (attach !== "visible") return;
    const spot = spotRef.current;
    const body = rootRef.current;
    if (!spot || !body) return;
    const target = attachWithin ? spot.closest(attachWithin) : spot;
    if (!target) return;
    const margin = attachMargin ?? (attachWithin ? "-50% 0px -50% 0px" : "0px");

    // attachWithin: the section must cross the middle of the screen AND this Dot
    // (wherever it has moved to) must actually be on screen — otherwise the guide
    // Dot covers the gap, so the visitor never loses the Dot.
    let sectionOk = false;
    let bodyOk = !attachWithin;
    const update = () => {
      const rendered = spot.offsetWidth > 0 && spot.offsetHeight > 0;
      setInView(sectionOk && bodyOk && rendered);
    };
    const sectionIo = new IntersectionObserver(
      ([entry]) => {
        sectionOk = !!entry?.isIntersecting;
        update();
      },
      { rootMargin: margin },
    );
    sectionIo.observe(target);
    const bodyIo = attachWithin
      ? new IntersectionObserver(([entry]) => {
          bodyOk = !!entry?.isIntersecting;
          update();
        })
      : null;
    bodyIo?.observe(body);
    return () => {
      sectionIo.disconnect();
      bodyIo?.disconnect();
    };
  }, [attach, attachMargin, attachWithin]);

  const shouldAttach = attach === "visible" ? inView : attach;
  const gazeX = gaze?.x;
  const gazeY = gaze?.y;
  const propsKey = props?.join(",") ?? "";

  useEffect(() => {
    const a = actor.current;
    if (!a || !shouldAttach || !needed) return;
    const baseOpts =
      gazeX !== undefined && gazeY !== undefined ? { gaze: { x: gazeX, y: gazeY } } : undefined;
    const detach = dot.attach(a, {
      priority,
      base,
      baseOpts,
      name,
      props: propsKey ? (propsKey.split(",") as Accessory[]) : [],
      scrollReactions,
    });
    if (enter) void dot.setState(enter);
    return detach;
  }, [shouldAttach, needed, priority, base, gazeX, gazeY, enter, name, propsKey, scrollReactions]);

  useEffect(() => {
    if (!onActiveChange) return;
    const check = () => onActiveChange(actor.current !== null && dot.activeActor === actor.current);
    check();
    return dot.subscribe(check);
  }, [onActiveChange]);

  return (
    <div
      ref={spotRef}
      aria-hidden
      className={cn("pointer-events-none select-none", className)}
      style={{ width: `calc(${size} * 1.25)`, height: `calc(${size} * 1.25)`, ...style }}
    >
      <div
        ref={rootRef}
        data-dot-actor=""
        onClick={interactive ? () => dot.poke() : undefined}
        className="h-full w-full"
        style={{ visibility: "hidden" }}
      >
        <DotFigure uid={uid} interactive={interactive} />
      </div>
    </div>
  );
}
