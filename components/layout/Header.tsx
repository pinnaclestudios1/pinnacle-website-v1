"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { TransitionLink } from "@/components/motion/PageTransition";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ctaHref, primaryNav } from "@/lib/site";
import { MobileMenu } from "./MobileMenu";

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Top nav (brief §4): Logo · Work · Services · Process · About · Start a project.
 * Always visible on desktop so the CTA is always one click away.
 */
export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 8);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-[var(--pn-z-header)] h-[var(--pn-header-h)] bg-bg">
      {/* Hairline appears once the page scrolls (opacity only). */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-px bg-line/40 transition-opacity duration-300",
          scrolled ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="mx-auto flex h-full max-w-[calc(var(--pn-max)+2*var(--pn-gutter))] items-center justify-between gap-6 px-[var(--pn-gutter)]">
        <TransitionLink
          href="/"
          aria-label="Pinnacle Studios — home"
          className="-m-2 rounded-md p-2"
          data-dot-anchor="nav-logo"
        >
          <Logo decorative className="w-[8.5rem] lg:w-[9.75rem]" />
        </TransitionLink>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <TransitionLink
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="group relative block rounded-md px-4 py-2 text-[0.9375rem] text-ink"
                  >
                    {item.label}
                    {/* Hover underline (scaleX) */}
                    <span
                      aria-hidden
                      className="absolute inset-x-4 bottom-1 h-px origin-left scale-x-0 bg-ink transition-transform duration-300 ease-out-expo group-hover:scale-x-100 motion-reduce:transition-none"
                    />
                    {/* Active state: a tiny apex dot — orange is allowed for active states. */}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -top-0.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-accent transition-[opacity,scale] duration-300 ease-dot",
                        active ? "scale-100 opacity-100" : "scale-0 opacity-0",
                      )}
                    />
                  </TransitionLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden lg:block">
          <Button href={ctaHref} size="sm" ctaLocation="nav">
            Start a project
          </Button>
        </div>

        <MobileMenu pathname={pathname} />
      </div>
    </header>
  );
}
