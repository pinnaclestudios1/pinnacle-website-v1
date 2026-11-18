"use client";

import { useEffect, useRef } from "react";
import { dot } from "@/components/dot/controller";
import { DotActorView } from "@/components/dot/DotActorView";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * Brief §8: "the Dot climbing a small progress pyramid as the visitor answers".
 * One node per step up the pyramid's left edge; the apex is the summit, reached on send.
 * Decorative (aria-hidden) — the form announces "Step x of y" in text.
 */
const W = 321.32;
const H = 252;
const BASE = { x: 25.57, y: 226.52 };
const APEX = { x: 160.76, y: 29.23 };
const at = (t: number) => ({
  x: BASE.x + (APEX.x - BASE.x) * t,
  y: BASE.y + (APEX.y - BASE.y) * t,
});

export function ClimbProgress({
  step,
  total,
  done,
}: {
  step: number;
  total: number;
  done: boolean;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const rider = useRef<HTMLDivElement>(null);
  const placed = useRef(false);
  const nodes = Array.from({ length: total }, (_, i) => at(i / total));
  const t = done ? 1 : step / total;
  const target = done ? APEX : nodes[step]!;

  useEffect(() => {
    const box = wrap.current;
    const r = rider.current;
    if (!box || !r) return;
    const place = (instant: boolean) => {
      const x = (target.x / W) * box.offsetWidth - r.offsetWidth / 2;
      // The Dot's body bottom (90% of its box) rests on top of the node (radius ≈ 10 units).
      const y = ((target.y - 10) / H) * box.offsetHeight - r.offsetHeight * 0.9;
      gsap.killTweensOf(r);
      if (instant || !placed.current) {
        gsap.set(r, { x, y, opacity: 1 });
        placed.current = true;
        return Promise.resolve();
      }
      if (prefersReducedMotion()) {
        return new Promise<void>((resolve) =>
          gsap
            .timeline({ onComplete: resolve })
            .to(r, { opacity: 0, duration: 0.15 })
            .set(r, { x, y })
            .to(r, { opacity: 1, duration: 0.2 }),
        );
      }
      const peak = Math.min(Number(gsap.getProperty(r, "y")), y) - 34;
      return new Promise<void>((resolve) => {
        gsap.to(r, { x, duration: 0.55, ease: "power1.inOut" });
        gsap.to(r, {
          keyframes: [
            { y: peak, duration: 0.27, ease: "power2.out" },
            { y, duration: 0.28, ease: "power2.in" },
          ],
          onComplete: resolve,
        });
      });
    };

    void place(false).then(() => {
      if (done && dot.activeName === "brief") void dot.celebrate();
    });
    const onResize = () => void place(true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [target.x, target.y, done]);

  // The climbed part of the edge, drawn as a solid line over the grey outline.
  const reached = at(t);

  return (
    <div ref={wrap} aria-hidden className="relative mx-auto w-full max-w-[15rem]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" fill="none">
        <circle
          cx={APEX.x}
          cy={APEX.y}
          r={70}
          fill="var(--pn-peach)"
          className={cn(
            "origin-center transition-[opacity,scale] duration-700 ease-out-expo [transform-box:fill-box]",
            done ? "scale-100 opacity-60" : "scale-50 opacity-0",
          )}
        />
        <path
          d={`M${BASE.x} ${BASE.y}L${APEX.x} ${APEX.y}L295.94 ${BASE.y}Z`}
          stroke="var(--pn-line)"
          strokeWidth={3}
          strokeOpacity={0.5}
        />
        <path
          d={`M${BASE.x} ${BASE.y}L${reached.x} ${reached.y}`}
          stroke="var(--pn-ink)"
          strokeWidth={3}
          strokeLinecap="round"
        />
        {nodes.map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={9}
            strokeWidth={3}
            stroke={i <= step || done ? "var(--pn-ink)" : "var(--pn-line)"}
            fill={i < step || done ? "var(--pn-ink)" : "var(--pn-node-fill)"}
          />
        ))}
        <circle
          cx={APEX.x}
          cy={APEX.y}
          r={12}
          strokeWidth={3}
          stroke={done ? "var(--pn-ink)" : "var(--pn-line)"}
          fill="var(--pn-node-fill)"
        />
      </svg>
      <div ref={rider} className="absolute top-0 left-0 opacity-0">
        <DotActorView
          size="28px"
          name="brief"
          priority={40}
          attach="visible"
          props={done ? ["flag"] : []}
          interactive
        />
      </div>
    </div>
  );
}
