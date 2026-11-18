/**
 * Custom line icons in the pyramid's stroke weight (brief §2 Graphic language).
 * 24px grid, 1.5px strokes, round caps. TODO: confirm — a designer may redraw these.
 */
const PATHS: Record<string, string[]> = {
  // Browser window
  "web-development": ["M3 6.5h18v12H3z", "M3 9.5h18", "M5.5 8h.01M7.5 8h.01", "M7 13h6M7 15.5h4"],
  // Dashboard grid
  "web-apps": ["M3.5 4.5h17v15h-17z", "M9 4.5v15", "M9 10h11.5", "M11.5 13.5l2 2 4-4"],
  // Phone
  "mobile-apps": [
    "M7.5 2.5h9a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1z",
    "M10.5 5h3",
    "M12 18.5h.01",
  ],
  // Cursor over a frame
  "ui-ux-design": ["M3.5 3.5h11v8", "M3.5 3.5v11h8", "M13 13l7.5 3-3 1.5-1.5 3z"],
  // Bag
  ecommerce: ["M5 8h14l-1 12.5H6z", "M9 8V6.5a3 3 0 0 1 6 0V8"],
  // Spark with motion lines
  "branding-motion": [
    "M14 3l1.8 4.7L20.5 9.5l-4.7 1.8L14 16l-1.8-4.7L7.5 9.5l4.7-1.8z",
    "M3 15h4M5 19h5M3 21h2",
  ],
  // Shield with check
  "care-plans": [
    "M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z",
    "M8.5 12l2.5 2.5 4.5-5",
  ],
};

export function ServiceIcon({ slug, className = "size-7" }: { slug: string; className?: string }) {
  const paths = PATHS[slug] ?? PATHS["web-development"]!;
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
