"use client";

import { useEffect, useRef } from "react";
import { onScroll, scrollY } from "@/lib/motion/scroll";
import { site } from "@/lib/site";

/**
 * Altitude meter (brief §5): counts 0m at Base Camp → 8,848m at The Summit as you scroll.
 * Desktop home only, in the right-hand gutter so it never covers content.
 * One tick per stage. Decorative for screen readers (the stage headings carry the story).
 * Updates (text + one transform) ride the shared scroll signal; it fades out over the footer.
 */
export function AltitudeMeter() {
  const root = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const ticks = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const mk = marker.current;
    const out = readout.current;
    const tk = ticks.current;
    if (!el || !mk || !out || !tk) return;

    const TRACK = 176; // px, matches h-44
    let summitY = 1;
    let stageYs: number[] = [];
    let last = -1;

    const measure = () => {
      const stages = Array.from(document.querySelectorAll<HTMLElement>("[data-stage]"));
      const top = (s: HTMLElement) => s.getBoundingClientRect().top + window.scrollY;
      const summit = document.querySelector<HTMLElement>('[data-stage="7"]');
      summitY = summit
        ? Math.max(1, top(summit) + summit.offsetHeight / 2 - window.innerHeight / 2)
        : 1;
      stageYs = stages.map((s) =>
        Math.min(1, Math.max(0, (top(s) - window.innerHeight * 0.4) / summitY)),
      );
      Array.from(tk.children).forEach((t, i) => {
        (t as HTMLElement).style.transform = `translateY(${-(stageYs[i] ?? 0) * TRACK}px)`;
      });
      update(scrollY());
    };

    // Runs from the shared scroll signal: position handed over, no DOM reads.
    const update = (y: number) => {
      const p = Math.min(1, Math.max(0, y / summitY));
      const metres = Math.round(p * site.summitAltitude);
      if (metres === last) return;
      last = metres;
      mk.style.transform = `translateY(${-p * TRACK}px)`;
      out.textContent = metres.toLocaleString("en-US");
    };

    // Layout changes (pinned scenes add spacing, fonts load) → re-measure.
    const ro = new ResizeObserver(() => measure());
    ro.observe(document.body);

    // Fade out over the footer.
    const footer = document.querySelector("footer");
    const io = new IntersectionObserver(([entry]) => {
      el.style.opacity = entry?.isIntersecting ? "0" : "1";
    });
    if (footer) io.observe(footer);

    const offScroll = onScroll(update);
    measure();
    return () => {
      ro.disconnect();
      io.disconnect();
      offScroll();
    };
  }, []);

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed top-1/2 z-[var(--pn-z-sticky)] hidden flex-col items-center transition-opacity duration-500 xl:flex"
      style={{ right: "calc(var(--pn-dot-lane) / 2)", transform: "translate(50%, -50%)" }}
    >
      <span className="label text-ink-soft">Alt</span>
      <div className="relative mt-3 h-44 w-px bg-line/50">
        <div ref={ticks} className="absolute inset-x-0 bottom-0">
          {Array.from({ length: 7 }, (_, i) => (
            <span
              key={i}
              className="absolute bottom-0 left-1/2 -ml-[3px] block size-1.5 rounded-full border border-node-stroke bg-node"
            />
          ))}
        </div>
        <span
          ref={marker}
          className="absolute bottom-0 left-1/2 -mb-1 -ml-1 block size-2 rounded-full bg-ink"
        />
      </div>
      <p className="label mt-3 tabular-nums">
        <span ref={readout}>0</span>m
      </p>
    </div>
  );
}
