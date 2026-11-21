"use client";

import { dot } from "@/components/dot/controller";
import { gsap, loadScrollTrigger, refreshScrollTriggers } from "@/lib/motion/gsap";
import type { SceneInit } from "../SceneMotion";

/**
 * Stage 5 choreography. Scrubs a five-part build; at each phase the Dot moves to
 * where the work is happening:
 *   0 sketch  → the hero area        1 wireframe → carries blocks to the cards
 *   2 design  → paints the image     3 code      → types in the code panel
 *   4 launch  → hops onto the window corner, excited
 * Desktop: the room pins while it builds. Mobile (lighter, brief §9): no pin — the
 * build plays as the window scrolls through the screen. Reduced motion: finished state.
 */
export const init: SceneInit = (root, { reduced, desktop }) => {
  if (reduced) return () => {};
  const q = <T extends Element>(s: string) => root.querySelector<T>(s);
  const qa = <T extends Element>(s: string) => Array.from(root.querySelectorAll<T>(s));
  const pin = q<HTMLElement>("[data-bp-pin]");
  const win = q<HTMLElement>("[data-bp-window]");
  const sketch = q<SVGElement>("[data-bp-sketch]");
  const code = q<HTMLElement>("[data-bp-code]");
  const live = q<HTMLElement>("[data-bp-live]");
  const wires = qa<HTMLElement>("[data-bp-wire]");
  const fills = qa<HTMLElement>("[data-bp-fill]");
  const lines = qa<HTMLElement>("[data-bp-line]");
  const sketchRects = qa<SVGElement>("[data-bp-sketch] rect");
  const captions = qa<HTMLElement>("[data-bp-caption]");
  const steps = qa<HTMLElement>("[data-bp-step]");
  if (!pin || !win || !sketch || !code || !live) return () => {};

  let cancelled = false;
  let tl: gsap.core.Timeline | null = null;
  let phase = -1;

  const setPhase = (next: number) => {
    if (next === phase) return;
    phase = next;
    captions.forEach((c, i) => c.toggleAttribute("data-dim", i !== next));
    steps.forEach((st, i) => st.toggleAttribute("data-on", i <= next));
    if (dot.activeName !== "blueprint") return;
    void dot.goTo(`bp-${next}`).then(() => {
      if (phase === 4 && dot.activeName === "blueprint") void dot.setState("excited");
    });
  };

  // When the Blueprint Dot takes over mid-build (e.g. after a fast scroll), go straight
  // to where the work is instead of waiting for the next phase change.
  let wasActive = false;
  const unsubscribe = dot.subscribe(() => {
    const active = dot.activeName === "blueprint";
    const takeover = active && !wasActive;
    wasActive = active; // before goTo: it notifies subscribers synchronously
    if (takeover && phase >= 0) void dot.goTo(`bp-${phase}`);
  });

  void loadScrollTrigger().then(() => {
    if (cancelled) return;

    // Desktop: compact captions (one at a time) so the pinned room fits the screen.
    if (desktop) root.setAttribute("data-bp-scrub", "");

    // Start from an empty room.
    gsap.set(sketch, { opacity: 1 });
    gsap.set(sketchRects, { opacity: 0 });
    gsap.set(wires, { opacity: 0 });
    gsap.set(fills, { scaleX: 0 });
    gsap.set(live, { opacity: 0, scale: 0.6 });

    tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      // Follow what's on screen (the smoothed timeline), not the raw scroll position.
      onUpdate: () => setPhase(Math.min(4, Math.floor((tl?.progress() ?? 0) * 5))),
      // Mobile: the window is sticky; the build follows the captions scrolling beneath it.
      scrollTrigger: desktop
        ? { trigger: pin, start: "top top", end: "+=320%", pin: true, scrub: 0.6 }
        : {
            trigger: root.querySelector("[data-bp-captions]") ?? win,
            start: "top 75%",
            end: "bottom 55%",
            scrub: 0.6,
          },
    });

    // 3D (desktop): the window starts tilted back in perspective, like a plan on a desk,
    // and turns to face the visitor as the build reaches the design phase.
    if (desktop) {
      tl.fromTo(
        win,
        { rotationX: 14, rotationY: -10, transformPerspective: 1600, transformOrigin: "50% 60%" },
        { rotationX: 0, rotationY: 0, duration: 2.2, ease: "power2.inOut" },
        0,
      );
    }
    tl.to(sketchRects, { opacity: 1, duration: 0.7, stagger: 0.03 }, 0) // 0 sketch
      .to(wires, { opacity: 1, duration: 0.6, stagger: 0.04 }, 1) // 1 wireframe
      .to(sketch, { opacity: 0.15, duration: 0.5 }, 1.1)
      .to(fills, { scaleX: 1, duration: 0.6, stagger: 0.05, ease: "power3.inOut" }, 2) // 2 design
      .to(wires, { opacity: 0.25, duration: 0.4 }, 2.4)
      .to(sketch, { opacity: 0, duration: 0.3 }, 2.4)
      .to(code, { x: 0, duration: 0.4, ease: "power3.out" }, 3) // 3 code
      .to(lines, { opacity: 1, duration: 0.1, stagger: 0.07 }, 3.3)
      .to(code, { x: "101%", duration: 0.35, ease: "power3.in" }, 4) // 4 launch
      .to(live, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, 4.3)
      .to(win, { y: -10, duration: 0.5 }, 4.3)
      .to({}, { duration: 0.3 }, 4.7);

    setPhase(0);
    refreshScrollTriggers();
  });

  return () => {
    cancelled = true;
    unsubscribe();
    tl?.scrollTrigger?.kill();
    tl?.kill();
    gsap.set([sketch, ...sketchRects, ...wires, ...fills, ...lines, code, live, win], {
      clearProps: "all",
    });
    gsap.set(code, { x: "101%" });
    captions.forEach((c) => c.removeAttribute("data-dim"));
    steps.forEach((st) => st.removeAttribute("data-on"));
    root.removeAttribute("data-bp-scrub");
  };
};
