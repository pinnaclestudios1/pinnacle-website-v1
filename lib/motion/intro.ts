"use client";

/**
 * The first-visit preloader (home only) sets `html.preload` from a head script.
 * Scenes that should start after it (the hero hello) await `whenIntroDone()`.
 */
export const INTRO_DONE_EVENT = "pn:intro-done";

export function introRunning(): boolean {
  return document.documentElement.classList.contains("preload");
}

export function finishIntro() {
  const html = document.documentElement;
  if (!html.classList.contains("preload")) return;
  html.classList.remove("preload", "preload-skip");
  window.dispatchEvent(new Event(INTRO_DONE_EVENT));
}

export function whenIntroDone(): Promise<void> {
  if (!introRunning()) return Promise.resolve();
  return new Promise((resolve) =>
    window.addEventListener(INTRO_DONE_EVENT, () => resolve(), { once: true }),
  );
}
