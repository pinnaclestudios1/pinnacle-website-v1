import type { CSSProperties } from "react";

/**
 * Static star field for the night-sky footer. Positions come from a seeded PRNG,
 * so server and client render identical markup (no hydration mismatch).
 * A few stars twinkle via CSS (opacity only; disabled under reduced motion).
 * 3D: stars sit on three depth layers by size; as the sky scrolls into view the near
 * layer drifts more than the far one (CSS scroll-driven parallax, off the main thread).
 */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STARS = (() => {
  const rand = mulberry32(8848);
  return Array.from({ length: 70 }, (_, i) => {
    const r = rand();
    return {
      x: +(rand() * 100).toFixed(2),
      y: +(Math.pow(rand(), 1.6) * 100).toFixed(2), // denser near the top
      size: r > 0.92 ? 2.2 : r > 0.7 ? 1.5 : 1,
      opacity: +(0.35 + rand() * 0.55).toFixed(2),
      twinkle: i % 6 === 0,
      duration: +(4 + rand() * 5).toFixed(1),
      delay: +(rand() * 6).toFixed(1),
    };
  });
})();

const LAYERS = [
  { depth: "far", stars: STARS.filter((s) => s.size === 1) },
  { depth: "mid", stars: STARS.filter((s) => s.size === 1.5) },
  { depth: "near", stars: STARS.filter((s) => s.size === 2.2) },
] as const;

export function NightSky({ className }: { className?: string }) {
  return (
    <div aria-hidden className={className}>
      {LAYERS.map((layer) => (
        <div key={layer.depth} data-sky-layer={layer.depth} className="absolute inset-0">
          {layer.stars.map((s, i) => (
            <span
              key={i}
              className={s.twinkle ? "star-twinkle absolute rounded-full" : "absolute rounded-full"}
              style={
                {
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: s.size,
                  height: s.size,
                  opacity: s.opacity,
                  backgroundColor: "var(--pn-cream-logo)",
                  "--star-o": s.opacity,
                  "--star-d": `${s.duration}s`,
                  "--star-delay": `${s.delay}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}
