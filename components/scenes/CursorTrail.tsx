"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

const COUNT = 10;

/**
 * Hero cursor trail (brief §5 Stage 1): a faint chain of grey dots behind the
 * cursor — the Dot's eyes follow it via the global "look" behaviour.
 * Fine pointers only, off under reduced motion, transform/opacity only,
 * and the rAF loop runs only while the pointer is inside the hero.
 */
export function CursorTrail() {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = layer.current;
    const hero = el?.parentElement;
    if (!el || !hero) return;
    if (!window.matchMedia("(pointer: fine)").matches || prefersReducedMotion()) return;

    const dots = Array.from(el.children) as HTMLElement[];
    const pts = dots.map(() => ({ x: 0, y: 0 }));
    const target = { x: 0, y: 0 };
    let frame = 0;
    let inside = false;
    let lastMove = 0;
    let lastTick = 0;

    const tick = (now: number) => {
      // Same feel at 60, 120 or 144 Hz: the easing step scales with the frame time.
      const dt = lastTick ? Math.min(50, now - lastTick) : 16.7;
      lastTick = now;
      const k = 1 - Math.pow(0.65, dt / 16.7);
      const idle = now - lastMove > 600;
      pts.forEach((p, i) => {
        const lead = i === 0 ? target : pts[i - 1]!;
        p.x += (lead.x - p.x) * k;
        p.y += (lead.y - p.y) * k;
        const d = dots[i]!;
        d.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scale(${1 - i / (COUNT * 1.4)})`;
        d.style.opacity = idle ? "0" : String(0.35 * (1 - i / COUNT));
      });
      frame = inside || !idle ? requestAnimationFrame(tick) : 0;
      if (!frame) lastTick = 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = hero.getBoundingClientRect();
      target.x = e.clientX - r.left;
      target.y = e.clientY - r.top;
      if (!inside) pts.forEach((p) => Object.assign(p, target));
      inside = true;
      lastMove = performance.now();
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      inside = false;
      lastMove = 0;
    };

    hero.addEventListener("pointermove", onMove, { passive: true });
    hero.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={layer} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: COUNT }, (_, i) => (
        <span
          key={i}
          className="absolute top-0 left-0 -mt-[3px] -ml-[3px] block size-1.5 rounded-full bg-line opacity-0 transition-opacity duration-300"
        />
      ))}
    </div>
  );
}
