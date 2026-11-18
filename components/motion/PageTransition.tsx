"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";
import { dot } from "@/components/dot/controller";
import { DotActorView } from "@/components/dot/DotActorView";
import type { DotActor } from "@/components/dot/types";
import { gsap } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { getLenis, resetScroll } from "@/lib/motion/scroll";

/**
 * Page transitions (brief §9 Signature motions):
 * a cream curtain wipes up from the bottom, the Dot rolls along a line across it,
 * the route changes behind the curtain, then the curtain exits through the top.
 *
 * - Total ≈ 1.0–1.1s (scene band 800–1200ms).
 * - Reduced motion: no curtain, just a normal navigation (content fades in via CSS).
 * - Back/forward and hash/query changes skip the curtain.
 * - A fail-safe always lifts the curtain, so it can never trap the visitor.
 * - After every client navigation focus moves to <main> for keyboard/screen-reader users.
 * - The Dot takes over the curtain in its "loading" state (it spins; the timeline rolls it along).
 */

type Phase = "idle" | "covering" | "waiting" | "revealing";

type NavigateOptions = {
  /** Element to "dive" into: it expands to full screen instead of the curtain wipe. */
  dive?: Element;
};

type TransitionCtx = { navigate: (href: string, opts?: NavigateOptions) => void };

const Ctx = createContext<TransitionCtx | null>(null);

// Cover + route swap + reveal should land inside the 800–1200ms scene band.
const COVER = 0.42;
const REVEAL = 0.5;
const FAILSAFE_MS = 4000;

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const curtainRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const curtainActor = useRef<DotActor | null>(null);
  const releaseDot = useRef<(() => void) | null>(null);
  const diveRef = useRef<HTMLDivElement>(null);
  const mode = useRef<"curtain" | "dive">("curtain");

  const phase = useRef<Phase>("idle");
  const prevPath = useRef(pathname);
  const failSafe = useRef<number | undefined>(undefined);

  const travel = () => {
    const track = trackRef.current;
    const dot = dotRef.current;
    if (!track || !dot) return 0;
    return track.offsetWidth - dot.offsetWidth;
  };

  const reveal = useCallback(() => {
    window.clearTimeout(failSafe.current);
    const curtain = curtainRef.current;
    if (!curtain || phase.current === "revealing" || phase.current === "idle") return;
    phase.current = "revealing";

    if (mode.current === "dive") {
      gsap.to(diveRef.current, {
        autoAlpha: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          phase.current = "idle";
          getLenis()?.start();
        },
      });
      return;
    }

    gsap
      .timeline({
        onComplete: () => {
          gsap.set(curtain, { yPercent: 100, autoAlpha: 0 });
          phase.current = "idle";
          releaseDot.current?.();
          releaseDot.current = null;
          getLenis()?.start();
        },
      })
      .to(dotRef.current, { x: travel(), duration: REVEAL, ease: "power2.in" }, 0)
      .to(curtain, { yPercent: -100, duration: REVEAL, ease: "expo.inOut" }, 0);
  }, []);

  const navigate = useCallback(
    (href: string, opts: NavigateOptions = {}) => {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) {
        window.location.assign(url.href);
        return;
      }
      const target = url.pathname + url.search + url.hash;
      const samePage = url.pathname === window.location.pathname;
      const curtain = curtainRef.current;

      if (samePage || prefersReducedMotion() || phase.current !== "idle" || !curtain) {
        router.push(target);
        return;
      }

      phase.current = "covering";
      getLenis()?.stop();

      // Window dive (brief §9): the clicked card expands to fill the screen, then the page swaps.
      const diveEl = diveRef.current;
      if (opts.dive && diveEl) {
        mode.current = "dive";
        const r = opts.dive.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        gsap
          .timeline({
            onComplete: () => {
              phase.current = "waiting";
              router.push(target);
              failSafe.current = window.setTimeout(reveal, FAILSAFE_MS);
            },
          })
          .set(diveEl, {
            autoAlpha: 1,
            x: r.left,
            y: r.top,
            scaleX: r.width / vw,
            scaleY: r.height / vh,
            transformOrigin: "0 0",
          })
          .to(diveEl, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.7, ease: "expo.inOut" });
        return;
      }
      mode.current = "curtain";
      // The Dot hands over to the curtain for the trip ("loading": rolls along a line).
      if (curtainActor.current && !releaseDot.current) {
        releaseDot.current = dot.attach(curtainActor.current, { priority: 100, base: "loading" });
      }

      gsap
        .timeline({
          onComplete: () => {
            phase.current = "waiting";
            router.push(target);
            failSafe.current = window.setTimeout(reveal, FAILSAFE_MS);
          },
        })
        .set(curtain, { autoAlpha: 1, yPercent: 100 })
        .set(dotRef.current, { x: 0 })
        .set(lineRef.current, { scaleX: 0 })
        .to(curtain, { yPercent: 0, duration: COVER, ease: "expo.inOut" })
        .to(lineRef.current, { scaleX: 1, duration: COVER, ease: "expo.out" }, COVER * 0.4)
        .to(
          dotRef.current,
          { x: () => travel() / 2, duration: COVER, ease: "power2.out" },
          COVER * 0.5,
        );
    },
    [router, reveal],
  );

  // A new route has committed.
  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;

    const wasTransitioning = phase.current === "waiting" || phase.current === "covering";
    if (wasTransitioning) resetScroll();

    document.getElementById("main")?.focus({ preventScroll: true });

    if (wasTransitioning) {
      // Give the new page one frame to paint before lifting the curtain.
      requestAnimationFrame(() => reveal());
    }
  }, [pathname, reveal]);

  useEffect(
    () => () => {
      window.clearTimeout(failSafe.current);
      releaseDot.current?.();
    },
    [],
  );

  const value = useMemo(() => ({ navigate }), [navigate]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        ref={curtainRef}
        aria-hidden
        // Hidden until GSAP takes over. No Tailwind translate-* here: GSAP owns `transform`.
        className="invisible fixed inset-0 z-[var(--pn-z-curtain)] border-t border-line bg-bg opacity-0"
      >
        <div
          ref={trackRef}
          className="absolute top-1/2 right-[var(--pn-gutter)] left-[var(--pn-gutter)]"
        >
          <span
            ref={lineRef}
            className="absolute top-0 left-0 block h-px w-full origin-left bg-line"
          />
          {/* Sits on the line: the figure box is 1.25× the body, so nudge down by 0.125× the size. */}
          <div ref={dotRef} className="absolute left-0" style={{ bottom: "calc(-28px * 0.125)" }}>
            <DotActorView size="28px" attach={false} actorRef={curtainActor} />
          </div>
        </div>
      </div>
      {/* Window dive layer: a full-viewport surface scaled down to the clicked card, then up. */}
      <div
        ref={diveRef}
        aria-hidden
        className="invisible fixed top-0 left-0 z-[var(--pn-z-curtain)] h-screen w-screen border border-line/40 bg-surface opacity-0"
      />
    </Ctx.Provider>
  );
}

export function useTransitionRouter() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTransitionRouter must be used inside <TransitionProvider>");
  return ctx;
}

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  /** Expand this link's box to full screen as the transition (project windows). */
  dive?: boolean;
};

/** Drop-in for next/link that plays the page transition on internal navigation. */
export function TransitionLink({ href, onClick, target, dive, ...props }: TransitionLinkProps) {
  const { navigate } = useTransitionRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (target && target !== "_self") return;
    e.preventDefault();
    navigate(href, dive ? { dive: e.currentTarget } : undefined);
  };

  return <Link href={href} target={target} onClick={handleClick} {...props} />;
}
