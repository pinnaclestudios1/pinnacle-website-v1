import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

type ContainerProps<T extends ElementType> = {
  as?: T;
  /** Full-bleed: drop the max width (for mountain scenes). Gutters stay. */
  bleed?: boolean;
} & ComponentPropsWithoutRef<T>;

/** Max ~1280px content column with responsive gutters (brief §2 Layout). */
export function Container<T extends ElementType = "div">({
  as,
  bleed,
  className,
  ...props
}: ContainerProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-[var(--pn-gutter)]",
        !bleed && "max-w-[calc(var(--pn-max)+2*var(--pn-gutter))]",
        className,
      )}
      {...props}
    />
  );
}

/** 12-column grid on desktop, 4 on mobile, 6 on tablet. */
export const grid = "grid grid-cols-4 gap-x-5 md:grid-cols-6 md:gap-x-6 lg:grid-cols-12 lg:gap-x-8";
