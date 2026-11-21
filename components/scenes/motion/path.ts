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
  const trailPath = root.querySelector<SVGPathElement>("[data-path-measure]");
  const rider = root.querySelector<HTMLElement>("[data-path-dot]");
  if (!lane || !clip || !svg || !trailPath || !rider) return () => {};

  const length = trailPath.getTotalLength();

  // Where the clip box sits inside the lane — measured once per refresh (resize, pins,
  // fonts), so placing the Dot on every scroll frame reads no layout at all.
  let box = { left: 0, top: 0, width: 1, height: 1 };
  const measureBox = () => {
    const c = clip.getBoundingClientRect();
    const base = lane.getBoundingClientRect();
    // Undo the reveal's own shift so the box is where the trail really is.
    const shift = ((Number(gsap.getProperty(clip, "yPercent")) || 0) / 100) * clip.offsetHeight;
    box = {
      left: c.left - base.left,
      top: c.top - shift - base.top,
      width: c.width,
      height: c.height,
    };
  };

  /** Put the Dot on the trail at progress t (0 = top, 1 = bottom) and reveal the trail down to it. */
  const place = (t: number, reveal = true) => {
    const p = trailPath.getPointAtLength(length * Math.min(1, Math.max(0, t)));
    gsap.set(rider, {
      x: box.left + (p.x / 200) * box.width,
      y: box.top + (p.y / 1000) * box.height,
    });
    if (reveal) {
      const hidden = (1 - p.y / 1000) * 100; // % of the trail below the Dot
      gsap.set(clip, { yPercent: -hidden });
      gsap.set(svg, { yPercent: hidden });
    }
  };

  if (reduced) {
    const settle = () => {
      measureBox();
      place(1, false);
    };
    settle();
    window.addEventListener("resize", settle);
    return () => window.removeEventListener("resize", settle);
  }

  let cancelled = false;
  let tween: gsap.core.Tween | null = null;
  measureBox();
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
        scrub: 0.4,
        invalidateOnRefresh: true,
        onRefresh: () => {
          measureBox();
          place(progress.t);
        },
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
