import type { Metadata } from "next";
import { cmsEnabled } from "@/sanity/env";
import { Studio } from "./Studio";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

/** The content studio. Until a Sanity project exists, explain how to connect one. */
export default function StudioPage() {
  if (cmsEnabled) return <Studio />;
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 font-sans">
      <p className="label text-ink-soft">Content studio</p>
      <h1 className="mt-4 text-h2">Connect Sanity to start editing.</h1>
      <p className="mt-6 text-ink-soft">
        The site is currently serving its built-in seed content. To let the team edit projects,
        services, team, jobs and FAQs here:
      </p>
      <ol className="mt-6 list-decimal space-y-3 pl-5 text-[0.9375rem]">
        <li>Create a project at sanity.io/manage (dataset: production).</li>
        <li>
          Set <code className="font-mono">NEXT_PUBLIC_SANITY_PROJECT_ID</code> (and{" "}
          <code className="font-mono">SANITY_REVALIDATE_SECRET</code>) in the hosting environment.
        </li>
        <li>Add this site’s URL as a CORS origin with credentials in Sanity.</li>
        <li>
          Import the seed: <code className="font-mono">npm run cms:seed</code>, then{" "}
          <code className="font-mono">
            npx sanity dataset import content/seed/sanity-seed.ndjson production
          </code>
          .
        </li>
        <li>
          Add a Sanity webhook to <code className="font-mono">/api/revalidate</code> so published
          changes go live instantly.
        </li>
      </ol>
    </main>
  );
}
