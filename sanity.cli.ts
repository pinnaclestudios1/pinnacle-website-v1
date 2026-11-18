import { defineCliConfig } from "sanity/cli";

/** For `npx sanity dataset import`, `npx sanity cors add`, etc. */
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  },
});
