"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { useMediaQuery } from "@/lib/use-media-query";
import { ConsentRoot } from "./ConsentRoot";

/**
 * Optional extras that must not cost the initial bundle (brief §11):
 * - Custom cursor: desktop + fine pointer + motion allowed; code loads when the page is idle.
 * - Sound: off by default; the synth engine loads the first time it's switched on.
 * - Cookie consent + analytics (ConsentRoot).
 * The sound toggle is always visible (brief §4 "Always visible").
 */
const SOUND_KEY = "pn-sound";

const idle = (fn: () => void) => {
  if (typeof window.requestIdleCallback === "function")
    window.requestIdleCallback(fn, { timeout: 2500 });
  else setTimeout(fn, 1200); // Safari
};

export function ExtrasRoot() {
  const reduced = useReducedMotion();
  const desktopPointer = useMediaQuery("(min-width: 1024px) and (pointer: fine)");
  const [sound, setSound] = useState(false);

  // Cursor
  useEffect(() => {
    if (reduced || !desktopPointer) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    idle(() => {
      void import("./cursor").then((m) => {
        if (cancelled) return;
        m.start();
        stop = m.stop;
      });
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [reduced, desktopPointer]);

  // Sound preference is remembered, but audio only starts after a click (browser rule),
  // so a remembered "on" shows as off until the visitor presses it again this visit.
  const toggleSound = async () => {
    const next = !sound;
    setSound(next);
    try {
      localStorage.setItem(SOUND_KEY, next ? "1" : "0");
    } catch {
      /* storage blocked */
    }
    const m = await import("./sound");
    if (next) await m.start();
    else m.stop();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void toggleSound()}
        aria-pressed={sound}
        aria-label={sound ? "Sound on — turn off" : "Sound off — turn on"}
        title={sound ? "Sound on" : "Sound off"}
        className={cn(
          "fixed z-[var(--pn-z-sticky)] grid size-10 place-items-center rounded-full border border-line/50 bg-surface/90 text-ink transition-transform duration-200 active:scale-95 motion-reduce:transition-none",
          "right-[var(--pn-gutter)] bottom-[calc(1.35rem+env(safe-area-inset-bottom))]",
          "lg:right-[calc(var(--pn-dot-lane)/2)] lg:bottom-[14vh] lg:translate-x-1/2",
        )}
      >
        <SoundIcon on={sound} />
      </button>
      <ConsentRoot />
    </>
  );
}

function SoundIcon({ on }: { on: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="size-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z" />
      {on ? (
        <>
          <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />
          <path d="M18 7a7 7 0 0 1 0 10" />
        </>
      ) : (
        <path d="M16 10l4 4m0-4l-4 4" />
      )}
    </svg>
  );
}
