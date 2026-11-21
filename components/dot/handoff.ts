import { onFrame } from "@/lib/motion/scroll";
import type { DotActor } from "./types";

/**
 * The hand-off flight. Only one Dot is ever on screen, but control passes between
 * Dots in different places (the guide in the margin, the one riding a home stage,
 * the footer summit…). Instead of one fading out and another fading in, a copy of
 * the Dot hops in an arc from where it was to where it is going, then the real
 * Dot takes over exactly where the copy lands.
 *
 * - The target is tracked live every frame, so it lands correctly while the page scrolls.
 * - A new hand-off mid-flight just re-aims the copy from wherever it is.
 * - Transform only; reduced motion never flies (the controller falls back to a fade).
 */

type Box = { x: number; y: number; w: number; h: number }; // x, y = centre

const toBox = (r: DOMRect): Box => ({
  x: r.left + r.width / 2,
  y: r.top + r.height / 2,
  w: r.width,
  h: r.height,
});

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class DotFlight {
  private el: HTMLDivElement | null = null;
  private baseW = 1;
  private baseH = 1;
  private from: Box = { x: 0, y: 0, w: 1, h: 1 };
  private cur: Box = this.from;
  private last: Box = this.from;
  private target: DotActor | null = null;
  private t0 = 0;
  private dur = 600;
  private arc = 0;
  /** Unsubscribes the per-frame step (runs right after Lenis, before GSAP renders). */
  private stop: (() => void) | null = null;
  private land: (() => void) | null = null;

  get active() {
    return this.target !== null;
  }

  /**
   * Fly from `source` (or from the copy's current spot, mid-flight) to `target`.
   * Returns false when there is nothing to fly (no source box, target not rendered,
   * or they are already in the same place) — the caller then swaps directly.
   */
  fly(source: DotActor | null, target: DotActor, land: () => void): boolean {
    const to = target.getBounds();
    if (!to) {
      this.cancel();
      return false;
    }
    if (!this.active || !this.el) {
      const r = source?.getBounds();
      const clone = r ? source!.cloneFigure() : null;
      if (!r || !clone) return false;
      this.mount(clone, toBox(r));
    }

    // A Dot that has just scrolled off screen enters from the nearest edge.
    const vh = window.innerHeight;
    const start = {
      ...this.cur,
      y: Math.min(vh + this.cur.h / 2, Math.max(-this.cur.h / 2, this.cur.y)),
    };
    const end = toBox(to);
    const dist = Math.hypot(end.x - start.x, end.y - start.y);
    if (dist < 4) {
      this.cancel();
      return false;
    }

    this.from = start;
    this.cur = start;
    this.last = end;
    this.target = target;
    this.land = land;
    this.dur = Math.min(900, Math.max(420, 360 + dist * 0.45));
    this.arc = Math.min(140, dist * 0.28);
    this.t0 = performance.now();
    if (!this.stop) this.stop = onFrame(this.tick);
    return true;
  }

  /** Stop without landing (e.g. the menu or the page curtain takes over). */
  cancel() {
    this.stop?.();
    this.stop = null;
    this.target = null;
    this.land = null;
    this.el?.remove();
    this.el = null;
  }

  private mount(clone: HTMLElement, b: Box) {
    this.el?.remove();
    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("data-dot-flyer", "");
    Object.assign(el.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: `${b.w}px`,
      height: `${b.h}px`,
      zIndex: "var(--pn-z-dot)",
      pointerEvents: "none",
      willChange: "transform",
    });
    clone.removeAttribute("data-dot-actor");
    Object.assign(clone.style, {
      transform: "none",
      opacity: "1",
      visibility: "visible",
      width: "100%",
      height: "100%",
    });
    el.append(clone);
    document.body.append(el);
    this.el = el;
    this.baseW = b.w;
    this.baseH = b.h;
    this.cur = b;
    this.paint(b, 0, 0);
  }

  private paint(b: Box, tilt: number, stretch: number) {
    if (!this.el) return;
    const s = b.w / this.baseW;
    this.el.style.transform =
      `translate3d(${b.x - this.baseW / 2}px, ${b.y - this.baseH / 2}px, 0) ` +
      `rotate(${tilt}deg) scale(${s * (1 - stretch * 0.6)}, ${s * (1 + stretch)})`;
  }

  private tick = () => {
    const now = performance.now();
    const target = this.target;
    if (!target) {
      this.stop?.();
      this.stop = null;
      return;
    }
    const live = target.getBounds();
    if (live) this.last = toBox(live);
    const { from, last: end } = this;

    const t = Math.min(1, (now - this.t0) / this.dur);
    const e = easeInOut(t);
    const lift = Math.sin(Math.PI * t);
    const b: Box = {
      x: from.x + (end.x - from.x) * e,
      y: from.y + (end.y - from.y) * e - this.arc * lift,
      w: from.w + (end.w - from.w) * e,
      h: from.h + (end.h - from.h) * e,
    };
    this.cur = b;
    const dx = end.x - from.x;
    const dist = Math.hypot(dx, end.y - from.y) || 1;
    // Lean into the direction of travel and stretch a touch at the top of the hop.
    this.paint(b, (dx / dist) * 14 * lift, 0.07 * lift);

    if (t < 1) return;
    this.stop?.();
    this.stop = null;
    const land = this.land;
    this.target = null;
    this.land = null;
    land?.(); // the real Dot appears in this same frame…
    this.el?.remove(); // …so removing the copy is seamless.
    this.el = null;
  };
}
