"use client";

import type { DotFlight } from "./handoff";
import {
  isBaseState,
  type Accessory,
  type BaseOptions,
  type BaseState,
  type DotActor,
  type DotSnapshot,
  type DotState,
  type Point,
  type Reaction,
} from "./types";

/**
 * The one global Dot controller (brief §10: "dot.goTo(node), dot.setState('excited')").
 *
 * Several Dot actors can exist (the guide in the page margin, the one in the
 * mobile menu, the curtain, the 404 page, the footer summit), but only one is
 * ever on screen: the highest-priority attached actor. Every command goes to it,
 * so the character behaves the same everywhere. When an actor detaches, control
 * hands back to the next one down. Between "moment" Dots (priority ≤ 40) the hand-off
 * is a hop through the air (handoff.ts), so the visitor sees one Dot travelling,
 * never one vanishing and another appearing. The menu, the 404, the lab and the
 * page curtain (priority ≥ 50) swap with a quick fade.
 *
 *   dot.setState("excited")            // any state from the character bible
 *   dot.setState("curious", { toward: el })
 *   dot.goTo(el | "anchor-name" | {x, y})
 *   dot.goHome()
 *   dot.celebrate()
 *   dot.setAccessory("sunglasses", true)
 */

type Entry = {
  id: number;
  actor: DotActor;
  priority: number;
  base: BaseState;
  baseOpts: BaseOptions;
  defaultOpts: BaseOptions;
  name: string | null;
  props: Accessory[];
  scrollReactions: boolean;
};

export type AttachOptions = {
  /** Higher wins. Guide 0 · footer summit 20 · home stages 30 · menu/404 50 · lab 60 · curtain 100. */
  priority?: number;
  base?: BaseState;
  baseOpts?: BaseOptions;
  /** Lets scene code check `dot.activeName === "climb"` before steering the Dot. */
  name?: string;
  /** Props only this moment carries (e.g. the summit flag), on top of global accessories. */
  props?: Accessory[];
  /** Set false for choreographed scenes so generic scroll hops don't interfere. Default true. */
  scrollReactions?: boolean;
};

type Target = Element | Point | string;

/** A higher-priority reaction may interrupt a lower one; never the reverse. */
const REACTION_PRIORITY: Record<Reaction, number> = {
  guide: 1,
  rollBack: 1,
  drop: 2,
  excited: 2,
  wave: 2,
  dizzy: 3,
  wake: 4,
  backflip: 5,
  celebrate: 6,
};

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

/** Hand-offs between Dots at or below this priority fly; above it they fade. */
const FLY_MAX_PRIORITY = 40;

export type DotCue = "land";

