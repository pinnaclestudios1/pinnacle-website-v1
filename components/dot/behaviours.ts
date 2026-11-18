"use client";

import { useEffect } from "react";
import { dot } from "./controller";
import type { Point } from "./types";

/**
 * Automatic triggers from the character bible (brief §3), installed once.
 *
 *   Look        cursor moves              → eyes follow (fine pointers only)
 *   Guide       scrolling down            → hops ahead
 *   Roll back   scrolling up              → rolls backwards
 *   Dizzy       very fast scroll          → spiral eyes for 1s
 *   Curious     hover [data-dot-curious]  → leans toward it
 *   Excited     hover/focus a primary CTA → double bounce
 *   Sleepy      10s with no input         → yawns, sleeps
 *   Wake        any input after sleep     → startled hop, smile
 *
 * Easter eggs: type "pinnacle" → sunglasses · after 10pm → nightcap ·
 * click the Dot 5× → backflip (handled by dot.poke()).
 * Konami-code mini-game is version 2 (brief §12).
 *
 * All listeners are passive and only read state — the Dot never blocks input.
 */

const SLEEP_AFTER_MS = 10_000;
const DIZZY_SPEED = 5; // px per ms — a hard fling
const SCROLL_REACT_EVERY_MS = 1400;
const DIZZY_EVERY_MS = 2500;

export function useDotBehaviours() {
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    /* ---------- sleepy / wake ---------- */
    let sleepTimer = 0;
    const activity = () => {
      if (dot.autoBehaviours && dot.state === "sleepy") void dot.setState("wake");
      window.clearTimeout(sleepTimer);
      sleepTimer = window.setTimeout(() => {
        if (dot.autoBehaviours && dot.state === "idle") void dot.setState("sleepy");
      }, SLEEP_AFTER_MS);
    };

    /* ---------- look ---------- */
    let lookFrame = 0;
    let pointer: Point | null = null;
    const onPointerMove = (e: PointerEvent) => {
      activity();
      if (!finePointer || e.pointerType !== "mouse") return;
      pointer = { x: e.clientX, y: e.clientY };
      if (!lookFrame) {
        lookFrame = requestAnimationFrame(() => {
          lookFrame = 0;
          dot.lookAt(pointer);
        });
      }
    };

    /* ---------- scroll: guide / roll back / dizzy ---------- */
    let lastY = window.scrollY;
    let lastT = performance.now();
    let lastReact = 0;
    let lastDizzy = 0;
    const onScroll = () => {
      activity();
      const now = performance.now();
      const dt = now - lastT;
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      lastT = now;
      // A long gap means a new gesture (or a programmatic jump) — just re-baseline.
      if (dt > 120 || !dot.autoBehaviours || !dot.scrollReactions) return;
      const speed = Math.abs(dy) / Math.max(dt, 1);
      if (speed > DIZZY_SPEED && now - lastDizzy > DIZZY_EVERY_MS) {
        lastDizzy = now;
        void dot.setState("dizzy");
      } else if (Math.abs(dy) > 1 && now - lastReact > SCROLL_REACT_EVERY_MS) {
        lastReact = now;
        void dot.setState(dy > 0 ? "guide" : "rollBack");
      }
    };

    /* ---------- hover: excited / curious ---------- */
    let lastCta: Element | null = null;
    let lastCurious: Element | null = null;
    const onPointerOver = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;
      const cta = target.closest('[data-cta="primary"]');
      if (cta && cta !== lastCta && dot.autoBehaviours) void dot.setState("excited");
      lastCta = cta;

      const curious = target.closest("[data-dot-curious]");
      if (curious && curious !== lastCurious && dot.autoBehaviours) {
        void dot.setState("curious", { toward: curious });
      } else if (!curious && lastCurious && dot.state === "curious") {
        void dot.setState("idle");
      }
      lastCurious = curious;
    };
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest('[data-cta="primary"]') && dot.autoBehaviours)
        void dot.setState("excited");
    };

    /* ---------- keyboard: activity + "pinnacle" ---------- */
    let typed = "";
    const onKeyDown = (e: KeyboardEvent) => {
      activity();
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey) return;
      typed = (typed + e.key.toLowerCase()).slice(-8);
      if (typed === "pinnacle") {
        typed = "";
        dot.toggleAccessory("sunglasses");
      }
    };

    /* ---------- night visit ---------- */
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) dot.setAccessory("nightcap", true);

    const opts = { passive: true } as const;
    window.addEventListener("pointermove", onPointerMove, opts);
    window.addEventListener("pointerdown", activity, opts);
    window.addEventListener("wheel", activity, opts);
    window.addEventListener("touchstart", activity, opts);
    window.addEventListener("scroll", onScroll, opts);
    document.addEventListener("pointerover", onPointerOver, opts);
    document.addEventListener("focusin", onFocusIn);
    window.addEventListener("keydown", onKeyDown);
    activity();

    return () => {
      window.clearTimeout(sleepTimer);
      cancelAnimationFrame(lookFrame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", activity);
      window.removeEventListener("wheel", activity);
      window.removeEventListener("touchstart", activity);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}
