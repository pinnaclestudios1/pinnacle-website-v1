"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import { useReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * Muted, looping video (brief §11: compressed, muted, with poster).
 * Plays only while on screen (or only on hover for cards), never under reduced motion —
 * then the poster shows and the visitor can press play.
 */
export function LoopVideo({
  src,
  poster,
  label,
  hoverOnly = false,
  className,
}: {
  src: string;
  poster?: string;
  label: string;
  hoverOnly?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  // Analytics: first play of each video (brief §11 "video plays").
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onPlay = () => track("video_play", { label });
    v.addEventListener("play", onPlay, { once: true });
    return () => v.removeEventListener("play", onPlay);
  }, [label]);

  useEffect(() => {
    const v = ref.current;
    if (!v || reduced) return;
    if (hoverOnly) {
      const host = v.closest("a, [data-hover-host]") ?? v;
      const play = () => void v.play().catch(() => {});
      const stop = () => v.pause();
      host.addEventListener("pointerenter", play);
      host.addEventListener("pointerleave", stop);
      host.addEventListener("focusin", play);
      host.addEventListener("focusout", stop);
      return () => {
        host.removeEventListener("pointerenter", play);
        host.removeEventListener("pointerleave", stop);
        host.removeEventListener("focusin", play);
        host.removeEventListener("focusout", stop);
      };
    }
    const io = new IntersectionObserver(
      ([e]) => (e?.isIntersecting ? void v.play().catch(() => {}) : v.pause()),
      {
        threshold: 0.25,
      },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduced, hoverOnly]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
      controls={reduced}
      className={className}
    />
  );
}
