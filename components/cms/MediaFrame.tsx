import type { Media } from "@/lib/cms/types";
import { Img } from "./Img";
import { cn } from "@/lib/cn";
import { Todo } from "@/components/ui/Todo";
import { LoopVideo } from "./LoopVideo";

/**
 * Image, looping video, or — when nothing is uploaded yet — a calm line-art
 * placeholder with a TODO label. Always reserves its aspect ratio (no layout shift).
 */
const RIDGES = [
  "M0 80 L40 45 L62 62 L95 25 L130 58 L160 40",
  "M0 85 L30 60 L70 75 L105 40 L160 70",
  "M0 75 L50 35 L80 55 L120 20 L160 50",
];

export function MediaFrame({
  media,
  ratio = "16 / 10",
  sizes = "(min-width: 1024px) 60vw, 100vw",
  priority = false,
  hoverVideo = false,
  todo = "project visual / looping video",
  variant = 0,
  className,
}: {
  media: Media;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  hoverVideo?: boolean;
  todo?: string;
  variant?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-line/40 bg-surface",
        className,
      )}
      style={{ aspectRatio: ratio }}
    >
      {media?.kind === "image" ? (
        <Img src={media.url} alt={media.alt} fill sizes={sizes} priority={priority} />
      ) : media?.kind === "video" ? (
        <LoopVideo
          src={media.url}
          poster={media.poster}
          label={media.alt}
          hoverOnly={hoverVideo}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          <svg
            aria-hidden
            viewBox="0 0 160 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out-expo group-hover:scale-[1.03] motion-reduce:transition-none"
          >
            <path
              d={RIDGES[variant % RIDGES.length]}
              stroke="var(--pn-line)"
              strokeWidth={1.25}
              vectorEffect="non-scaling-stroke"
              fill="none"
            />
          </svg>
          <span className="absolute bottom-4 left-4">
            <Todo>{todo}</Todo>
          </span>
        </>
      )}
    </div>
  );
}
