"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef, type ElementType } from "react";

type RevealProps<T extends ElementType> = {
  as?: T;
  /** Stagger offset in ms. */
  delay?: number;
} & ComponentPropsWithoutRef<T>;

/**
 * Section reveal (600–900ms, expo-out). Progressive enhancement:
 * content is fully visible without JS, under reduced motion it only fades,
 * and a CSS fallback shows it after 3s if the observer never fires.
 * Never wrap the LCP element (hero headline) in Reveal.
 */
export function Reveal<T extends ElementType = "div">({
  as,
  delay = 0,
  style,
  ...props
}: RevealProps<T>) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.setAttribute("data-revealed", "");
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      ref={ref}
      data-reveal=""
      style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}
      {...props}
    />
  );
}
