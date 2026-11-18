import type { ReactNode } from "react";
import { DotActorView } from "@/components/dot/DotActorView";
import { cn } from "@/lib/cn";
import { SceneMotion } from "./SceneMotion";

/**
 * A winding trail that draws itself as you scroll, with the Dot riding its tip
 * (same motion as the home page's Stage 2 — scenes/motion/path.ts).
 * Used on inner pages for step-by-step content: services, process, milestones.
 *
 * align="left": trail in a lane left of the content (content is indented for it).
 * align="center" (desktop): trail down the middle; children handle alternation.
 */
const TRAIL =
  "M100 0 C170 150, 170 250, 100 360 C30 470, 30 580, 100 690 C170 800, 30 900, 100 1000";

export function Trail({
  children,
  align = "left",
  className,
}: {
  children: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div data-scene="path" data-stage="trail" className={cn("relative", className)}>
      <SceneMotion scene="path" />
      <div data-path-lane="" className="relative">
        {/* Clip box for the transform-only reveal (path.ts); the svg sits inside it. */}
        <div
          aria-hidden
          data-path-clip=""
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 h-full w-10 overflow-hidden",
            align === "center" ? "lg:left-1/2 lg:w-40 lg:-translate-x-1/2" : "lg:w-16",
          )}
        >
          <svg
            aria-hidden
            data-path-svg=""
            className="block h-full w-full"
            viewBox="0 0 200 1000"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              data-path-trail=""
              d={TRAIL}
              stroke="var(--pn-line)"
              strokeWidth={1.25}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
            />
            <path data-path-measure="" d={TRAIL} visibility="hidden" />
          </svg>
        </div>
        <div
          data-path-dot=""
          className="pointer-events-none absolute top-0 left-0 z-10 [--path-dot:24px] lg:[--path-dot:32px]"
          style={{ translate: "-50% -50%" }}
        >
          <DotActorView
            size="var(--path-dot)"
            name="path"
            priority={30}
            attach="visible"
            attachWithin="[data-stage]"
            scrollReactions={false}
            interactive
          />
        </div>
        <div className={cn(align === "left" ? "pl-16 lg:pl-28" : "")}>{children}</div>
      </div>
    </div>
  );
}
