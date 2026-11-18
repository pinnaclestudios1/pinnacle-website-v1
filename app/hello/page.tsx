import { ProjectCard } from "@/components/cms/ProjectCard";
import { DotActorView } from "@/components/dot/DotActorView";
import { WhatsAppIcon } from "@/components/layout/StickyCta";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Todo } from "@/components/ui/Todo";
import { getFeaturedProjects } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import { site, whatsappHref } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Hello from Instagram",
  description:
    "Pinnacle Studios — our latest reel, best projects and a quick way to start a project.",
  path: "/hello",
});

/**
 * Instagram link-in-bio landing (brief §6): light and mobile-first — latest reel,
 * three best projects, Start a project + WhatsApp. UTM parameters from reel links
 * are captured site-wide (components/forms/UtmCapture).
 */
const REEL_URL = process.env.NEXT_PUBLIC_LATEST_REEL_URL; // TODO: latest reel permalink

export default async function HelloPage() {
  const projects = await getFeaturedProjects(3);
  const wa = whatsappHref("Hi! I found you on Instagram and I’d like to talk about a project.");
  const instagram = site.socials.find((s) => s.label === "Instagram")?.href;

  return (
    <Container className="max-w-xl! py-12">
      <div className="flex items-center gap-4">
        <DotActorView size="44px" priority={30} enter="wave" interactive />
        <div>
          <p className="label text-ink-soft">Hello from Instagram</p>
          <h1 className="mt-1 font-display text-h2">You found the Dot.</h1>
        </div>
      </div>

      <div className="mt-8 grid gap-3">
        <Button href="/contact" ctaLocation="hello" className="w-full">
          Start a project
        </Button>
        {wa ? (
          <Button
            href={wa}
            variant="outline"
            target="_blank"
            ctaLocation="hello"
            className="w-full"
            aria-label="WhatsApp us (opens in a new tab)"
          >
            <WhatsAppIcon className="size-4" /> WhatsApp us
          </Button>
        ) : (
          <p className="text-center text-sm text-ink-soft">
            WhatsApp <Todo>number</Todo>
          </p>
        )}
      </div>

      <section aria-labelledby="reel" className="mt-14">
        <h2 id="reel" className="label font-sans text-ink-soft">
          Latest reel
        </h2>
        {REEL_URL ? (
          <a
            href={REEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block rounded-md border border-line/40 bg-surface p-6 text-center underline underline-offset-4"
          >
            Watch our latest reel on Instagram ↗
          </a>
        ) : (
          <div className="mt-4 grid aspect-[9/16] max-h-[28rem] place-items-center rounded-md border border-dashed border-line bg-surface">
            <Todo>latest reel (NEXT_PUBLIC_LATEST_REEL_URL)</Todo>
          </div>
        )}
      </section>

      <section aria-labelledby="best" className="mt-14">
        <h2 id="best" className="label font-sans text-ink-soft">
          Our best peaks
        </h2>
        <ul className="mt-6 space-y-10">
          {projects.map((p, i) => (
            <li key={p.slug}>
              <ProjectCard project={p} index={i} compact />
            </li>
          ))}
        </ul>
        <Button href="/work" variant="text" className="mt-8" ctaLocation="hello">
          See all work →
        </Button>
      </section>

      <p className="mt-14 text-center text-sm text-ink-soft">
        {instagram ? (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            Back to Instagram
          </a>
        ) : (
          <Todo>Instagram URL</Todo>
        )}
      </p>
    </Container>
  );
}
