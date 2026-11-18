"use client";

import { useEffect, useRef } from "react";
import { RichText } from "@/components/cms/RichText";
import { DotActorView } from "@/components/dot/DotActorView";
import { Todo } from "@/components/ui/Todo";
import type { FaqGroup } from "@/lib/cms/types";
import { gsap } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * FAQ accordions (brief §6: "the Dot opens each accordion").
 * Native <details> — keyboard and screen-reader friendly, works without JavaScript.
 * When a question opens, the Dot hops to it from the lane on the left.
 */
export function FaqList({
  groups,
  dotName = "faq",
  headingLevel = 2,
}: {
  groups: FaqGroup[];
  dotName?: string;
  headingLevel?: 2 | 3;
}) {
  const root = useRef<HTMLDivElement>(null);
  const rider = useRef<HTMLDivElement>(null);
  const H = headingLevel === 2 ? "h2" : "h3";

  useEffect(() => {
    const host = root.current;
    const r = rider.current;
    if (!host || !r) return;
    let current: HTMLElement | null = host.querySelector("summary");
    let placed = false;

    const place = (instant: boolean) => {
      if (!current) return;
      const s = current.getBoundingClientRect();
      const b = host.getBoundingClientRect();
      const x = 0;
      const y = s.top - b.top + s.height / 2 - r.offsetHeight * 0.55;
      gsap.killTweensOf(r);
      if (instant || !placed || prefersReducedMotion()) {
        gsap.set(r, { x, y, opacity: 1 });
        placed = true;
        return;
      }
      const peak = Math.min(Number(gsap.getProperty(r, "y")), y) - 28;
      gsap.to(r, {
        keyframes: [
          { y: peak, duration: 0.22, ease: "power2.out" },
          { y, duration: 0.24, ease: "power2.in" },
        ],
      });
    };

    const onToggle = (e: Event) => {
      const d = e.target as HTMLDetailsElement;
      if (!d.open) return;
      current = d.querySelector("summary");
      place(false);
    };
    host.addEventListener("toggle", onToggle, true);
    place(true);
    const onResize = () => place(true);
    window.addEventListener("resize", onResize);
    return () => {
      host.removeEventListener("toggle", onToggle, true);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={root} className="relative pl-12 lg:pl-16">
      <div ref={rider} className="pointer-events-none absolute top-0 left-0 opacity-0">
        <DotActorView size="26px" name={dotName} priority={30} attach="visible" interactive />
      </div>
      <div className="space-y-14">
        {groups.map((g) => (
          <section key={g.id} aria-labelledby={`faq-${g.id}`}>
            {groups.length > 1 && (
              <H id={`faq-${g.id}`} className="label font-sans text-ink-soft">
                {g.title}
              </H>
            )}
            <div className="mt-4 divide-y divide-line/40 border-y border-line/40">
              {g.items.map((item) => (
                <details key={item.question} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-xl [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <span aria-hidden className="relative block size-4 shrink-0">
                      <span className="absolute top-1/2 left-0 h-px w-full bg-ink" />
                      <span className="absolute top-0 left-1/2 h-full w-px bg-ink transition-transform duration-300 ease-out-expo group-open:scale-y-0 motion-reduce:transition-none" />
                    </span>
                  </summary>
                  <div className="faq-answer pb-6 text-ink-soft">
                    <RichText value={item.answer} className="text-[1rem]" />
                    {item.draft && (
                      <p className="mt-3">
                        <Todo>confirm this answer</Todo>
                      </p>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
