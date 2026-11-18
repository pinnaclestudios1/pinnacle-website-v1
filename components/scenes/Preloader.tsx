"use client";

import { useEffect } from "react";
import {
  APEX,
  MARK_VIEWBOX,
  NODE_CENTRE,
  NODE_LEFT,
  NODE_RIGHT,
  PYRAMID_INNER,
  PYRAMID_OUTLINE,
  TAGLINE,
  WORDMARK,
} from "@/components/brand/logo-paths";
import { DotFigure } from "@/components/dot/DotFigure";
import { finishIntro, introRunning } from "@/lib/motion/intro";

/**
 * Stage 0 — Preloader (brief §5): max 2.5s, first visit only, skippable.
 *
 * The animation is pure CSS (styles/globals.css, "Preloader"), so it plays even
 * while JavaScript is still loading, and it hides itself even if JS never runs.
 * The page is fully rendered behind it — the preloader never hides a slow site.
 *
 *   0.00–0.80  pyramid outline draws          0.45–1.05  inner lines draw
 *   0.80–1.10  nodes pop                      0.95–1.35  the Dot drops onto the apex
 *   1.35–1.75  squash, bounce, eyes open      1.40–1.90  wordmark fades in
 *   1.90       blink                          2.15–2.50  fade out
 *
 * Skipped instantly by any click, key, wheel or touch.
 */
const DURATION_MS = 2500;

export function Preloader() {
  useEffect(() => {
    if (!introRunning()) return;
    const html = document.documentElement;
    const done = window.setTimeout(finishIntro, DURATION_MS);
    let skipTimer = 0;
    const skip = () => {
      html.classList.add("preload-skip");
      skipTimer = window.setTimeout(finishIntro, 260);
      remove();
    };
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    const remove = () => events.forEach((e) => window.removeEventListener(e, skip));
    events.forEach((e) => window.addEventListener(e, skip, { passive: true }));
    return () => {
      window.clearTimeout(done);
      window.clearTimeout(skipTimer);
      remove();
    };
  }, []);

  const apexLeft = `${(APEX.cx / MARK_VIEWBOX.width) * 100}%`;
  const apexTop = `${(APEX.cy / MARK_VIEWBOX.height) * 100}%`;
  const dotSize = `calc(var(--pre-w) * ${((2 * APEX.r) / MARK_VIEWBOX.width).toFixed(4)})`;

  return (
    <div className="preloader" aria-hidden>
      <div className="preloader-inner">
        <div className="relative" style={{ width: "var(--pre-w)" }}>
          <svg
            viewBox={`0 0 ${MARK_VIEWBOX.width} ${MARK_VIEWBOX.height}`}
            className="w-full"
            fill="none"
          >
            <path
              data-pre-line=""
              d={PYRAMID_OUTLINE}
              pathLength={1}
              stroke="var(--pn-logo-line)"
              strokeWidth={9.78641}
            />
            <path
              data-pre-line="inner"
              d={PYRAMID_INNER}
              pathLength={1}
              stroke="var(--pn-logo-line)"
              strokeWidth={9.78641}
            />
            {[NODE_LEFT, NODE_RIGHT, NODE_CENTRE].map((n, i) => (
              <circle
                key={i}
                data-pre-node=""
                cx={n.cx}
                cy={n.cy}
                r={n.r}
                fill="var(--pn-logo-node)"
                style={{ animationDelay: `${0.8 + i * 0.08}s` }}
              />
            ))}
          </svg>
          <div
            className="absolute"
            style={{ left: apexLeft, top: apexTop, transform: "translate(-50%, -50%)" }}
          >
            <div
              data-pre-dot=""
              style={{ width: `calc(${dotSize} * 1.25)`, height: `calc(${dotSize} * 1.25)` }}
            >
              <div data-pre-squash="" className="h-full w-full">
                <DotFigure uid="preloader" />
              </div>
            </div>
          </div>
        </div>
        <svg viewBox="390 45 655 185" className="preloader-wordmark mt-8" fill="none">
          <path d={WORDMARK} fill="var(--pn-logo-wordmark)" />
          <path d={TAGLINE} fill="var(--pn-logo-tagline)" />
        </svg>
      </div>
    </div>
  );
}
