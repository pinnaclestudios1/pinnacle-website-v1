"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useDotBehaviours } from "./behaviours";
import { DotActorView } from "./DotActorView";

/**
 * The guide Dot + the automatic triggers.
 *
 * The guide is the fallback: it shows whenever no "moment" Dot (a home stage, the
 * menu, the 404, the footer summit…) is on screen, so the visitor never loses the Dot.
 * - Desktop: in the left page gutter (the "Dot lane"), where it never covers text.
 * - Mobile/tablet: docked bottom-left, beside the sticky "Start a project" pill.
 *
 * Full-bleed elements (e.g. case-study hero images) reach into the gutter; mark them
 * with `data-dot-avoid` and the guide fades out while one passes behind it.
 */
export function DotStage() {
  useDotBehaviours();
  const pathname = usePathname();
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let io: IntersectionObserver | null = null;
    const behind = new Set<Element>();

    const observe = () => {
      io?.disconnect();
      behind.clear();
      el.style.opacity = "";
      const targets = document.querySelectorAll("[data-dot-avoid]");
      if (!targets.length) return;
      // A horizontal band exactly where the guide sits.
      const r = el.getBoundingClientRect();
      const top = Math.max(0, Math.round(r.top));
      const bottom = Math.max(0, Math.round(window.innerHeight - r.bottom));
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) =>
            e.isIntersecting ? behind.add(e.target) : behind.delete(e.target),
          );
          el.style.opacity = behind.size ? "0" : "";
        },
        { rootMargin: `-${top}px 0px -${bottom}px 0px` },
      );
      targets.forEach((t) => io!.observe(t));
    };

    const frame = requestAnimationFrame(observe);
    window.addEventListener("resize", observe);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", observe);
      io?.disconnect();
    };
  }, [pathname]);

  return (
    <div
      ref={wrap}
      aria-hidden
      className={
        "pointer-events-none fixed z-[var(--pn-z-dot)] transition-opacity duration-300 [--guide:26px] " +
        "bottom-[calc(1.15rem+env(safe-area-inset-bottom))] left-[var(--pn-gutter)] " +
        "lg:bottom-[14vh] lg:left-[calc(var(--pn-dot-lane)/2)] lg:[translate:-50%_0] lg:[--guide:var(--pn-dot-guide)]"
      }
    >
      <DotActorView size="var(--guide)" attach interactive />
    </div>
  );
}
