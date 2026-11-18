"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/motion/reduced-motion";
import { useMediaQuery } from "@/lib/use-media-query";

/**
 * Lazy scene choreography (brief §11: heavy scenes load only when the visitor nears them).
 * Drop <SceneMotion scene="climb" /> inside a [data-scene] section; its motion module
 * is fetched when the section comes within one screen, and torn down on unmount or when
 * reduced-motion / desktop changes.
 */
export type SceneEnv = { reduced: boolean; desktop: boolean };
export type SceneInit = (root: HTMLElement, env: SceneEnv) => () => void;

const loaders = {
  hero: () => import("./motion/hero"),
  path: () => import("./motion/path"),
  climb: () => import("./motion/climb"),
  peaks: () => import("./motion/peaks"),
  blueprint: () => import("./motion/blueprint"),
} satisfies Record<string, () => Promise<{ init: SceneInit }>>;

export type SceneName = keyof typeof loaders;

export function SceneMotion({ scene }: { scene: SceneName }) {
  const marker = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 1024px)");

  useEffect(() => {
    const root = marker.current?.closest<HTMLElement>("[data-scene]");
    if (!root) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        loaders[scene]()
          .then((m) => {
            if (cancelled) return;
            cleanup = m.init(root, { reduced, desktop });
            // Exposed for QA: which scenes initialised, and in which mode.
            root.setAttribute(
              "data-motion",
              `${desktop ? "desktop" : "mobile"}${reduced ? "-reduced" : ""}`,
            );
          })
          .catch((err: unknown) => console.error(`[scene:${scene}] failed to load`, err));
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(root);

    return () => {
      cancelled = true;
      io.disconnect();
      cleanup?.();
      root.removeAttribute("data-motion");
    };
  }, [scene, reduced, desktop]);

  return <span ref={marker} hidden />;
}
