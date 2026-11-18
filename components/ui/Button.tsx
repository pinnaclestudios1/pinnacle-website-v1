import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { TransitionLink } from "@/components/motion/PageTransition";

type Variant = "primary" | "outline" | "text";
type Size = "md" | "sm";

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  /** Analytics + Dot hook: where this CTA lives (e.g. "nav", "hero", "footer"). */
  ctaLocation?: string;
};

type LinkProps = Common & { href: string } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "href" | "className" | "children"
  >;
type NativeButtonProps = Common & { href?: undefined } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "className" | "children"
  >;

const base =
  "group relative isolate inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium leading-none " +
  "transition-transform duration-200 ease-out-expo active:scale-[0.97] motion-reduce:transition-none " +
  "disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<Size, string> = {
  md: "h-12 px-6 text-[0.9375rem]",
  sm: "h-10 px-4 text-sm",
};

/*
 * Only transform and opacity animate (brief §9). Hover effects are pseudo-elements
 * fading/scaling in; colours never transition.
 * Primary = orange fill, charcoal label (white fails AA on #FF5B27).
 */
const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-ink hover:-translate-y-0.5 " +
    "before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:opacity-0 before:shadow-[0_10px_28px_-8px_var(--pn-orange)] " +
    "before:transition-opacity before:duration-200 hover:before:opacity-70",
  outline:
    "border border-ink text-ink hover:-translate-y-0.5 " +
    "before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:rounded-[inherit] before:bg-surface " +
    "before:transition-transform before:duration-300 before:ease-out-expo hover:before:scale-y-100",
  text: "h-auto px-0 text-ink underline decoration-line underline-offset-[6px] hover:decoration-ink",
};

export function Button(props: LinkProps | NativeButtonProps) {
  const { variant = "primary", size = "md", className, children, ctaLocation, ...rest } = props;
  const classes = cn(base, variant !== "text" && sizes[size], variants[variant], className);
  const dataAttrs = {
    "data-cta": variant,
    ...(ctaLocation ? { "data-cta-location": ctaLocation } : {}),
  };

  if (typeof rest.href === "string") {
    const { href, ...anchorRest } = rest as Omit<LinkProps, keyof Common>;
    if (href.startsWith("/")) {
      return (
        <TransitionLink href={href} className={classes} {...dataAttrs} {...anchorRest}>
          {children}
        </TransitionLink>
      );
    }
    return (
      <a href={href} className={classes} rel="noopener noreferrer" {...dataAttrs} {...anchorRest}>
        {children}
      </a>
    );
  }

  const buttonRest = rest as Omit<NativeButtonProps, keyof Common>;
  return (
    <button type="button" className={classes} {...dataAttrs} {...buttonRest}>
      {children}
    </button>
  );
}
