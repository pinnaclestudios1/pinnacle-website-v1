import { LegalDoc } from "@/components/legal/LegalDoc";
import { Todo } from "@/components/ui/Todo";
import { analyticsConfig } from "@/lib/analytics";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Cookie policy",
  description:
    "Which cookies and browser storage the Pinnacle Studios website uses, and how to control them.",
  path: "/cookies",
});

/**
 * Cookie policy. Lists exactly what the site stores. The analytics table is built from
 * the tools actually configured (NEXT_PUBLIC_GA_ID / _CLARITY_ID / _PLAUSIBLE_DOMAIN),
 * so the policy never lists a tool that isn't running. DRAFT: legal review.
 */
const ESSENTIAL = [
  {
    name: "pn-visited",
    where: "Local storage",
    purpose: "Remembers you’ve seen the intro animation, so it plays only once.",
    lasts: "Until you clear it",
  },
  {
    name: "pn-brief-draft",
    where: "Local storage",
    purpose:
      "Keeps your unfinished project brief so you can continue later. Never sent unless you submit.",
    lasts: "30 days, or until sent",
  },
  {
    name: "pn-utm",
    where: "Session storage",
    purpose: "Remembers which campaign link brought you here, sent only with a form.",
    lasts: "Until you close the tab",
  },
  {
    name: "pn-consent",
    where: "Local storage",
    purpose: "Remembers your analytics choice so we don’t ask again.",
    lasts: "Until you change it or clear it",
  },
  {
    name: "pn-sound",
    where: "Local storage",
    purpose: "Remembers whether you turned the ambient sound on.",
    lasts: "Until you clear it",
  },
  {
    name: "Cloudflare Turnstile",
    where: "Cookie (Cloudflare)",
    purpose: "Checks form submissions come from a person, not a bot.",
    lasts: "Session",
  },
];

type Row = { name: string; where: string; purpose: string; lasts: string };

const ANALYTICS: Row[] = [
  ...(analyticsConfig.ga
    ? [
        {
          name: "_ga, _ga_*",
          where: "Cookie (Google Analytics 4)",
          purpose: "Counts visits and which pages help, without identifying you.",
          lasts: "Up to 2 years",
        },
      ]
    : []),
  ...(analyticsConfig.clarity
    ? [
        {
          name: "_clck, _clsk, CLID, MUID",
          where: "Cookie (Microsoft Clarity)",
          purpose: "Shows where visitors get stuck (heatmaps, anonymised session replays).",
          lasts: "1 day to 1 year",
        },
      ]
    : []),
  ...(analyticsConfig.plausible
    ? [
        {
          name: "Plausible",
          where: "No cookies",
          purpose: "Privacy-friendly page counts. Stores nothing in your browser.",
          lasts: "—",
        },
      ]
    : []),
];

/** On small screens the table scrolls sideways in its own box, which keyboard users can focus. */
function StorageTable({ rows, label }: { rows: Row[]; label: string }) {
  return (
    <div className="overflow-x-auto rounded-sm" role="region" aria-label={label} tabIndex={0}>
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="label text-ink-soft">
          <tr>
            <th scope="col" className="py-2 pr-4 font-normal">
              Name
            </th>
            <th scope="col" className="py-2 pr-4 font-normal">
              Where
            </th>
            <th scope="col" className="py-2 pr-4 font-normal">
              Purpose
            </th>
            <th scope="col" className="py-2 font-normal">
              How long
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/40 border-y border-line/40">
          {rows.map((c) => (
            <tr key={c.name}>
              <td className="py-3 pr-4 font-mono text-xs">{c.name}</td>
              <td className="py-3 pr-4">{c.where}</td>
              <td className="py-3 pr-4">{c.purpose}</td>
              <td className="py-3">{c.lasts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CookiesPage() {
  return (
    <LegalDoc
      title="Cookie policy"
      intro={
        <p>
          We keep this short: {site.name} uses only what the site needs to work, plus analytics if —
          and only if — you say yes.
        </p>
      }
      sections={[
        {
          id: "essential",
          title: "Essential storage (always on)",
          body: <StorageTable rows={ESSENTIAL} label="Essential storage" />,
        },
        {
          id: "analytics",
          title: "Analytics (only with your consent)",
          body: ANALYTICS.length ? (
            <div className="space-y-4">
              <p>
                {analyticsConfig.ga || analyticsConfig.clarity
                  ? "These load only after you choose “Accept” in the cookie banner. Until then, nothing below is set."
                  : "We use cookieless analytics only, so there is nothing to accept."}
              </p>
              <StorageTable rows={ANALYTICS} label="Analytics cookies" />
            </div>
          ) : (
            <p>
              No analytics run on this site right now. If we add any, they will load only after you
              accept them in the cookie banner, and they will be listed here.{" "}
              <Todo>choose GA4 + Clarity or Plausible (set the env vars)</Todo>
            </p>
          ),
        },
        {
          id: "embeds",
          title: "Embedded services",
          body: (
            <p>
              The booking page embeds <Todo>Cal.com or Calendly</Todo>, which may set its own
              cookies when you use it. Its own cookie policy applies.
            </p>
          ),
        },
        {
          id: "control",
          title: "Changing your choice",
          body: (
            <p>
              You can change your analytics choice at any time from{" "}
              <button type="button" data-open-consent="" className="underline underline-offset-4">
                Cookie settings
              </button>{" "}
              (also in the footer), and clear site storage in your browser settings.
            </p>
          ),
        },
      ]}
    />
  );
}
