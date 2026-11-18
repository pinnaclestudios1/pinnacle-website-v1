/**
 * Rive adapter — not built (see docs/DECISIONS.md #2).
 *
 * The brief recommends a Rive state machine for the Dot. We ship an SVG + GSAP
 * actor instead because Rive files must be authored in the Rive editor and the
 * runtime is heavy for the JS budget. If a motion designer delivers a `.riv`
 * later, swap renderers without touching any calling code:
 *
 *   1. `npm i @rive-app/canvas-lite`, lazy-imported inside the actor.
 *   2. Create `RiveDotActor implements DotActor` (see ./types.ts):
 *        setBase(state)      → set the state machine's "base" number input
 *        play(reaction)      → fire the matching trigger input; resolve on the
 *                              "reaction-done" Rive event
 *        lookAt(point)       → set "lookX" / "lookY" number inputs (-1..1)
 *        setAccessories(set) → boolean inputs "sunglasses", "nightcap", "flag", "map"
 *        setReducedMotion(r) → boolean input "reduced" (designer builds the still variants)
 *        moveTo(point)       → keep the GSAP hop on the wrapper element, as now
 *   3. In DotActorView, construct RiveDotActor instead of SvgDotActor.
 *
 * Suggested state machine inputs for the designer:
 *   number  base       0 idle · 1 curious · 2 sleepy · 3 lost · 4 loading
 *   trigger guide, rollBack, dizzy, excited, wake, celebrate, backflip, drop
 *   number  lookX, lookY
 *   boolean sunglasses, nightcap, flag, map, reduced
 */
export {};
