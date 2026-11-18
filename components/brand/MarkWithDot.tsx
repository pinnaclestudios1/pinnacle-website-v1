"use client";

import { useCallback, useState, type CSSProperties } from "react";
import { DotActorView, type DotActorViewProps } from "@/components/dot/DotActorView";
import { cn } from "@/lib/cn";
import { Mark } from "./Logo";
import { APEX, MARK_VIEWBOX } from "./logo-paths";

const APEX_LEFT = `${(APEX.cx / MARK_VIEWBOX.width) * 100}%`;
const APEX_TOP = `${(APEX.cy / MARK_VIEWBOX.height) * 100}%`;
const APEX_DIAMETER = ((2 * APEX.r) / MARK_VIEWBOX.width).toFixed(4);

type Props = Omit<DotActorViewProps, "size" | "onActiveChange"> & {
  /** CSS width of the mark, e.g. "18rem" or "min(24rem, 80vw)". */
  width: string;
  /** Once the Dot has been here, keep the logo's apex empty (the hero: the Dot hopped off the logo). */
  keepApexEmpty?: boolean;
  className?: string;
};

/**
 * The pyramid mark with the live Dot sitting exactly on its apex.
 * While the Dot is on screen the logo's own apex is hidden, so there is never
 * a second orange circle. Used by the hero, the home summit and the footer.
 */
export function MarkWithDot({ width, keepApexEmpty = false, className, ...dotProps }: Props) {
  const [dotActive, setDotActive] = useState(false);
  const [visited, setVisited] = useState(false);
  const onActiveChange = useCallback((active: boolean) => {
    setDotActive(active);
    if (active) setVisited(true);
  }, []);
  return (
    <div
      className={cn("relative", className)}
      style={{ width: "var(--mark-w)", ["--mark-w" as string]: width } as CSSProperties}
    >
      <Mark className="w-full" hideApex={dotActive || (keepApexEmpty && visited)} />
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: APEX_LEFT, top: APEX_TOP }}
      >
        <DotActorView
          size={`calc(var(--mark-w) * ${APEX_DIAMETER})`}
          onActiveChange={onActiveChange}
          {...dotProps}
        />
      </div>
    </div>
  );
}
