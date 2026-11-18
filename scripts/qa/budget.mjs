/**
 * Initial-JS budget (brief §11: ~200KB gzip). For each route, sums the gzip size of
 * every <script src> the server HTML loads (modern browsers: nomodule polyfills are
 * excluded). Lazy chunks (scenes, cursor, sound, consent, analytics) are not counted —
 * they load after first paint.
 *
 *   npm run build && npm start      # in one terminal
 *   npm run qa:budget               # in another
 */
import { gzipSync } from "node:zlib";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const LIMIT = Number(process.env.BUDGET_KB ?? 200);
const ROUTES = [
  "/",
  "/work",
  "/work/project-one",
  "/services/web-development",
  "/about",
  "/faq",
  "/contact",
  "/cookies",
];

const cache = new Map();
async function gz(src) {
  if (!cache.has(src)) {
    const body = Buffer.from(await (await fetch(BASE + src)).arrayBuffer());
    cache.set(src, gzipSync(body, { level: 9 }).length);
  }
  return cache.get(src);
}

let worst = 0;
for (const route of ROUTES) {
  const html = await (await fetch(BASE + route)).text();
  const srcs = [...html.matchAll(/<script\b([^>]*)\bsrc="([^"]+)"([^>]*)>/g)]
    .filter((m) => !/nomodule/i.test(m[1] + m[3]))
    .map((m) => m[2].replace(/&amp;/g, "&"))
    .filter((s) => s.startsWith("/_next/"));
  const unique = [...new Set(srcs)];
  let total = 0;
  for (const s of unique) total += await gz(s);
  const kb = total / 1024;
  worst = Math.max(worst, kb);
  console.log(
    `${kb <= LIMIT ? "PASS" : "FAIL"}  ${route.padEnd(28)} ${kb.toFixed(1)} KB gzip (${unique.length} scripts)`,
  );
}
console.log(`\nLargest: ${worst.toFixed(1)} KB (budget ${LIMIT} KB)`);
process.exit(worst <= LIMIT ? 0 : 1);
