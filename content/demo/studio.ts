import type { Job, Media, TeamMember } from "../../lib/cms/types";

/**
 * DEMO CONTENT — fictional team, roles, story and numbers, used only in demo mode
 * (lib/demo.ts). Portraits are illustrations, not photos of real people.
 */

const portrait = (id: string, name: string): Media => ({
  kind: "image",
  url: `/demo/people/${id}.webp`,
  alt: `Illustrated portrait of ${name}`,
  width: 480,
  height: 480,
});

export const demoTeam: TeamMember[] = [
  [
    "aarav",
    "Aarav Mehta",
    "Founder & Design Director",
    "Has climbed to Everest Base Camp twice — the second time on purpose.",
  ],
  [
    "meera",
    "Meera Iyer",
    "Engineering Lead",
    "Refactors her spice rack alphabetically and by heat.",
  ],
  ["kabir", "Kabir Sethi", "Product Designer", "Owns 41 notebooks. Has finished three."],
  ["zoya", "Zoya Khan", "Motion Designer", "Animates her grocery lists. Nobody asked."],
  [
    "rohan",
    "Rohan D’Souza",
    "Full-stack Developer",
    "Can explain recursion with a plate of momos.",
  ],
  ["isha", "Isha Kapoor", "Project Manager", "Has never missed a deadline or a sunrise trek."],
].map(([id, name, role, funFact], i) => ({
  id: `demo-${id}`,
  name: name!,
  role: role!,
  photo: portrait(id!, name!),
  funFact: funFact!,
  socials: [],
  order: i + 1,
  placeholder: false,
}));

export const demoJobs: Job[] = [
  {
    slug: "senior-product-designer",
    title: "Senior Product Designer",
    type: "Full-time",
    location: "Hybrid · India",
    summary:
      "Lead the design of web and mobile products from first sketch to shipped release, alongside engineers from day one.",
    description: [
      "You'll own the design of two or three client products a year, run discovery with real users, and keep our design system honest.",
      "Six months in, you'll have shipped a release you're proud of and mentored one of our junior designers.",
    ],
    requirements: [
      "5+ years designing digital products, with shipped work to show",
      "Comfortable presenting to founders and to engineers",
      "Motion or front-end skills (nice to have)",
    ],
    applyUrl: null,
    open: true,
    placeholder: false,
  },
  {
    slug: "frontend-engineer",
    title: "Frontend Engineer (React)",
    type: "Full-time",
    location: "Remote · India",
    summary: "Build fast, accessible interfaces in React and Next.js, and care how they feel.",
    description: [
      "You'll turn designs into production code with designers beside you, own performance budgets, and help shape our component library.",
    ],
    requirements: [
      "3+ years with React and TypeScript",
      "You measure performance and accessibility, not just guess",
      "GSAP or animation experience (nice to have)",
    ],
    applyUrl: null,
    open: true,
    placeholder: false,
  },
];

const photo = (n: number, alt: string): Media => ({
  kind: "image",
  url: `/demo/studio/studio-${n}.webp`,
  alt,
  width: 1200,
  height: 900,
});

/** Everything else the pages show in demo mode. */
export const demoStudio = {
  story:
    "Pinnacle started with two friends, one borrowed desk and a belief that websites should be remembered, not just visited. Six years on, we're a small team that still sweats every pixel and every millisecond.",
  mission: "Build digital products people remember — and that quietly work for years.",
  vision: "A studio where craft and speed stop being a trade-off.",
  milestones: [
    { year: "2020", text: "Two founders, one borrowed desk, first client in Pune." },
    { year: "2022", text: "First international project; the team grows to six." },
    { year: "2025", text: "48 products shipped for teams in 11 countries." },
  ],
  numbers: {
    "Projects shipped": "48",
    "Years climbing": "6",
    "Client rating": "4.9/5",
    "Countries served": "11",
  } as Record<string, string>,
  trust: ["Kestrel", "Saffron & Salt", "Tidewell", "Arcline", "Folio", "Northbay"],
  studioPhotos: [
    photo(1, "Sticky notes from a discovery workshop"),
    photo(2, "Wireframes pinned to the studio wall"),
    photo(3, "A desk mid-project: laptop, notebook, coffee"),
    photo(4, "Colour and type swatches for a brand system"),
  ],
  /** Process stages (content/studio.ts processPhases) → typical durations. */
  processDurations: {
    Discover: "1–2 weeks",
    Strategy: "1 week",
    Design: "3–5 weeks",
    Build: "4–10 weeks",
    Test: "1–2 weeks",
    Launch: "1 week",
    Grow: "Ongoing",
  } as Record<string, string>,
  /** Blueprint Room phases → typical durations. */
  blueprintDurations: {
    Sketch: "Week 1",
    Wireframe: "Weeks 1–2",
    Design: "Weeks 2–5",
    Code: "Weeks 4–10",
    Launch: "Weeks 10–12",
  } as Record<string, string>,
  pricing: {
    "web-development": { price: "From ₹2.5L / $4k", engagement: "Fixed price" },
    "web-apps": { price: "From ₹6L / $9k", engagement: "Dedicated team" },
    "mobile-apps": { price: "From ₹7L / $10k", engagement: "Dedicated team" },
    "ui-ux-design": { price: "From ₹1.5L / $2.5k", engagement: "Fixed price" },
    ecommerce: { price: "From ₹3L / $5k", engagement: "Fixed price" },
    "branding-motion": { price: "From ₹1.8L / $3k", engagement: "Fixed price" },
    "care-plans": { price: "From ₹25k / $400 a month", engagement: "Monthly retainer" },
  } as Record<string, { price: string; engagement: string }>,
  projectsFrom: "₹1.5L / $2.5k",
  industries: ["Fintech", "Healthcare", "Food & hospitality", "Mobility", "Education", "Retail"],
  benefits: [
    "Hybrid weeks — your call",
    "A yearly learning budget",
    "Top-spec hardware",
    "Quiet December, half days",
  ],
};
