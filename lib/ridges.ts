/**
 * Ink-wash mountain ridges for the hero: layered silhouettes, each a seeded ridge line
 * with one dominant peak plus natural roughness. Pure functions of their inputs
 * (identical on server and client).
 *
 * Coordinates are in a W × H box; each path is closed down to the bottom edge, so it
 * can be filled as a silhouette.
 */
export type RidgeOptions = {
  seed: number;
  width?: number;
  height?: number;
  /** Where the ridge sits when there's no peak (0 = top, 1 = bottom). */
  base: number;
  /** Peak position (fraction of width) and how high it rises (fraction of height). */
  peakX: number;
  peakHeight: number;
  /** Spread of the main massif (fraction of width). */
  spread?: number;
  /** Small-scale roughness (fraction of height). */
  rough?: number;
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => +n.toFixed(1);

/** The ridge's y at fraction x (exported so a Dot can be placed exactly on a peak). */
export function ridgeY(o: RidgeOptions, x: number) {
  const { width: _w, height = 100, base, peakX, peakHeight, spread = 0.22, rough = 0.035 } = o;
  void _w;
  const rand = mulberry32(o.seed);
  const waves = Array.from({ length: 5 }, (_, i) => ({
    freq: 2 + i * 2.7 + rand(),
    phase: rand() * Math.PI * 2,
    amp: rough / (i + 1),
  }));
  // Main massif: a soft-shouldered bump, slightly asymmetric.
  const d = (x - peakX) / (x < peakX ? spread : spread * 1.25);
  const massif = peakHeight * Math.exp(-d * d * 1.6);
  // Secondary hills.
  const hills =
    0.06 * Math.sin(x * Math.PI * 3.1 + o.seed) + 0.04 * Math.sin(x * Math.PI * 6.3 + o.seed * 2);
  // Roughness fades out near the summit so the peak stays crisp.
  const r = waves.reduce((s, w) => s + w.amp * Math.sin(x * Math.PI * 2 * w.freq + w.phase), 0);
  const nearPeak = Math.min(1, Math.abs(x - peakX) / 0.04);
  return height * (base - massif - hills * (1 - massif) * 0.6 - r * nearPeak);
}

/** Closed silhouette path for a ridge. */
export function ridgePath(o: RidgeOptions, samples = 120) {
  const width = o.width ?? 100;
  const height = o.height ?? 100;
  let d = `M0 ${height}`;
  for (let i = 0; i <= samples; i++) {
    const x = i / samples;
    d += `L${f(x * width)} ${f(ridgeY(o, x))}`;
  }
  return `${d}L${width} ${height}Z`;
}
