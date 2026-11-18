# Checklists tracker

Brief §7 (Agency essentials) and §12 (Launch checklist). Updated at the end of every phase.

Legend: ✅ done · 🟡 partly / scaffolded · ⬜ not started · 🧑 needs the studio (content, account or decision) · v2 = deferred by agreement

## §7 Agency essentials

### Credibility and trust

| Item                                             | Status | Phase / note                                                                                  |
| ------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------- |
| One-line positioning above the fold              | 🟡     | Hero headline + subline in place (copy TODO: confirm). Home Ascent stages 1–7 built (phase 3) |
| Portfolio with in-depth case studies             | 🟡 🧑  | /work (filters) + case-study template ✅; real projects needed                                |
| Measurable results on every case study           | ⬜ 🧑  | Phase 5; real numbers needed                                                                  |
| Client logos (with permission)                   | ⬜ 🧑  | Trust strip placeholder on home                                                               |
| Testimonials with names, roles, photos, video    | 🟡 🧑  | CMS model (with permission flag) + home Voices ✅; real quotes needed                         |
| Third-party reviews (Clutch, GoodFirms, Google)  | ⬜ 🧑  | Phase 3                                                                                       |
| Team page with real photos and roles             | 🟡 🧑  | /about team grid ✅; photos and roles needed                                                  |
| Company details: registered name, address, GST   | 🟡 🧑  | Footer slots in place (TODO markers)                                                          |
| Awards, certifications, partner badges           | 🟡 🧑  | Slots on /about ✅                                                                            |
| Years in business, projects delivered, countries | ⬜ 🧑  | Phase 3 (The Path)                                                                            |

### Services and offering

| Item                                | Status | Phase / note                                                      |
| ----------------------------------- | ------ | ----------------------------------------------------------------- |
| Dedicated page per service          | ✅     | All 7, each with its Dot moment (draft copy — TODO: confirm)      |
| Tech stack shown clearly            | ✅     | On every service page and case study (TODO: confirm)              |
| Industries served                   | 🟡 🧑  | Section on /services; list needed                                 |
| Engagement models                   | ✅     | Fixed price, dedicated team, monthly retainer (/services)         |
| Pricing guidance / "projects from"  | ⬜ 🧑  | Open decision: show pricing?                                      |
| Maintenance and support plans       | ✅     | /services/care-plans                                              |
| Process step by step with timelines | 🟡 🧑  | Blueprint Room on home ✅ (durations TODO); /process page phase 5 |

### Conversion

| Item                                  | Status | Phase / note                                                                          |
| ------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| "Start a project" on every page       | ✅     | Nav (desktop), sticky bar (mobile), footer summit CTA                                 |
| Multi-step project brief form         | ✅     | 6 steps, Dot progress pyramid, saved progress, works without JS. `npm run qa:contact` |
| Calendar booking (Cal.com / Calendly) | 🟡 🧑  | Embed ready on /contact/book; set `NEXT_PUBLIC_BOOKING_URL`                           |
| WhatsApp click-to-chat                | 🟡 🧑  | Wired in sticky bar + footer; shows once a number is set in `lib/site.ts`             |
| Email and phone clearly visible       | 🟡 🧑  | Footer + menu slots (TODO markers)                                                    |
| Response-time promise                 | ✅     | Footer, menu, contact (copy TODO: confirm)                                            |
| Thank-you page with next steps        | ✅     | Next steps, book-now button, 2 case-study slots (TODO: real projects)                 |
| Optional: project cost estimator      | v2     |                                                                                       |
| Optional: capabilities deck PDF       | 🟡 🧑  | Email-gated request ✅ (/services, footer); set `DECK_URL`                            |
| NDA available on request              | 🟡     | Stated on /contact ✅; FAQ phase 5                                                    |

### Content and SEO

| Item                                 | Status | Phase / note                                                                                                                                      |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Journal/blog                         | v2     |                                                                                                                                                   |
| FAQ page                             | ✅     | Grouped, Dot opens accordions; draft answers — TODO: confirm                                                                                      |
| Service + city landing pages         | v2     | Service pages exist; city pages v2                                                                                                                |
| Meta titles, descriptions, OG images | ✅     | Unique title/description/canonical + generated share image (`/og`) per page                                                                       |
| Structured data                      | ✅     | Organization, WebSite, Service, FAQPage, BreadcrumbList, CreativeWork (published facts only); LocalBusiness + JobPosting once address/dates exist |
| XML sitemap and robots.txt           | ✅     | `app/sitemap.ts`, `app/robots.ts` (previews blocked)                                                                                              |
| Google Business Profile linked       | ⬜ 🧑  | Launch; needs the profile (add to `site.socials` → `sameAs`)                                                                                      |

### Brand and experience

