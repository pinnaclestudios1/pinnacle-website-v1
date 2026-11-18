"use client";

/**
 * Sanity Studio, embedded at /studio (brief §10: the team adds projects, posts and
 * jobs without code). Requires NEXT_PUBLIC_SANITY_PROJECT_ID — until then /studio
 * shows setup instructions.
 */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

export default defineConfig({
  name: "pinnacle",
  title: "Pinnacle Studios",
  basePath: "/studio",
  projectId: projectId || "not-configured",
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Site settings")
              .id("siteSettings")
              .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
            S.divider(),
            S.documentTypeListItem("project").title("Projects"),
            S.documentTypeListItem("service").title("Services"),
            S.documentTypeListItem("testimonial").title("Testimonials"),
            S.documentTypeListItem("teamMember").title("Team"),
            S.documentTypeListItem("job").title("Jobs"),
            S.documentTypeListItem("faqGroup").title("FAQ"),
            S.divider(),
            S.documentTypeListItem("post").title("Journal (v2)"),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
