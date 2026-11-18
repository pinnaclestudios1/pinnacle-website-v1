import { cn } from "@/lib/cn";
import {
  APEX,
  LOGO_VIEWBOX,
  MARK_VIEWBOX,
  NODE_CENTRE,
  NODE_LEFT,
  NODE_RIGHT,
  PYRAMID_INNER,
  PYRAMID_OUTLINE,
  TAGLINE,
  WORDMARK,
} from "./logo-paths";

type LogoProps = {
  className?: string;
  /** When the logo sits inside a labelled link, hide it from assistive tech. */
  decorative?: boolean;
  /**
   * Hide the orange apex so the live Dot can sit in its place (phase 2: the Dot
   * "hops off the logo"). The anchor element is kept for positioning.
   */
  hideApex?: boolean;
};

function Pyramid({ hideApex }: { hideApex?: boolean }) {
  return (
    <g>
      <path d={PYRAMID_OUTLINE} stroke="var(--pn-logo-line)" strokeWidth={9.78641} fill="none" />
      <path d={PYRAMID_INNER} stroke="var(--pn-logo-line)" strokeWidth={9.78641} fill="none" />
      <circle
        cx={APEX.cx}
        cy={APEX.cy}
        r={APEX.r}
        fill="var(--pn-orange)"
        data-dot-anchor="logo-apex"
        opacity={hideApex ? 0 : 1}
      />
      <circle cx={NODE_LEFT.cx} cy={NODE_LEFT.cy} r={NODE_LEFT.r} fill="var(--pn-logo-node)" />
      <circle cx={NODE_RIGHT.cx} cy={NODE_RIGHT.cy} r={NODE_RIGHT.r} fill="var(--pn-logo-node)" />
      <circle
        cx={NODE_CENTRE.cx}
        cy={NODE_CENTRE.cy}
        r={NODE_CENTRE.r}
        fill="var(--pn-logo-node)"
      />
    </g>
  );
}

/** Full horizontal logo: pyramid mark + PINNACLE wordmark + STUDIOS. Colours follow the theme scope. */
export function Logo({ className, decorative, hideApex }: LogoProps) {
  return (
    <svg
      viewBox={`0 0 ${LOGO_VIEWBOX.width} ${LOGO_VIEWBOX.height}`}
      className={cn("h-auto", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...(decorative
        ? { "aria-hidden": true, focusable: false }
        : { role: "img", "aria-label": "Pinnacle Studios" })}
    >
      <Pyramid hideApex={hideApex} />
      <path d={WORDMARK} fill="var(--pn-logo-wordmark)" />
      <path d={TAGLINE} fill="var(--pn-logo-tagline)" />
    </svg>
  );
}

/** The pyramid mark on its own (no wordmark). */
export function Mark({ className, decorative = true, hideApex }: LogoProps) {
  return (
    <svg
      viewBox={`0 0 ${MARK_VIEWBOX.width} ${MARK_VIEWBOX.height}`}
      className={cn("h-auto", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...(decorative
        ? { "aria-hidden": true, focusable: false }
        : { role: "img", "aria-label": "Pinnacle Studios" })}
    >
      <Pyramid hideApex={hideApex} />
    </svg>
  );
}
