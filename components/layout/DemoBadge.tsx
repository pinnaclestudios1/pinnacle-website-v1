import { demoMode } from "@/lib/demo";

/**
 * A small fixed label while demo content is showing (lib/demo.ts), so nobody mistakes
 * the sample clients, people and numbers for real ones. Never rendered on production.
 */
export function DemoBadge() {
  if (!demoMode) return null;
  return (
    <aside
      aria-label="Demo notice"
      className="pointer-events-none fixed bottom-3 left-3 z-[60] rounded-full border border-line/60 bg-bg/90 px-3 py-1 text-[0.6875rem] tracking-wide text-ink-soft shadow-sm backdrop-blur max-lg:bottom-[calc(env(safe-area-inset-bottom)+4.5rem)]"
    >
      Demo content — sample clients &amp; people
    </aside>
  );
}
