/**
 * Lighthouse reports (phase 7, brief §11/§12: "Lighthouse 85+ on mobile for Home,
 * Work and Contact"). Runs mobile (Lighthouse's default: Moto G Power, slow 4G,
 * 4× CPU throttling) and desktop for each route against a production build.
 *
 *   npm run build && npm start      # in one terminal
 *   npm run qa:lighthouse           # in another
 *
 * Output: docs/qa/lighthouse/<route>-<form>.html + summary.json.
 * Exits 1 if any mobile Performance score on the brief's three pages is under 85,
 * or any Accessibility / Best practices / SEO score is under 90.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import { detailRoutes } from "./routes.mjs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const DETAIL = await detailRoutes(BASE);
const OUT = path.resolve("docs/qa/lighthouse");
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const KEY = ["/", "/work", "/contact"]; // the brief's launch-checklist pages
const ROUTES = [...KEY, "/services/web-development", DETAIL.project, "/about", "/process"];
/** Lighthouse varies run to run: the brief's pages on mobile use the median of 3. */
const RUNS = Number(process.env.LH_RUNS ?? 3);
const runsFor = (route, form) => (form === "mobile" && KEY.includes(route) ? RUNS : 1);

const slug = (r) => r.replace(/\//g, "_").replace(/^_/, "") || "home";
const pct = (n) => Math.round((n ?? 0) * 100);

await mkdir(OUT, { recursive: true });
const chrome = await chromeLauncher.launch({
  chromePath: CHROME,
  chromeFlags: ["--headless=new", "--no-first-run"],
});

const summary = [];
let failed = false;

for (const form of ["mobile", "desktop"]) {
  for (const route of ROUTES) {
    // Median of RUNS by performance score (Lighthouse varies run to run).
    const results = [];
    for (let i = 0; i < runsFor(route, form); i++) {
      const res = await lighthouse(
        BASE + route,
        {
          port: chrome.port,
          output: "html",
          logLevel: "error",
          onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        },
        form === "desktop" ? desktopConfig : undefined,
      );
      results.push(res);
    }
    results.sort((a, b) => a.lhr.categories.performance.score - b.lhr.categories.performance.score);
    const { lhr, report } = results[Math.floor(results.length / 2)];
    await writeFile(path.join(OUT, `${slug(route)}-${form}.html`), report);

    const a = lhr.audits;
    const row = {
      route,
      form,
      performance: pct(lhr.categories.performance.score),
      accessibility: pct(lhr.categories.accessibility.score),
      bestPractices: pct(lhr.categories["best-practices"].score),
      seo: pct(lhr.categories.seo.score),
      lcp: a["largest-contentful-paint"].displayValue,
      fcp: a["first-contentful-paint"].displayValue,
      tbt: a["total-blocking-time"].displayValue,
      cls: a["cumulative-layout-shift"].displayValue,
      si: a["speed-index"].displayValue,
    };
    summary.push(row);

    const perfOk = form !== "mobile" || !KEY.includes(route) || row.performance >= 85;
    // Draft case studies are deliberately noindex: that alone shouldn't fail SEO.
    const seoFails = Object.values(lhr.audits).filter(
      (x) => x.score === 0 && lhr.categories.seo.auditRefs.some((r) => r.id === x.id),
    );
    const noindexOnly = seoFails.length > 0 && seoFails.every((x) => x.id === "is-crawlable");
    row.note = noindexOnly ? "noindex (draft page, intentional)" : undefined;
    const restOk =
      row.accessibility >= 90 && row.bestPractices >= 90 && (row.seo >= 90 || noindexOnly);
    if (!perfOk || !restOk) failed = true;
    console.log(
      `${perfOk && restOk ? "PASS" : "FAIL"}  [${form}] ${route.padEnd(26)} ` +
        `P${row.performance} A${row.accessibility} BP${row.bestPractices} SEO${row.seo}  ` +
        `LCP ${row.lcp} · TBT ${row.tbt} · CLS ${row.cls}${row.note ? `  (${row.note})` : ""}`,
    );
  }
}

await chrome.kill();
await writeFile(path.join(OUT, "summary.json"), JSON.stringify(summary, null, 2));
console.log(`\nReports: ${path.relative(process.cwd(), OUT)}`);
process.exit(failed ? 1 : 0);
