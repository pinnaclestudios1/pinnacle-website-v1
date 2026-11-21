"use client";

import type Lenis from "lenis";

/**
 * Thin, framework-free access to the scroll engine so any section (and the Dot
 * controller) can read the scroll position, stop/start or jump without prop drilling.
 * Falls back to native scrolling when Lenis is off (reduced motion).
 */
let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

/* ------------------------------------------------------------------ scroll signal */

/**
 * One scroll signal for everything that reacts to scrolling (header, altitude meter,
 * the Dot's scroll reactions).
 *
 * Why not window "scroll" listeners: Lenis moves the page from the GSAP ticker. A
 * listener that reads `scrollY` or writes styles at any other point in the frame forces
 * the browser to recalculate styles mid-frame (measured: ~0.7 s of forced style work
 * per full scroll of the home page). With Lenis on, subscribers run inside Lenis's own
 * update — after the scroll position is set and before GSAP renders — and get the
 * position as a number, so nothing reads the DOM. Without Lenis, native scroll events
 * are used.
 */
type ScrollFn = (y: number) => void;
const subscribers = new Set<ScrollFn>();
let nativeBound = false;

function onNativeScroll() {
  if (lenis) return; // Lenis emits its own updates
  const y = window.scrollY;
  subscribers.forEach((fn) => fn(y));
}

export function onScroll(fn: ScrollFn) {
  subscribers.add(fn);
  if (!nativeBound && typeof window !== "undefined") {
    nativeBound = true;
    window.addEventListener("scroll", onNativeScroll, { passive: true });
  }
  return () => {
    subscribers.delete(fn);
  };
}

/** Called by SmoothScroll from inside Lenis's update. */
export function emitScroll(y: number) {
  subscribers.forEach((fn) => fn(y));
}

/**
 * Per-frame callbacks that need to MEASURE layout (e.g. the Dot's hand-off flight
 * tracking its moving target). They run right after Lenis updates and before GSAP
 * renders, when nothing has written styles yet this frame, so their reads are free.
 * Without Lenis (reduced motion) a plain rAF loop is used instead.
 */
const frameFns = new Set<() => void>();
let frameRaf = 0;
function rafLoop() {
  frameRaf = 0;
  if (lenis || !frameFns.size) return;
  frameFns.forEach((fn) => fn());
  frameRaf = requestAnimationFrame(rafLoop);
}
export function onFrame(fn: () => void) {
  frameFns.add(fn);
  if (!lenis && !frameRaf) frameRaf = requestAnimationFrame(rafLoop);
  return () => {
    frameFns.delete(fn);
  };
}
/** Called by SmoothScroll every tick, right after Lenis. */
export function runFrame() {
  frameFns.forEach((fn) => fn());
}

/** Current scroll position without touching the DOM when Lenis is running. */
export function scrollY() {
  return lenis ? lenis.scroll : window.scrollY;
}

/* ------------------------------------------------------------------ helpers */

/** Lock page scroll (menus, dialogs). Works with and without Lenis. */
export function lockScroll() {
  lenis?.stop();
  document.documentElement.style.overflow = "hidden";
}

export function unlockScroll() {
  document.documentElement.style.overflow = "";
  lenis?.start();
}

/** Jump to top instantly (used behind the page-transition curtain). */
export function resetScroll() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}
