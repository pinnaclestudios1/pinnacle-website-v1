import { cn } from "@/lib/cn";

/**
 * Responsive image with ZERO client JavaScript (next/image adds ~6KB to every page
 * that uses it — brief §11 JS budget). Sanity's CDN does the work: format
 * negotiation (AVIF/WebP via auto=format), resizing (w=) and quality, so we only
 * need a server-rendered srcset.
 */
const WIDTHS = [480, 768, 1080, 1440, 1920, 2560];

function isSanity(url: string) {
  return url.startsWith("https://cdn.sanity.io/");
}

function withParams(url: string, w: number) {
  const u = new URL(url);
  u.searchParams.set("w", String(w));
  u.searchParams.set("auto", "format");
  u.searchParams.set("fit", "max");
  u.searchParams.set("q", "80");
  return u.toString();
}

export function Img({
  src,
  alt,
  sizes = "100vw",
  width,
  height,
  priority = false,
  fill = false,
  className,
}: {
  src: string;
  alt: string;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  /** Absolutely fill the (positioned) parent, cropped to cover. */
  fill?: boolean;
  className?: string;
}) {
  const sanity = isSanity(src);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sanity ? withParams(src, 1440) : src}
      srcSet={sanity ? WIDTHS.map((w) => `${withParams(src, w)} ${w}w`).join(", ") : undefined}
      sizes={sanity ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={cn(fill && "absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}
