# TODO inventory

Generated 2026-11-21 by `npm run qa:todos` — 184 markers in 52 files.

Everything here is visible on the site as a dashed `TODO` tag, or is a code comment that blocks launch. `docs/TODO.md` is the short, human list of what the studio needs to provide; this file is the exhaustive one.

| Group | Count |
| --- | --- |
| Legal review | 10 |
| Accounts, keys and services | 23 |
| Decisions | 11 |
| Content and assets to supply | 109 |
| Copy and values to confirm | 26 |
| Other | 5 |

## Legal review (10)

| Where | What |
| --- | --- |
| `app/privacy/page.tsx:47` | Placeholder: privacy contact email |
| `app/privacy/page.tsx:135` | Placeholder: retention period |
| `app/privacy/page.tsx:143` | Placeholder: retention period |
| `app/privacy/page.tsx:170` | Placeholder: privacy contact email |
| `app/terms/page.tsx:97` | Placeholder: lawyer to confirm wording |
| `components/legal/LegalDoc.tsx:30` | Placeholder: legal review |
| `lib/site.ts:18` | legalName: null as string \| null, // TODO: registered company name |
| `content/seed/faqs.ts:23` | d("Do you take payment in INR and USD?", "TODO: confirm currencies and payment terms."), |
| `content/seed/faqs.ts:73` | "TODO: confirm IP-transfer terms (e.g. on final payment).", |
| `content/seed/services.ts:100` | answer: ["TODO: confirm ownership terms (see the FAQ page)."], |

## Accounts, keys and services (23)

| Where | What |
| --- | --- |
| `app/api/revalidate/route.ts:8` | with a secret matching SANITY_REVALIDATE_SECRET. TODO(keys). |
| `app/contact/book/page.tsx:17` | TODO(keys): choose the provider. Its origin is added to the CSP automatically (next.config.ts). |
| `app/contact/book/page.tsx:47` | Placeholder: Cal.com or Calendly link (NEXT_PUBLIC_BOOKING_URL) |
| `app/cookies/page.tsx:162` | Placeholder: choose GA4 + Clarity or Plausible (set the env vars) |
| `app/cookies/page.tsx:171` | Placeholder: Cal.com or Calendly |
| `app/error.tsx:9` | TODO(keys): report to Sentry once a DSN exists (SENTRY_DSN). |
| `app/hello/page.tsx:23` | const REEL_URL = process.env.NEXT_PUBLIC_LATEST_REEL_URL; // TODO: latest reel permalink |
| `app/hello/page.tsx:77` | Placeholder: latest reel (NEXT_PUBLIC_LATEST_REEL_URL) |
| `app/privacy/page.tsx:111` | Placeholder: Brevo or Mailchimp |
| `app/privacy/page.tsx:115` | Placeholder: Cal.com or Calendly |
| `components/layout/Newsletter.tsx:11` | Newsletter sign-up → server action → email platform (Brevo; TODO: confirm vs Mailchimp). |
| `lib/cms/queries.ts:5` | (Vision tool in /studio) when the project is created. TODO(keys). |
| `lib/server/config.ts:13` | from: env("CONTACT_FROM_EMAIL"), // e.g. "Asha at Pinnacle <hello@pinnacle.studio>" — TODO |
| `lib/server/config.ts:14` | to: env("CONTACT_TO_EMAIL"), // team inbox — TODO |
| `lib/server/config.ts:22` | webhook: env("CRM_WEBHOOK_URL"), // HubSpot / Zoho / Notion via Zapier/Make, or a direct endpoint — TODO: choose |
| `lib/server/leads.ts:221` | Newsletter (provider: Brevo — TODO: confirm vs Mailchimp). |
| `lib/server/spam.ts:76` | if (!config.turnstileSecret) return true; // not configured yet — TODO(keys) |
| `sanity/env.ts:4` | TODO(keys): create the project at sanity.io/manage and set these in the hosting env. |
| `next.config.ts:104` | TODO: confirm — add `preload` to HSTS only after the production domain is final. |
| `.env.example:6` | TODO: confirm production domain |
| `.env.example:21` | CONTACT_FROM_EMAIL="Asha at Pinnacle <hello@your-domain>" # TODO: verified sending domain |
| `.env.example:58` | --- Phase 6 (Analytics / monitoring) — TODO: choose and provide --- |
| `.env.example:65` | SENTRY_DSN= # TODO: error monitoring (not wired yet) |

## Decisions (11)

