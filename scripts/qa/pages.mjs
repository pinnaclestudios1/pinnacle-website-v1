/**
 * Inner pages QA (phase 5): every route at desktop and mobile, plus page behaviours.
 *
 *   npm run build && npm start      # in one terminal
 *   npm run qa:pages                # in another
 *
 * Output: docs/qa/pages/*.png and report.json
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { detailRoutes } from "./routes.mjs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const DETAIL = await detailRoutes(BASE);
const OUT = path.resolve("docs/qa/pages");
const CHROME =
  process.env.CHROME_PATH ??
  ["C:/Program Files/Google/Chrome/Application/chrome.exe", "/usr/bin/google-chrome"].find(Boolean);

const ROUTES = [
  "/work",
  DETAIL.project,
  "/services",
  "/services/web-development",
  "/services/mobile-apps",
  "/services/care-plans",
  "/process",
  "/about",
  "/careers",
  DETAIL.job,
  "/faq",
  "/hello",
  "/contact",
  "/contact/book",
  "/contact/thank-you",
  "/privacy",
  "/terms",
  "/cookies",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (run, name, pass, detail = "") => {
  results.push({ run, name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  [${run}] ${name}${detail ? ` — ${detail}` : ""}`);
};

await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });

async function newPage(viewport) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport(viewport);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return { page, ctx, errors };
}

const slug = (r) => r.replace(/\//g, "_").replace(/^_/, "") || "home";

try {
  /* ------------------------------------------------ every route, two viewports */
  for (const [label, viewport] of [
    ["desktop", { width: 1440, height: 900 }],
    ["mobile", { width: 390, height: 844, isMobile: true, hasTouch: true }],
  ]) {
    const { page, ctx, errors } = await newPage(viewport);
    for (const route of ROUTES) {
      errors.length = 0;
      const res = await page.goto(BASE + route, { waitUntil: "networkidle0" });
      await sleep(400);
      const facts = await page.evaluate(() => ({
        h1: document.querySelectorAll("h1").length,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        imgsNoAlt: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt"))
          .length,
        title: document.title,
      }));
      const ok =
        res?.status() === 200 &&
        facts.h1 === 1 &&
        facts.overflow <= 1 &&
        facts.imgsNoAlt === 0 &&
        errors.length === 0;
      check(
        label,
        `${route}`,
        ok,
        ok
          ? facts.title
          : `status ${res?.status()}, h1=${facts.h1}, overflow=${facts.overflow}px, imgs without alt=${facts.imgsNoAlt}, errors=${errors.slice(0, 2).join(" | ")}`,
      );
      await page.screenshot({ path: path.join(OUT, `${label}-${slug(route)}.png`) });
    }
    await ctx.close();
  }

  /* ------------------------------------------------ behaviours */
  const { page, ctx, errors } = await newPage({ width: 1440, height: 900 });

  // Work filters (URL-driven, the Dot hops to the chosen filter).
  await page.goto(`${BASE}/work`, { waitUntil: "networkidle0" });
  const count = () => page.$$eval("[data-project]", (els) => els.length);
  const all = await count();
  const dotX = () =>
    page.evaluate(
      () =>
        new DOMMatrix(
          getComputedStyle(
            document
              .querySelector("[data-filter-all]")
              .closest("div.relative")
              .querySelector(".absolute"),
          ).transform,
        ).m41,
    );
  const x0 = await dotX();
  await page.click('a[href*="platform=ios"]');
  await page
    .waitForFunction(() => location.search.includes("platform=ios"), { timeout: 4000 })
    .catch(() => {});
  await sleep(900);
  const filtered = await count();
  const x1 = await dotX();
  check(
    "work",
    "platform filter narrows the grid and updates the URL",
    filtered < all && page.url().includes("platform=ios"),
    `${all} → ${filtered}`,
  );
  check(
    "work",
    "the Dot hops to the selected filter",
    Math.abs(x1 - x0) > 20,
    `x ${Math.round(x0)} → ${Math.round(x1)}`,
  );
  await page.goto(`${BASE}/work?platform=ios&service=ecommerce`, { waitUntil: "networkidle0" });
  check(
    "work",
    "empty filter combination shows the Lost Dot empty state",
    await page.evaluate(() => document.body.innerText.includes("No peaks on this trail yet")),
  );

  // Case study template.
  await page.goto(`${BASE}${DETAIL.project}`, { waitUntil: "networkidle0" });
  const sections = await page.$$eval("h2", (hs) => hs.map((h) => h.textContent.trim()));
  const needed = [
    "At a glance",
    "The challenge",
    "The approach",
    "Design",
    "Build",
    "Motion and details",
    "Results",
  ];
  check(
    "case-study",
    "has every section from the brief",
    needed.every((n) => sections.includes(n)),
    sections.join(", "),
  );
  const robots = await page.$eval('meta[name="robots"]', (m) => m.content).catch(() => "");
  check("case-study", "placeholder case study is noindex", robots.includes("noindex"), robots);

  // FAQ: the Dot hops to the opened question.
  await page.goto(`${BASE}/faq`, { waitUntil: "networkidle0" });
  await sleep(500);
  const riderY = () =>
    page.evaluate(
      () =>
        new DOMMatrix(
          getComputedStyle(
            document.querySelector("details").closest(".relative").querySelector(".absolute"),
          ).transform,
        ).m42,
    );
  const y0 = await riderY();
  const summaries = await page.$$("summary");
  await summaries[4].click();
  await sleep(900);
  const opened = await page.evaluate(() => document.querySelectorAll("details[open]").length);
  const y1 = await riderY();
  check(
    "faq",
    "question opens (native details) and the Dot hops to it",
    opened === 1 && y1 - y0 > 100,
    `y ${Math.round(y0)} → ${Math.round(y1)}`,
  );

  // Trail scene initialises on inner pages.
  for (const route of ["/services", "/process"]) {
    await page.goto(BASE + route, { waitUntil: "networkidle0" });
    await page.evaluate(() => window.scrollTo(0, 900));
    await sleep(1200);
    const motion = await page.$eval('[data-scene="path"]', (s) => s.getAttribute("data-motion"));
    check(
      "trail",
      `${route}: the Dot rides the trail`,
      motion === "desktop",
      motion ?? "not initialised",
    );
  }

  // About: team nodes reveal their card (touch/keyboard friendly).
  await page.goto(`${BASE}/about`, { waitUntil: "networkidle0" });
  await page.click("button[aria-controls^='member-']");
  check(
    "about",
    "team node toggles its card",
    (await page.$eval("button[aria-controls^='member-']", (b) =>
      b.getAttribute("aria-expanded"),
    )) === "true",
  );

  // Studio: full screen, no site chrome; setup notice until Sanity is configured.
  await page.goto(`${BASE}/studio`, { waitUntil: "networkidle0" });
  const studio = await page.evaluate(() => ({
    header: !!document.querySelector("header"),
    footer: !!document.querySelector("footer"),
    notice: document.body.innerText.includes("Connect Sanity"),
  }));
  check("studio", "renders without site chrome", !studio.header && !studio.footer);
  check("studio", "shows setup steps until a Sanity project is connected", studio.notice);

  // SEO plumbing.
  const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
  check("seo", "sitemap lists service pages", sitemap.includes("/services/care-plans"));
  check(
    "seo",
    "sitemap leaves out placeholder case studies and roles",
    !sitemap.includes("/work/project-one") && !sitemap.includes("/careers/example-role"),
  );
  const notFound = await fetch(`${BASE}/work/does-not-exist`);
  check("seo", "unknown case study returns 404", notFound.status === 404, String(notFound.status));

  check(
    "behaviours",
    "no console or page errors",
    errors.length === 0,
    errors.slice(0, 3).join(" | "),
  );
  await ctx.close();
} finally {
  await browser.close();
}

await writeFile(path.join(OUT, "report.json"), JSON.stringify(results, null, 2));
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} checks passed. Screenshots: ${OUT}`);
process.exit(failed ? 1 : 0);
