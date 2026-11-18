/**
 * Cross-browser smoke test (phase 7, brief §12: "Chrome, Safari, Firefox, Edge").
 * Drives the browsers installed on this machine — Chrome, Edge (Chromium) and Firefox
 * (WebDriver BiDi) — through every route at desktop and mobile widths and checks:
 *   no script errors · an <h1> · no horizontal overflow · brand fonts loaded ·
 *   a Dot on screen (home) · the brief form's first step advances.
 * Safari (WebKit) can't run on Windows: test it on a Mac / iPhone (docs/LAUNCH.md).
 *
 *   npm run build && npm start      # in one terminal
 *   npm run qa:browsers             # in another
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve("docs/qa/browsers");
const BROWSERS = [
  {
    name: "chrome",
    browser: "chrome",
    path: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  },
  {
    name: "edge",
    browser: "chrome",
    path: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  },
  { name: "firefox", browser: "firefox", path: "C:/Program Files/Mozilla Firefox/firefox.exe" },
].filter((b) => existsSync(b.path));

const ROUTES = [
  "/",
  "/work",
  "/work/project-one",
  "/services",
  "/services/web-development",
  "/process",
  "/about",
  "/careers",
  "/careers/example-role",
  "/faq",
  "/hello",
  "/contact",
  "/contact/book",
  "/privacy",
  "/terms",
  "/cookies",
  "/this-page-does-not-exist",
];
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (run, name, pass, detail = "") => {
  results.push({ run, name, pass, detail });
  if (!pass || process.env.VERBOSE)
    console.log(`${pass ? "PASS" : "FAIL"}  [${run}] ${name}${detail ? ` — ${detail}` : ""}`);
};

await mkdir(OUT, { recursive: true });

for (const b of BROWSERS) {
  let browser;
  try {
    browser = await puppeteer.launch({
      browser: b.browser,
      executablePath: b.path,
      headless: true,
      // Windows Firefox starts through a launcher process; make it wait for the browser.
      args: b.browser === "firefox" ? ["-wait-for-browser", "-no-remote"] : [],
    });
  } catch (e) {
    // e.g. a browser mid-update exits straight away; report it and test the others.
    check(`${b.name}`, "browser launches", false, String(e.message ?? e).split(/\r?\n/)[0]);
    continue;
  }
  const version = await browser.version();
  console.log(`\n${b.name}: ${version}`);

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e.message ?? e)));
    // First visit plays the preloader; mark as visited so pages are inspected straight away.
    await page.goto(BASE + "/privacy", { waitUntil: "load" });
    await page.evaluate(() => localStorage.setItem("pn-visited", "1"));

    for (const route of ROUTES) {
      const run = `${b.name} ${vp.name} ${route}`;
      errors.length = 0;
      await page.goto(BASE + route, { waitUntil: "load" });
      await sleep(1200);
      const info = await page.evaluate(() => ({
        h1: !!document.querySelector("h1")?.textContent?.trim(),
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        fonts:
          document.fonts.status === "loaded" &&
          [...document.fonts].some((f) => f.status === "loaded"),
      }));
      check(run, "no script errors", errors.length === 0, errors.slice(0, 2).join(" | "));
      check(run, "has a heading", info.h1);
      check(run, "no horizontal overflow", info.overflow <= 1, `${info.overflow}px`);
      check(run, "brand fonts loaded", info.fonts);
    }

    // Home: a Dot is on screen at a few points down the page.
    {
      const run = `${b.name} ${vp.name} home Dot`;
      await page.goto(BASE + "/", { waitUntil: "load" });
      await sleep(2500);
      const total = await page.evaluate(() => document.body.scrollHeight - innerHeight);
      let seen = 0;
      const points = [0, 0.25, 0.5, 0.75];
      for (const f of points) {
        await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * f));
        await sleep(1200);
        const on = await page.evaluate(() =>
          [...document.querySelectorAll("[data-dot-actor], [data-dot-flyer]")].some((a) => {
            const cs = getComputedStyle(a);
            const r = a.getBoundingClientRect();
            return (
              cs.visibility === "visible" &&
              Number(cs.opacity) > 0.5 &&
              r.bottom > 0 &&
              r.top < innerHeight &&
              r.width > 0
            );
          }),
        );
        if (on) seen++;
      }
      check(
        run,
        "a Dot is on screen while scrolling",
        seen >= points.length - 1,
        `${seen}/${points.length}`,
      );
      await page.evaluate(() => window.scrollTo(0, 0));
      await sleep(400);
      await page.screenshot({ path: path.join(OUT, `${b.name}-${vp.name}-home.png`) });
    }

    // Contact: the first step of the brief advances.
    {
      const run = `${b.name} ${vp.name} contact`;
      // The brief keeps an unfinished draft (pn-brief-draft) and resumes it; start fresh.
      await page.evaluate(() => localStorage.removeItem("pn-brief-draft"));
      await page.goto(BASE + "/contact", { waitUntil: "load" });
      await sleep(1200);
      // Same approach as the contact suite: one [data-step] fieldset shows at a time.
      const visibleStep = () =>
        page.$$eval("[data-step]", (fs) =>
          fs.findIndex((f) => getComputedStyle(f).display !== "none"),
        );
      const before = await visibleStep();
      let advanced = `no steps (visible ${before})`;
      if (before === 0) {
        await page.click('[data-step] label:has(input[value="website"]) span');
        await page.evaluate(() =>
          [...document.querySelectorAll("button")]
            .find((x) => x.textContent?.includes("Next"))
            ?.click(),
        );
        await sleep(700);
        const after = await visibleStep();
        advanced = after === 1 ? "ok" : `stayed on step ${after + 1}`;
      }
      check(run, "brief form step 1 advances", advanced === "ok", advanced);
      await page.screenshot({ path: path.join(OUT, `${b.name}-${vp.name}-contact.png`) });
    }
    await page.close();
  }
  await browser.close();
}

await writeFile(path.join(OUT, "report.json"), JSON.stringify(results, null, 2));
const failed = results.filter((r) => !r.pass).length;
console.log(
  `\n${results.length - failed}/${results.length} checks passed (${BROWSERS.map((b) => b.name).join(", ")}).`,
);
process.exit(failed ? 1 : 0);
