"use client";

import { gsap } from "@/lib/motion/gsap";
import {
  ACCESSORIES,
  type Accessory,
  type BaseOptions,
  type BaseState,
  type DotActor,
  type Point,
  type Reaction,
} from "./types";

/**
 * SVG + GSAP renderer for the Dot (see DotFigure for the artwork).
 *
 * Motion rules (brief §9): only transform and opacity animate; the Dot is
 * springy with overshoot — squash on landing, stretch on jump.
 * Reduced motion: the Dot stays still and only blinks (brief §3); reactions
 * become simple face changes and glow fades, and moves become cross-fades.
 */

/** Squash and stretch from the bottom of the body. */
const SQ = { svgOrigin: "0 40" } as const;
/** Rotate around the body centre. */
const ROT = { svgOrigin: "0 0" } as const;

type Parts = {
  shadow: SVGElement;
  pos: SVGElement;
  halo: SVGElement;
  squash: SVGElement;
  rot: SVGElement;
  face: SVGElement;
  gaze: SVGElement;
  open: SVGElement[];
  closed: SVGElement[];
  happy: SVGElement[];
  spiral: SVGElement[];
  smile: SVGElement;
  mouthO: SVGElement;
  worry: SVGElement;
  zzz: SVGElement[];
  confettiGroup: SVGElement;
  confetti: SVGElement[];
  acc: Record<Accessory, SVGElement>;
};

export class SvgDotActor implements DotActor {
  private readonly root: HTMLElement;
  private readonly p: Parts;
  private loop: gsap.core.Timeline | null = null;
  private reactionTl: gsap.core.Timeline | null = null;
  private resolveReaction: (() => void) | null = null;
  private blinkCall: gsap.core.Tween | null = null;
  private base: BaseState = "idle";
  private baseOpts: BaseOptions = {};
  private reduced = false;
  private visible = false;
  private accessories: ReadonlySet<Accessory> = new Set();
  private labelCount = 0;
  private readonly faceX: gsap.QuickToFunc;
  private readonly faceY: gsap.QuickToFunc;

  constructor(root: HTMLElement) {
    this.root = root;
    const one = (name: string) => {
      const el = root.querySelector<SVGElement>(`[data-part="${name}"]`);
      if (!el) throw new Error(`Dot part missing: ${name}`);
      return el;
    };
    const all = (name: string) =>
      Array.from(root.querySelectorAll<SVGElement>(`[data-part="${name}"]`));

    this.p = {
      shadow: one("shadow"),
      pos: one("pos"),
      halo: one("halo"),
      squash: one("squash"),
      rot: one("rot"),
      face: one("face"),
      gaze: one("gaze"),
      open: all("eye-open"),
      closed: all("eye-closed"),
      happy: all("eye-happy"),
      spiral: all("eye-spiral"),
      smile: one("mouth-smile"),
      mouthO: one("mouth-o"),
      worry: one("mouth-worry"),
      zzz: all("z"),
      confettiGroup: one("confetti-group"),
      confetti: all("confetti"),
      acc: {
        sunglasses: one("acc-sunglasses"),
        nightcap: one("acc-nightcap"),
        flag: one("acc-flag"),
        map: one("acc-map"),
      },
    };

    gsap.set(root, { autoAlpha: 0 });
    this.faceX = gsap.quickTo(this.p.face, "x", { duration: 0.45, ease: "power3.out" });
    this.faceY = gsap.quickTo(this.p.face, "y", { duration: 0.45, ease: "power3.out" });
    this.neutral();
  }

  /* ================================================================ public API */

  setBase(state: BaseState, opts: BaseOptions = {}) {
    this.base = state;
    this.baseOpts = opts;
    if (this.reactionTl) return; // rebuilt when the reaction finishes
    this.buildBase();
  }

  play(reaction: Reaction): Promise<void> {
    this.interruptReaction();
    this.stopLoop();
    this.neutral();
    const tl = this.reduced ? this.reducedReaction(reaction) : this.fullReaction(reaction);
    if (!tl) {
      this.buildBase();
      return Promise.resolve();
    }
    return this.run(tl);
  }

