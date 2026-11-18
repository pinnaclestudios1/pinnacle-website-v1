# Launch handover

Two checklists: a device test the studio runs before launch, and the launch-day steps.
Everything else is in `docs/QA-REPORT.md` (what was tested) and `docs/TODO.md` (what's still needed).

## 1. Real-device test (≈ 30 min per device)

Run on at least: **one iPhone (Safari)**, **one Android phone (Chrome)**, and **a Mac with Safari**. Use the staging URL.
Tick each line; note the device, OS and browser version next to any problem, with a screenshot.

### Every device

- [ ] Home loads; the intro plays once (open `/?intro` to see it again)
- [ ] Scroll the whole home page slowly, then fast: the Dot is always somewhere on screen and hops between spots (never blinks out)
- [ ] The travel line on the home page and on /process draws smoothly up to the Dot, with no flicker
- [ ] The Blueprint Room (stage 5) shows the whole window while it builds
- [ ] “Start a project” is always reachable (header, sticky pill on mobile, footer)
- [ ] Menu opens and closes; links work; the page behind doesn't scroll while it's open
- [ ] /work: filters work; a case study opens with the window-dive transition
- [ ] /contact: complete all 6 steps; Back keeps your answers; refresh mid-way and the draft comes back
- [ ] Submit a test brief → thank-you page with the Dot celebrating (on staging with real keys: check the emails arrive)
- [ ] /faq: questions open and close; the Dot moves to the open one
- [ ] Footer: night sky, newsletter field, legal links, “Cookie settings”
- [ ] 404: visit `/nope` — the lost Dot with its map
- [ ] Sound toggle (bottom right): off by default; on → soft notes when the Dot lands; nothing plays until you turn it on
- [ ] Landscape orientation: nothing overlaps or gets cut off

### Phones only

- [ ] Text never needs zooming; tap targets are easy to hit
- [ ] The sticky pill doesn't cover the cookie banner, form buttons or the keyboard
- [ ] Form fields: the right keyboard appears (email → @ keyboard, phone → number pad)
- [ ] Notch / home-bar areas: nothing is hidden under them

### Accessibility spot check (one phone + one computer)

- [ ] **VoiceOver** (iPhone/Mac) or **TalkBack** (Android): headings read in order; the Dot is silent; form errors are announced
- [ ] **Keyboard only** (computer): Tab from the top — the skip link appears first, focus is always visible, the menu and the brief work without a mouse
- [ ] **Reduce motion** on (iOS: Settings → Accessibility → Motion; macOS: Accessibility → Display): no scroll animation, everything still readable
- [ ] Zoom the browser to 200%: nothing overlaps, no sideways scrolling

## 2. Launch day

### Before switching DNS

- [ ] Domain decided → set `NEXT_PUBLIC_SITE_URL` (canonical URLs, sitemap, share images)
- [ ] Hosting project created (Vercel recommended) with every variable from `.env.example` that you use
- [ ] **Sanity**: project created, seed imported (`npm run cms:seed` then `npx sanity dataset import …`), placeholders replaced, webhook → `/api/revalidate` with `SANITY_REVALIDATE_SECRET`, site URL added as a CORS origin
- [ ] **Email (Resend)**: sending domain verified (SPF/DKIM); `CONTACT_FROM_EMAIL` is a real person; `CONTACT_TO_EMAIL` set
- [ ] **Turnstile**: site + secret keys set
- [ ] **CRM / Slack**: webhook URLs set (optional but recommended)
- [ ] **Booking**: `NEXT_PUBLIC_BOOKING_URL` set (Cal.com or Calendly)
- [ ] **Analytics**: choose GA4 + Clarity (banner appears) or Plausible (no banner), set the ID(s); update `/privacy` and `/cookies` wording to match
- [ ] Rate limiting: add a shared store (e.g. Upstash Redis) — the built-in one is per server instance (`lib/server/spam.ts`)
- [ ] `npm run qa:todos` → every “Content”, “Legal” and “Keys” item is resolved, or consciously accepted
- [ ] Legal review of /privacy, /terms, /cookies done; company details filled in `lib/site.ts`

### Go live

- [ ] Deploy; open the production URL in a private window
- [ ] Submit one **real** brief: team email, auto-reply, CRM record and Slack message all arrive
- [ ] Send one newsletter signup and one deck request
- [ ] Check share previews: paste the URL into WhatsApp / LinkedIn / Slack (the Dot card appears)
- [ ] Check structured data: [Rich Results Test](https://search.google.com/test/rich-results) on `/`, a service page and `/faq`
- [ ] Run Lighthouse on production for Home, Work and Contact (target 85+ mobile)

### Right after launch

- [ ] Google Search Console: verify the domain, submit `/sitemap.xml`
- [ ] Google Business Profile: link the website; add the profile URL to `site.socials` (→ structured data `sameAs`)
- [ ] Analytics realtime view: page views and a test `cta_click` arrive (after accepting cookies, if GA4/Clarity)
- [ ] Uptime monitor on `/` and `/contact` (e.g. Better Stack, UptimeRobot); error monitoring (Sentry) when ready
- [ ] Once the domain is final for good: add `preload` to HSTS in `next.config.ts` and submit to hstspreload.org
- [ ] Old URLs (if replacing a site): add redirects in `next.config.ts`
- [ ] Launch reel and posts — the Dot pose pack is in `brand/mascot/`

### After the first month

- [ ] Search Console → Core Web Vitals (real-visitor data)
- [ ] Review lead-score thresholds against real briefs (`lib/forms/brief.ts`)
- [ ] Review the conversion funnel: brief step drop-off (`form_step_reached` / `form_submitted` events), CTA clicks by location
