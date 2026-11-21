# Pinnacle Studios — The Ascent

The Pinnacle Studios website: a scroll journey up the Pinnacle pyramid, guided by the Dot.
The brief ("Pinnacle Studios Website — Concept & Architecture") is the source of truth.

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
npm run check      # typecheck + lint + production build
npm run qa:home    # with `npm start` running: drives the home page in headless Chrome
npm run qa:contact # after a build: end-to-end form tests against mock Resend/Slack/CRM/Brevo
npm run qa:pages   # every inner page, desktop + mobile
npm run qa:a11y    # axe-core (WCAG 2.2 AA) on every route, desktop/mobile/reduced motion
npm run qa:budget  # initial JS per route (budget ~200KB gzip)
npm run qa:keyboard   # tab order, focus rings, skip link, menu focus, reduced motion
npm run qa:browsers   # Chrome, Edge, Firefox (installed browsers), every route
npm run qa:lighthouse # mobile + desktop reports → docs/qa/lighthouse
npm run qa:todos      # every TODO marker → docs/qa/TODO-INVENTORY.md
npm run qa:smooth     # scroll smoothness: frame times, jank, forced style/layout work
npm run demo:media    # redraw the demo mockups, loops and portraits into public/demo
npm run brand:mascot  # the Dot pose pack → brand/mascot
```

Latest results: `docs/QA-REPORT.md`. Launch steps: `docs/LAUNCH.md`.

### Content (CMS)

Pages read content only through `lib/cms`. Without a Sanity project the site serves the seed in `content/seed` (placeholders and drafts, all marked TODO). With `NEXT_PUBLIC_SANITY_PROJECT_ID` set, it reads Sanity; editors work at `/studio`.

- Schemas: `sanity/schemaTypes` · Studio config: `sanity.config.ts`
- Seed → Sanity: `npm run cms:seed`, then `npx sanity dataset import content/seed/sanity-seed.ndjson production`
- Publish webhook: `POST /api/revalidate` (secret `SANITY_REVALIDATE_SECRET`)
- Studio-free content (process phases, values, careers copy): `content/studio.ts`

`npm run qa:pages` checks every inner page at desktop and mobile.

### Contact forms

Server actions in `app/actions/forms.ts`; delivery in `lib/server/leads.ts`; spam checks in `lib/server/spam.ts`.
Every integration is optional and configured by environment variables (see `.env.example`). In development with nothing configured, leads are logged to the server console.
The preloader plays only on a visitor's first visit. To see it again, open `/?intro`.

### Polish (phase 6)

- `components/extras`: custom cursor, Web Audio sound, cookie consent and the analytics runtime. All lazy; nothing third-party loads without an env var (and consent where cookies are involved).
- `app/og/route.tsx`: share images (`/og?title=…&eyebrow=…`), used automatically by `pageMetadata()` in `lib/seo.ts`.
- `lib/structured-data.ts` + `components/seo/JsonLd.tsx`: schema.org JSON-LD.
- `next.config.ts`: security headers and the Content-Security-Policy (origins added per configured service).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 + CSS-variable tokens · GSAP + ScrollTrigger · Lenis.
Sanity (CMS) · Resend, Turnstile, Cal.com/Calendly, Brevo (all optional, env-configured) · GA4 + Clarity or Plausible behind consent.

## Where things live

| Path                | What                                                                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/`              | One folder per route in the sitemap (brief §4)                                                                                                                          |
| `components/ui`     | Buttons, container/grid, TODO marker                                                                                                                                    |
| `components/layout` | Header, mobile menu, footer (night sky), sticky CTA, page intro                                                                                                         |
| `components/motion` | Smooth scroll, page transitions (`TransitionLink`), reveals                                                                                                             |
| `components/brand`  | Logo, mark, grain                                                                                                                                                       |
| `components/dot`    | The Dot: `controller.ts` (global `dot` API), `svg-actor.ts` (GSAP renderer), `DotActorView` (mount a Dot), `behaviours.ts` (triggers + easter eggs). Demo at `/dot-lab` |
| `components/scenes` | The Ascent: `Preloader`, `BaseCamp` … `Summit`, `AltitudeMeter`. Scene choreography in `scenes/motion/*.ts`, lazy-loaded by `SceneMotion`                               |
| `scripts/qa`        | Headless Chrome QA (`npm run qa:home`) → screenshots and a report in `docs/qa/`                                                                                         |
| `lib/site.ts`       | Contact details, nav, services. **Fill in the TODOs here.**                                                                                                             |
| `lib/motion`        | Motion tokens, GSAP setup, reduced-motion hook, scroll access                                                                                                           |
| `styles/tokens.css` | Brand tokens (colour, type, spacing, motion)                                                                                                                            |
| `docs/`             | Decisions, checklist tracker, TODO list                                                                                                                                 |

## House rules (from the brief)

- The orange Dot is the only loud thing. Tailwind's default colours are removed: only brand tokens exist.
- Animate only `transform` and `opacity`. Never use Tailwind `translate-*` classes on elements GSAP moves, because GSAP owns `transform`.
- Every animation respects `prefers-reduced-motion` and never blocks content or input.
- Use `TransitionLink` (or `Button href`) for internal links so page transitions play.
- Never invent clients, numbers or testimonials: use `<Todo>` or `null` in `lib/site.ts`.

## Using the Dot

```ts
import { dot } from "@/components/dot";
dot.setState("excited"); // any state from the character bible
dot.setState("curious", { toward: el });
dot.goTo(el); // or a data-dot-anchor name, or {x, y}
dot.celebrate(); // e.g. after a form submits
dot.setAccessory("flag", true);
```

Add `data-dot-curious` to anything the Dot should lean toward on hover (project cards).
Primary CTAs (`<Button>` default variant) excite it automatically.
