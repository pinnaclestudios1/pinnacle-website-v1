import { TransitionLink } from "@/components/motion/PageTransition";
import { Todo } from "@/components/ui/Todo";
import type { Project } from "@/lib/cms/types";
import { cn } from "@/lib/cn";
import { services } from "@/lib/site";
import { MediaFrame } from "./MediaFrame";

/**
 * A project "window" (brief §5 Stage 4, §6 Work): thumbnail or hover video, name,
 * client, tags, one headline result. Hover makes the Dot curious; click dives in.
 *
 * 3D: the window settles from tilted-back to face-on as it scrolls in (`data-depth`,
 * CSS scroll-driven, runs off the main thread), and on desktop tilts toward the cursor
 * with a soft light sheen (`data-tilt`, components/extras/tilt.ts). Both are off under
 * reduced motion.
 */
export function ProjectCard({
  project,
  index = 0,
  ratio = "16 / 10",
  compact = false,
  headingLevel = 3,
  className,
}: {
  project: Project;
  index?: number;
  ratio?: string;
  compact?: boolean;
  headingLevel?: 2 | 3;
  className?: string;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const tags = project.services
    .map((slug) => services.find((s) => s.slug === slug)?.name)
    .filter(Boolean)
    .slice(0, 2);

  return (
    <TransitionLink
      href={`/work/${project.slug}`}
      dive
      data-dot-curious=""
      data-project={project.slug}
      data-tilt-area=""
      className={cn("group block rounded-md", className)}
    >
      <div data-depth="">
        <div data-tilt="" className="relative overflow-hidden rounded-md">
          <MediaFrame
            media={project.preview ?? project.hero}
            ratio={ratio}
            hoverVideo
            variant={index}
            sizes={compact ? "(min-width: 768px) 33vw, 100vw" : undefined}
          />
          <span data-tilt-glare="" aria-hidden className="tilt-glare" />
        </div>
      </div>
      <div className={cn("mt-5 grid gap-3", !compact && "sm:grid-cols-[1fr_auto] sm:items-end")}>
        <div>
          <p className="label text-ink-soft">
            {project.client ?? <Todo>client</Todo>} · {project.industry ?? <Todo>industry</Todo>}
          </p>
          <Heading className={cn("mt-2 font-display", compact ? "text-xl" : "text-h3")}>
            {project.placeholder ? (
              <Todo>{project.title.replace(/^TODO:\s*/, "")}</Todo>
            ) : (
              project.title
            )}
          </Heading>
          {!compact && tags.length > 0 && (
            <p className="mt-2 text-sm text-ink-soft">{tags.join(" · ")}</p>
          )}
        </div>
        {!compact && (
          <p className="font-display text-h3 sm:text-right">
            {project.headlineResult ?? <Todo>headline result, e.g. +X% conversions</Todo>}
          </p>
        )}
      </div>
    </TransitionLink>
  );
}