function centerOf(el: Element): Point {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function resolveTarget(target: Target): Point | null {
  if (typeof target === "string") {
    const el = document.querySelector(`[data-dot-anchor="${CSS.escape(target)}"]`);
    return el ? centerOf(el) : null;
  }
  if (target instanceof Element) return centerOf(target);
  return target;
}

class DotController {
  private entries: Entry[] = [];
  private nextId = 1;
  private reaction: Reaction | null = null;
  private token = 0;
  private accessories = new Set<Accessory>();
  private systemReduced = false;
  private reducedOverride: boolean | null = null;
  private auto = true;
  private pokes: number[] = [];
  private mediaBound = false;
  private listeners = new Set<() => void>();
  private cueListeners = new Set<(cue: DotCue) => void>();
  /** Loaded lazily after the first Dot attaches (keeps it out of the initial JS); until then hand-offs fade. */
  private flight: DotFlight | null = null;
  private flightRequested = false;
  private snapshot: DotSnapshot = this.makeSnapshot();

  /* ------------------------------------------------------------ actors */

  attach(actor: DotActor, opts: AttachOptions = {}): () => void {
    this.bindMedia();
    if (!this.flightRequested && typeof window !== "undefined") {
      this.flightRequested = true;
      void import("./handoff").then((m) => {
        this.flight = new m.DotFlight();
      });
    }
    const entry: Entry = {
      id: this.nextId++,
      actor,
      priority: opts.priority ?? 0,
      base: opts.base ?? "idle",
      baseOpts: opts.baseOpts ?? {},
      defaultOpts: opts.baseOpts ?? {},
      name: opts.name ?? null,
      props: opts.props ?? [],
      scrollReactions: opts.scrollReactions ?? true,
    };
    const prevTop = this.top;
    actor.setReducedMotion(this.reducedMotion);
    actor.setAccessories(this.accessoriesFor(entry));

    // Keep ascending priority; on a tie the newest actor goes on top.
    let i = this.entries.length;
    while (i > 0 && this.entries[i - 1]!.priority > entry.priority) i--;
    this.entries.splice(i, 0, entry);

    if (this.top === entry) {
      this.handOver(prevTop, entry);
    } else {
      actor.setBase(entry.base, entry.baseOpts);
      actor.setVisible(false);
    }
    this.emit();
    return () => this.detach(entry.id);
  }

  private detach(id: number) {
    const idx = this.entries.findIndex((e) => e.id === id);
    if (idx < 0) return;
    const wasTop = idx === this.entries.length - 1;
    const [entry] = this.entries.splice(idx, 1);
    if (!entry) return;
    if (wasTop && this.top) {
      this.handOver(entry, this.top);
    } else {
      entry.actor.setVisible(false);
      if (wasTop) this.flight?.cancel();
    }
    this.emit();
  }

  /** Pass the screen from `prev` to `next`: a hop through the air, or a quick fade. */
  private handOver(prev: Entry | undefined, next: Entry) {
    const flight = this.flight;
    const canFly =
      !!flight &&
      !this.reducedMotion &&
      next.priority <= FLY_MAX_PRIORITY &&
      (prev ? prev.priority <= FLY_MAX_PRIORITY : flight.active);
    if (canFly) {
      // fly() copies the old Dot before it is hidden, so the copy starts exactly there.
      const flying = flight.fly(prev?.actor ?? null, next.actor, () => {
        if (this.top !== next) return;
        next.actor.setVisible(true, true);
        next.actor.boop();
        this.cue("land");
      });
      if (flying) {
        prev?.actor.setVisible(false, true);
        this.activate(next, false);
        return;
      }
    }
    flight?.cancel();
    prev?.actor.setVisible(false);
    this.activate(next);
  }

  private activate(entry: Entry, show = true) {
    this.reaction = null;
    this.token++;
    entry.actor.setBase(entry.base, entry.baseOpts);
    if (show) entry.actor.setVisible(true);
  }

  private get top(): Entry | undefined {
    return this.entries[this.entries.length - 1];
  }

  /** The actor currently on screen (null if none, e.g. mobile with no slot open). */
  get activeActor(): DotActor | null {
    return this.top?.actor ?? null;
  }

  /** Name of the actor on screen, if it was attached with one. */
  get activeName(): string | null {
    return this.top?.name ?? null;
  }

  /** Whether generic scroll reactions (guide / roll back / dizzy) apply right now. */
  get scrollReactions(): boolean {
    return this.top?.scrollReactions ?? true;
  }

  private accessoriesFor(entry: Entry): Set<Accessory> {
    return new Set([...this.accessories, ...entry.props]);
  }

  /* ------------------------------------------------------------ state */

  get state(): DotState {
    return this.reaction ?? this.top?.base ?? "idle";
  }

  get base(): BaseState {
    return this.top?.base ?? "idle";
  }

  setState(state: DotState, opts: { toward?: Element | Point; at?: Point } = {}): Promise<void> {
    if (state === "look") {
      this.lookAt(opts.at ?? null);
      return Promise.resolve();
    }
    const top = this.top;
    if (!top) return Promise.resolve();

    if (isBaseState(state)) {
      top.base = state;
      top.baseOpts =
        state === "curious" && opts.toward
          ? { toward: opts.toward instanceof Element ? centerOf(opts.toward) : opts.toward }
          : state === "idle"
            ? top.defaultOpts
            : {};
      this.reaction = null;
      this.token++;
      top.actor.setBase(top.base, top.baseOpts);
      this.emit();
      return Promise.resolve();
    }
    return this.react(state);
  }

  private async react(reaction: Reaction) {
    const top = this.top;
    if (!top) return;
    // While the curtain rolls, only a celebration may interrupt.
    if (top.base === "loading" && reaction !== "celebrate") return;
    if (this.reaction && REACTION_PRIORITY[reaction] <= REACTION_PRIORITY[this.reaction]) return;

    if (reaction === "wake") {
      top.base = "idle";
      top.baseOpts = top.defaultOpts;
      top.actor.setBase("idle", top.baseOpts);
    }
    const token = ++this.token;
    this.reaction = reaction;
    this.emit();
    await top.actor.play(reaction);
    if (token === this.token) {
      this.reaction = null;
      this.emit();
    }
  }

  /** Hop to an element, a `data-dot-anchor` name, or a viewport point. */
  async goTo(target: Target) {
    const top = this.top;
    const point = resolveTarget(target);
    if (!top || !point) return;
    const token = ++this.token;
    this.reaction = "guide";
    this.emit();
    await top.actor.moveTo(point);
    if (token === this.token) {
      this.reaction = null;
      this.emit();
    }
  }

  async goHome() {
    const top = this.top;
    if (!top) return;
    const token = ++this.token;
    this.reaction = "guide";
    this.emit();
    await top.actor.moveTo(null);
    if (token === this.token) {
      this.reaction = null;
      this.emit();
    }
  }

  lookAt(point: Point | null) {
    this.top?.actor.lookAt(point);
  }

  celebrate() {
    return this.setState("celebrate");
  }

  /* ------------------------------------------------------------ accessories & easter eggs */

  setAccessory(accessory: Accessory, on: boolean) {
    if (on === this.accessories.has(accessory)) return;
    if (on) this.accessories.add(accessory);
    else this.accessories.delete(accessory);
    this.entries.forEach((e) => e.actor.setAccessories(this.accessoriesFor(e)));
    this.emit();
  }

  toggleAccessory(accessory: Accessory) {
    this.setAccessory(accessory, !this.accessories.has(accessory));
  }

  hasAccessory(accessory: Accessory) {
    return this.accessories.has(accessory);
  }

  /** Click on the Dot. Five clicks within 2.5s → backflip (brief §3 Easter eggs). */
  poke() {
    const now = performance.now();
    this.pokes = [...this.pokes.filter((t) => now - t < 2500), now];
    if (this.pokes.length >= 5) {
      this.pokes = [];
      void this.react("backflip");
    } else {
      this.top?.actor.boop();
    }
  }

  /* ------------------------------------------------------------ settings */

  get autoBehaviours() {
    return this.auto;
  }

  /** Turn automatic triggers (scroll, hover, sleep) on/off — used by the Dot Lab. */
  setAutoBehaviours(on: boolean) {
    this.auto = on;
    this.emit();
  }

  get reducedMotion() {
    return this.reducedOverride ?? this.systemReduced;
  }

  /** Preview reduced motion without changing the OS setting (Dot Lab). `null` = follow the system. */
  setReducedMotionOverride(value: boolean | null) {
    this.reducedOverride = value;
    this.applyReduced();
  }

  private bindMedia() {
    if (this.mediaBound || typeof window === "undefined") return;
    this.mediaBound = true;
    const mql = window.matchMedia(REDUCED_QUERY);
    this.systemReduced = mql.matches;
    mql.addEventListener("change", () => {
      this.systemReduced = mql.matches;
      this.applyReduced();
    });
  }

  private applyReduced() {
    this.entries.forEach((e) => e.actor.setReducedMotion(this.reducedMotion));
    this.emit();
  }

  /* ------------------------------------------------------------ subscriptions */

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  getSnapshot = () => this.snapshot;

  /** Whether a hand-off flight is in the air right now. */
  get flying() {
    return this.flight?.active ?? false;
  }

  /** Resolves once no hand-off flight is in the air (scene code waits before choreography). */
  whenLanded(): Promise<void> {
    if (!this.flying) return Promise.resolve();
    return new Promise((resolve) => {
      const check = () => (this.flying ? requestAnimationFrame(check) : resolve());
      requestAnimationFrame(check);
    });
  }

  /** One-off moments other systems can react to (sound plays a note when the Dot lands). */
  onCue = (fn: (cue: DotCue) => void) => {
    this.cueListeners.add(fn);
    return () => {
      this.cueListeners.delete(fn);
    };
  };

  private cue(c: DotCue) {
    this.cueListeners.forEach((fn) => fn(c));
  }

  private emit() {
    this.snapshot = this.makeSnapshot();
    this.listeners.forEach((fn) => fn());
  }

  private makeSnapshot(): DotSnapshot {
    return {
      state: this.state,
      base: this.base,
      reaction: this.reaction,
      accessories: [...this.accessories],
      reducedMotion: this.reducedMotion,
      reducedOverride: this.reducedOverride,
      autoBehaviours: this.auto,
      actors: this.entries.length,
    };
  }
}

export const dot = new DotController();

export const SERVER_SNAPSHOT: DotSnapshot = {
  state: "idle",
  base: "idle",
  reaction: null,
  accessories: [],
  reducedMotion: false,
  reducedOverride: null,
  autoBehaviours: true,
  actors: 0,
};
