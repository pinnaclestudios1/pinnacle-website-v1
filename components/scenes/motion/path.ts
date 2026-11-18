"use client";

import { gsap, loadScrollTrigger, refreshScrollTriggers } from "@/lib/motion/gsap";
import type { SceneInit } from "../SceneMotion";

/**
 * Stage 2: the trail draws itself as you scroll (linear, scrubbed — brief §9) and the
 * Dot rides its tip. The tip tracks the middle of the screen, so the Dot stays beside
 * whatever you're reading. Works on mobile too (no pinning involved).
 * Reduced motion: the trail is fully drawn and the Dot rests at its end.
 *
 * The "draw" is a transform-only reveal: the clip box slides up while the svg inside
 * slides down by the same amount, so exactly the part above the Dot shows. (Stroke
 * dashes with pathLength flicker in Chrome when vector-effect is non-scaling-stroke —
 * the dash turns into a 1px pattern — so they are not used.)
 */
export const init: SceneInit = (root, { reduced }) => {
  const lane = root.querySelector<HTMLElement>("[data-path-lane]");
  const clip = root.querySelector<HTMLElement>("[data-path-clip]");
  const svg = root.querySelector<SVGSVGElement>("[data-path-svg]");
  const measure = root.querySelector<SVGPathElement>("[data-path-measure]");
  const rider = root.querySelector<HTMLElement>("[data-path-dot]");
  if (!lane || !clip || !svg || !measure || !rider) return () => {};

  const length = measure.getTotalLength();

  /** Put the Dot on the trail at progress t (0 = top, 1 = bottom) and reveal the trail down to it. */
  const place = (t: number, reveal = true) => {
    const p = measure.getPointAtLength(length * Math.min(1, Math.max(0, t)));
    // Measure without the reveal transforms (they cancel out for the svg, but be exact).
    const box = clip.getBoundingClientRect();
    const base = lane.getBoundingClientRect();
    const shift = ((Number(gsap.getProperty(clip, "yPercent")) || 0) / 100) * clip.offsetHeight;
    const x = box.left - base.left + (p.x / 200) * box.width;
    const y = box.top - shift - base.top + (p.y / 1000) * box.height;
    gsap.set(rider, { x, y });
    if (reveal) {
      const hidden = (1 - p.y / 1000) * 100; // % of the trail below the Dot
      gsap.set(clip, { yPercent: -hidden });
      gsap.set(svg, { yPercent: hidden });
    }
  };

  if (reduced) {
    place(1, false);
    const onResize = () => place(1, false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }

  let cancelled = false;
  let tween: gsap.core.Tween | null = null;
  place(0);

  void loadScrollTrigger().then(() => {
    if (cancelled) return;
    // A proxy drives the progress; place() renders it.
    const progress = { t: 0 };
    tween = gsap.to(progress, {
      t: 1,
      ease: "none",
      onUpdate: () => place(progress.t),
      scrollTrigger: {
        trigger: lane,
        start: "top center",
        end: "bottom center",
        scrub: 0.3,
        invalidateOnRefresh: true,
        onRefresh: () => place(progress.t),
      },
    });
    refreshScrollTriggers();
  });

  return () => {
    cancelled = true;
    tween?.scrollTrigger?.kill();
    tween?.kill();
    gsap.set([clip, svg], { clearProps: "transform" });
    gsap.set(rider, { clearProps: "x,y" });
  };
};
