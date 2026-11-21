/**
 * Home page QA (phase 3+): drives a real headless Chrome through The Ascent on
 * desktop, mobile and reduced motion, checks the choreography, and saves screenshots.
 *
 *   npm run build && npm start        # in one terminal
 *   npm run qa:home                   # in another (BASE_URL defaults to http://localhost:3000)
 *
 * Output: docs/qa/home/*.png and docs/qa/home/report.json
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve("docs/qa/home");
const CHROME =
  process.env.CHROME_PATH ??
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
  ].find(Boolean);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (run, name, pass, detail = "") => {
  results.push({ run, name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  [${run}] ${name}${detail ? ` — ${detail}` : ""}`);
};

async function newPage(browser, { width, height, mobile = false, reduced = false }) {
  const ctx = await browser.createBrowserContext(); // fresh storage = first visit
  const page = await ctx.newPage();
  await page.setViewport({
    width,
    height,
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: 1,
  });
  if (reduced)
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return { page, ctx, errors };
}

const scrollTo = (page, y) => page.evaluate((y) => window.scrollTo(0, y), y);
const topOf = (page, sel) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? el.getBoundingClientRect().top + window.scrollY : null;
  }, sel);
const shot = (page, name) => page.screenshot({ path: path.join(OUT, `${name}.png`) });

/** Distance a pinned section scrolls: its pin-spacer height minus the pinned element. */
const pinInfo = (page, sel) =>
  page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const spacer = el?.parentElement?.classList.contains("pin-spacer") ? el.parentElement : null;
    if (!el || !spacer) return null;
    const top = spacer.getBoundingClientRect().top + window.scrollY;
    return { top, distance: spacer.offsetHeight - el.offsetHeight };
  }, sel);

