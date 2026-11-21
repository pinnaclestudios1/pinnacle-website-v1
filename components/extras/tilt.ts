import { gsap } from "@/lib/motion/gsap";

/**
 * 3D pointer tilt (desktop, fine pointer, motion allowed — loaded lazily by ExtrasRoot).
 *
 *   <a data-tilt-area>            the region that responds to the pointer
 *     <div data-tilt>             what tilts (perspective rotation, transform only)
 *       … <span data-tilt-glare>  optional light sheen that follows the pointer
 *
 * An area can hold several [data-tilt] layers at different depths (the hero's terrain
 * tilts less than the pyramid and drifts the other way — parallax). A [data-tilt]
 * without an area responds to the pointer over itself.
 *   data-tilt-max   maximum angle in degrees (default 6)
 *   data-tilt-shift sideways drift in px, opposite the pointer (default 0)
 * The pivot is the element's own transform-origin, so the hero mark pivots on its apex
 * (where the Dot sits).
 *
 * One delegated listener; GSAP quickTo eases every value, so motion is smooth and
 * frame-rate independent, and GSAP renders it in the same frame as everything else.
 * Reads (one getBoundingClientRect) happen in the pointer event, before any writes.
 */
type Tilt = {
  rx: gsap.QuickToFunc;
  ry: gsap.QuickToFunc;
  x: gsap.QuickToFunc | null;
  y: gsap.QuickToFunc | null;
  max: number;
  shift: number;
  glare: { x: gsap.QuickToFunc; y: gsap.QuickToFunc; o: gsap.QuickToFunc } | null;
};

let teardown: (() => void) | null = null;

export function start() {
  if (teardown) return;
  const html = document.documentElement;
  html.classList.add("has-tilt");
  const cache = new WeakMap<HTMLElement, Tilt>();
  let current: { area: HTMLElement; layers: Tilt[] } | null = null;

  const setup = (el: HTMLElement): Tilt => {
    const found = cache.get(el);
    if (found) return found;
    gsap.set(el, { transformPerspective: 900 });
    const ease = { duration: 0.7, ease: "power3.out" };
    const shift = Number(el.dataset.tiltShift) || 0;
    const glareEl = el.querySelector<HTMLElement>("[data-tilt-glare]");
    const t: Tilt = {
      rx: gsap.quickTo(el, "rotationX", ease),
      ry: gsap.quickTo(el, "rotationY", ease),
      x: shift ? gsap.quickTo(el, "x", ease) : null,
      y: shift ? gsap.quickTo(el, "y", ease) : null,
      max: Number(el.dataset.tiltMax) || 6,
      shift,
      glare: glareEl
        ? {
            x: gsap.quickTo(glareEl, "xPercent", ease),
            y: gsap.quickTo(glareEl, "yPercent", ease),
            o: gsap.quickTo(glareEl, "opacity", { duration: 0.5, ease: "power2.out" }),
          }
        : null,
    };
    cache.set(el, t);
    return t;
  };

  const release = (layers: Tilt[]) =>
    layers.forEach((t) => {
      t.rx(0);
      t.ry(0);
      t.x?.(0);
      t.y?.(0);
      t.glare?.o(0);
    });

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const target = e.target instanceof Element ? e.target : null;
    const area = target?.closest<HTMLElement>("[data-tilt-area], [data-tilt]") ?? null;

    if (current && current.area !== area) {
      release(current.layers);
      current = null;
    }
    if (!area) return;
    if (!current) {
      const els = area.matches("[data-tilt]")
        ? [area]
        : Array.from(area.querySelectorAll<HTMLElement>("[data-tilt]"));
      if (!els.length) return;
      current = { area, layers: els.map(setup) };
    }

    const r = area.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) - 0.5; // -0.5…0.5
    const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) - 0.5;
    for (const t of current.layers) {
      t.ry(px * 2 * t.max);
      t.rx(-py * 2 * t.max);
      t.x?.(-px * 2 * t.shift);
      t.y?.(-py * 2 * t.shift);
      if (t.glare) {
        t.glare.x(px * 50);
        t.glare.y(py * 50);
        t.glare.o(1);
      }
    }
  };

  const onLeave = () => {
    if (current) release(current.layers);
    current = null;
  };

  document.addEventListener("pointermove", onMove, { passive: true });
  html.addEventListener("pointerleave", onLeave);
  window.addEventListener("blur", onLeave);

  teardown = () => {
    document.removeEventListener("pointermove", onMove);
    html.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("blur", onLeave);
    onLeave();
    html.classList.remove("has-tilt");
    teardown = null;
  };
}

export function stop() {
  teardown?.();
}
