/**
 * Studio content that isn't a CMS model in the brief (§10): the process phases,
 * values and benefits. Edit here. DRAFT copy — TODO: confirm.
 */

/** /process — the full Blueprint Room, one phase per section (brief §6). */
export const processPhases = [
  {
    id: "discover",
    name: "Discover",
    what: "We learn your business, users, competitors and goals, and audit what you already have.",
    get: "A shared understanding of the problem and what success looks like.",
    you: "A kickoff workshop and access to anything you already have (analytics, brand, content).",
  },
  {
    id: "strategy",
    name: "Strategy",
    what: "We turn findings into a plan: sitemap or product scope, priorities and a roadmap.",
    get: "A scope, sitemap or feature map, and a timeline everyone agrees on.",
    you: "Review and sign off the plan.",
  },
  {
    id: "design",
    name: "Design",
    what: "Wireframes first, then high-fidelity design and motion — desktop and mobile.",
    get: "Clickable prototypes and a design system.",
    you: "Feedback rounds on wireframes and designs.",
  },
  {
    id: "build",
    name: "Build",
    what: "Front-end, back-end, CMS and integrations, built in sprints.",
    get: "A staging site or test builds you can try every sprint.",
    you: "A demo every sprint and quick decisions when we need them.",
  },
  {
    id: "test",
    name: "Test",
    what: "Real devices, browsers, speed, accessibility and SEO — then fixes.",
    get: "A QA report: Lighthouse, accessibility and a cleared bug list.",
    you: "User-acceptance testing on staging.",
  },
  {
    id: "launch",
    name: "Launch",
    what: "Go live, connect analytics and Search Console, and watch closely.",
    get: "A live product, handover and training.",
    you: "A final go-ahead — then celebrate.",
  },
  {
    id: "grow",
    name: "Grow",
    what: "Measure, learn and improve: content, A/B tests, new features.",
    get: "Monthly reports and a backlog of improvements.",
    you: "A monthly check-in.",
  },
] as const;

export const collaborationTools = ["Figma", "Slack", "Notion", "Jira", "GitHub"];

export const communicationPromise = [
  {
    title: "Weekly updates",
    text: "A short written update every week — progress, next steps, anything we need.",
  },
  { title: "A demo every sprint", text: "See real, working progress, not just status reports." },
  { title: "A dedicated project manager", text: "One person who knows your project inside out." },
];

/** /about — values (3–5, each with a small Dot illustration). Drafted from the brief's design principles. */
export const values = [
  {
    title: "Craft over noise",
    text: "One loud thing, everything else calm. We sweat the details so you don’t have to.",
    pose: "happy",
  },
  {
    title: "Show, don’t tell",
    text: "Our work is our pitch. We prototype early and let you feel it.",
    pose: "sunglasses",
  },
  {
    title: "Delight never blocks",
    text: "Beautiful is only good when it’s also fast, accessible and clear.",
    pose: "idle",
  },
  {
    title: "Climb together",
    text: "Weekly updates, honest advice, no surprises — we’re on the rope with you.",
    pose: "flag",
  },
] as const;

/** /careers */
export const careers = {
  why: [
    {
      title: "Work people remember",
      text: "Small team, ambitious projects, and room to do your best work.",
    },
    {
      title: "Craft is the culture",
      text: "We review each other’s work generously and ship with pride.",
    },
    { title: "Grow on purpose", text: "Time and budget for learning — TODO: confirm specifics." },
  ],
  benefits: ["TODO: benefit", "TODO: benefit", "TODO: benefit", "TODO: benefit"],
  hiring: [
    { title: "Apply", text: "Send your portfolio or GitHub and a few lines about you." },
    { title: "Intro call", text: "A friendly 30-minute chat. TODO: confirm." },
    {
      title: "Craft task or review",
      text: "A short, paid task or a walk through past work. TODO: confirm.",
    },
    { title: "Offer", text: "We move fast and keep you posted at every step." },
  ],
};

/** Engagement models (brief §7). */
export const engagementModels = [
  {
    title: "Fixed price",
    text: "A clear scope, timeline and cost — best for websites and first releases.",
  },
  {
    title: "Dedicated team",
    text: "Designers and engineers working as part of your team, month to month.",
  },
  {
    title: "Monthly retainer",
    text: "A set number of hours each month for improvements, support and growth.",
  },
];

/** Industries served (brief §7). TODO: the studio's real focus industries. */
export const industries: string[] = [];
