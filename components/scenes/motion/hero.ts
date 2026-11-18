"use client";

import { dot } from "@/components/dot/controller";
import { whenIntroDone } from "@/lib/motion/intro";
import type { SceneInit } from "../SceneMotion";

/**
 * Stage 1 — Base Camp (brief §5): after the preloader, the Dot hops off the logo,
 * waves, then lands beside "Let's climb ↓". Under reduced motion the same steps
 * become a smile and a cross-fade (handled by the actor).
 *
 * Robust start: the hello waits until the page is actually visible AND the hero
 * Dot has taken control, rather than checking once and giving up. (Pages opened
 * in a background tab, or in a preview pane that isn't painting, deliver
 * visibility events late.) It plays once per page view; re-initialising after a
 * resize just puts the Dot back on its landing spot.
 */
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const init: SceneInit = (root) => {
  let cancelled = false;
  const disposers: (() => void)[] = [];
  const isHero = () => !cancelled && dot.activeName === "hero";

  const whenVisible = () =>
    new Promise<void>((resolve) => {
      if (document.visibilityState === "visible") return resolve();
      const onChange = () => {
        if (document.visibilityState !== "visible") return;
        document.removeEventListener("visibilitychange", onChange);
        resolve();
      };
      document.addEventListener("visibilitychange", onChange);
      disposers.push(() => document.removeEventListener("visibilitychange", onChange));
    });

  const whenHeroActive = () =>
    new Promise<void>((resolve) => {
      if (isHero()) return resolve();
      const unsubscribe = dot.subscribe(() => {
        if (!isHero()) return;
        unsubscribe();
        resolve();
      });
      disposers.push(unsubscribe);
    });

  const played = () => root.hasAttribute("data-hello-played");
  /** On short/narrow screens the landing spot can sit below the fold: then the Dot
      stays on the logo's peak instead of hopping out of view. */
  const landingVisible = () => {
    const r = root.querySelector('[data-dot-anchor="hero-landing"]')?.getBoundingClientRect();
    return !!r && r.top > 0 && r.bottom < window.innerHeight - 24;
  };
  const land = () => (landingVisible() ? dot.goTo("hero-landing") : Promise.resolve());

  void (async () => {
    await whenIntroDone();
    await whenVisible();
    await whenHeroActive();
    await dot.whenLanded(); // the Dot may still be hopping in from the margin
    if (cancelled) return;

    if (played()) {
      // Already said hello this page view (e.g. re-init after a resize): just re-land.
      await land();
      return;
    }

    await wait(450);
    await whenHeroActive(); // the visitor may have scrolled away meanwhile
    if (cancelled) return;
    root.setAttribute("data-hello-played", "");
    await dot.setState("wave");
    await wait(150);
    if (!isHero()) return;
    await land();
  })();

  // Keep the Dot on its landing spot if the layout reflows.
  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (played() && isHero()) void land();
    }, 200);
  };
  window.addEventListener("resize", onResize);

  return () => {
    cancelled = true;
    disposers.forEach((d) => d());
    window.clearTimeout(resizeTimer);
    window.removeEventListener("resize", onResize);
  };
};
