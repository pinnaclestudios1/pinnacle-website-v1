/**
 * Custom cursor (brief §7: desktop only). Lazy-loaded by ExtrasRoot only on
 * fine-pointer desktops with motion allowed. Vanilla DOM, transform-only.
 * Text fields keep the native text cursor; everything degrades to the system
 * cursor if this never loads.
 *
 * Responsiveness:
 * - The dot is written straight from the pointer event (no easing, no waiting for
 *   a frame loop), so it sits exactly under the pointer.
 * - The ring follows with frame-rate-independent easing (~60ms to catch up), so it
 *   trails a touch without ever feeling slow, even on 120Hz screens or busy frames.
 * - No mix-blend-mode (it forces the page under the cursor to repaint every frame).
 *   Over the night footer the colours switch to cream instead.
 */
const INTERACTIVE = "a, button, summary, label, select, [role='button'], [data-cursor='hover']";
const TEXT =
  "input:not([type='checkbox']):not([type='radio']):not([type='submit']), textarea, [contenteditable='true']";
const DARK = ".theme-night";

let teardown: (() => void) | null = null;

export function start() {
  if (teardown) return;
  const html = document.documentElement;
  const dot = document.createElement("div");
  const ring = document.createElement("div");
  dot.setAttribute("aria-hidden", "true");
  ring.setAttribute("aria-hidden", "true");
  dot.className = "pn-cursor-dot";
  ring.className = "pn-cursor-ring";
  document.body.append(ring, dot);
  html.classList.add("has-custom-cursor");

  const target = { x: -100, y: -100 };
  const pos = { x: -100, y: -100 };
  let scale = 1;
  let wantScale = 1;
  let hidden = true;
  let dark = false;
  let frame = 0;
  let lastT = 0;

  const render = (now: number) => {
    const dt = lastT ? Math.min(64, now - lastT) : 16;
    lastT = now;
    const k = 1 - Math.exp(-dt / 45); // time constant 45ms
    pos.x += (target.x - pos.x) * k;
    pos.y += (target.y - pos.y) * k;
    scale += (wantScale - scale) * (1 - Math.exp(-dt / 70));
    ring.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${scale})`;
    const settled =
      Math.abs(target.x - pos.x) < 0.2 &&
      Math.abs(target.y - pos.y) < 0.2 &&
      Math.abs(wantScale - scale) < 0.005;
    if (settled) {
      frame = 0;
      lastT = 0;
    } else {
      frame = requestAnimationFrame(render);
    }
  };
  const kick = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  const setHidden = (h: boolean) => {
    if (h === hidden) return;
    hidden = h;
    dot.style.opacity = h ? "0" : "1";
    ring.style.opacity = h ? "0" : "1";
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    target.x = e.clientX;
    target.y = e.clientY;
    dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
    if (hidden && pos.x < -50) {
      // First move: start the ring under the pointer instead of flying in from a corner.
      pos.x = target.x;
      pos.y = target.y;
    }
    const el = e.target instanceof Element ? e.target : null;
    setHidden(!!el?.closest(TEXT));
    wantScale = el?.closest(INTERACTIVE) ? 1.7 : 1;
    const nowDark = !!el?.closest(DARK);
    if (nowDark !== dark) {
      dark = nowDark;
      html.classList.toggle("cursor-on-dark", dark);
    }
    kick();
  };
  const onLeave = () => setHidden(true);
  const onDown = () => {
    wantScale *= 0.8;
    kick();
  };
  const onUp = () => {
    wantScale /= 0.8;
    kick();
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerleave", onLeave);
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });

  teardown = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerleave", onLeave);
    window.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointerup", onUp);
    dot.remove();
    ring.remove();
    html.classList.remove("has-custom-cursor", "cursor-on-dark");
    teardown = null;
  };
}

export function stop() {
  teardown?.();
}
