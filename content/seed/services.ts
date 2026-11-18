import type { Service, ServiceStep } from "../../lib/cms/types";

/**
 * Seed services — DRAFT copy written from the brief's service list (brief §4, §6).
 * Everything here is "TODO: confirm"; prices are left empty pending the pricing decision.
 * Slugs must match lib/site.ts (they are the sitemap URLs).
 */

const process = (discover: string, build: string): ServiceStep[] => [
  { title: "Discover", text: discover },
  { title: "Design", text: "Wireframes, then high-fidelity screens you review and shape with us." },
  { title: "Build", text: build },
  { title: "Launch & grow", text: "We launch, measure, and keep improving after go-live." },
];

const base = { startingPrice: null, relatedProjects: [] as string[], draft: true };

export const services: Service[] = [
  {
    ...base,
    slug: "web-development",
    name: "Web Design & Development",
    summary: "Fast, memorable websites designed and built in-house.",
    whatItIs:
      "Marketing sites, product sites and content-rich platforms — designed around your story and engineered to be fast, accessible and easy to update.",
    whoFor: "Founders, growing companies and brands whose website is their best salesperson.",
    problems: [
      "Your site looks like everyone else’s and doesn’t convert.",
      "It’s slow on mobile and hard for your team to update.",
      "Search engines and social previews don’t show you at your best.",
    ],
    deliverables: [
      "Information architecture and copy guidance",
      "Responsive design for every page",
      "Production build with a CMS your team can use",
      "SEO, analytics and performance setup",
      "Launch support and handover",
    ],
    process: process(
      "Goals, audience, competitors and a content audit.",
      "Modern, fast front-end and a CMS — tested on real devices.",
    ),
    techStack: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Headless CMS (Sanity)",
      "Vercel",
    ],
    engagement: "Fixed-price project",
    faqs: [
      {
        question: "Can my team edit the site after launch?",
        answer: ["Yes — content lives in a CMS built for your team, and we train you on it."],
        draft: true,
      },
      {
        question: "Do you write the copy?",
        answer: ["We can, or we can shape copy you already have. TODO: confirm offer."],
        draft: true,
      },
    ],
  },
  {
    ...base,
    slug: "web-apps",
    name: "Web Apps & SaaS",
    summary: "Product-grade web applications, from first release to scale.",
    whatItIs:
      "Dashboards, portals, internal tools and SaaS products — designed for daily use and built to grow.",
    whoFor:
      "Startups shipping a first version and teams modernising a product people already rely on.",
    problems: [
      "Your product idea needs a first version, fast, without cutting corners that hurt later.",
      "An existing app is slow, hard to change or confusing to use.",
      "You need design and engineering under one roof.",
    ],
    deliverables: [
      "Product discovery and scope",
      "UX flows and UI design",
      "Front-end and back-end build",
      "Authentication, payments and integrations",
      "Testing, deployment and monitoring",
    ],
    process: process(
      "Users, jobs-to-be-done and the smallest valuable first release.",
      "Iterative sprints with a demo every sprint.",
    ),
    techStack: ["React", "Next.js", "Node.js", "TypeScript", "PostgreSQL", "AWS / Vercel"],
    engagement: "Fixed scope for v1, then a dedicated team or retainer",
    faqs: [
      {
        question: "Can you work with our existing codebase?",
        answer: ["Usually, yes. We start with a short technical review. TODO: confirm."],
        draft: true,
      },
      {
        question: "Who owns the code?",
        answer: ["TODO: confirm ownership terms (see the FAQ page)."],
        draft: true,
      },
    ],
  },
  {
    ...base,
    slug: "mobile-apps",
    name: "Mobile Apps",
    summary: "iOS and Android apps that feel at home on every device.",
    whatItIs:
      "Cross-platform and native mobile apps — from first prototype to App Store and Play Store launch.",
    whoFor: "Products where the phone is the main way customers meet you.",
    problems: [
      "You need iOS and Android without building everything twice.",
      "Your current app has poor reviews and low retention.",
      "Launching on the stores feels like a maze.",
    ],
    deliverables: [
      "App UX and UI design",
      "Cross-platform or native build",
      "Back-end and API integration",
      "Store listings and release",
      "Analytics and crash reporting",
    ],
    process: process(
      "Core journeys, platforms and success metrics.",
      "Builds on real devices every sprint, then store submission.",
    ),
    techStack: [
      "Flutter",
      "React Native",
      "Swift / Kotlin (where needed)",
      "Firebase",
      "TODO: confirm",
    ],
    engagement: "Fixed-price v1, then a monthly retainer",
    faqs: [
      {
        question: "Flutter or React Native?",
        answer: [
          "We recommend one after discovery, based on your team and product. TODO: confirm.",
        ],
        draft: true,
      },
    ],
  },
  {
    ...base,
    slug: "ui-ux-design",
    name: "UI/UX & Product Design",
    summary: "Research-led interfaces people understand at first glance.",
    whatItIs: "User research, product strategy, UX flows, interface design and design systems.",
    whoFor: "Teams with a product to improve, or a new product to shape before engineering starts.",
    problems: [
      "Users get lost or drop off in key flows.",
      "Your product looks inconsistent as it grows.",
      "Engineering is waiting on design decisions.",
    ],
    deliverables: [
      "Research and usability testing",
      "User flows and wireframes",
      "High-fidelity UI in Figma",
      "Design system and component library",
      "Developer-ready handoff",
    ],
    process: process(
      "Interviews, analytics and a review of the current experience.",
      "Prototypes tested with real users, then a design system for scale.",
    ),
    techStack: ["Figma", "FigJam", "Usability testing", "Design systems"],
    engagement: "Fixed-price project or design retainer",
    faqs: [
      {
        question: "Can you design for our developers to build?",
        answer: ["Yes — we deliver developer-ready files and stay available during the build."],
        draft: true,
      },
    ],
  },
  {
    ...base,
    slug: "ecommerce",
    name: "E-commerce",
    summary: "Online stores built to convert and easy to run.",
    whatItIs:
      "Shopify and headless storefronts with fast product pages, smooth checkout and the integrations you need.",
    whoFor: "D2C brands and retailers moving online or outgrowing a template store.",
    problems: [
      "Product pages are slow and conversion is low.",
      "Your store looks generic next to competitors.",
      "Payments, shipping and inventory don’t talk to each other.",
    ],
    deliverables: [
      "Store strategy and UX",
      "Custom theme or headless storefront",
      "Payments (Razorpay / Stripe) and shipping setup",
      "Product and content migration",
      "Analytics and conversion tracking",
    ],
    process: process(
      "Catalogue, customers, operations and the numbers that matter.",
      "Storefront build, integrations and test orders before launch.",
    ),
    techStack: ["Shopify", "Next.js Commerce", "Razorpay / Stripe", "Headless CMS"],
    engagement: "Fixed-price build, then a care plan",
    faqs: [
      {
        question: "Can you migrate our existing store?",
        answer: ["Yes — products, customers and content. TODO: confirm scope limits."],
        draft: true,
      },
    ],
  },
  {
    ...base,
    slug: "branding-motion",
    name: "Branding & Motion",
    summary: "Identities and motion systems with character.",
    whatItIs:
      "Brand identity, visual systems, mascots and motion — the kind of character that made our Dot.",
    whoFor: "New companies finding their voice and established ones ready for a refresh.",
    problems: [
      "Your brand looks dated or forgettable.",
      "Everything looks different across web, social and product.",
      "Static visuals don’t capture attention any more.",
    ],
    deliverables: [
      "Brand strategy and naming support",
      "Logo and identity system",
      "Brand guidelines",
      "Mascot and illustration",
      "Motion system, reels and Rive / Lottie animations",
    ],
    process: process(
      "Positioning, audience and the feeling the brand should give.",
      "Identity, then a motion system tested across real channels.",
    ),
    techStack: ["Figma", "Illustrator", "After Effects", "Rive", "Lottie"],
    engagement: "Fixed-price project",
    faqs: [
      {
        question: "Do you make social reels too?",
        answer: ["Yes — the same characters and motion system carry across reels and posts."],
        draft: true,
      },
    ],
  },
  {
    ...base,
    slug: "care-plans",
    name: "Maintenance & Growth",
    summary: "Care plans that keep your product fast, secure and improving.",
    whatItIs:
      "Ongoing updates, monitoring, performance, security and a monthly improvement budget.",
    whoFor:
      "Anyone with a live site or app who wants it to keep getting better, not just stay online.",
    problems: [
      "Nobody owns updates, so the site slowly breaks.",
      "Small fixes wait weeks.",
      "You don’t know what to improve next.",
    ],
    deliverables: [
      "Dependency and security updates",
      "Uptime and error monitoring",
      "Monthly performance and analytics report",
      "A set number of improvement hours",
      "Priority support",
    ],
    process: [
      { title: "Audit", text: "We review performance, security and analytics." },
      { title: "Plan", text: "We agree priorities for the month." },
      { title: "Improve", text: "Updates, fixes and improvements, every month." },
      { title: "Report", text: "A clear monthly report and next steps." },
    ],
    techStack: ["Monitoring (Sentry)", "Uptime checks", "Analytics", "CI/CD"],
    engagement: "Monthly retainer",
    faqs: [
      {
        question: "Can you look after a site you didn’t build?",
        answer: ["Yes, after a short onboarding audit. TODO: confirm."],
        draft: true,
      },
    ],
  },
];
