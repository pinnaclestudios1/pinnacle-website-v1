"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { ProjectCard } from "@/components/cms/ProjectCard";
import { DotActorView } from "@/components/dot/DotActorView";
import { DotIllustration } from "@/components/dot/DotIllustration";
import type { Project } from "@/lib/cms/types";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * Work — Peaks Conquered (brief §6): filters by service, industry and platform
 * (/work?service=…&industry=…&platform=…). The Dot rolls to the selected filter.
 * Projects sit like peaks of different heights; hover plays a preview video.
 */
export type FilterGroup = {
  key: "service" | "industry" | "platform";
  label: string;
  options: { value: string; label: string }[];
};

const RATIOS = ["4 / 5", "16 / 11", "1 / 1"];
const OFFSETS = ["lg:mt-0", "lg:mt-24", "lg:mt-12"];

export function WorkGrid({ projects }: { projects: Project[] }) {
  return (
    <ul className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((p, i) => (
        <li key={p.slug} className={OFFSETS[i % 3]}>
          <ProjectCard project={p} index={i} ratio={RATIOS[i % 3]} headingLevel={2} />
        </li>
      ))}
    </ul>
  );
}

export function WorkIndex({ projects, groups }: { projects: Project[]; groups: FilterGroup[] }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const active = {
    service: params.get("service"),
    industry: params.get("industry"),
    platform: params.get("platform"),
  };
  const shown = projects.filter(
    (p) =>
      (!active.service || p.services.includes(active.service)) &&
      (!active.industry || p.industry === active.industry) &&
      (!active.platform || p.platforms.includes(active.platform)),
  );
  const anyActive = Object.values(active).some(Boolean);

  const href = (key: FilterGroup["key"], value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value && active[key] !== value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  // The Dot hops onto the most recently chosen filter (or "All").
  const bar = useRef<HTMLDivElement>(null);
  const rider = useRef<HTMLDivElement>(null);
  const placed = useRef(false);
  const key = `${active.service}|${active.industry}|${active.platform}`;
  useEffect(() => {
    const host = bar.current;
    const r = rider.current;
    if (!host || !r) return;
    const activeChips = host.querySelectorAll<HTMLElement>("[data-filter-active='true']");
    const target =
      activeChips[activeChips.length - 1] ?? host.querySelector<HTMLElement>("[data-filter-all]");
    if (!target) return;
    const place = (instant: boolean) => {
      const t = target.getBoundingClientRect();
      const b = host.getBoundingClientRect();
      const x = t.left - b.left + t.width / 2 - r.offsetWidth / 2;
      const y = t.top - b.top - r.offsetHeight * 0.9;
      gsap.killTweensOf(r);
      if (instant || !placed.current || prefersReducedMotion()) {
        gsap.set(r, { x, y, opacity: 1 });
        placed.current = true;
        return;
      }
      const peak = Math.min(Number(gsap.getProperty(r, "y")), y) - 30;
      gsap.to(r, { x, duration: 0.5, ease: "power1.inOut" });
      gsap.to(r, {
        keyframes: [
          { y: peak, duration: 0.25, ease: "power2.out" },
          { y, duration: 0.25, ease: "power2.in" },
        ],
      });
    };
    place(false);
    const onResize = () => place(true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [key]);

  return (
    <>
      <div ref={bar} className="relative pt-12">
        <div ref={rider} className="pointer-events-none absolute top-0 left-0 z-10 opacity-0">
          <DotActorView size="26px" name="work-filter" priority={30} attach="visible" interactive />
        </div>
        <nav aria-label="Filter projects" className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={pathname}
              scroll={false}
              data-filter-all=""
              aria-current={!anyActive ? "true" : undefined}
              className={chip(!anyActive)}
            >
              All work
            </Link>
          </div>
          {groups.map((g) => (
            <div key={g.key} className="flex flex-wrap items-center gap-2">
              <span className="label mr-2 w-24 text-ink-soft">{g.label}</span>
              {g.options.map((o) => {
                const on = active[g.key] === o.value;
                return (
                  <Link
                    key={o.value}
                    href={href(g.key, o.value)}
                    scroll={false}
                    replace
                    data-filter-active={on ? "true" : undefined}
                    aria-current={on ? "true" : undefined}
                    className={chip(on)}
                  >
                    {o.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      <p role="status" aria-live="polite" className="label mt-10 text-ink-soft">
        {shown.length} {shown.length === 1 ? "peak" : "peaks"}
        {anyActive ? " match" : ""}
      </p>

      <div className="mt-8">
        {shown.length ? (
          <WorkGrid projects={shown} />
        ) : (
          <div className="flex flex-col items-start gap-6 rounded-md border border-dashed border-line p-10">
            <DotIllustration pose="lost" id="work-empty" />
            <p className="font-display text-h3">No peaks on this trail yet.</p>
            <Link href={pathname} scroll={false} className="underline underline-offset-4">
              Show all work
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

const chip = (on: boolean) =>
  cn(
    "inline-flex h-9 items-center rounded-md border px-3.5 text-sm transition-transform duration-150 active:scale-[0.97] motion-reduce:transition-none",
    on ? "border-ink bg-ink text-bg" : "border-line/70 text-ink hover:border-ink",
  );
