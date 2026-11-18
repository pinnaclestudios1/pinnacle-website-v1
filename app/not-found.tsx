import type { Metadata } from "next";
import { DotActorView } from "@/components/dot/DotActorView";
import { DocumentTitle } from "@/components/layout/DocumentTitle";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/Container";

// Next adds `noindex` to 404 responses itself; don't duplicate the robots tag.
export const metadata: Metadata = {
  title: "Lost trail",
};

/**
 * 404 — Lost Dot (brief §6).
 * Optional later (v2): a mini-game to help the Dot find the path.
 */
export default function NotFound() {
  return (
    <Container as="section" className="flex min-h-[70svh] flex-col justify-center py-24">
      <DocumentTitle title={`Lost trail — ${site.name}`} />
      {/* Lost Dot: holds a tiny map, looks around (brief §3, §6). */}
      <div aria-hidden className="mb-10 flex items-end gap-4">
        <DotActorView size="76px" priority={50} base="lost" interactive />
        <span className="mb-4 h-px w-24 bg-line" />
        <span className="mb-[0.8rem] block size-2.5 rounded-full border border-node-stroke bg-node" />
      </div>
      <p className="label text-ink-soft">404 · Altitude unknown</p>
      <h1 className="mt-5 text-h1">This trail doesn&rsquo;t exist.</h1>
      <p className="mt-6 max-w-lg text-lead text-ink-soft">
        The page you were looking for has moved, or never existed. Let&rsquo;s get you back on the
        path.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button href="/" variant="outline">
          Home
        </Button>
        <Button href="/work" variant="outline">
          Work
        </Button>
        <Button href="/contact" ctaLocation="404">
          Start a project
        </Button>
      </div>
    </Container>
  );
}