  moveTo(target: Point | null): Promise<void> {
    const root = this.root;
    const x0 = Number(gsap.getProperty(root, "x")) || 0;
    const y0 = Number(gsap.getProperty(root, "y")) || 0;
    let tx = 0;
    let ty = 0;
    if (target) {
      const r = root.getBoundingClientRect();
      tx = x0 + target.x - (r.left + r.width / 2);
      ty = y0 + target.y - (r.top + r.height / 2);
    }
    const dist = Math.hypot(tx - x0, ty - y0);
    if (dist < 1) return Promise.resolve();

    this.interruptReaction();
    this.stopLoop();
    this.neutral();
    const p = this.p;
    const tl = gsap.timeline();

    if (this.reduced) {
      tl.to(root, { opacity: 0, duration: 0.2 })
        .set(root, { x: tx, y: ty })
        .to(root, { opacity: 1, duration: 0.2 });
      return this.run(tl);
    }

    const d = gsap.utils.clamp(0.45, 1.1, 0.3 + dist / 1100);
    const peak = Math.min(y0, ty) - Math.max(36, dist * 0.22);
    const dir = tx >= x0 ? 1 : -1;
    tl.to(p.squash, { scaleX: 1.15, scaleY: 0.85, duration: 0.1, ...SQ }, 0)
      .to(root, { x: tx, duration: d, ease: "power1.inOut" }, 0.1)
      .to(
        root,
        {
          keyframes: [
            { y: peak, duration: d / 2, ease: "power2.out" },
            { y: ty, duration: d / 2, ease: "power2.in" },
          ],
        },
        0.1,
      )
      .to(p.squash, { scaleX: 0.9, scaleY: 1.12, duration: 0.18, ...SQ }, 0.1)
      .to(p.squash, { scaleX: 1, scaleY: 1, duration: 0.2, ...SQ }, 0.1 + d * 0.4)
      .to(p.rot, { rotation: 14 * dir, duration: d / 2, ease: "sine.out", ...ROT }, 0.1)
      .to(p.rot, { rotation: 0, duration: d / 2, ease: "sine.in", ...ROT }, 0.1 + d / 2)
      .to(p.shadow, { opacity: 0, duration: 0.12 }, 0.1)
      .to(p.shadow, { opacity: 1, duration: 0.12 }, d)
      .to(p.squash, { scaleX: 1.16, scaleY: 0.84, duration: 0.07, ...SQ }, 0.1 + d)
      .to(
        p.squash,
        { scaleX: 1, scaleY: 1, duration: 0.45, ease: "elastic.out(1, 0.45)", ...SQ },
        0.17 + d,
      );
    return this.run(tl);
  }

