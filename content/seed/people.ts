import type { Job, TeamMember } from "../../lib/cms/types";

/** Team — PLACEHOLDERS. TODO: real names, roles, photos and fun facts (with consent). */
export const team: TeamMember[] = [1, 2, 3, 4].map((n) => ({
  id: `member-${n}`,
  name: null,
  role: null,
  photo: null,
  funFact: null,
  socials: [],
  order: n,
  placeholder: true,
}));

/**
 * Jobs — one PLACEHOLDER role so the job-post template can be reviewed.
 * TODO: real openings in the CMS (or mark this one closed).
 */
export const jobs: Job[] = [
  {
    slug: "example-role",
    title: "TODO: Role title",
    type: null,
    location: null,
    summary: "TODO: two sentences on the role and why it matters.",
    description: [
      "TODO: what you’ll do, who you’ll work with, what success looks like in six months.",
    ],
    requirements: ["TODO: requirement", "TODO: requirement", "TODO: nice to have"],
    applyUrl: null,
    open: true,
    placeholder: true,
  },
];
