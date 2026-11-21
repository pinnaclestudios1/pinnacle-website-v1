"use client";

import { dot } from "@/components/dot/controller";
import { gsap, loadScrollTrigger, refreshScrollTriggers } from "@/lib/motion/gsap";
import { getLenis } from "@/lib/motion/scroll";
import type { SceneInit } from "../SceneMotion";

/**
 * Stage 3 — The Climb. The Dot bounces from node to node (brief §5).
 *
 * Desktop + motion (horizontal mode, set by CSS): the section pins and the trail
 * scrolls sideways under the Dot; the node under it blooms and the Dot hops.
 * Keyboard: focusing a link in an off-screen node scrolls the page to that node.
 *
 * Mobile / reduced motion (vertical stack): the Dot moves to whichever node is at
 * the middle of the screen — a hop with motion, a cross-fade without.
 */
export const init: SceneInit = (root, { reduced, desktop }) => {
  const pin = root.querySelector<HTMLElement>("[data-climb-pin]");
  const track = root.querySelector<HTMLElement>("[data-climb-track]");
  const dotSpot = root.querySelector<HTMLElement>("[data-climb-dot]");
  const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-node]"));
  if (!pin || !track || !dotSpot || nodes.length === 0) return () => {};

  return desktop && !reduced
    ? horizontal(pin, track, dotSpot, nodes)
    : vertical(track, dotSpot, nodes, reduced);
};

const circleOf = (n: HTMLElement) => n.querySelector<HTMLElement>("[data-node-circle]");

function horizontal(
  pin: HTMLElement,
  track: HTMLElement,
  dotSpot: HTMLElement,
  nodes: HTMLElement[],
) {
  let cancelled = false;
  let tween: gsap.core.Tween | null = null;
  let active = -1;

  const setActive = (index: number) => {
    if (index === active) return;
    if (active >= 0) nodes[active]?.removeAttribute("data-active");
    nodes[index]?.setAttribute("data-active", "");
    if (active >= 0 && dot.activeName === "climb") void dot.setState("guide");
    active = index;
  };

  // Geometry is measured once per refresh (resize, pins, fonts), then the node under the
  // Dot is found from the track's current x alone — no layout reads while scrolling.
  let dotX = 0; // the Dot's centre on screen (it stays put; the track moves under it)
  let trackLeft0 = 0; // the track's left edge on screen when x = 0
  let centres: number[] = []; // node circle centres, relative to the track's left edge
  const measure = () => {
    const shift = Number(gsap.getProperty(track, "x")) || 0;
    const t = track.getBoundingClientRect();
    const d = dotSpot.getBoundingClientRect();
    dotX = d.left + d.width / 2;
    trackLeft0 = t.left - shift;
    centres = nodes.map((n) => {
      const c = circleOf(n)?.getBoundingClientRect();
      return c ? c.left + c.width / 2 - t.left : Infinity;
    });
  };
  const nearestToDot = () => {
    // GSAP caches x, so this reads no layout.
    const trackLeft = trackLeft0 + (Number(gsap.getProperty(track, "x")) || 0);
    let best = 0;
    let bestDist = Infinity;
    centres.forEach((cx, i) => {
      const d = Math.abs(trackLeft + cx - dotX);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  };

  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

  void loadScrollTrigger().then(() => {
    if (cancelled) return;
    tween = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      // On the tween, not the ScrollTrigger: with scrub smoothing the track moves after
      // the scroll event, so measure on every animated frame.
      onUpdate: () => setActive(nearestToDot()),
      scrollTrigger: {
        trigger: pin,
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onRefresh: () => {
          measure();
          setActive(nearestToDot());
        },
      },
    });
    measure();
    setActive(nearestToDot());
    refreshScrollTriggers();
  });

  // Keyboard users: bring a focused node under the Dot.
  const onFocusIn = (e: FocusEvent) => {
    const st = tween?.scrollTrigger;
    const node = (e.target as Element | null)?.closest<HTMLElement>("[data-node]");
    if (!st || !node) return;
    const index = nodes.indexOf(node);
    const y = st.start + (st.end - st.start) * (index / Math.max(1, nodes.length - 1));
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  };
  track.addEventListener("focusin", onFocusIn);

  return () => {
    cancelled = true;
    track.removeEventListener("focusin", onFocusIn);
    tween?.scrollTrigger?.kill();
    tween?.kill();
    gsap.set(track, { clearProps: "transform" });
    nodes.forEach((n) => n.removeAttribute("data-active"));
  };
}

