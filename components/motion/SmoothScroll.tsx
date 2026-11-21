"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { getScrollTrigger, gsap } from "@/lib/motion/gsap";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { emitScroll, runFrame, setLenis } from "@/lib/motion/scroll";

/**
 * Lenis smooth scroll driven by the GSAP ticker so ScrollTrigger scenes stay in sync.
 * - Off entirely under prefers-reduced-motion (native scrolling).
 * - Touch devices keep native scrolling (Lenis default), which is lighter on mobile.
 *
 * Frame order matters for smoothness. Lenis is a *priority* ticker listener, so each
 * frame runs: Lenis sets the scroll position → ScrollTrigger and the scroll signal read
 * it → GSAP renders every tween → the browser styles and paints once. Registered
 * normally, Lenis ran after GSAP's writes and forced a full style recalculation on
 * every frame.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ autoRaf: false, lerp: 0.09, wheelMultiplier: 0.95 });
    setLenis(lenis);
    lenis.on("scroll", () => {
      // ScrollTrigger only exists once a scroll scene has lazy-loaded it.
      getScrollTrigger()?.update();
      emitScroll(lenis.scroll);
    });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
      runFrame();
    };
    gsap.ticker.add(tick, false, true);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return null;
}
