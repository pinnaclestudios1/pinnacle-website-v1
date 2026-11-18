/**
 * The Dot — types shared by the controller and any renderer (brief §3).
 *
 * States from the character bible, split by how they behave:
 * - Base states persist until changed: idle, curious, sleepy, lost, loading.
 * - Reactions play once, then return to the base state:
 *   guide, rollBack, dizzy, excited, wake, celebrate
 *   (+ backflip easter egg, drop entrance, wave for the hero hello).
 * - "look" isn't exclusive: the eyes follow the cursor on top of idle.
 */

export const BASE_STATES = ["idle", "curious", "sleepy", "lost", "loading"] as const;
export type BaseState = (typeof BASE_STATES)[number];

export const REACTIONS = [
  "guide",
  "rollBack",
  "dizzy",
  "excited",
  "wake",
  "celebrate",
  "backflip",
  "drop",
  "wave",
] as const;
export type Reaction = (typeof REACTIONS)[number];

export type DotState = BaseState | Reaction | "look";

export const ACCESSORIES = ["sunglasses", "nightcap", "flag", "map"] as const;
export type Accessory = (typeof ACCESSORIES)[number];

export type Point = { x: number; y: number };

export type BaseOptions = {
  /** Curious: the viewport point the Dot leans toward. */
  toward?: Point;
  /** Resting gaze offset in face units (e.g. {x: 2, y: -4} = looking up at the sky). */
  gaze?: Point;
};

export function isBaseState(s: DotState): s is BaseState {
  return (BASE_STATES as readonly string[]).includes(s);
}

/**
 * A renderer for one on-screen Dot. The SVG + GSAP actor implements this today;
 * a Rive actor can implement the same interface later (see rive-adapter.ts).
 */
export interface DotActor {
  setBase(state: BaseState, opts?: BaseOptions): void;
  /** Plays a one-shot reaction. Resolves when it finishes or is interrupted. */
  play(reaction: Reaction): Promise<void>;
  /** Hops to a viewport point; `null` returns home. */
  moveTo(target: Point | null): Promise<void>;
  lookAt(point: Point | null): void;
  setAccessories(accessories: ReadonlySet<Accessory>): void;
  setReducedMotion(reduced: boolean): void;
  /** `instant` skips the fade (used when a flying hand-off lands exactly on this Dot). */
  setVisible(visible: boolean, instant?: boolean): void;
  /** On-screen box of the Dot (null when it isn't rendered). Used for hand-off flights. */
  getBounds(): DOMRect | null;
  /** A visual copy of the Dot as it looks right now, for the hand-off flight. */
  cloneFigure(): HTMLElement | null;
  /** Tiny squash when clicked. */
  boop(): void;
  destroy(): void;
}

export type DotSnapshot = {
  state: DotState;
  base: BaseState;
  reaction: Reaction | null;
  accessories: Accessory[];
  reducedMotion: boolean;
  reducedOverride: boolean | null;
  autoBehaviours: boolean;
  actors: number;
};
