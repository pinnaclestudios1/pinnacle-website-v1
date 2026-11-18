/**
 * Motion tokens (brief §9). Mirrors the CSS variables in styles/tokens.css.
 * Durations are in seconds for GSAP.
 */
export const duration = {
  micro: 0.2, // hover, press: 150–250ms
  ui: 0.4, // menus, accordions, cards: 300–500ms
  reveal: 0.75, // section reveals: 600–900ms
  scene: 1.0, // page-to-page: 800–1200ms
  preloaderMax: 2.5, // hard cap, skippable
} as const;

export const ease = {
  /** Default for things arriving. */
  out: "expo.out",
  inOut: "expo.inOut",
  /** The Dot: springy with overshoot. */
  dot: "back.out(2.2)",
  /** Line-work is scrubbed to scroll, so it is linear. */
  line: "none",
} as const;

/** Mobile gets shorter durations (brief §9 Rules). */
export function motionScale(): number {
  if (typeof window === "undefined") return 1;
  return window.matchMedia("(max-width: 767px)").matches ? 0.8 : 1;
}