function vertical(
  track: HTMLElement,
  dotSpot: HTMLElement,
  nodes: HTMLElement[],
  reduced: boolean,
) {
  const container = dotSpot.parentElement;
  if (!container) return () => {};
  let active = -1;

  /** Where the Dot sits on node i: centred on top of its circle. */
  const spotFor = (i: number) => {
    const c = circleOf(nodes[i]!)?.getBoundingClientRect();
    const base = container.getBoundingClientRect();
    const box = dotSpot.getBoundingClientRect();
    if (!c) return { x: 0, y: 0 };
    return {
      x: c.left - base.left + c.width / 2 - box.width / 2,
      // Body bottom is at 90% of the Dot's box: rest it on the circle's top edge.
      y: c.top - base.top - box.height * 0.9,
    };
  };

  const moveTo = (i: number, instant: boolean) => {
    const { x, y } = spotFor(i);
    gsap.killTweensOf(dotSpot);
    if (instant) {
      gsap.set(dotSpot, { x, y });
    } else if (reduced) {
      gsap
        .timeline()
        .to(dotSpot, { opacity: 0, duration: 0.15 })
        .set(dotSpot, { x, y })
        .to(dotSpot, { opacity: 1, duration: 0.2 });
    } else {
      const midY = Math.min(Number(gsap.getProperty(dotSpot, "y")), y) - 40;
      gsap.to(dotSpot, { x, duration: 0.5, ease: "power1.inOut" });
      gsap.to(dotSpot, {
        keyframes: [
          { y: midY, duration: 0.25, ease: "power2.out" },
          { y, duration: 0.25, ease: "power2.in" },
        ],
      });
    }
  };

  // The node crossing the middle of the screen becomes active. An IntersectionObserver
  // on a thin band at mid-screen replaces measuring every node on every scroll frame.
  const activate = (best: number) => {
    if (best === active) return;
    const first = active < 0;
    if (active >= 0) nodes[active]?.removeAttribute("data-active");
    nodes[best]?.setAttribute("data-active", "");
    active = best;
    moveTo(best, first);
  };
  const band = new IntersectionObserver(
    (entries) => {
      const hit = entries.filter((e) => e.isIntersecting).pop();
      if (hit) activate(nodes.indexOf(hit.target as HTMLElement));
    },
    { rootMargin: "-45% 0px -45% 0px" },
  );
  // Start with the node nearest the middle (one measurement, at init).
  const mid = window.innerHeight / 2;
  let nearest = 0;
  let nearestDist = Infinity;
  nodes.forEach((n, i) => {
    const r = n.getBoundingClientRect();
    const d = Math.abs(r.top + r.height / 2 - mid);
    if (d < nearestDist) {
      nearestDist = d;
      nearest = i;
    }
  });

  const onResize = () => {
    if (active >= 0) moveTo(active, true);
  };

  activate(nearest);
  nodes.forEach((n) => band.observe(n));
  window.addEventListener("resize", onResize);

  return () => {
    band.disconnect();
    window.removeEventListener("resize", onResize);
    gsap.killTweensOf(dotSpot);
    gsap.set(dotSpot, { clearProps: "x,y,opacity" });
    nodes.forEach((n) => n.removeAttribute("data-active"));
  };
}
