/**
 * Sanity connection settings (brief §10: Sanity, hosted). Until a project exists,
 * the site serves the local seed in content/seed — see lib/cms/index.ts.
 * TODO(keys): create the project at sanity.io/manage and set these in the hosting env.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = "2026-11-01";
export const cmsEnabled = projectId.length > 0;
