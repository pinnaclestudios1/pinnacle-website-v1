"use client";

import type { MouseEvent } from "react";
import { getLenis } from "@/lib/motion/scroll";

/** First focusable element on every page (WCAG 2.4.1). */
export function SkipLink() {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const main = document.getElementById("main");
    if (!main) return;
    e.preventDefault();
    main.focus({ preventScroll: true });
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(main, { immediate: true });
    else main.scrollIntoView();
  };

  return (
    <a
      href="#main"
      onClick={onClick}
      className="fixed top-3 left-3 z-[200] -translate-y-24 rounded-md bg-ink px-4 py-3 text-sm font-medium text-bg focus-visible:translate-y-0 focus-visible:outline-ink"
    >
      Skip to content
    </a>
  );
}
