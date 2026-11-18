import { cn } from "@/lib/cn";
import { DotFigure } from "./DotFigure";

export type DotPose = "idle" | "happy" | "sunglasses" | "flag" | "lost";

/**
 * A still drawing of the Dot (values, empty states). Not a live actor: it never moves,
 * never takes control from the guide, and is decorative for screen readers.
 */
export function DotIllustration({
  pose = "idle",
  size = "56px",
  id,
  className,
}: {
  pose?: DotPose;
  size?: string;
  id: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      data-pose={pose}
      className={cn("pointer-events-none shrink-0", className)}
      style={{ width: `calc(${size} * 1.25)`, height: `calc(${size} * 1.25)` }}
    >
      <DotFigure uid={`ill-${id}`} />
    </div>
  );
}
