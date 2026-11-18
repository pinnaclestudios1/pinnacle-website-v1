/**
 * Keyboard + reduced-motion QA (phase 7, brief §11 WCAG 2.2 AA, §12 "reduced-motion and
 * keyboard checked"). For each route, tabs through the whole page and checks:
 *  - focus always moves forward and never gets trapped (2.1.2 No Keyboard Trap)
 *  - every stop has a visible focus indicator (2.4.7 Focus Visible)
 *  - the focused element is not hidden behind the sticky header (2.4.11 Focus Not Obscured)
 *  - the skip link is the first stop and moves focus to <main> (2.4.1 Bypass Blocks)
 * Plus: the mobile menu traps focus while open and returns it on Escape; with
 * reduced motion, nothing animates on its own.
 *
 *   npm run build && npm start      # in one terminal
 *   npm run qa:keyboard             # in another
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve("docs/qa/keyboard");
const CHROME = process.env.CHROME_PATH ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const ROUTES = [
  "/",
  "/work",
  "/work/project-one",
  "/services",
  "/services/web-development",
  "/process",
  "/about",
  "/careers/example-role",
  "/faq",
  "/contact",
  "/cookies",
];
const MAX_STOPS = 160;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (run, name, pass, detail = "") => {
  results.push({ run, name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  [${run}] ${name}${detail ? ` — ${detail}` : ""}`);
};

await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });

async function newPage(viewport, reduced = false) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport(viewport);
  if (reduced)
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem("pn-visited", "1");
    } catch {}
  });
  return { page, ctx };
}

/** Describe the focused element and test its focus ring + visibility. */
const inspectFocus = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return { body: true };
    const cs = getComputedStyle(el);
    const ring =
      (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) ||
      (cs.boxShadow && cs.boxShadow !== "none") ||
      el.matches(":focus-visible") === false; // mouse focus doesn't need a ring
    const r = el.getBoundingClientRect();
    const header = document.querySelector("header");
    const hb =
      header && getComputedStyle(header).position !== "static"
        ? header.getBoundingClientRect().bottom
        : 0;
    const inView = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
    // Not obscured: some part of the element is below the sticky header.
    const obscured = !header?.contains(el) && r.bottom <= hb + 1 && r.height > 0;
    const label =
      el.getAttribute("aria-label") ||
      el.textContent?.trim().replace(/\s+/g, " ").slice(0, 40) ||
      el.getAttribute("name") ||
      el.tagName;
    const key = `${el.tagName}|${label}|${Math.round(r.left)}|${Math.round(r.top + scrollY)}`;
    return {
      body: false,
      ring,
      inView,
      obscured,
      label,
      tag: el.tagName,
      key,
      size: r.width * r.height,
    };
  });

for (const route of ROUTES) {
  const run = `tab ${route}`;
  const { page, ctx } = await newPage({ width: 1440, height: 900 });
  await page.goto(BASE + route, { waitUntil: "networkidle0" });
  await sleep(800);

  // Skip link
  await page.keyboard.press("Tab");
  const first = await inspectFocus(page);
  check(run, "first Tab lands on the skip link", /skip/i.test(first.label ?? ""), first.label);
  await page.keyboard.press("Enter");
  await sleep(300);
  const afterSkip = await page.evaluate(() => {
    const a = document.activeElement;
    return !!a && (a.tagName === "MAIN" || !!a.closest("main"));
  });
  check(run, "skip link moves focus to the main content", afterSkip);

  // Tab through everything from the top.
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    document.activeElement?.blur?.();
  });
  const seen = new Set();
  const noRing = [];
  const hidden = [];
  const covered = [];
  let stops = 0;
  let cycled = false;
  let stuck = 0;
  let last = "";
  for (; stops < MAX_STOPS; stops++) {
    await page.keyboard.press("Tab");
    await sleep(60);
    const f = await inspectFocus(page);
    if (f.body) {
      if (stops > 3) {
        cycled = true;
        break;
      }
      continue;
    }
    if (f.key === last) stuck++;
    else stuck = 0;
    last = f.key;
    if (stuck >= 3) break;
    if (seen.has(f.key)) {
      cycled = true;
      break;
    }
    seen.add(f.key);
    if (!f.ring) noRing.push(f.label);
    if (!f.inView && f.size > 4) hidden.push(f.label);
    if (f.obscured) covered.push(f.label);
  }
  check(
    run,
    "focus moves through the page without a trap",
    stuck < 3 && (cycled || stops >= MAX_STOPS),
    `${seen.size} stops`,
  );
  check(run, "every stop shows a focus ring", noRing.length === 0, noRing.slice(0, 4).join(" | "));
  check(
    run,
    "focused elements scroll into view",
    hidden.length === 0,
    hidden.slice(0, 4).join(" | "),
  );
  check(
    run,
    "focus is never hidden under the sticky header",
    covered.length === 0,
    covered.slice(0, 4).join(" | "),
  );
  await ctx.close();
}

