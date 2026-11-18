# What we need from the studio

Everything the site is waiting on. The exhaustive list (every marker with file and line) is `docs/qa/TODO-INVENTORY.md` — regenerate it with `npm run qa:todos`. Launch steps: `docs/LAUNCH.md`.

## Content system (phase 5) — connect Sanity

- [ ] Create a Sanity project (dataset `production`) and set `NEXT_PUBLIC_SANITY_PROJECT_ID` + `SANITY_REVALIDATE_SECRET`
- [ ] Add the site URL as a CORS origin (with credentials) in Sanity
- [ ] `npm run cms:seed` → `npx sanity dataset import content/seed/sanity-seed.ndjson production`
- [ ] Add the Sanity webhook → `/api/revalidate`
- [ ] Replace placeholders in the Studio: 3–5 case studies, team, testimonials (with permission), open roles
- [ ] Confirm the draft service copy, FAQ answers, process copy, values and careers copy
- [ ] Industries served (`content/studio.ts`), latest reel link (`NEXT_PUBLIC_LATEST_REEL_URL`), deck PDF (`DECK_URL`)
- [ ] Lawyer review of /privacy, /terms, /cookies; fill company details, retention periods, grievance officer

## Contact flow (phase 4) — the code is ready, it needs your details

- [ ] Name, role and photo of the person who replies (`site.contact.replier`); used on /contact and in the auto-reply
- [ ] Budget bands (INR + USD) and what counts as a "high-value" lead (`lib/forms/brief.ts`)
- [ ] Set the env keys in `.env.example` → hosting settings, then send one real test brief

## Fill in `lib/site.ts`

- [ ] Registered company name, GST / registration number
- [ ] Contact email, phone, WhatsApp number (digits with country code), office address
- [ ] Social profile URLs: Instagram, LinkedIn, Behance, Dribbble, GitHub
- [ ] Confirm hero headline and subline
- [ ] Confirm the seven service one-liners

## Brand (confirm or replace in `styles/tokens.css`, `app/fonts.ts`)

- [ ] Cream `#F6F1E7`, surface `#FBF8F2`, ink `#1E1E1E`, night `#181715` (brief examples)
- [ ] Orange `#FF5B27`, line grey `#777775` (from the logo)
- [ ] Fonts: Fraunces / Geist / Geist Mono, or a licensed alternative
- [ ] Final name for the Dot
- [ ] Favicon art (currently the Dot with two eyes)

## Content (phases 3–5)

- [ ] 3–5 launch case studies: copy, results, images, short looping videos
- [ ] Client logos (with permission), testimonials (name, role, photo; video if possible)
- [ ] Review profiles: Clutch / GoodFirms / Google
- [ ] Key numbers: projects shipped, years, client rating, countries served
- [ ] Team photos, roles, fun facts; studio life photos
- [ ] Photo and name of the person who replies to leads
- [ ] Capabilities deck PDF
- [ ] Pricing: show ranges publicly or not?

## Accounts and keys (phases 4–6) — see `.env.example`

- [ ] Domain and Vercel project
- [ ] Resend + verified sending domain
- [ ] Cloudflare Turnstile keys
- [ ] CRM: HubSpot, Zoho or Notion?
- [ ] Slack webhook for lead alerts
- [ ] Cal.com or Calendly booking link
- [ ] Newsletter platform: Brevo or Mailchimp?
- [ ] Analytics: GA4 + Clarity (cookie banner appears), or Plausible (no banner)? Set `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_CLARITY_ID` or `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- [ ] Sentry, uptime monitor
- [ ] Sanity project (phase 5)
- [ ] Cloudinary or Mux for video

## Phase 6 polish

- [ ] Brand fonts in share images (`app/og/route.tsx` uses a system font): add Fraunces/Geist as TTF/OTF files to the repo
- [ ] Office address → enables LocalBusiness structured data; job posting dates → JobPosting
- [ ] Markets served → `areaServed` on Service structured data
- [ ] HSTS `preload` once the production domain is final (`next.config.ts`)

## QA follow-ups (phase 7)

- [ ] Run the real-device test (`docs/LAUNCH.md` §1) on an iPhone, an Android phone and a Mac (Safari)
- [ ] Screen-reader spot check (VoiceOver / TalkBack / NVDA)
- [ ] Re-run `npm run qa:browsers` once Edge launches again
- [ ] Repeat the form tests with real keys on staging

## Legal

- [ ] Legal review of privacy, terms and cookie drafts (DPDP Act 2023 + GDPR)