| Where | What |
| --- | --- |
| `app/privacy/page.tsx:106` | Placeholder: HubSpot / Zoho / Notion |
| `app/privacy/page.tsx:118` | Placeholder: GA4 + Microsoft Clarity, or Plausible |
| `app/services/page.tsx:84` | Placeholder: “from ₹X / $X” — pricing decision |
| `app/services/[slug]/page.tsx:170` | Placeholder: starting price — pricing decision |
| `lib/cms/types.ts:74` | e.g. "From ₹3L / $5k" — TODO: pricing decision (brief §12 open decisions). |
| `lib/forms/brief.ts:155` | TODO: confirm thresholds with the studio after the first month's baseline. |
| `content/seed/faqs.ts:17` | "It depends on scope. After a short call we send a clear, fixed proposal. TODO: add “projects from …” ranges if the studio decides to publish them.", |
| `content/seed/projects.ts:5` | TODO: replace with the 3–5 launch case studies (brief §12 open decisions) in the CMS. |
| `content/seed/projects.ts:27` | approach: ["TODO: research, strategy and the key decisions we made."], |
| `content/seed/services.ts:5` | Everything here is "TODO: confirm"; prices are left empty pending the pricing decision. |
| `content/studio.ts:105` | { title: "Grow on purpose", text: "Time and budget for learning — TODO: confirm specifics." }, |

## Content and assets to supply (109)

