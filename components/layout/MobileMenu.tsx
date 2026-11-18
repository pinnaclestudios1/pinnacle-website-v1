"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { DotActorView } from "@/components/dot/DotActorView";
import { TransitionLink } from "@/components/motion/PageTransition";
import { Button } from "@/components/ui/Button";
import { Todo } from "@/components/ui/Todo";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { lockScroll, unlockScroll } from "@/lib/motion/scroll";
import { ctaHref, primaryNav, services, site } from "@/lib/site";

/**
 * Full-screen mobile menu (brief §4). Uses a native modal <dialog>:
 * focus is trapped, the page behind is inert, Escape closes, and focus
 * returns to the Menu button — all for free from the platform.
 *
 * The Dot drops into [data-dot-slot="menu"] when the menu opens.
 */
export function MobileMenu({ pathname }: { pathname: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const openMenu = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    const items = panelRef.current?.querySelectorAll("[data-menu-item]") ?? [];
    gsap.killTweensOf([dialog, items]);
    // Must be visibility:visible *before* showModal(), or the browser can't move focus inside.
    gsap.set(dialog, { visibility: "visible", opacity: 0 });
    dialog.showModal();
    setOpen(true);
    lockScroll();

    const reduced = prefersReducedMotion();
    gsap.to(dialog, { opacity: 1, duration: 0.3, ease: "power1.out" });
    if (!reduced) {
      gsap.fromTo(
        items,
        { y: 28, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, ease: "expo.out", stagger: 0.05, delay: 0.08 },
      );
    }
  }, []);

  const closeMenu = useCallback((immediate = false) => {
    const dialog = dialogRef.current;
    if (!dialog || !dialog.open) return;
    const finish = () => {
      dialog.close();
      setOpen(false);
      unlockScroll();
    };
    gsap.killTweensOf(dialog);
    if (immediate || prefersReducedMotion()) {
      gsap.set(dialog, { autoAlpha: 0 });
      finish();
      return;
    }
    gsap.to(dialog, { autoAlpha: 0, duration: 0.25, ease: "power1.in", onComplete: finish });
  }, []);

  // Close on route change (e.g. back button while open).
  useEffect(() => {
    closeMenu(true);
  }, [pathname, closeMenu]);

  // Close if the viewport grows to desktop while open.
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mql.matches && closeMenu(true);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [closeMenu]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={openMenu}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="-mr-2 flex h-11 items-center gap-3 rounded-md px-2 text-[0.9375rem] text-ink"
      >
        Menu
        <span aria-hidden className="flex w-5 flex-col gap-[5px]">
          <span className="h-px w-full bg-ink" />
          <span className="h-px w-3/4 self-end bg-ink" />
        </span>
      </button>

      <dialog
        id="mobile-menu"
        ref={dialogRef}
        aria-label="Menu"
        data-lenis-prevent
        onCancel={(e) => {
          e.preventDefault();
          closeMenu();
        }}
        className="invisible m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-bg p-0 text-ink opacity-0 backdrop:bg-transparent"
      >
        <div ref={panelRef} className="flex min-h-full flex-col px-[var(--pn-gutter)] pb-10">
          <div className="flex h-[var(--pn-header-h)] shrink-0 items-center justify-between">
            <TransitionLink
              href="/"
              aria-label="Pinnacle Studios — home"
              onClick={() => closeMenu()}
              className="-m-2 rounded-md p-2"
            >
              <Logo decorative className="w-[8.5rem]" />
            </TransitionLink>
            <button
              type="button"
              onClick={() => closeMenu()}
              className="-mr-2 flex h-11 items-center gap-3 rounded-md px-2 text-[0.9375rem]"
            >
              Close
              <span aria-hidden className="relative block size-5">
                <span className="absolute top-1/2 left-0 h-px w-full rotate-45 bg-ink" />
                <span className="absolute top-1/2 left-0 h-px w-full -rotate-45 bg-ink" />
              </span>
            </button>
          </div>

          {/* The Dot drops into the open menu (brief §4). */}
          <div data-dot-slot="menu" aria-hidden className="mt-6 mb-2 h-10">
            <DotActorView size="32px" priority={50} attach={open} enter="drop" interactive />
          </div>

          <nav aria-label="Mobile">
            <ul className="space-y-1">
              {[{ label: "Home", href: "/" }, ...primaryNav].map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href} data-menu-item>
                    <TransitionLink
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => closeMenu()}
                      className={cn(
                        "inline-block rounded-md py-1 font-display text-h2",
                        active && "underline decoration-line decoration-1 underline-offset-8",
                      )}
                    >
                      {item.label}
                    </TransitionLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div data-menu-item className="mt-8">
            <Button href={ctaHref} ctaLocation="mobile-menu" onClick={() => closeMenu()}>
              Start a project
            </Button>
          </div>

          <div data-menu-item className="mt-auto pt-12">
            <p className="label text-ink-soft">Services</p>
            <ul className="mt-3 grid grid-cols-1 gap-y-2 text-[0.9375rem] xs:grid-cols-2">
              {services.map((s) => (
                <li key={s.slug}>
                  <TransitionLink
                    href={`/services/${s.slug}`}
                    onClick={() => closeMenu()}
                    className="rounded-sm text-ink-soft hover:text-ink"
                  >
                    {s.name}
                  </TransitionLink>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-ink-soft">
              {site.contact.email ? (
                <a href={`mailto:${site.contact.email}`} className="underline underline-offset-4">
                  {site.contact.email}
                </a>
              ) : (
                <Todo>contact email</Todo>
              )}
              <span className="mx-2">·</span>
              {site.contact.responsePromise}
            </p>
          </div>
        </div>
      </dialog>
    </div>
  );
}
