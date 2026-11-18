/**
 * Contact Summit QA (phase 4): end-to-end form tests against mock services.
 *
 *   npm run build && npm run qa:contact
 *
 * Starts a mock server (Resend, Slack, CRM, Brevo) and two production servers:
 *   :3100 — wired to the mocks (the happy paths, spam traps, rate limit)
 *   :3101 — production with NO channels configured (must refuse, never lose a lead)
 * Drives real forms in headless Chrome and checks exactly what each service received.
 * Output: docs/qa/contact/*.png and report.json
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const OUT = path.resolve("docs/qa/contact");
const MOCK_PORT = 4010;
const CHROME =
  process.env.CHROME_PATH ??
  ["C:/Program Files/Google/Chrome/Application/chrome.exe", "/usr/bin/google-chrome"].find(Boolean);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (run, name, pass, detail = "") => {
  results.push({ run, name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  [${run}] ${name}${detail ? ` — ${detail}` : ""}`);
};

/* ------------------------------------------------------------------ mock services */
let received = [];
const mock = createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    let json = null;
    try {
      json = JSON.parse(body);
    } catch {
      /* not JSON */
    }
    received.push({ path: req.url, headers: req.headers, body: json });
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ id: `mock-${received.length}` }));
  });
});
await new Promise((r) => mock.listen(MOCK_PORT, "127.0.0.1", r));
const mockUrl = `http://127.0.0.1:${MOCK_PORT}`;
const reset = () => (received = []);
const waitFor = async (pred, ms = 6000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (pred()) return true;
    await sleep(100);
  }
  return false;
};

/* ------------------------------------------------------------------ servers */
function startServer(port, env) {
  const child = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(port)],
    {
      env: { ...process.env, NODE_ENV: "production", ...env },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let log = "";
  child.stdout.on("data", (d) => (log += d));
  child.stderr.on("data", (d) => (log += d));
  return {
    child,
    logs: () => log,
    ready: async () => {
      for (let i = 0; i < 60; i++) {
        try {
          const r = await fetch(`http://localhost:${port}/contact`);
          if (r.ok) return;
        } catch {
          /* not yet */
        }
        await sleep(500);
      }
      throw new Error(`server :${port} did not start\n${log}`);
    },
  };
}

const wired = startServer(3100, {
  RESEND_API_KEY: "test-key",
  RESEND_API_URL: `${mockUrl}/resend`,
  CONTACT_FROM_EMAIL: "Pinnacle Test <hello@example.test>",
  CONTACT_TO_EMAIL: "team@example.test",
  SLACK_WEBHOOK_URL: `${mockUrl}/slack`,
  CRM_WEBHOOK_URL: `${mockUrl}/crm`,
  CRM_WEBHOOK_SECRET: "s3cret",
  BREVO_API_KEY: "test-key",
  BREVO_LIST_ID: "7",
  BREVO_API_URL: `${mockUrl}/brevo`,
  DECK_URL: "https://example.test/pinnacle-capabilities.pdf",
  CAREERS_TO_EMAIL: "careers@example.test",
});
const bare = startServer(3101, {
  RESEND_API_KEY: "",
  SLACK_WEBHOOK_URL: "",
  CRM_WEBHOOK_URL: "",
  CONTACT_DRY_RUN: "",
});

await mkdir(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });

async function newPage({ width = 1280, height = 900, mobile = false, js = true } = {}) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width, height, isMobile: mobile, hasTouch: mobile });
  await page.setJavaScriptEnabled(js);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return { page, ctx, errors };
}

const shot = (page, name) =>
  page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
const visibleStep = (page) =>
  page.$$eval("[data-step]", (fs) => fs.findIndex((f) => getComputedStyle(f).display !== "none"));
const clickChip = (page, value) => page.click(`label:has(input[value="${value}"]) span`);
const next = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Next"))?.click(),
  );