| Where | What |
| --- | --- |
| `app/about/page.tsx:22` | About — The Guides (brief §6). Real story, people and numbers are TODO (never invented). |
| `app/about/page.tsx:31` | Placeholder: origin story — why Pinnacle exists (2–3 sentences) |
| `app/about/page.tsx:44` | Placeholder: mission statement |
| `app/about/page.tsx:50` | Placeholder: vision statement |
| `app/about/page.tsx:108` | Placeholder: studio photo |
| `app/about/page.tsx:126` | Placeholder: year |
| `app/about/page.tsx:129` | Placeholder: milestone (real numbers only) |
| `app/about/page.tsx:148` | Placeholder: {k.toLowerCase()} |
| `app/actions/forms.ts:25` | : "Please try again in a few minutes."; // TODO: contact email |
| `app/careers/page.tsx:80` | Placeholder: type · location |
| `app/careers/[slug]/page.tsx:45` | Placeholder: {title} |
| `app/careers/[slug]/page.tsx:47` | Placeholder: type · location |
| `app/contact/page.tsx:42` | TODO: next/image of contact.replier.photo |
| `app/contact/page.tsx:46` | Placeholder: name of the person who replies |
| `app/contact/page.tsx:48` | Placeholder: role |
| `app/contact/page.tsx:61` | Placeholder: email |
| `app/contact/page.tsx:71` | Placeholder: phone |
| `app/contact/page.tsx:76` | Placeholder: office address |
| `app/contact/page.tsx:97` | Placeholder: number |
| `app/hello/page.tsx:57` | Placeholder: number |
| `app/hello/page.tsx:109` | Placeholder: Instagram URL |
| `app/privacy/page.tsx:36` | Placeholder: registered company name |
| `app/privacy/page.tsx:37` | Placeholder: registered address |
| `app/privacy/page.tsx:102` | Placeholder: hosting provider (e.g. Vercel) |
| `app/privacy/page.tsx:172` | Placeholder: response time |
| `app/privacy/page.tsx:182` | Placeholder: name, email |
| `app/process/page.tsx:47` | Placeholder: typical duration |
| `app/services/page.tsx:105` | Placeholder: industries served |
| `app/services/[slug]/page.tsx:167` | Placeholder: engagement model |
| `app/services/[slug]/page.tsx:188` | Placeholder: related case studies |
| `app/terms/page.tsx:29` | Placeholder: registered company name |
| `app/terms/page.tsx:30` | Placeholder: registered address |
| `app/terms/page.tsx:36` | Placeholder: GST / registration number |
| `app/terms/page.tsx:106` | Placeholder: city |
| `app/terms/page.tsx:122` | Placeholder: contact email |
| `app/work/[slug]/page.tsx:67` | Placeholder: year |
| `app/work/[slug]/page.tsx:79` | Placeholder: client |
| `app/work/[slug]/page.tsx:94` | Placeholder: services |
| `app/work/[slug]/page.tsx:132` | Placeholder: industry |
| `app/work/[slug]/page.tsx:134` | Placeholder: timeline |
| `app/work/[slug]/page.tsx:137` | Placeholder: team size |
| `app/work/[slug]/page.tsx:140` | Placeholder: platform |
| `app/work/[slug]/page.tsx:143` | Placeholder: tech stack |
| `app/work/[slug]/page.tsx:211` | Placeholder: what it measures |
| `app/work/[slug]/page.tsx:213` | Placeholder: number |
| `app/work/[slug]/page.tsx:222` | Placeholder: client quote (with permission) |
| `app/work/[slug]/page.tsx:226` | Placeholder: name |
| `components/about/TeamGrid.tsx:37` | Placeholder: name |
| `components/about/TeamGrid.tsx:38` | Placeholder: role |
| `components/about/TeamGrid.tsx:52` | Placeholder: fun fact |
| `components/cms/MediaFrame.tsx:71` | Placeholder: {todo} |
| `components/cms/ProjectCard.tsx:62` | Placeholder: client |
| `components/cms/ProjectCard.tsx:77` | Placeholder: headline result, e.g. +X% conversions |
| `components/cms/RichText.tsx:44` | Placeholder: {p.slice(5).trim()} |
| `components/cms/RichText.tsx:66` | Placeholder: {fallback} |
| `components/layout/Footer.tsx:74` | Placeholder: email |
| `components/layout/Footer.tsx:83` | Placeholder: phone |
| `components/layout/Footer.tsx:99` | Placeholder: WhatsApp number |
| `components/layout/Footer.tsx:102` | Placeholder: office address |
| `components/layout/Footer.tsx:125` | Placeholder: URL |
| `components/layout/Footer.tsx:140` | Placeholder: registered company name |
| `components/layout/Footer.tsx:142` | Placeholder: registration number |
| `components/layout/MobileMenu.tsx:188` | Placeholder: contact email |
| `components/scenes/BaseCamp.tsx:135` | Trust strip (brief §5): client logos or a countries line — TODO: real, permitted logos. |
| `components/scenes/BlueprintRoom.tsx:17` | TODO: confirm caption copy; durations must be the studio's real typical timings. |
| `components/scenes/BlueprintRoom.tsx:103` | Placeholder: duration |
| `components/scenes/Summit.tsx:58` | Placeholder: number |
| `components/scenes/ThePath.tsx:15` | TODO: confirm — statement copy drafted from the brief's three prompts. |
| `components/scenes/ThePath.tsx:132` | Placeholder: number |
| `components/scenes/Voices.tsx:13` | const RATINGS = ["Clutch", "Google", "GoodFirms"]; // TODO: real ratings + profile links |
| `components/scenes/Voices.tsx:56` | Placeholder: client quote (with permission) |
| `components/scenes/Voices.tsx:67` | Placeholder: name |
| `components/scenes/Voices.tsx:72` | Placeholder: role, company |
| `components/scenes/Voices.tsx:85` | Placeholder: rating + profile link |
| `components/ui/DraftNotice.tsx:7` | Placeholder: confirm the draft {what} |
| `lib/server/config.ts:17` | Capabilities deck PDF link emailed on request (brief §8 CTA system). TODO: the deck. |
| `lib/site.ts:13` | href: string \| null; // TODO: provide profile URLs |
| `lib/site.ts:19` | registrationNumber: null as string \| null, // TODO: GST / registration number |
| `lib/site.ts:28` | email: null as string \| null, // TODO: provide |
| `lib/site.ts:29` | phone: null as string \| null, // TODO: provide (E.164, e.g. +91…) |
| `lib/site.ts:30` | whatsapp: null as string \| null, // TODO: provide (digits only, with country code, for wa.me) |
| `lib/site.ts:31` | address: null as string \| null, // TODO: provide office address |
| `lib/site.ts:35` | name: null as string \| null, // TODO: provide |
| `lib/site.ts:36` | role: null as string \| null, // TODO: provide |
| `lib/site.ts:37` | photo: null as string \| null, // TODO: provide (path under /public, square, ≥ 240px) |
| `lib/site.ts:63` | One-line summary — TODO: confirm all copy (drafted from service names). |
| `lib/structured-data.ts:43` | LocalBusiness-style address only once a real one is supplied (TODO in lib/site.ts). |
| `content/seed/faqs.ts:30` | d("How long does a website take?", "TODO: typical range for a marketing site."), |
| `content/seed/faqs.ts:31` | d("How long does an app take?", "TODO: typical range for a first release."), |
| `content/seed/people.ts:3` | Team — PLACEHOLDERS. TODO: real names, roles, photos and fun facts (with consent). |
| `content/seed/people.ts:17` | TODO: real openings in the CMS (or mark this one closed). |
| `content/seed/people.ts:22` | title: "TODO: Role title", |
| `content/seed/people.ts:25` | summary: "TODO: two sentences on the role and why it matters.", |
| `content/seed/people.ts:29` | requirements: ["TODO: requirement", "TODO: requirement", "TODO: nice to have"], |
| `content/seed/projects.ts:14` | title: `TODO: Project ${n}`, |
| `content/seed/projects.ts:21` | summary: "TODO: one-sentence summary of the project and the outcome.", |
| `content/seed/projects.ts:26` | challenge: ["TODO: the client’s problem in 2–3 short paragraphs."], |
| `content/seed/projects.ts:29` | text: ["TODO: moodboard, wireframes, final screens, design-system snippets."], |
| `content/seed/projects.ts:33` | text: ["TODO: architecture highlights and interesting engineering problems solved."], |
| `content/seed/services.ts:141` | "We recommend one after discovery, based on your team and product. TODO: confirm.", |
| `content/studio.ts:3` | values and benefits. Edit here. DRAFT copy — TODO: confirm. |
| `content/studio.ts:107` | benefits: ["TODO: benefit", "TODO: benefit", "TODO: benefit", "TODO: benefit"], |
| `content/studio.ts:110` | { title: "Intro call", text: "A friendly 30-minute chat. TODO: confirm." }, |
| `content/studio.ts:135` | Industries served (brief §7). TODO: the studio's real focus industries. |
| `styles/tokens.css:22` | --pn-grey: #777775; /* line-work, from logo — TODO: confirm (brief example was #8A8A8A) |
| `styles/tokens.css:24` | --pn-charcoal: #1e1e1e; /* ink — TODO: confirm (logo wordmark is #101216) |
| `styles/tokens.css:29` | --pn-orange: #ff5b27; /* Pinnacle orange, from logo apex — TODO: confirm |
| `.env.example:14` | --- Phase 4 (Contact Summit) — TODO: provide --- |
| `.env.example:50` | --- Phase 5 (CMS + inner pages) — TODO: provide --- |