  lookAt(point: Point | null) {
    const canLook = !this.reduced && this.base === "idle" && !this.reactionTl && this.visible;
    if (!point || !canLook) {
      if (!point) {
        this.faceX(0);
        this.faceY(0);
      }
      return;
    }
    const r = this.root.getBoundingClientRect();
    const dx = point.x - (r.left + r.width / 2);
    const dy = point.y - (r.top + r.height / 2);
    const dist = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, dist / 260); // close cursor → smaller eye travel
    this.faceX((dx / dist) * 7 * k);
    this.faceY((dy / dist) * 5 * k);
  }

  setAccessories(accessories: ReadonlySet<Accessory>) {
    this.accessories = new Set(accessories);
    this.syncAccessories(true);
  }

  setReducedMotion(reduced: boolean) {
    if (reduced === this.reduced) return;
    this.reduced = reduced;
    this.interruptReaction();
    if (reduced) gsap.set(this.root, { x: 0, y: 0 });
    this.buildBase();
  }

  setVisible(visible: boolean, instant = false) {
    if (visible === this.visible) return;
    this.visible = visible;
    if (instant) {
      gsap.killTweensOf(this.root, "opacity,visibility");
      gsap.set(this.root, { autoAlpha: visible ? 1 : 0 });
    } else {
      gsap.to(this.root, { autoAlpha: visible ? 1 : 0, duration: 0.25, overwrite: "auto" });
    }
    if (visible) this.loop?.resume();
    else this.loop?.pause();
  }

  getBounds() {
    if (!this.root.isConnected) return null;
    const r = this.root.getBoundingClientRect();
    return r.width > 0 && r.height > 0 ? r : null;
  }

  cloneFigure() {
    return this.root.isConnected ? (this.root.cloneNode(true) as HTMLElement) : null;
  }

  boop() {
    if (this.reduced || this.reactionTl) return;
    gsap
      .timeline()
      .to(this.p.squash, { scaleX: 1.14, scaleY: 0.86, duration: 0.08, ...SQ })
      .to(this.p.squash, {
        scaleX: 1,
        scaleY: 1,
        duration: 0.45,
        ease: "elastic.out(1, 0.4)",
        ...SQ,
      });
  }

  destroy() {
    this.interruptReaction();
    this.stopLoop();
    this.stopBlink();
    gsap.killTweensOf([this.root, ...this.allParts(), ...Object.values(this.p.acc)]);
  }

  /* ================================================================ base states */

  private buildBase() {
    this.stopLoop();
    this.neutral();
    this.syncAccessories(false);
    const p = this.p;
    const r = this.reduced;
    if (this.baseOpts.gaze) gsap.set(p.gaze, this.baseOpts.gaze);
    if (this.base !== "idle") {
      this.faceX(0);
      this.faceY(0);
    }

    switch (this.base) {
      case "idle":
        this.startBlink();
        if (!r) this.loop = this.breathe(2.4, 0.035);
        break;

      case "curious": {
        // Leans toward the thing, eyes widen.
        this.startBlink();
        const dir = this.directionTo(this.baseOpts.toward);
        if (r) {
          gsap.set(p.open, { scale: 1.2, transformOrigin: "50% 50%" });
        } else {
          this.loop = gsap
            .timeline()
            .to(p.rot, { rotation: 12 * dir, duration: 0.5, ease: "back.out(2)", ...ROT }, 0)
            .to(p.gaze, { x: 7 * dir, y: -1, duration: 0.4, ease: "power3.out" }, 0)
            .to(
              p.open,
              { scale: 1.25, duration: 0.3, ease: "back.out(3)", transformOrigin: "50% 50%" },
              0,
            );
        }
        break;
      }

      case "sleepy":
        // Yawns, eyes close, tiny "z".
        this.stopBlink();
        if (r) {
          gsap.set(p.open, { opacity: 0 });
          gsap.set(p.closed, { opacity: 1 });
          gsap.set(p.zzz[0]!, { opacity: 0.9 });
        } else {
          this.loop = this.sleep();
        }
        break;

      case "lost":
        // Holds a tiny map, looks around.
        this.startBlink();
        gsap.set(p.worry, { opacity: 1 });
        if (!r) {
          this.loop = gsap
            .timeline({ repeat: -1, repeatDelay: 0.6 })
            .to(p.gaze, { x: -7, duration: 0.5, ease: "power2.inOut" })
            .to(p.rot, { rotation: -6, duration: 0.5, ease: "power2.inOut", ...ROT }, "<")
            .to(p.gaze, { x: 7, duration: 0.8, ease: "power2.inOut" }, "+=0.5")
            .to(p.rot, { rotation: 6, duration: 0.8, ease: "power2.inOut", ...ROT }, "<")
            .to(p.gaze, { x: 0, duration: 0.5, ease: "power2.inOut" }, "+=0.5")
            .to(p.rot, { rotation: 0, duration: 0.5, ease: "power2.inOut", ...ROT }, "<");
        }
        break;

      case "loading":
        // Rolls along a line across the screen (the curtain moves it; this spins it).
        this.startBlink();
        if (!r) {
          this.loop = gsap
            .timeline()
            .to(p.rot, { rotation: "+=360", duration: 0.7, ease: "none", repeat: -1, ...ROT });
        }
        break;
    }

    if (!this.visible) this.loop?.pause();
  }

  private breathe(duration: number, amount: number) {
    const p = this.p;
    return gsap
      .timeline({ repeat: -1, yoyo: true })
      .to(p.squash, { scaleX: 1 + amount, scaleY: 1 - amount, duration, ease: "sine.inOut", ...SQ })
      .to(
        p.shadow,
        { scaleX: 1 + amount, duration, ease: "sine.inOut", transformOrigin: "50% 50%" },
        0,
      );
  }

  private sleep() {
    const p = this.p;
    const zzz = gsap.timeline({ repeat: -1 });
    p.zzz.forEach((z, i) => {
      zzz
        .fromTo(
          z,
          { opacity: 0, x: -4, y: 8 },
          { opacity: 1, x: 0, y: 0, duration: 0.7, ease: "sine.out" },
          i * 0.9,
        )
        .to(z, { opacity: 0, x: 6, y: -10, duration: 0.9, ease: "sine.in" }, i * 0.9 + 1);
    });
    zzz.to({}, { duration: 0.6 });

    return gsap
      .timeline()
      .to(p.open, { scaleY: 0.4, duration: 0.4, ease: "power2.out", transformOrigin: "50% 50%" })
      .set(p.mouthO, { opacity: 1, scale: 0.3, transformOrigin: "50% 50%" }, "<")
      .to(p.mouthO, { scale: 1.25, duration: 0.7, ease: "sine.inOut" }, "<")
      .to(p.squash, { scaleX: 0.96, scaleY: 1.06, duration: 0.7, ease: "sine.inOut", ...SQ }, "<")
      .to(p.mouthO, { scale: 0.3, opacity: 0, duration: 0.45 })
      .to(p.squash, { scaleX: 1, scaleY: 1, duration: 0.45, ...SQ }, "<")
      .to(p.open, { opacity: 0, duration: 0.2 })
      .to(p.closed, { opacity: 1, duration: 0.2 }, "<")
      .add(this.breathe(3.4, 0.05))
      .add(zzz, "<");
  }

  /* ================================================================ reactions */

  private fullReaction(r: Reaction): gsap.core.Timeline {
    const p = this.p;
    const tl = gsap.timeline();

    switch (r) {
      case "guide": {
        // Hops ahead (phase 3 adds node-to-node hops via dot.goTo).
        tl.to(p.gaze, { x: 2, y: 2, duration: 0.2 }, 0);
        const landed = this.hop(tl, 16, 0);
        tl.to(p.gaze, { x: 0, y: 0, duration: 0.3 }, landed);
        break;
      }

      case "rollBack":
        // Rolls backwards, slightly flustered.
        tl.set(p.worry, { opacity: 1 }, 0)
          .to(p.open, { scaleY: 0.75, duration: 0.1, transformOrigin: "50% 50%" }, 0)
          .to(p.rot, { rotation: -200, duration: 0.42, ease: "power2.out", ...ROT }, 0)
          .to(p.pos, { x: -18, duration: 0.42, ease: "power2.out" }, 0)
          .to(p.rot, { rotation: 0, duration: 0.5, ease: "power2.inOut", ...ROT }, 0.5)
          .to(p.pos, { x: 0, duration: 0.5, ease: "power2.inOut" }, 0.5)
          .to(p.open, { scaleY: 1, duration: 0.15 }, 0.9);
        break;

      case "dizzy":
        // Spiral eyes for 1s.
        tl.set(p.open, { opacity: 0 }, 0)
          .set([...p.spiral, p.worry], { opacity: 1 }, 0)
          .to(p.spiral, { rotation: 720, duration: 1, ease: "none", transformOrigin: "50% 50%" }, 0)
          .to(
            p.rot,
            {
              keyframes: { rotation: [0, -10, 9, -7, 5, 0], easeEach: "sine.inOut" },
              duration: 1,
              ...ROT,
            },
            0,
          )
          .to(p.gaze, { keyframes: { x: [0, 3, -3, 2, 0] }, duration: 1 }, 0);
        break;

      case "excited": {
        // Quick double bounce, glow brightens.
        tl.to(
          p.halo,
          { opacity: 1, scale: 1.2, duration: 0.2, ease: "power2.out", transformOrigin: "50% 50%" },
          0,
        ).to(p.open, { scale: 1.15, duration: 0.15, transformOrigin: "50% 50%" }, 0);
        const first = this.hop(tl, 14, 0, 0.16, 0.14);
        const second = this.hop(tl, 14, first - 0.05, 0.16, 0.14);
        tl.to(p.halo, { opacity: 0.75, scale: 1, duration: 0.6 }, second).to(
          p.open,
          { scale: 1, duration: 0.3 },
          second,
        );
        break;
      }

      case "wake": {
        // Startled hop, then smile.
        tl.set(p.open, { scale: 1.35, transformOrigin: "50% 50%" }, 0).set(
          p.mouthO,
          { opacity: 1, scale: 0.9, transformOrigin: "50% 50%" },
          0,
        );
        const landed = this.hop(tl, 28, 0, 0.18, 0.2);
        tl.set(p.mouthO, { opacity: 0 }, landed)
          .set(p.open, { opacity: 0, scale: 1 }, landed)
          .set([p.smile, ...p.happy], { opacity: 1 }, landed)
          .to({}, { duration: 0.9 }, landed);
        break;
      }

      case "celebrate":
        // Big jump, confetti in orange and cream, glow.
        tl.set(p.open, { opacity: 0 }, 0)
          .set([p.smile, ...p.happy], { opacity: 1 }, 0)
          .to(
            p.squash,
            { scaleX: 1.18, scaleY: 0.82, duration: 0.16, ease: "power2.out", ...SQ },
            0,
          )
          .to(p.pos, { y: -72, duration: 0.4, ease: "power2.out" }, 0.16)
          .to(p.squash, { scaleX: 0.88, scaleY: 1.14, duration: 0.2, ...SQ }, 0.16)
          .to(p.squash, { scaleX: 1, scaleY: 1, duration: 0.2, ...SQ }, 0.36)
          .to(p.rot, { rotation: 360, duration: 0.6, ease: "power2.inOut", ...ROT }, 0.2)
          .to(
            p.shadow,
            { scaleX: 0.4, opacity: 0.3, duration: 0.4, transformOrigin: "50% 50%" },
            0.16,
          )
          .to(p.halo, { opacity: 1, scale: 1.35, duration: 0.3, transformOrigin: "50% 50%" }, 0.16)
          .set(p.confettiGroup, { y: -60 }, 0.42)
          .add(this.confetti(), 0.42)
          .to(p.pos, { y: 0, duration: 0.34, ease: "power2.in" }, 0.56)
          .to(p.shadow, { scaleX: 1, opacity: 1, duration: 0.34, ease: "power2.in" }, 0.56)
          .to(p.squash, { scaleX: 1.18, scaleY: 0.82, duration: 0.08, ...SQ }, 0.9)
          .to(
            p.squash,
            { scaleX: 1, scaleY: 1, duration: 0.5, ease: "elastic.out(1, 0.4)", ...SQ },
            0.98,
          )
          .to(p.halo, { opacity: 0.75, scale: 1, duration: 0.8 }, 1)
          .to({}, { duration: 0.4 }, 1.6);
        break;

      case "backflip":
        // Easter egg: 5 clicks.
        tl.set([p.smile, ...p.happy], { opacity: 1 }, 0)
          .set(p.open, { opacity: 0 }, 0)
          .to(p.squash, { scaleX: 1.16, scaleY: 0.84, duration: 0.12, ...SQ }, 0)
          .to(p.pos, { y: -56, duration: 0.32, ease: "power2.out" }, 0.12)
          .to(p.rot, { rotation: -360, duration: 0.56, ease: "power1.inOut", ...ROT }, 0.14)
          .to(
            p.shadow,
            { scaleX: 0.5, opacity: 0.4, duration: 0.32, transformOrigin: "50% 50%" },
            0.12,
          )
          .to(p.pos, { y: 0, duration: 0.26, ease: "power2.in" }, 0.44)
          .to(p.shadow, { scaleX: 1, opacity: 1, duration: 0.26 }, 0.44)
          .to(p.squash, { scaleX: 1.16, scaleY: 0.84, duration: 0.07, ...SQ }, 0.7)
          .to(
            p.squash,
            { scaleX: 1, scaleY: 1, duration: 0.45, ease: "elastic.out(1, 0.45)", ...SQ },
            0.77,
          )
          .to({}, { duration: 0.3 }, 1.1);
        break;

      case "wave": {
        // Hello! No arms on the site, so the whole body waves (brief §3 Design rules).
        tl.set(p.open, { opacity: 0 }, 0)
          .set([p.smile, ...p.happy], { opacity: 1 }, 0)
          .to(
            p.rot,
            {
              keyframes: { rotation: [0, -14, 12, -10, 8, 0], easeEach: "sine.inOut" },
              duration: 1.1,
              ...ROT,
            },
            0,
          );
        this.hop(tl, 10, 0.05, 0.14, 0.12);
        tl.to({}, { duration: 0.25 }, 1.1);
        break;
      }

      case "drop": {
        // Entrance: drops in from above (e.g. into the open mobile menu).
        tl.fromTo(
          p.pos,
          { y: -150, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.42, ease: "power2.in" },
          0,
        )
          .fromTo(
            p.shadow,
            { scaleX: 0.3, opacity: 0, transformOrigin: "50% 50%" },
            { scaleX: 1, opacity: 1, duration: 0.42, ease: "power2.in" },
            0,
          )
          .to(p.squash, { scaleX: 1.22, scaleY: 0.78, duration: 0.08, ...SQ }, 0.42);
        this.hop(tl, 12, 0.5, 0.16, 0.14);
        break;
      }
    }
    return tl;
  }

  /** Reduced motion: no movement — face changes and glow fades only. */
  private reducedReaction(r: Reaction): gsap.core.Timeline | null {
    const p = this.p;
    const tl = gsap.timeline();
    switch (r) {
      case "excited":
        tl.to(p.halo, { opacity: 1, duration: 0.2 }).to(p.halo, { opacity: 0.75, duration: 0.6 });
        return tl;
      case "celebrate":
        tl.set(p.open, { opacity: 0 })
          .set([p.smile, ...p.happy], { opacity: 1 })
          .to(p.halo, { opacity: 1, duration: 0.3 })
          .to(p.halo, { opacity: 0.75, duration: 0.8 }, "+=0.8");
        return tl;
      case "wake":
      case "wave":
        tl.set(p.smile, { opacity: 1 }).to({}, { duration: 0.9 });
        return tl;
      case "dizzy":
        tl.set(p.open, { opacity: 0 }).set(p.spiral, { opacity: 1 }).to({}, { duration: 1 });
        return tl;
      case "drop":
        tl.fromTo(p.pos, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        return tl;
      default:
        return null; // guide, rollBack, backflip are pure movement — skipped
    }
  }

  /** Adds a squash-hop-squash to `tl` at `at`; returns the time it has landed. */
  private hop(tl: gsap.core.Timeline, height: number, at: number, up = 0.22, down = 0.2) {
    const { pos, squash, shadow } = this.p;
    const label = `hop${this.labelCount++}`;
    tl.addLabel(label, at);
    const t = (offset: number) => `${label}+=${offset}`;
    tl.to(squash, { scaleX: 1.14, scaleY: 0.86, duration: 0.08, ease: "power1.out", ...SQ }, label)
      .to(pos, { y: -height, duration: up, ease: "power2.out" }, t(0.08))
      .to(
        squash,
        { scaleX: 0.9, scaleY: 1.12, duration: up * 0.5, ease: "power1.out", ...SQ },
        t(0.08),
      )
      .to(
        squash,
        { scaleX: 1, scaleY: 1, duration: up * 0.5, ease: "power1.in", ...SQ },
        t(0.08 + up * 0.5),
      )
      .to(
        shadow,
        {
          scaleX: 0.55,
          opacity: 0.45,
          duration: up,
          ease: "power2.out",
          transformOrigin: "50% 50%",
        },
        t(0.08),
      )
      .to(pos, { y: 0, duration: down, ease: "power2.in" }, t(0.08 + up))
      .to(shadow, { scaleX: 1, opacity: 1, duration: down, ease: "power2.in" }, t(0.08 + up))
      .to(
        squash,
        { scaleX: 1.16, scaleY: 0.84, duration: 0.07, ease: "power1.out", ...SQ },
        t(0.08 + up + down),
      )
      .to(
        squash,
        { scaleX: 1, scaleY: 1, duration: 0.4, ease: "elastic.out(1, 0.45)", ...SQ },
        t(0.15 + up + down),
      );
    return at + 0.15 + up + down;
  }

  private confetti() {
    const tl = gsap.timeline();
    for (const c of this.p.confetti) {
      const angle = (gsap.utils.random(-170, -10) * Math.PI) / 180;
      const dist = gsap.utils.random(55, 115);
      tl.fromTo(
        c,
        { x: 0, y: 0, opacity: 1, rotation: 0, transformOrigin: "50% 50%" },
        {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          rotation: gsap.utils.random(-280, 280),
          duration: 0.55,
          ease: "power3.out",
        },
        0,
      ).to(
        c,
        { y: `+=${gsap.utils.random(40, 75)}`, opacity: 0, duration: 0.8, ease: "power1.in" },
        0.55,
      );
    }
    return tl;
  }

  /* ================================================================ helpers */

  private run(tl: gsap.core.Timeline): Promise<void> {
    this.reactionTl = tl;
    return new Promise((resolve) => {
      this.resolveReaction = resolve;
      tl.eventCallback("onComplete", () => {
        if (this.reactionTl !== tl) return;
        this.reactionTl = null;
        this.resolveReaction = null;
        this.buildBase();
        resolve();
      });
    });
  }

  private interruptReaction() {
    if (!this.reactionTl) return;
    this.reactionTl.kill();
    this.reactionTl = null;
    const resolve = this.resolveReaction;
    this.resolveReaction = null;
    resolve?.();
  }

  private stopLoop() {
    this.loop?.kill();
    this.loop = null;
  }

  private startBlink() {
    this.stopBlink();
    const schedule = () => {
      // Blinks every 3–6s (brief §3) — the one motion kept under reduced motion.
      this.blinkCall = gsap.delayedCall(gsap.utils.random(3, 6), () => {
        const eye = this.p.open[0];
        if (
          this.visible &&
          !this.reactionTl &&
          eye &&
          Number(gsap.getProperty(eye, "opacity")) > 0.5
        ) {
          const sy = Number(gsap.getProperty(eye, "scaleY")) || 1;
          gsap
            .timeline()
            .to(this.p.open, {
              scaleY: 0.1,
              duration: 0.07,
              ease: "power1.in",
              transformOrigin: "50% 50%",
            })
            .to(this.p.open, { scaleY: sy, duration: 0.11, ease: "power1.out" });
        }
        schedule();
      });
    };
    schedule();
  }

  private stopBlink() {
    this.blinkCall?.kill();
    this.blinkCall = null;
  }

  private neutral() {
    const p = this.p;
    gsap.killTweensOf(this.allParts());
    gsap.set(p.pos, { x: 0, y: 0, opacity: 1 });
    gsap.set(p.squash, { scaleX: 1, scaleY: 1, ...SQ });
    gsap.set(p.rot, { rotation: 0, ...ROT });
    gsap.set(p.gaze, { x: 0, y: 0 });
    gsap.set(p.open, { opacity: 1, scale: 1, transformOrigin: "50% 50%" });
    gsap.set(
      [...p.closed, ...p.happy, ...p.spiral, p.smile, p.mouthO, p.worry, ...p.zzz, ...p.confetti],
      {
        opacity: 0,
      },
    );
    gsap.set(p.spiral, { rotation: 0, transformOrigin: "50% 50%" });
    gsap.set(p.confettiGroup, { y: 0 });
    gsap.set(p.halo, { opacity: 0.75, scale: 1, transformOrigin: "50% 50%" });
    gsap.set(p.shadow, { scaleX: 1, opacity: 1, transformOrigin: "50% 50%" });
  }

  private allParts(): SVGElement[] {
    const p = this.p;
    return [
      p.pos,
      p.squash,
      p.rot,
      p.gaze,
      p.halo,
      p.shadow,
      p.smile,
      p.mouthO,
      p.worry,
      p.confettiGroup,
      ...p.open,
      ...p.closed,
      ...p.happy,
      ...p.spiral,
      ...p.zzz,
      ...p.confetti,
    ];
  }

  private syncAccessories(animate: boolean) {
    for (const a of ACCESSORIES) {
      const el = this.p.acc[a];
      const on = this.accessories.has(a) || (a === "map" && this.base === "lost");
      const isOn = Number(gsap.getProperty(el, "opacity")) > 0.5;
      if (on === isOn) continue;
      gsap.killTweensOf(el);
      if (!animate || this.reduced) {
        gsap.set(el, { opacity: on ? 1 : 0, y: 0 });
      } else if (on) {
        gsap.fromTo(
          el,
          { opacity: 0, y: -18 },
          { opacity: 1, y: 0, duration: 0.45, ease: "back.out(2)" },
        );
      } else {
        gsap.to(el, { opacity: 0, y: -10, duration: 0.25 });
      }
    }
  }

  private directionTo(point?: Point) {
    if (!point) return 1;
    const r = this.root.getBoundingClientRect();
    return point.x >= r.left + r.width / 2 ? 1 : -1;
  }
}
