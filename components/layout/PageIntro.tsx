import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

type PageIntroProps = {
  /** Mono eyebrow, e.g. "Work — Peaks Conquered". */
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
};

/** Standard inner-page opening: eyebrow, one h1, short intro. Server-rendered, never hidden by motion (LCP). */
export function PageIntro({ eyebrow, title, intro, children }: PageIntroProps) {
  return (
    <Container as="section" className="pt-16 pb-12 lg:pt-28 lg:pb-20">
      <p className="label text-ink-soft">{eyebrow}</p>
      <h1 className="mt-5 max-w-5xl text-h1">{title}</h1>
      {intro && <div className="mt-8 max-w-2xl text-lead text-ink-soft">{intro}</div>}
      {children}
    </Container>
  );
}
