/**
 * The first case study and open role the running site actually lists — the seed
 * placeholders (project-one, example-role) or demo content (lib/demo.ts), whichever
 * the build serves — so every QA script checks real detail pages either way.
 */
async function firstLink(base, listPath, prefix) {
  const html = await (await fetch(`${base}${listPath}`)).text();
  const m = html.match(new RegExp(`href="(${prefix}/[a-z0-9-]+)"`));
  if (!m) throw new Error(`No ${prefix}/… link found on ${listPath}`);
  return m[1];
}

export async function detailRoutes(base) {
  const [project, job] = await Promise.all([
    firstLink(base, "/work", "/work"),
    firstLink(base, "/careers", "/careers"),
  ]);
  return { project, job };
}
