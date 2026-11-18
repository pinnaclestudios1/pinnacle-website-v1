"use client";

import gsap from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

/**
 * Register plugins exactly once, client-side only. Import gsap from here, not from "gsap".
 *
 * ScrollTrigger (~17KB gzip) is NOT in the initial bundle: scroll scenes call
 * `await loadScrollTrigger()` so only pages that need it pay for it (brief §11 JS budget).
 */
if (typeof window !== "undefined") {
  gsap.defaults({ ease: "expo.out", duration: 0.75 });
}

let scrollTrigger: typeof ScrollTriggerType | null = null;
let loading: Promise<typeof ScrollTriggerType> | null = null;

export function loadScrollTrigger(): Promise<typeof ScrollTriggerType> {
  if (scrollTrigger) return Promise.resolve(scrollTrigger);
  loading ??= import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
    gsap.registerPlugin(ScrollTrigger);
    scrollTrigger = ScrollTrigger;
    // Web fonts swapping in (and late page load) change section heights: re-measure then.
    void document.fonts?.ready.then(refreshScrollTriggers);
    if (document.readyState !== "complete") {
      window.addEventListener("load", refreshScrollTriggers, { once: true });
    }
    return ScrollTrigger;
  });
  return loading;
}

/**
 * Scenes initialise lazily and in any order, and pinned scenes add page height.
 * Each scene calls this after creating its triggers so every trigger's start/end
 * is re-measured in document order (debounced).
 */
let refreshTimer = 0;
export function refreshScrollTriggers() {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    if (!scrollTrigger) return;
    scrollTrigger.sort();
    scrollTrigger.refresh();
  }, 120);
}

/** The ScrollTrigger instance if a scene has already loaded it, else null. */
export function getScrollTrigger() {
  return scrollTrigger;
}

export { gsap };
