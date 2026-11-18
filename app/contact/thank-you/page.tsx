import { ProjectCard } from "@/components/cms/ProjectCard";
import { DotActorView } from "@/components/dot/DotActorView";
import { getFeaturedProjects } from "@/lib/cms";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Thank you",
  description: "We’ve got your brief. Here’s what happens next.",
  path: "/contact/thank-you",
  noIndex: true,
});

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL;

const NEXT_STEPS = [
  {
    title: "We reply within 24 hours",
    body: "A real person reads your brief and gets back to you.",
  },
  {
    title: "Discovery call",
    body: "20–30 minutes to understand your goals, users and constraints.",
  },
  { title: "Proposal in 3–5 days", body: "Scope, timeline and cost — clear and in writing." },
];

/** Thank-you page with next steps (brief §8). The Dot celebrates at the summit. */
export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const safeRef = ref && /^[A-Z]{2}-\d{6}-[A-Z0-9]{4}$/.test(ref) ? ref : null;
  const featured = await getFeaturedProjects(2);

  return (
    <section aria-labelledby="thanks-title" className="py-16 lg:py-24">
      <Container>
        <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-end">
          <DotActorView size="72px" priority={40} enter="celebrate" props={["flag"]} interactive />
          <div>
            <p className="label text-ink-soft">
              You reached the summit · {site.summitAltitude.toLocaleString("en-US")}m
            </p>
            <h1 id="thanks-title" className="mt-4 text-h1">
              Thank you — we&rsquo;ve got it.
            </h1>
          </div>
        </div>
        <p className="mt-8 max-w-xl text-lead text-ink-soft">
          Your brief is safely with us{safeRef ? ` (reference ${safeRef})` : ""}. A confirmation is
          on its way to your inbox.
        </p>

        <h2 className="mt-16 font-display text-h3">What happens next</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {NEXT_STEPS.map((s, i) => (
            <li key={s.title} className="rounded-md border border-line/40 bg-surface p-6">
              <span className="label text-ink-soft">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-3 font-display text-h3">{s.title}</p>
              <p className="mt-2 text-sm text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Button
            href={BOOKING_URL ?? "/contact/book"}
            ctaLocation="thank-you"
            {...(BOOKING_URL ? { target: "_blank" } : {})}
          >
            Book the call now
          </Button>
          <span className="text-sm text-ink-soft">
            Skip the back-and-forth — pick a time that suits you.
          </span>
        </div>

        <h2 className="mt-20 font-display text-h3">While you wait</h2>
        <ul className="mt-8 grid gap-10 md:grid-cols-2">
          {featured.map((p, i) => (
            <li key={p.slug}>
              <ProjectCard project={p} index={i} compact />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
