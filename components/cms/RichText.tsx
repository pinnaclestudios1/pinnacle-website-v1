import { PortableText, type PortableTextComponents } from "next-sanity";
import type { RichText as RichTextValue } from "@/lib/cms/types";
import { cn } from "@/lib/cn";
import { Todo } from "@/components/ui/Todo";

/**
 * Renders rich text from either source: plain paragraphs (seed) or Portable Text (Sanity).
 * Paragraphs that start with "TODO:" render as visible TODO markers.
 */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h3: ({ children }) => <h3 className="font-display text-h3">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l border-line pl-5 font-display text-h3">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc space-y-2 pl-5">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal space-y-2 pl-5">{children}</ol>,
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={(value as { href?: string })?.href}
        className="underline underline-offset-4"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
};

export function RichText({ value, className }: { value: RichTextValue; className?: string }) {
  if (!value?.length) return null;
  const isPlain = value.every((v) => typeof v === "string");
  return (
    <div className={cn("space-y-4 text-[1.0625rem] leading-relaxed", className)}>
      {isPlain ? (
        (value as string[]).map((p, i) =>
          p.startsWith("TODO:") ? (
            <p key={i}>
              <Todo>{p.slice(5).trim()}</Todo>
            </p>
          ) : (
            <p key={i}>{p}</p>
          ),
        )
      ) : (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <PortableText value={value as any} components={components} />
      )}
    </div>
  );
}

/** Inline text that may be a "TODO: …" placeholder. */
export function MaybeTodo({
  text,
  fallback,
}: {
  text: string | null | undefined;
  fallback: string;
}) {
  if (!text) return <Todo>{fallback}</Todo>;
  if (text.startsWith("TODO:")) return <Todo>{text.slice(5).trim()}</Todo>;
  return <>{text}</>;
}