| Item                                          | Status | Phase / note                                                                                                                              |
| --------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Consistent brand system                       | 🟡     | Tokens, logo, fonts, the Dot ✅; final values TODO: confirm                                                                               |
| Signature interactions                        | ✅     | Preloader, the Dot, the Ascent scroll journey, page transitions and window dive. Verified by `npm run qa:home` (22 checks)                |
| Custom cursor (desktop only)                  | ✅     | Fine pointer ≥1024px, off with reduced motion; dot follows instantly, ring eases; lazy                                                    |
| Sound toggle (off by default)                 | ✅     | Web Audio, no files: soft pentatonic plucks on Dot landings + arpeggio at celebrations/summit; no background loop; remembered per visitor |
| Delightful 404                                | ✅     | Lost Dot with map; optional mini-game is v2                                                                                               |
| Favicon, app icons, share images with the Dot | ✅     | SVG favicon, apple-icon, 192/512/maskable PNGs, `/og` cards                                                                               |
| Dark/night variant for footer                 | ✅     | `.theme-night` footer with star field                                                                                                     |

### Technical quality

| Item                                     | Status | Phase / note                                                                                                                                                                                          |
| ---------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fast on mobile (Core Web Vitals)         | ✅     | Lab: LCP 0.9–1.1 s, CLS ≤ 0.003 on mobile; Lighthouse mobile 92–100. Field data in Search Console after launch                                                                                        |
| Fully responsive, real devices           | 🟡 🧑  | Responsive ✅ (desktop + mobile in Chrome and Firefox); real-device script in docs/LAUNCH.md §1                                                                                                       |
| Accessible (WCAG 2.2 AA)                 | 🟡 🧑  | axe 0 violations (58 runs), keyboard/focus 78/78, Lighthouse a11y 100. Screen-reader pass needs a person (docs/LAUNCH.md)                                                                             |
| HTTPS, security headers, spam protection | 🟡     | Headers + CSP ✅; spam protection ✅ (honeypot, time trap, rate limit, Turnstile-ready); shared rate-limit store before launch                                                                        |
| CMS                                      | 🟡 🧑  | Sanity schemas + Studio + seed import + revalidate hook ✅; create the project                                                                                                                        |
| Analytics and conversion tracking        | 🟡 🧑  | Consent-gated GA4/Clarity or Plausible wired: page_view, cta_click, whatsapp_click, stage_reached, case_study_viewed, video_play, deck_requested, booking_made, form events. Pick a tool + set its ID |
| Uptime monitoring and backups            | ⬜ 🧑  | Launch; accounts needed                                                                                                                                                                               |

### Legal

| Item                         | Status | Phase / note                                                                                                         |
| ---------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| Privacy policy (DPDP + GDPR) | 🟡 🧑  | Draft written ✅; lawyer review needed                                                                               |
| Terms of use                 | 🟡 🧑  | Draft written ✅; lawyer review needed                                                                               |
| Cookie consent banner        | ✅     | Shown only when cookie-setting analytics are configured; equal Reject/Accept; “Cookie settings” in footer + /cookies |
| Consent checkbox on forms    | ✅     | Brief, home quick form, newsletter; consent recorded in the CRM payload                                              |

### People

| Item                                                   | Status | Phase / note                                          |
| ------------------------------------------------------ | ------ | ----------------------------------------------------- |
| Careers page with open roles                           | ✅     | /careers, job template, application form (CV by link) |
| Culture and studio life                                | 🟡 🧑  | Photo slots on /about                                 |
| Social links (IG, LinkedIn, Behance, Dribbble, GitHub) | 🟡 🧑  | Footer slots; URLs needed                             |

## §12 Launch checklist

| Item                                           | Status | Note                                                                                                         |
| ---------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| All copy proofread; no placeholder text        | ⬜ 🧑  | 184 markers listed in docs/qa/TODO-INVENTORY.md (`npm run qa:todos`)                                         |
| Every form tested end to end                   | 🟡 🧑  | All 5 forms pass against mock services (38 checks). Repeat with real keys on launch day (docs/LAUNCH.md §2)  |
| Mobile tested on real Android and iPhone       | ⬜ 🧑  | Script ready: docs/LAUNCH.md §1                                                                              |
| Chrome, Safari, Firefox, Edge                  | 🟡 🧑  | Chrome 157 + Firefox 153: all pass; Edge passed earlier, re-run after it restarts; Safari needs a Mac/iPhone |
| Lighthouse 85+ mobile (Home, Work, Contact)    | ✅     | 95 / 100 / 99 (median of 3). Re-check on production                                                          |
| Reduced-motion and keyboard checked            | ✅     | `qa:keyboard` 78/78 + axe reduced-motion runs                                                                |
| Meta tags, OG images, favicon, structured data | ✅     | Validate with Google's Rich Results Test on the live domain                                                  |
| Sitemap submitted to Search Console            | ⬜ 🧑  | Launch                                                                                                       |
| Analytics and conversion events firing         | 🟡 🧑  | Wired; verify in the tool's realtime view once an ID is set                                                  |
| Redirects from old URLs                        | ⬜ 🧑  | Need list of old URLs (if any)                                                                               |
| Privacy, terms, cookie consent live            | 🟡 🧑  | Drafts + banner live; legal review                                                                           |
| 404 and error pages working                    | ✅     | `not-found.tsx`, `error.tsx`, `global-error.tsx`                                                             |
| Backups and uptime monitoring                  | ⬜ 🧑  | Accounts needed                                                                                              |
| Launch reel and posts                          | ⬜ 🧑  | Studio (the pinnacle-reel-studio skill can help)                                                             |
