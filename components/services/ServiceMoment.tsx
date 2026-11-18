"use client";

import { useEffect } from "react";
import { dot } from "@/components/dot/controller";
import { DotActorView } from "@/components/dot/DotActorView";
import { ServiceIcon } from "@/components/scenes/ServiceIcon";
import { cn } from "@/lib/cn";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * Each service gets its own small Dot moment (brief §6) — e.g. on Mobile Apps the Dot
 * bounces inside a phone frame. The Dot hops every few seconds while it's on screen.
 */
const FRAMES: Record<string, { shape: string; label: string }> = {
  "web-development": { shape: "browser", label: "in a browser window" },
  "web-apps": { shape: "dashboard", label: "on a dashboard" },
  "mobile-apps": { shape: "phone", label: "inside a phone" },
  "ui-ux-design": { shape: "artboard", label: "on an artboard" },
  ecommerce: { shape: "bag", label: "in a shopping bag" },
  "branding-motion": { shape: "swatch", label: "among colour swatches" },
  "care-plans": { shape: "shield", label: "behind a shield" },
};

export function ServiceMoment({ slug }: { slug: string }) {
  const frame = FRAMES[slug] ?? FRAMES["web-development"]!;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      if (dot.activeName === "service-moment" && dot.state === "idle") void dot.setState("guide");
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      aria-hidden
      className="relative mx-auto grid aspect-square w-full max-w-sm place-items-center"
    >
      <div
        className={cn(
          "relative grid place-items-end justify-items-center border border-line bg-surface pb-[12%]",
          frame.shape === "phone" && "h-[78%] w-[44%] rounded-[1.6rem]",
          frame.shape === "browser" && "h-[62%] w-[88%] rounded-md pt-6",
          frame.shape === "dashboard" && "h-[62%] w-[88%] rounded-md pt-6 pl-[22%]",
          frame.shape === "artboard" && "h-[70%] w-[70%] rounded-sm border-dashed",
          frame.shape === "bag" && "h-[60%] w-[60%] rounded-t-sm rounded-b-xl",
          frame.shape === "swatch" && "h-[56%] w-[80%] rounded-md",
          frame.shape === "shield" && "h-[70%] w-[60%] rounded-t-md rounded-b-[45%]",
        )}
      >
        {/* Frame details */}
        {(frame.shape === "browser" || frame.shape === "dashboard") && (
          <span className="absolute inset-x-0 top-0 flex h-6 items-center gap-1 border-b border-line/60 px-3">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-1.5 rounded-full border border-line" />
            ))}
          </span>
        )}
        {frame.shape === "dashboard" && (
          <span className="absolute top-6 bottom-0 left-0 w-[20%] border-r border-line/60" />
        )}
        {frame.shape === "phone" && (
          <span className="absolute top-3 left-1/2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-line/50" />
        )}
        {frame.shape === "bag" && (
          <span className="absolute -top-[22%] left-1/2 h-[30%] w-[40%] -translate-x-1/2 rounded-t-full border border-b-0 border-line" />
        )}
        {frame.shape === "swatch" && (
          <span className="absolute top-4 left-4 flex gap-2">
            {["bg-charcoal", "bg-line", "bg-cream", "bg-surface"].map((c) => (
              <span key={c} className={cn("size-5 rounded-sm border border-line/60", c)} />
            ))}
          </span>
        )}
        <span className="absolute top-3 right-3 text-line">
          <ServiceIcon slug={slug} className="size-5" />
        </span>
        <span className="absolute inset-x-[18%] bottom-[12%] h-px bg-line/60" />
        <DotActorView
          size="clamp(40px, 7vw, 60px)"
          name="service-moment"
          priority={30}
          attach="visible"
          interactive
        />
      </div>
    </div>
  );
}
