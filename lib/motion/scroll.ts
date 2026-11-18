"use client";

import type Lenis from "lenis";

/**
 * Thin, framework-free access to the scroll engine so any section (and the Dot
 * controller in phase 2) can read velocity, stop/start or jump without prop drilling.
 * Falls back to native scrolling when Lenis is off (reduced motion).
 */
let lenis: Lenis | null = null;
const listeners = new Set<(l: Lenis | null) => void>();

export function setLenis(instance: Lenis | null) {
  lenis = instance;
  listeners.forEach((fn) => fn(lenis));
}

export function getLenis() {
  return lenis;
}

export function onLenisChange(fn: (l: Lenis | null) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

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
