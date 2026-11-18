"use client";

import { gsap, loadScrollTrigger, refreshScrollTriggers } from "@/lib/motion/gsap";
import type { SceneInit } from "../SceneMotion";

/**
 * Stage 4: the Dot's elevator car is scrubbed down the shaft as the windows pass,
 * staying level with the reader (desktop and mobile — no pinning involved).
 * Reduced motion: the car stays at the top. Hover/curious and the click "dive"
 * are handled globally.
 */
export const init: SceneInit = (root, { reduced }) => {
  const shaft = root.querySelector<HTMLElement>("[data-peaks-shaft]");
  const car = root.querySelector<HTMLElement>("[data-peaks-car]");
  if (!shaft || !car || reduced) return () => {};
  let cancelled = false;
  let tween: gsap.core.Tween | null = null;

  void loadScrollTrigger().then(() => {
    if (cancelled) return;
    tween = gsap.to(car, {
      y: () => shaft.clientHeight - car.offsetHeight,
      ease: "none",
      scrollTrigger: {
        trigger: shaft,
        start: "top 55%",
        end: "bottom 55%",
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
    refreshScrollTriggers();
  });

  return () => {
    cancelled = true;
    tween?.scrollTrigger?.kill();
    tween?.kill();
    gsap.set(car, { clearProps: "y" });
  };
};
