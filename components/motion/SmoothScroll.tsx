"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { getScrollTrigger, gsap } from "@/lib/motion/gsap";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { setLenis } from "@/lib/motion/scroll";

/**
 * Lenis smooth scroll driven by the GSAP ticker so ScrollTrigger scenes stay in sync.
 * - Off entirely under prefers-reduced-motion (native scrolling).
 * - Touch devices keep native scrolling (Lenis default), which is lighter on mobile.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
    setLenis(lenis);
    // Keep ScrollTrigger in sync once a scroll scene has lazy-loaded it.
    lenis.on("scroll", () => getScrollTrigger()?.update());

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, [reduced]);

  return null;
}
