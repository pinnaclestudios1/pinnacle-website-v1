/**
 * Scroll smoothness benchmark. Scrolls a page with real wheel events (so Lenis and the
 * scroll scenes run as they do for visitors) and records, per run:
 *   - frame times from requestAnimationFrame: average fps, p95 frame, % janky (> 25 ms)
 *   - long tasks (> 50 ms) and total blocking time while scrolling
 *   - browser work: layouts, style recalcs, layout / style / script time (CDP metrics)
 *
 *   npm run build && npm start      # in one terminal
 *   npm run qa:smooth               # in another   (SMOOTH_LABEL=after to tag a run)
 *
 * Output: docs/qa/smooth/<label>.json. Headless frame timing is approximate — compare
 * runs on the same machine, not against real devices.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const LABEL = process.env.SMOOTH_LABEL ?? "latest";
const OUT = path.resolve("docs/qa/smooth");
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

const RUNS = [
  { name: "desktop", viewport: { width: 1440, height: 900 }, cpu: 1, route: "/" },
  { name: "desktop", viewport: { width: 1440, height: 900 }, cpu: 1, route: "/process" },
  {
    name: "mobile-4x",
    viewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    cpu: 4,
    route: "/",
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pct = (arr, p) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
};

await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--disable-gpu-vsync", "--run-all-compositor-stages-before-draw"],
});
const report = [];

for (const run of RUNS) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport(run.viewport);
  const cdp = await page.createCDPSession();
  await cdp.send("Performance.enable");
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem("pn-visited", "1");
    } catch {}
  });
  await page.goto(BASE + run.route, { waitUntil: "networkidle0" });
  await sleep(2500); // let idle work (Dot builds, lazy scenes) settle
  if (run.cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: run.cpu });

  // Start recording.
  await page.evaluate(() => {
    window.__frames = [];
    window.__long = [];
    let last = performance.now();
    const tick = (t) => {
      window.__frames.push(t - last);
      last = t;
      window.__raf = requestAnimationFrame(tick);
    };
    window.__raf = requestAnimationFrame(tick);
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__long.push(e.duration);
    }).observe({ type: "longtask", buffered: false });
  });
  const before = Object.fromEntries(
    (await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]),
  );

  // Scroll the whole page with wheel events, about like a trackpad / wheel.
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  await page.mouse.move(run.viewport.width / 2, run.viewport.height / 2);
  const step = 120;
  for (let y = 0; y < total + 600; y += step) {
    await page.mouse.wheel({ deltaY: step });
    await sleep(16);
  }
  await sleep(1500);

  const after = Object.fromEntries(
    (await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]),
  );
  const { frames, long } = await page.evaluate(() => {
    cancelAnimationFrame(window.__raf);
    return { frames: window.__frames.slice(1), long: window.__long };
  });
  if (run.cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });

  const avg = frames.reduce((a, b) => a + b, 0) / (frames.length || 1);
  const d = (k) => after[k] - before[k];
  const row = {
    run: run.name,
    route: run.route,
    frames: frames.length,
    fps: Math.round(1000 / avg),
    p95FrameMs: Math.round(pct(frames, 95)),
    jankyPct: +((100 * frames.filter((f) => f > 25).length) / (frames.length || 1)).toFixed(1),
    longTasks: long.length,
    blockingMs: Math.round(long.reduce((a, b) => a + Math.max(0, b - 50), 0)),
    layouts: d("LayoutCount"),
    styleRecalcs: d("RecalcStyleCount"),
    layoutMs: Math.round(d("LayoutDuration") * 1000),
    styleMs: Math.round(d("RecalcStyleDuration") * 1000),
    scriptMs: Math.round(d("ScriptDuration") * 1000),
  };
  report.push(row);
  console.log(
    `[${row.run} ${row.route}] fps ${row.fps} · p95 ${row.p95FrameMs}ms · janky ${row.jankyPct}% · ` +
      `long tasks ${row.longTasks} (${row.blockingMs}ms) · layouts ${row.layouts} (${row.layoutMs}ms) · ` +
      `styles ${row.styleRecalcs} (${row.styleMs}ms) · script ${row.scriptMs}ms`,
  );
  await ctx.close();
}

await browser.close();
await writeFile(path.join(OUT, `${LABEL}.json`), JSON.stringify(report, null, 2));
