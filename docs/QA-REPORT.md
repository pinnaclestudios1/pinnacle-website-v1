# QA report — Phase 7

**Date:** 18 Nov 2026 · **Build:** production (`next build` + `next start`), seed content (no Sanity project yet), mock delivery services (no real keys yet).

Every number below comes from a script in `scripts/qa/` and can be re-run (see “How to re-run”). Raw output is in `docs/qa/`.

## Summary

| Area                   | Result                                                                                                                                           | Target (brief)                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| Lighthouse, mobile     | Home **95** · Work **100** · Contact **99** (inner pages 92–100)                                                                                 | 85+ on Home, Work, Contact (§12)    |
| Lighthouse, desktop    | **100** on every page tested                                                                                                                     | —                                   |
| Accessibility, SEO, BP | **100 / 100 / 100** on every page (SEO 66 on draft case studies: deliberately `noindex`)                                                         | WCAG 2.2 AA, SEO (§11)              |
| axe-core (WCAG 2.2 AA) | **0 violations** · 19 routes × desktop / mobile / reduced motion + consent banner (58 runs)                                                      | 0                                   |
| Keyboard + focus       | **78 / 78** · tab order, visible focus, focus not hidden by the sticky header, skip link, menu focus, reduced motion                             | §11, §12                            |
| Forms (end to end)     | **38 / 38** · brief (6 steps), quick enquiry, newsletter, deck request, job application, spam traps, rate limit, no-JS, refusal with no channels | Every form (§12)                    |
| Cross-browser          | **Chrome 157 and Firefox 153: all checks pass** (17 routes × desktop + mobile). Edge: see below. Safari: needs a Mac/iPhone                      | Chrome, Safari, Firefox, Edge (§12) |
| Home journey           | **41 / 41** · preloader, all 8 stages, Dot continuity (desktop 27/27, mobile 33/33), reduced motion                                              | §5                                  |
| Inner pages            | **51 / 51**                                                                                                                                      | §6                                  |
| Initial JS             | **≤ 199.2 KB gzip** on every route                                                                                                               | ~200 KB (§11)                       |
| Core Web Vitals (lab)  | LCP 0.9–1.1 s mobile · CLS ≤ 0.003 · TBT 60–340 ms mobile                                                                                        | LCP < 2.5 s, CLS < 0.1              |

## Lighthouse (mobile: Moto G Power, slow 4G, 4× CPU)

| Page                        | Perf | A11y | Best pr. | SEO | LCP   | TBT    | CLS   |
| --------------------------- | ---- | ---- | -------- | --- | ----- | ------ | ----- |
| `/`                         | 95   | 100  | 100      | 100 | 1.1 s | 250 ms | 0     |
| `/work`                     | 100  | 100  | 100      | 100 | 0.9 s | 70 ms  | 0     |
| `/contact`                  | 99   | 100  | 100      | 100 | 0.9 s | 110 ms | 0.001 |
| `/services/web-development` | 100  | 100  | 100      | 100 | 0.9 s | 70 ms  | 0     |
| `/work/project-one` (draft) | 100  | 100  | 100      | 66¹ | 0.9 s | 60 ms  | 0.003 |
| `/about`                    | 92   | 100  | 100      | 100 | 0.9 s | 340 ms | 0.001 |
| `/process`                  | 99   | 100  | 100      | 100 | 0.9 s | 90 ms  | 0     |

¹ Placeholder case studies are `noindex` on purpose so drafts never reach Google; real case studies score 100.
The brief's three pages use the median of 3 runs. Desktop: 100 across the board. Full HTML reports: `docs/qa/lighthouse/`.

Lab scores are measured on localhost; field data (real visitors) appears in Search Console about 28 days after launch.

## Fixed during QA

| Issue                                                                                                          | Fix                                                                                                           |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Home page mobile Performance 72–79: every Dot on the page built its animation rig at load (~0.5 s main thread) | Dots build on demand: the one on screen immediately, the rest one per idle slot (`DotActorView`). Home now 95 |
| `/cookies` on mobile scrolled sideways by 206 px (the storage table stretched the page)                        | Legal page grid constrained (`grid-cols-1`, `min-w-0`); the table scrolls inside its own box                  |
| That scrolling table wasn't reachable by keyboard (axe `scrollable-region-focusable`)                          | It's now a labelled, focusable region                                                                         |
| A stale “phase 3” note in the footer                                                                           | Removed (the cream-to-night fade is in `Summit.tsx`)                                                          |

Earlier, in the Phase 6 feedback round: the Dot now travels between spots, the travel lines no longer flicker, the Blueprint Room fits the screen, the sound is gentler and the cursor is instant.

## Not covered here (needs people, devices or keys)

| Item                                           | Why                                                                                                                                                                     | Who / when                                       |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Safari / iPhone**                            | WebKit doesn't run on Windows                                                                                                                                           | Studio, with `docs/LAUNCH.md` §1                 |
| **Edge**                                       | Passed the same checks earlier today (Edge 157.0.4341.60); on the final run it exited at launch, most likely mid-update. Same engine as Chrome, which passes everything | Re-run `npm run qa:browsers` after Edge restarts |
| **Real Android devices**                       | Headless tests emulate mobile; real touch, notch and keyboard behaviour need a phone                                                                                    | Studio, `docs/LAUNCH.md` §1                      |
| **Screen readers (NVDA, VoiceOver, TalkBack)** | Automated tools catch ~40% of issues; a person must listen                                                                                                              | Studio or an a11y tester                         |
| **Real email / CRM / Slack / Turnstile**       | No keys yet — tested against mock services                                                                                                                              | Launch day, `docs/LAUNCH.md` §2                  |
| **Content**                                    | 184 TODO markers remain (placeholders, drafts, decisions)                                                                                                               | `docs/qa/TODO-INVENTORY.md`                      |

## Remaining TODOs

`npm run qa:todos` → `docs/qa/TODO-INVENTORY.md` (184 markers, each with file and line):

| Group                        | Count |
| ---------------------------- | ----- |
| Content and assets to supply | 110   |
| Copy and values to confirm   | 26    |
| Accounts, keys and services  | 24    |
| Decisions                    | 11    |
| Legal review                 | 10    |
| Other                        | 3     |

The short version of what the studio needs to provide is `docs/TODO.md`.

## How to re-run

```bash
npm run build && npm start   # terminal 1
npm run qa:home              # terminal 2, then any of:
npm run qa:pages
npm run qa:contact           # starts its own servers on :3100 / :3101 with mock services
npm run qa:a11y
npm run qa:keyboard
npm run qa:browsers
npm run qa:lighthouse
npm run qa:budget
npm run qa:todos
```
