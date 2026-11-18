/**
 * TODO inventory (phase 7, brief: "a list of everything still marked TODO").
 * Scans source, content and config for `TODO` markers (comments, <Todo> placeholders,
 * "TODO: confirm" copy) and writes docs/qa/TODO-INVENTORY.md grouped by who has to act.
 *
 *   npm run qa:todos
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(".");
const DIRS = ["app", "components", "lib", "content", "sanity", "styles"];
const FILES = ["next.config.ts", ".env.example", "sanity.config.ts"];
const EXT = /\.(tsx?|mts|css|md)$/;
const OUT = path.resolve("docs/qa/TODO-INVENTORY.md");

/** First matching rule wins. */
const GROUPS = [
  {
    id: "legal",
    title: "Legal review",
    test: /legal|lawyer|privacy|terms|cookie polic|DPDP|GDPR|grievance|retention/i,
  },
  {
    id: "keys",
    title: "Accounts, keys and services",
    test: /TODO\((keys|launch)\)|api key|\benv\b|env\(|NEXT_PUBLIC|webhook|Sanity project|Resend|Turnstile|Sentry|Cal\.com|Calendly|Brevo|HSTS|domain|uptime|analytics/i,
  },
  {
    id: "decisions",
    title: "Decisions",
    test: /pricing|price|budget|choose|decide|decision|which|or Plausible|HubSpot|Zoho|lead-score|threshold/i,
  },
  {
    id: "content",
    title: "Content and assets to supply",
    test: /provide|supply|case stud|testimonial|logo|photo|image|video|number|client|team|role|reel|deck|address|email|phone|whatsapp|social|profile|registration|company|name|font|year|summary|title|metric|result|industr|duration|timeline|story|mission|vision|statement|fun fact|location|type|URL|city|platform|stack|benefit|opening|requirement|moodboard|architecture|typical|response time|engagement|services|measures|\{/i,
  },
  { id: "confirm", title: "Copy and values to confirm", test: /confirm|draft|sign-off/i },
  { id: "other", title: "Other", test: /.*/ },
];

async function walk(dir) {
  const out = [];
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (EXT.test(e.name) && !e.name.endsWith(".ndjson")) out.push(p);
  }
  return out;
}

const clean = (s) =>
  s
    .replace(/^\s*(\/\/|\/\*+|\*|#|\{\/\*)\s?/, "")
    .replace(/\*\/\}?\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();

const files = [
  ...(await Promise.all(DIRS.map((d) => walk(path.join(ROOT, d))))).flat(),
  ...FILES.map((f) => path.join(ROOT, f)),
];

const items = [];
for (const file of files) {
  let text;
  try {
    text = await readFile(file, "utf8");
  } catch {
    continue;
  }
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  text.split("\n").forEach((line, i) => {
    if (!/TODO|<Todo[\s>]/.test(line)) return;
    // Skip the TODO component itself and code that only detects TODO markers.
    if (/components\/ui\/Todo\.tsx$/.test(rel)) return;
    // Comments that only explain how TODO markers work.
    if (
      /renders TODO|TODO label|TODO markers|marked TODO|\(no TODO\)|"TODO: …"|start with "TODO:"/.test(
        line,
      )
    )
      return;
    if (/startsWith\("TODO|\/TODO\/|replace\(\/\^TODO|isTodo|TODO\\b|"TODO:"\)/.test(line)) return;
    let note = clean(line);
    const jsx = line.match(/<Todo>([^<]*)<\/Todo>/);
    if (jsx) note = `Placeholder: ${jsx[1].trim()}`;
    if (note.length > 180) note = note.slice(0, 177) + "…";
    const group = GROUPS.find((g) => g.test.test(note)).id;
    items.push({ file: rel, line: i + 1, note, group });
  });
}

const byGroup = Object.fromEntries(GROUPS.map((g) => [g.id, []]));
items.forEach((it) => byGroup[it.group].push(it));

const date = new Date().toISOString().slice(0, 10);
let md = `# TODO inventory\n\nGenerated ${date} by \`npm run qa:todos\` — ${items.length} markers in ${new Set(items.map((i) => i.file)).size} files.\n\n`;
md += `Everything here is visible on the site as a dashed \`TODO\` tag, or is a code comment that blocks launch. `;
md += `\`docs/TODO.md\` is the short, human list of what the studio needs to provide; this file is the exhaustive one.\n\n`;
md += `| Group | Count |\n| --- | --- |\n`;
for (const g of GROUPS)
  if (byGroup[g.id].length) md += `| ${g.title} | ${byGroup[g.id].length} |\n`;
for (const g of GROUPS) {
  const list = byGroup[g.id];
  if (!list.length) continue;
  md += `\n## ${g.title} (${list.length})\n\n| Where | What |\n| --- | --- |\n`;
  for (const it of list) md += `| \`${it.file}:${it.line}\` | ${it.note.replace(/\|/g, "\\|")} |\n`;
}

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, md);
console.log(`${items.length} TODO markers → ${path.relative(ROOT, OUT)}`);
for (const g of GROUPS)
  if (byGroup[g.id].length) console.log(`  ${g.title}: ${byGroup[g.id].length}`);