async function desktop(browser) {
  const run = "desktop";
  const { page, ctx, errors } = await newPage(browser, { width: 1440, height: 900 });
  const t0 = Date.now();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  check(
    run,
    "preloader shows on first visit",
    await page.evaluate(() => document.documentElement.classList.contains("preload")),
  );
  await sleep(1300);
  await shot(page, "desktop-0-preloader");
  await page.waitForFunction(() => !document.documentElement.classList.contains("preload"), {
    timeout: 6000,
  });
  const preMs = Date.now() - t0;
  // Measured from first paint, so a slow machine or a cold browser doesn't count
  // against it; the total is reported alongside.
  const afterPaint = await page.evaluate(() =>
    Math.round(
      performance.now() - (performance.getEntriesByName("first-paint")[0]?.startTime ?? 0),
    ),
  );
  check(
    run,
    "preloader ends ~2.5s after first paint",
    afterPaint <= 2800 && preMs <= 4500,
    `${afterPaint}ms after first paint, ${preMs}ms incl. navigation`,
  );

  // Hero: the Dot rises on the summit, waves, and settles on its peak.
  const landed = await page
    .waitForFunction(
      () => {
        const dot = document.querySelector("#base-camp [data-dot-actor]")?.getBoundingClientRect();
        const spot = document
          .querySelector('[data-dot-anchor="hero-landing"]')
          ?.getBoundingClientRect();
        if (!dot || !spot) return false;
        return (
          Math.abs(dot.left + dot.width / 2 - (spot.left + spot.width / 2)) < 3 &&
          Math.abs(dot.top + dot.height / 2 - (spot.top + spot.height / 2)) < 3
        );
      },
      { timeout: 8000 },
    )
    .then(() => true)
    .catch(() => false);
  check(run, "hero Dot rises on the summit and settles there", landed);
  await shot(page, "desktop-1-base-camp");

  // Stage 2
  const pathTop = await topOf(page, "#the-path");
  await scrollTo(page, pathTop + 700);
  await sleep(1200);
  await shot(page, "desktop-2-the-path");
  check(
    run,
    "The Path motion initialised",
    (await page.$eval("#the-path", (s) => s.dataset.motion)) === "desktop",
  );

  // Stage 3 — pinned horizontal climb
  await scrollTo(page, (await topOf(page, "#the-climb")) + 5);
  await sleep(1500);
  const climb = await pinInfo(page, "[data-climb-pin]");
  check(
    run,
    "The Climb pins",
    !!climb,
    climb ? `scrolls ${Math.round(climb.distance)}px sideways` : "no pin-spacer",
  );
  const actives = [];
  if (climb) {
    for (let i = 0; i <= 6; i++) {
      await scrollTo(page, climb.top + (climb.distance * i) / 6);
      await sleep(900);
      actives.push(
        await page.$$eval("[data-node]", (ns) =>
          ns.findIndex((n) => n.hasAttribute("data-active")),
        ),
      );
      if (i === 3) await shot(page, "desktop-3-the-climb");
    }
  }
  check(
    run,
    "nodes bloom in order as the Dot lands",
    actives.join() === "0,1,2,3,4,5,6",
    `active: ${actives.join(",")}`,
  );

  // Stage 4 — elevator
  const peaksTop = await topOf(page, "#peaks");
  await scrollTo(page, peaksTop + 900);
  await sleep(1400);
  const car = await page.$eval("[data-peaks-car]", (c) => {
    const r = c.getBoundingClientRect();
    const actor = c.querySelector("[data-dot-actor]");
    return {
      y: r.top + r.height / 2,
      vh: window.innerHeight,
      visible: actor ? getComputedStyle(actor).visibility === "visible" : false,
    };
  });
  check(
    run,
    "Peaks elevator keeps pace with the reader",
    Math.abs(car.y - car.vh * 0.55) < car.vh * 0.25,
    `car at ${Math.round(car.y)}px of ${car.vh}`,
  );
  check(run, "the Dot rides the elevator (peaks actor on screen)", car.visible);
  await shot(page, "desktop-4-peaks");

  // Stage 5 — Blueprint Room
  await scrollTo(page, (await topOf(page, "#blueprint")) + 5);
  await sleep(1500);
  const bp = await pinInfo(page, "[data-bp-pin]");
  check(run, "Blueprint Room pins", !!bp);
  const phases = [];
  if (bp) {
    for (let k = 0; k < 5; k++) {
      await scrollTo(page, bp.top + (bp.distance * (k + 0.6)) / 5);
      await sleep(1400);
      phases.push(
        await page.$$eval("[data-bp-caption]", (cs) =>
          cs.findIndex((c) => !c.hasAttribute("data-dim")),
        ),
      );
      await shot(page, `desktop-5-blueprint-${k}`);
    }
  }
  check(
    run,
    "build phases advance sketch → launch",
    phases.join() === "0,1,2,3,4",
    `phases: ${phases.join(",")}`,
  );
  const bpDot = await page.evaluate(() => {
    const a = document.querySelector("#blueprint [data-dot-actor]");
    return a ? getComputedStyle(a).visibility === "visible" : false;
  });
  check(run, "the Dot works inside the Blueprint Room", bpDot);

  // Stage 6, 7
  await scrollTo(page, await topOf(page, "#voices"));
  await sleep(1000);
  await shot(page, "desktop-6-voices");
  const summitTop = await topOf(page, "#summit");
  const summitH = await page.$eval("#summit", (s) => s.offsetHeight);
  await scrollTo(page, summitTop + summitH / 2 - 450);
  await sleep(1500);
  const alt = await page.evaluate(() => document.querySelector(".tabular-nums span")?.textContent);
  check(run, "altitude meter reads 8,848m at the summit", alt === "8,848", `reads ${alt}`);
  const flag = await page.evaluate(() => {
    const actor = document.querySelector("#summit [data-dot-actor]");
    const f = actor?.querySelector('[data-part="acc-flag"]');
    return actor && getComputedStyle(actor).visibility === "visible" && f
      ? Number(getComputedStyle(f).opacity)
      : 0;
  });
  check(run, "summit Dot holds the flag", flag > 0.9);
  await shot(page, "desktop-7-summit");

  await scrollTo(page, 1e6);
  await sleep(1200);
  await shot(page, "desktop-8-night-footer");

  check(run, "no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

async function mobile(browser) {
  const run = "mobile";
  const { page, ctx, errors } = await newPage(browser, { width: 390, height: 844, mobile: true });
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !document.documentElement.classList.contains("preload"), {
    timeout: 6000,
  });
  await sleep(3500);
  await shot(page, "mobile-1-base-camp");
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 700) {
    await scrollTo(page, y);
    await sleep(250);
  }
  await sleep(800);
  check(run, "no pinned scenes on mobile", (await page.$$(".pin-spacer")).length === 0);
  const climbLayout = await page.$eval("[data-climb-track]", (t) => getComputedStyle(t).display);
  check(run, "The Climb is a vertical stack", climbLayout === "grid", climbLayout);
  await scrollTo(page, await topOf(page, "#summit"));
  await sleep(1000);
  await shot(page, "mobile-7-summit");
  check(run, "no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

async function reduced(browser) {
  const run = "reduced-motion";
  const { page, ctx, errors } = await newPage(browser, { width: 1440, height: 900, reduced: true });
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  check(
    run,
    "no preloader",
    !(await page.evaluate(() => document.documentElement.classList.contains("preload"))),
  );
  await sleep(4000);
  const landed = await page.evaluate(() => {
    const dot = document.querySelector("#base-camp [data-dot-actor]")?.getBoundingClientRect();
    const spot = document
      .querySelector('[data-dot-anchor="hero-landing"]')
      ?.getBoundingClientRect();
    return !!dot && !!spot && Math.abs(dot.top + dot.height / 2 - (spot.top + spot.height / 2)) < 3;
  });
  check(run, "hero Dot still reaches its spot (cross-fade, no hop)", landed);
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 800) {
    await scrollTo(page, y);
    await sleep(200);
  }
  await sleep(1000);
  check(run, "no pinned scenes", (await page.$$(".pin-spacer")).length === 0);
  const hidden = await page.$$eval(
    "[data-reveal]",
    (els) => els.filter((e) => Number(getComputedStyle(e).opacity) < 0.99).length,
  );
  check(
    run,
    "all revealed content visible after scrolling",
    hidden === 0,
    `${hidden} still hidden`,
  );
  await scrollTo(page, await topOf(page, "#blueprint"));
  await sleep(600);
  await shot(page, "reduced-5-blueprint");
  check(run, "no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

/** Is any Dot on screen (visible, opaque, inside the viewport)? */
const dotOnScreen = (page) =>
  page.evaluate(() =>
    // A Dot mid-flight between two spots counts as on screen.
    [...document.querySelectorAll("[data-dot-actor], [data-dot-flyer]")].some((a) => {
      const cs = getComputedStyle(a);
      if (cs.visibility !== "visible" || Number(cs.opacity) < 0.5) return false;
      const r = a.getBoundingClientRect();
      return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
    }),
  );

/** The Dot should never vanish while scrolling the home page (brief §3: it guides the whole climb). */
async function continuity(browser, label, viewport) {
  const run = `continuity-${label}`;
  const { page, ctx, errors } = await newPage(browser, viewport);
  await page.goto(BASE + "/work", { waitUntil: "networkidle0" });
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  await sleep(1500);
  const total = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
  const missing = [];
  const step = Math.round(viewport.height * 0.4);
  for (let y = 0; y <= total; y += step) {
    await scrollTo(page, y);
    await sleep(700);
    if (!(await dotOnScreen(page))) {
      const where = await page.evaluate(() => {
        const el = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
        const stage = el?.closest("[data-stage]")?.getAttribute("data-stage");
        if (stage) return `stage ${stage}`;
        return el?.closest("footer") ? "footer" : "between stages";
      });
      missing.push(`${y}px (${where})`);
    }
  }
  const samples = Math.floor(total / step) + 1;
  // The short night-sky fade between Stage 7 and the footer may briefly have no Dot.
  check(
    run,
    "a Dot is on screen all the way down",
    missing.length <= 1,
    `${samples - missing.length}/${samples} positions${missing.length ? "; missing at " + missing.join(", ") : ""}`,
  );
  check(run, "no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

/** Mobile gets lighter — not absent — versions of every scene (brief §9). */
async function mobileMotion(browser) {
  const run = "mobile-motion";
  const { page, ctx } = await newPage(browser, { width: 390, height: 844, mobile: true });
  await page.goto(BASE + "/work", { waitUntil: "networkidle0" });
  await page.goto(BASE + "/", { waitUntil: "networkidle0" });
  await sleep(1000);

  // Path: the Dot rides the trail down as you scroll.
  const lane = await topOf(page, "[data-path-lane]");
  const riderY = async () =>
    page.$eval("[data-path-dot]", (d) => new DOMMatrix(getComputedStyle(d).transform).m42);
  await scrollTo(page, lane - 300);
  await sleep(900);
  const y1 = await riderY();
  await scrollTo(page, lane + 500);
  await sleep(900);
  const y2 = await riderY();
  check(
    run,
    "Path Dot rides down the trail",
    y2 > y1 + 300,
    `${Math.round(y1)} → ${Math.round(y2)}px`,
  );

  // Climb: the Dot hops to the node at the middle of the screen.
  const climbTop = await topOf(page, "#the-climb");
  const visited = new Set();
  for (let k = 0; k < 8; k++) {
    await scrollTo(page, climbTop + 200 + k * 330);
    await sleep(800);
    visited.add(
      await page.$$eval("[data-node]", (ns) => ns.findIndex((n) => n.hasAttribute("data-active"))),
    );
  }
  check(
    run,
    "Climb Dot hops node to node",
    visited.size >= 5,
    `nodes visited: ${[...visited].join(",")}`,
  );
  await shot(page, "mobile-3-climb-dot");

  // Peaks: the elevator works on mobile too.
  await scrollTo(page, (await topOf(page, "#peaks")) + 900);
  await sleep(1200);
  const car = await page.$eval("[data-peaks-car]", (c) => c.getBoundingClientRect().top);
  check(
    run,
    "Peaks elevator keeps pace on mobile",
    car > 100 && car < 844 - 50,
    `car at ${Math.round(car)}px`,
  );
  await shot(page, "mobile-4-peaks");

  // Blueprint: the site builds itself without pinning.
  // The window is sticky; the build follows the captions (start "top 75%" → end "bottom 55%").
  const cap = await page.$eval("[data-bp-captions]", (c) => {
    const r = c.getBoundingClientRect();
    return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY };
  });
  const from = cap.top - 0.75 * 844;
  const to = cap.bottom - 0.55 * 844;
  const phases = [];
  let bpDotSeen = 0;
  for (let k = 0; k < 5; k++) {
    await scrollTo(page, from + ((to - from) * (k + 0.5)) / 5);
    await sleep(1000);
    phases.push(
      await page.$$eval("[data-bp-caption]", (cs) =>
        cs.findIndex((c) => !c.hasAttribute("data-dim")),
      ),
    );
    if (
      await page.evaluate(
        () =>
          getComputedStyle(document.querySelector("#blueprint [data-dot-actor]")).visibility ===
          "visible",
      )
    )
      bpDotSeen++;
    if (k === 2) await shot(page, "mobile-5-blueprint-building");
  }
  check(
    run,
    "Blueprint builds on mobile, phase by phase",
    phases.join() === "0,1,2,3,4",
    `phases: ${phases.join(",")}`,
  );
  check(
    run,
    "the Dot stays in the Blueprint window while it builds",
    bpDotSeen === 5,
    `${bpDotSeen}/5`,
  );
  await ctx.close();
}

/** The Path trail must never cross text, at any width. */
async function layout(browser) {
  const run = "layout";
  for (const width of [390, 768, 900, 1024, 1280, 1440, 1920]) {
    const { page, ctx } = await newPage(browser, { width, height: 900, mobile: width < 768 });
    await page.goto(BASE + "/work", { waitUntil: "networkidle0" }); // skip the first-visit preloader
    await page.goto(BASE + "/", { waitUntil: "networkidle0" });
    await scrollTo(page, (await topOf(page, "#the-path")) - 100);
    await sleep(600);
    const hits = await page.evaluate(() => {
      const trail = document.querySelector("[data-path-trail]").getBoundingClientRect();
      const texts = [
        ...document.querySelectorAll("#the-path h2, #the-path .label, #the-path li p"),
      ];
      return texts
        .filter((t) => {
          const r = t.getBoundingClientRect();
          return (
            r.left < trail.right &&
            r.right > trail.left &&
            r.top < trail.bottom &&
            r.bottom > trail.top
          );
        })
        .map((t) => t.textContent.trim().slice(0, 30));
    });
    check(run, `Path trail clear of text at ${width}px`, hits.length === 0, hits.join(" | "));
    if (width === 900) {
      await scrollTo(page, (await topOf(page, "#the-path")) + 200);
      await sleep(800);
      await shot(page, "layout-900-the-path");
    }
    await ctx.close();
  }
}

/** Returning visitor (no preloader) on a large screen: the hello still plays. */
async function returning(browser) {
  const run = "returning-1920";
  const { page, ctx, errors } = await newPage(browser, { width: 1920, height: 1080 });
  await page.goto(BASE + "/work", { waitUntil: "networkidle0" }); // marks the visit
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  check(
    run,
    "no preloader on a return visit",
    !(await page.evaluate(() => document.documentElement.classList.contains("preload"))),
  );
  const landed = await page
    .waitForFunction(
      () => {
        const dot = document.querySelector("#base-camp [data-dot-actor]")?.getBoundingClientRect();
        const spot = document
          .querySelector('[data-dot-anchor="hero-landing"]')
          ?.getBoundingClientRect();
        return (
          !!dot && !!spot && Math.abs(dot.top + dot.height / 2 - (spot.top + spot.height / 2)) < 3
        );
      },
      { timeout: 8000 },
    )
    .then(() => true)
    .catch(() => false);
  check(run, "hero hello plays at full screen", landed);
  await shot(page, "returning-1920-base-camp");
  check(run, "no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--hide-scrollbars"],
});
try {
  await desktop(browser);
  await mobile(browser);
  await reduced(browser);
  await returning(browser);
  await layout(browser);
  await mobileMotion(browser);
  await continuity(browser, "desktop", { width: 1440, height: 900 });
  await continuity(browser, "mobile", { width: 390, height: 844, mobile: true });
} finally {
  await browser.close();
}
await writeFile(path.join(OUT, "report.json"), JSON.stringify(results, null, 2));
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} checks passed. Screenshots: ${OUT}`);
process.exit(failed ? 1 : 0);
