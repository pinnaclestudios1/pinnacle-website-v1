/**
 * Accessibility QA (phase 6, brief §11: WCAG 2.2 AA). Runs axe-core on every route at
 * desktop and mobile widths, with motion both on and reduced, after scrolling the page
 * so lazy sections and scroll scenes have rendered.
 *
 *   npm run build && npm start      # in one terminal
 *   npm run qa:a11y                 # in another
 *
 * Output: docs/qa/a11y/report.json. Exits 1 on any violation.
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import puppeteer from "puppeteer-core";

const require = createRequire(import.meta.url);
const AXE = await readFile(require.resolve("axe-core/axe.min.js"), "utf8");

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve("docs/qa/a11y");
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

const ROUTES = [
  "/",
  "/work",
  "/work/project-one",
  "/services",
  "/services/web-development",
  "/services/ecommerce",
  "/process",
  "/about",
  "/careers",
  "/careers/example-role",
  "/faq",
  "/hello",
  "/contact",
  "/contact/book",
  "/contact/thank-you",
  "/privacy",
  "/terms",
  "/cookies",
  "/this-page-does-not-exist",
];

const RUNS = [
  { name: "desktop", viewport: { width: 1440, height: 900 }, reduced: false },
  {
    name: "mobile",
    viewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
    reduced: false,
  },
  { name: "desktop-reduced", viewport: { width: 1440, height: 900 }, reduced: true },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });

const report = [];
let total = 0;

for (const run of RUNS) {
  for (const route of ROUTES) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.setViewport(run.viewport);
    if (run.reduced)
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    // Skip the first-visit preloader and the consent banner timing.
    await page.evaluateOnNewDocument(() => {
      try {
        localStorage.setItem("pn-visited", "1");
      } catch {}
    });
    await page.goto(BASE + route, { waitUntil: "networkidle0" });
    // Scroll through so every lazy scene and reveal has run, then back to the top.
    await page.evaluate(async () => {
      const step = innerHeight * 0.8;
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      scrollTo(0, 0);
    });
    await sleep(900);
    await page.evaluate(AXE);
    const res = await page.evaluate(async () => {
      const r = await axe.run(document, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"],
        },
        resultTypes: ["violations"],
      });
      return r.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes
          .slice(0, 6)
          .map((n) => ({ target: n.target.join(" "), summary: n.failureSummary })),
        count: v.nodes.length,
      }));
    });
    total += res.length;
    report.push({ run: run.name, route, violations: res });
    console.log(
      `${res.length ? "FAIL" : "PASS"}  [${run.name}] ${route}${res.length ? ` — ${res.map((v) => `${v.id}(${v.count})`).join(", ")}` : ""}`,
    );
    for (const v of res) for (const n of v.nodes) console.log(`        ${v.id}: ${n.target}`);
    await ctx.close();
  }
}

// The consent banner, reopened from "Cookie settings" (it is otherwise only shown when
// GA4 / Clarity are configured).
{
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.evaluateOnNewDocument(() => localStorage.setItem("pn-visited", "1"));
  await page.goto(BASE + "/cookies", { waitUntil: "networkidle0" });
  await page.$eval("main [data-open-consent]", (b) => {
    b.scrollIntoView({ block: "center" });
    b.click();
  });
  const shown = await page
    .waitForSelector("[data-consent-banner]", { timeout: 4000 })
    .then(() => true)
    .catch(() => false);
  await sleep(500);
  await page.evaluate(AXE);
  const res = shown
    ? await page.evaluate(async () => {
        const r = await axe.run("[data-consent-banner]", {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
        });
        return r.violations.map((v) => ({ id: v.id, count: v.nodes.length, nodes: [] }));
      })
    : [{ id: "banner-did-not-open", count: 1, nodes: [] }];
  total += res.length;
  report.push({ run: "banner", route: "/cookies", violations: res });
  console.log(
    `${res.length ? "FAIL" : "PASS"}  [banner] consent banner${res.length ? ` — ${res.map((v) => v.id).join(", ")}` : ""}`,
  );
  await ctx.close();
}

await browser.close();
await writeFile(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(
  `\n${total ? `${total} violation group(s)` : "No violations"} across ${report.length} page runs.`,
);
process.exit(total ? 1 : 0);