## Copy and values to confirm (26)

| Where | What |
| --- | --- |
| `app/fonts.ts:7` | TODO: confirm — these are free (OFL) defaults chosen to match the brief: |
| `app/layout.tsx:49` | themeColor: "#f6f1e7", // TODO: confirm (matches --pn-cream) |
| `app/privacy/page.tsx:124` | Placeholder: confirm transfer mechanisms |
| `components/faq/FaqList.tsx:100` | Placeholder: confirm this answer |
| `components/scenes/ServiceIcon.tsx:3` | 24px grid, 1.5px strokes, round caps. TODO: confirm — a designer may redraw these. |
| `lib/cms/types.ts:6` | `draft: true` → real-looking draft copy that still needs sign-off ("TODO: confirm"). |
| `lib/forms/brief.ts:27` | TODO: confirm — ranges are placeholders; set them to the studio's real bands. |
| `lib/site.ts:6` | visible TODO marker. Copy taken from the brief is marked "TODO: confirm". |
| `lib/site.ts:20` | Brief §5 Stage 1 headline — TODO: confirm |
| `lib/site.ts:22` | Brief §5 Stage 1 subline (paraphrased) — TODO: confirm final wording |
| `lib/site.ts:32` | responsePromise: "We reply within 24 hours", // brief §7/§8 — TODO: confirm |
| `lib/structured-data.ts:99` | TODO: add areaServed once the studio confirms its markets. |
| `content/seed/faqs.ts:5` | These describe how the studio works, so every answer needs sign-off: "TODO: confirm". |
| `content/seed/faqs.ts:77` | "TODO: confirm — repositories, hosting and CMS access.", |
| `content/seed/faqs.ts:91` | "Often — after a short onboarding audit. TODO: confirm.", |
| `content/seed/services.ts:60` | answer: ["We can, or we can shape copy you already have. TODO: confirm offer."], |
| `content/seed/services.ts:95` | answer: ["Usually, yes. We start with a short technical review. TODO: confirm."], |
| `content/seed/services.ts:134` | "TODO: confirm", |
| `content/seed/services.ts:209` | answer: ["Yes — products, customers and content. TODO: confirm scope limits."], |
| `content/seed/services.ts:280` | answer: ["Yes, after a short onboarding audit. TODO: confirm."], |
| `content/studio.ts:113` | text: "A short, paid task or a walk through past work. TODO: confirm.", |
| `styles/tokens.css:5` | Every value marked "TODO: confirm" is a default taken from the brief's examples |
| `styles/tokens.css:19` | --pn-cream: #f6f1e7; /* background — TODO: confirm (brief example) |
| `styles/tokens.css:20` | --pn-cream-light: #fbf8f2; /* surface — TODO: confirm (brief example) |
| `styles/tokens.css:26` | --pn-night: #181715; /* night-sky footer — TODO: confirm |
| `styles/tokens.css:30` | --pn-peach: #ffd9c6; /* glow behind the Dot only — TODO: confirm |

## Other (5)

| Where | What |
| --- | --- |
| `app/work/[slug]/page.tsx:108` | Placeholder: live link |
| `components/legal/LegalDoc.tsx:33` | Placeholder: date |
| `components/scenes/BaseCamp.tsx:157` | <Todo> |
| `lib/cms/index.ts:53` | (lib/demo.ts — never on the live site), otherwise the TODO placeholders. |
| `content/seed/people.ts:27` | "TODO: what you’ll do, who you’ll work with, what success looks like in six months.", |