async function fillBrief(page, { budget = "inr-20l-plus" } = {}) {
  await clickChip(page, "website");
  await clickChip(page, "ecommerce");
  await next(page);
  await sleep(300);
  await page.type(
    "textarea[name=about]",
    "We sell handmade ceramics and need a fast, beautiful store that tells our story.",
  );
  await next(page);
  await sleep(300);
  await clickChip(page, budget);
  await next(page);
  await sleep(300);
  await clickChip(page, "1-3m");
  await next(page);
  await sleep(300);
  await page.type("input[name=name]", "Test Climber");
  await page.type("input[name=email]", "climber@example.test");
  await page.type("input[name=company]", "Clay & Co");
  await page.select("select[name=source]", "instagram");
  await next(page);
  await sleep(400);
}

const BASE = "http://localhost:3100";

try {
  await Promise.all([wired.ready(), bare.ready()]);

  /* ---------------------------------------------------------- brief: happy path */
  {
    const run = "brief";
    reset();
    const { page, ctx, errors } = await newPage();
    await page.goto(`${BASE}/contact`, { waitUntil: "networkidle0" });
    check(run, "starts on step 1 (one question at a time)", (await visibleStep(page)) === 0);
    await shot(page, "1-brief-step1");

    // Validation: can't skip a step.
    await next(page);
    await sleep(300);
    const err1 = await page.evaluate(() => document.body.innerText.includes("Pick at least one"));
    check(
      run,
      "Next without an answer shows an error and stays",
      err1 && (await visibleStep(page)) === 0,
    );

    await fillBrief(page);
    check(run, "reaches the review step", (await visibleStep(page)) === 5);
    const focused = await page.evaluate(() => document.activeElement?.id);
    check(run, "focus moves to the current question", focused === "brief-step-5", focused);
    await shot(page, "2-brief-review");

    // Consent is required.
    await page.click("button[type=submit]");
    await sleep(400);
    check(
      run,
      "Send without consent is blocked",
      await page.evaluate(() => document.body.innerText.includes("Please agree")),
    );

    await page.click("input[name=consent]");
    await page.click("button[type=submit]");
    const delivered = await waitFor(() => received.length >= 4);
    const paths = received.map((r) => r.path).sort();
    check(run, "delivers to team email, auto-reply, CRM and Slack", delivered, paths.join(", "));

    const emails = received.filter((r) => r.path === "/resend/emails");
    const team = emails.find((e) => e.body?.to?.[0] === "team@example.test");
    const auto = emails.find((e) => e.body?.to?.[0] === "climber@example.test");
    check(
      run,
      "team email has the brief and reply-to",
      !!team &&
        team.body.reply_to === "climber@example.test" &&
        team.body.html.includes("handmade ceramics"),
    );
    check(
      run,
      "auto-reply goes to the client with next steps + Dot signature",
      !!auto &&
        auto.body.html.includes("What happens next") &&
        auto.body.html.includes("/email/dot.png"),
    );
    check(
      run,
      "Resend called with the API key",
      emails.every((e) => e.headers.authorization === "Bearer test-key"),
    );

    const crm = received.find((r) => r.path === "/crm");
    check(
      run,
      "CRM payload is complete and signed",
      crm?.headers["x-webhook-secret"] === "s3cret" &&
        crm.body.email === "climber@example.test" &&
        crm.body.budget === "inr-20l-plus" &&
        crm.body.projectTypes.join() === "website,ecommerce" &&
        crm.body.consent?.given === true,
    );
    const slack = received.find((r) => r.path === "/slack");
    check(
      run,
      "high-value lead flagged in Slack (call within 2 hours)",
      !!slack && slack.body.text.includes("High-value"),
      slack?.body?.text,
    );

    await page
      .waitForFunction(() => location.pathname === "/contact/thank-you", { timeout: 8000 })
      .catch(() => {});
    const url = new URL(page.url());
    check(
      run,
      "lands on the thank-you page with a reference",
      url.pathname === "/contact/thank-you" &&
        /^PB-\d{6}-[A-Z0-9]{4}$/.test(url.searchParams.get("ref") ?? ""),
      page.url(),
    );
    await sleep(1500);
    await shot(page, "3-thank-you");
    check(
      run,
      "draft cleared after sending",
      (await page.evaluate(() => localStorage.getItem("pn-brief-draft"))) === null,
    );
    check(run, "no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();
  }

  /* ---------------------------------------------------------- brief: lower-value lead not flagged */
  {
    const run = "brief-scoring";
    reset();
    const { page, ctx } = await newPage();
    await page.goto(`${BASE}/contact`, { waitUntil: "networkidle0" });
    await fillBrief(page, { budget: "inr-lt-1l" });
    await page.click("input[name=consent]");
    await sleep(3200);
    await page.click("button[type=submit]");
    await waitFor(() => received.some((r) => r.path === "/slack"));
    const slack = received.find((r) => r.path === "/slack");
    check(
      run,
      "small-budget lead is not flagged high-value",
      !!slack && !slack.body.text.includes("High-value"),
      slack?.body?.text,
    );
    await ctx.close();
  }

  /* ---------------------------------------------------------- draft save */
  {
    const run = "draft";
    const { page, ctx } = await newPage();
    await page.goto(`${BASE}/contact`, { waitUntil: "networkidle0" });
    await clickChip(page, "mobile-app");
    await next(page);
    await sleep(300);
    await page.type(
      "textarea[name=about]",
      "An app for climbers to log their routes and share them.",
    );
    await sleep(600);
    await page.reload({ waitUntil: "networkidle0" });
    await sleep(500);
    const restored = await page.evaluate(() =>
      document.body.innerText.includes("We kept your answers"),
    );
    const about = await page.$eval("textarea[name=about]", (t) => t.value);
    check(
      run,
      "progress is saved and restored after leaving",
      restored && about.startsWith("An app for climbers") && (await visibleStep(page)) === 1,
    );
    await ctx.close();
  }

  /* ---------------------------------------------------------- spam traps */
  {
    const run = "spam";
    reset();
    const { page, ctx } = await newPage();
    await page.goto(`${BASE}/contact`, { waitUntil: "networkidle0" });
    await fillBrief(page);
    await page.click("input[name=consent]");
    await page.$eval("input[name=website]", (i) => (i.value = "http://spam.example"));
    await sleep(3200);
    await page.click("button[type=submit]");
    await sleep(2500);
    check(
      run,
      "honeypot: bot sees success, nothing is delivered",
      received.length === 0,
      `${received.length} requests`,
    );
    await ctx.close();

    const p2 = await newPage();
    await p2.page.goto(`${BASE}/contact`, { waitUntil: "networkidle0" });
    await fillBrief(p2.page);
    await p2.page.click("input[name=consent]");
    await p2.page.$eval("input[name=startedAt]", (i) => (i.value = String(Date.now())));
    await p2.page.click("button[type=submit]");
    await sleep(2500);
    check(
      run,
      "time trap: an instant submission is dropped",
      received.length === 0,
      `${received.length} requests`,
    );
    await p2.ctx.close();
  }

  /* ---------------------------------------------------------- home quick form + rate limit */
  {
    const run = "home-quick";
    reset();
    const { page, ctx, errors } = await newPage();
    await page.goto(`${BASE}/work`, { waitUntil: "networkidle0" });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.getElementById("summit").scrollIntoView());
    await sleep(3500);
    const form = "#summit form";
    await page.type(`${form} input[name=name]`, "Quick Tester");
    await page.type(`${form} input[name=email]`, "quick@example.test");
    await page.type(`${form} input[name=what]`, "A portfolio site");
    await page.click(`${form} input[name=consent]`);
    await page.click(`${form} button[type=submit]`);
    const ok = await waitFor(() => received.length >= 4);
    check(
      run,
      "quick enquiry delivered to all channels",
      ok,
      received.map((r) => r.path).join(", "),
    );
    await sleep(800);
    const celebrated = await page.evaluate(
      () =>
        document.getElementById("summit").hasAttribute("data-celebrate") &&
        document.body.innerText.includes("You reached the summit"),
    );
    check(run, "success: pyramid glows, Dot celebrates, thank-you message", celebrated);
    await shot(page, "4-home-quick-success");
    check(run, "no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();

    // 5 per 10 minutes per visitor: four more succeed, the sixth is refused.
    const outcomes = [];
    for (let i = 0; i < 5; i++) {
      const p = await newPage();
      await p.page.goto(`${BASE}/work`, { waitUntil: "networkidle0" });
      await p.page.goto(`${BASE}/`, { waitUntil: "networkidle0" });
      await p.page.$eval(
        `${form} input[name=startedAt]`,
        (el) => (el.value = String(Date.now() - 10000)),
      );
      await p.page.type(`${form} input[name=name]`, `Burst ${i}`);
      await p.page.type(`${form} input[name=email]`, `burst${i}@example.test`);
      await p.page.type(`${form} input[name=what]`, "Spam burst");
      await p.page.click(`${form} input[name=consent]`);
      await p.page.click(`${form} button[type=submit]`);
      await sleep(2000);
      outcomes.push(
        await p.page.evaluate(() =>
          document.body.innerText.includes("Please wait a few minutes")
            ? "limited"
            : document.body.innerText.includes("You reached the summit")
              ? "ok"
              : "?",
        ),
      );
      await p.ctx.close();
    }
    check(
      run,
      "rate limit: 6th enquiry in 10 minutes is refused",
      outcomes.join() === "ok,ok,ok,ok,limited",
      outcomes.join(","),
    );
  }

  /* ---------------------------------------------------------- newsletter */
  {
    const run = "newsletter";
    reset();
    const { page, ctx } = await newPage();
    await page.goto(`${BASE}/work`, { waitUntil: "networkidle0" });
    await sleep(3200);
    const f = "footer form";
    await page.type(`${f} input[name=email]`, "reader@example.test");
    await page.click(`${f} input[name=consent]`);
    await page.click(`${f} button[type=submit]`);
    const ok = await waitFor(() => received.some((r) => r.path === "/brevo/contacts"));
    const sub = received.find((r) => r.path === "/brevo/contacts");
    check(
      run,
      "subscriber added to the Brevo list",
      ok && sub.body.email === "reader@example.test" && sub.body.listIds[0] === 7,
    );
    await sleep(500);
    check(
      run,
      "confirmation shown",
      await page.evaluate(() => document.body.innerText.includes("You’re on the list")),
    );
    await ctx.close();
  }

  /* ---------------------------------------------------------- capabilities deck */
  {
    const run = "deck";
    reset();
    const { page, ctx } = await newPage();
    await page.goto(`${BASE}/services#capabilities-deck`, { waitUntil: "networkidle0" });
    await sleep(3200);
    const f = "#capabilities-deck form";
    await page.type(`${f} input[name=email]`, "buyer@example.test");
    await page.click(`${f} input[name=consent]`);
    await page.click(`${f} button[type=submit]`);
    await waitFor(() => received.some((r) => r.body?.to?.[0] === "buyer@example.test"));
    const mail = received.find((r) => r.body?.to?.[0] === "buyer@example.test");
    check(
      run,
      "deck link emailed to the requester",
      !!mail && mail.body.html.includes("pinnacle-capabilities.pdf"),
    );
    check(
      run,
      "team is told about the request (CRM/Slack)",
      received.some((r) => r.path === "/crm") && received.some((r) => r.path === "/slack"),
    );
    await sleep(500);
    check(
      run,
      "confirmation shown",
      await page.evaluate(() => document.body.innerText.includes("On its way")),
    );
    await ctx.close();
  }

  /* ---------------------------------------------------------- job application */
  {
    const run = "careers";
    reset();
    const { page, ctx, errors } = await newPage();
    await page.goto(`${BASE}/careers/example-role`, { waitUntil: "networkidle0" });
    await sleep(3200);
    const f = "form:has(input[name=portfolio])";
    await page.type(`${f} input[name=name]`, "Ada Applicant");
    await page.type(`${f} input[name=email]`, "ada@example.test");
    await page.type(`${f} input[name=portfolio]`, "not-a-link");
    await page.type(
      `${f} textarea[name=message]`,
      "I design and build interfaces with care and love motion.",
    );
    await page.click(`${f} input[name=consent]`);
    await page.click(`${f} button[type=submit]`);
    await sleep(1500);
    check(
      run,
      "invalid portfolio link is rejected with a clear message",
      await page.evaluate(() => document.body.innerText.includes("Add a link to your portfolio")),
    );
    // Everything else the applicant typed must still be there after the error.
    const kept = await page.$eval(`${f} input[name=name]`, (i) => i.value);
    check(
      run,
      "fields keep their values after a validation error",
      kept === "Ada Applicant",
      `name field: "${kept}"`,
    );
    await page.$eval(`${f} input[name=portfolio]`, (i) => (i.value = ""));
    await page.type(`${f} input[name=portfolio]`, "https://ada.example.test");
    await page.click(`${f} button[type=submit]`);
    await waitFor(() => received.some((r) => r.body?.to?.[0] === "careers@example.test"));
    const team = received.find((r) => r.body?.to?.[0] === "careers@example.test");
    check(
      run,
      "application goes to the careers inbox",
      !!team && team.body.html.includes("ada.example.test"),
    );
    check(run, "applications never enter the sales CRM", !received.some((r) => r.path === "/crm"));
    check(
      run,
      "applicant gets a thank-you email",
      received.some((r) => r.body?.to?.[0] === "ada@example.test"),
    );
    check(run, "no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();
  }

  /* ---------------------------------------------------------- no JavaScript */
  {
    const run = "no-js";
    reset();
    const { page, ctx } = await newPage({ js: false });
    await page.goto(`${BASE}/contact`, { waitUntil: "load" });
    const allVisible = await page.$$eval("[data-step]", (fs) => fs.length);
    check(run, "all questions shown as one form", allVisible === 6);
    await page.click(`label:has(input[value="branding"]) input`);
    await page.type("textarea[name=about]", "A new identity for our bakery chain, plus packaging.");
    await page.click(`label:has(input[value="inr-3-8l"]) input`);
    await page.click(`label:has(input[value="flexible"]) input`);
    await page.type("input[name=name]", "No Script");
    await page.type("input[name=email]", "noscript@example.test");
    await page.click("input[name=consent]");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "load" }).catch(() => {}),
      page.click("button[type=submit]"),
    ]);
    await sleep(1500);
    const ok = await page.evaluate(() => document.body.innerText.includes("your brief is with us"));
    check(
      run,
      "brief submits and confirms without JavaScript",
      ok && received.some((r) => r.path === "/crm"),
      `${received.length} requests`,
    );
    await shot(page, "5-no-js-success");
    await ctx.close();
  }

  /* ---------------------------------------------------------- mobile */
  {
    const run = "mobile";
    const { page, ctx, errors } = await newPage({ width: 390, height: 844, mobile: true });
    await page.goto(`${BASE}/contact`, { waitUntil: "networkidle0" });
    await page.evaluate(() =>
      document
        .querySelector("form[aria-label='Project brief']")
        .scrollIntoView({ block: "center" }),
    );
    await sleep(800);
    await shot(page, "6-mobile-step1");
    await clickChip(page, "web-app");
    await next(page);
    await next(page);
    await sleep(500);
    await shot(page, "7-mobile-error");
    check(run, "mobile flow + inline errors work", (await visibleStep(page)) === 1);
    check(run, "no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
    await ctx.close();
  }

  /* ---------------------------------------------------------- production, nothing configured */
  {
    const run = "unconfigured-production";
    const { page, ctx } = await newPage();
    await page.goto(`http://localhost:3101/work`, { waitUntil: "networkidle0" });
    await page.goto(`http://localhost:3101/`, { waitUntil: "networkidle0" });
    const form = "#summit form";
    await page.$eval(
      `${form} input[name=startedAt]`,
      (el) => (el.value = String(Date.now() - 10000)),
    );
    await page.type(`${form} input[name=name]`, "Lost Lead");
    await page.type(`${form} input[name=email]`, "lost@example.test");
    await page.type(`${form} input[name=what]`, "Anything");
    await page.click(`${form} input[name=consent]`);
    await page.click(`${form} button[type=submit]`);
    await sleep(2000);
    const refused = await page.evaluate(() =>
      document.body.innerText.includes("didn’t go through"),
    );
    check(run, "refuses instead of silently losing the lead", refused);
    await ctx.close();
  }
} finally {
  await browser.close();
  wired.child.kill();
  bare.child.kill();
  mock.close();
}

await writeFile(path.join(OUT, "report.json"), JSON.stringify(results, null, 2));
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} checks passed. Screenshots: ${OUT}`);
process.exit(failed ? 1 : 0);
