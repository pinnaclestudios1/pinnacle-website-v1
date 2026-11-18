"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Wraps pages in the site chrome (nav, footer, Dot, smooth scroll…), except the
 * embedded CMS at /studio, which needs the whole screen and its own scrolling.
 * The chrome itself stays server-rendered: it is passed in as props.
 */
export function ChromeGate({
  before,
  after,
  children,
}: {
  before: ReactNode;
  after: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/studio")) return <>{children}</>;
  return (
    <>
      {before}
      <main id="main" tabIndex={-1} className="pt-[var(--pn-header-h)] outline-none">
        {children}
      </main>
      {after}
    </>
  );
}