/* Mobile menu: opens with the keyboard, keeps focus inside, Escape returns focus. */
{
  const run = "mobile menu";
  const { page, ctx } = await newPage({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(BASE + "/work", { waitUntil: "networkidle0" });
  await sleep(600);
  const btn = await page.$(
    "header button[aria-haspopup], header button[aria-controls], header button[aria-expanded]",
  );
  check(run, "menu button exists", !!btn);
  if (btn) {
    await btn.focus();
    await page.keyboard.press("Enter");
    await sleep(500);
    const inside = [];
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      await sleep(40);
      // A native modal <dialog> lets focus pass to the browser's own UI after the last
      // item (activeElement = body); what matters is it never reaches the page behind.
      inside.push(
        await page.evaluate(() => {
          const a = document.activeElement;
          return !a || a === document.body || !!a.closest("dialog[open]");
        }),
      );
    }
    check(
      run,
      "focus never reaches the page behind the menu",
      inside.every(Boolean),
      `${inside.filter(Boolean).length}/25 inside`,
    );
    await page.keyboard.press("Escape");
    await sleep(500);
    const back = await page.evaluate(() => {
      const open = !!document.querySelector("dialog[open]");
      const a = document.activeElement;
      return { open, onButton: !!a?.closest("header") && a.tagName === "BUTTON" };
    });
    check(run, "Escape closes the menu", !back.open);
    check(run, "focus returns to the menu button", back.onButton);
  }
  await ctx.close();
}

/* Reduced motion: nothing moves on its own; content is all there. */
for (const route of ["/", "/process", "/about", "/contact"]) {
  const run = `reduced ${route}`;
  const { page, ctx } = await newPage({ width: 1440, height: 900 }, true);
  await page.goto(BASE + route, { waitUntil: "networkidle0" });
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 80));
    }
    scrollTo(0, 0);
  });
  await sleep(1500);
  const moving = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.playState === "running")
      .filter((a) => {
        const t = a.effect?.getTiming?.();
        const dur = typeof t?.duration === "number" ? t.duration : 0;
        return t?.iterations === Infinity || dur > 1000;
      })
      .map(
        (a) => a.animationName || a.effect?.target?.className?.toString?.().slice(0, 40) || "anim",
      ),
  );
  check(run, "no looping or long animations", moving.length === 0, moving.slice(0, 4).join(" | "));
  const hiddenContent = await page.evaluate(
    () =>
      [...document.querySelectorAll("main h1, main h2, main h3, main p")].filter((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.height > 0 &&
          Number(getComputedStyle(el).opacity) < 0.1 &&
          !el.closest("[aria-hidden='true'],[data-bp-code]")
        );
      }).length,
  );
  check(run, "all text content is visible", hiddenContent === 0, `${hiddenContent} hidden`);
  await ctx.close();
}

await browser.close();
await writeFile(path.join(OUT, "report.json"), JSON.stringify(results, null, 2));
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} checks passed.`);
process.exit(failed ? 1 : 0);
