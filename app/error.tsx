"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

/**
 * 500 — "The Dot is fixing the mountain" (brief §4 System pages).
 * TODO(keys): report to Sentry once a DSN exists (SENTRY_DSN).
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container as="section" className="flex min-h-[70svh] flex-col justify-center py-24">
      <p className="label text-ink-soft">Something slipped</p>
      <h1 className="mt-5 text-h1">The Dot is fixing the mountain.</h1>
      <p className="mt-6 max-w-lg text-lead text-ink-soft">
        Something went wrong on our side. Try again in a moment.
        {error.digest && <span className="mt-2 block text-sm">Reference: {error.digest}</span>}
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/" variant="outline">
          Back to base camp
        </Button>
      </div>
    </Container>
  );
}
