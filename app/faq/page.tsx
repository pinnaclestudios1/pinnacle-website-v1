import { FaqList } from "@/components/faq/FaqList";
import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getFaqGroups } from "@/lib/cms";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { faqPage } from "@/lib/structured-data";

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "Answers on pricing, timelines, process, tech, ownership and support at Pinnacle Studios.",
  path: "/faq",
});

/** FAQ (brief §6): grouped; the Dot opens each accordion. FAQPage structured data (signed-off answers only). */
export default async function FaqPage() {
  const groups = await getFaqGroups();
  return (
    <>
      <JsonLd data={faqPage(groups.flatMap((g) => g.items))} />
      <PageIntro
        eyebrow="FAQ"
        title="Questions, answered."
        intro="The things people ask us most. Can’t find yours? Ask it in your brief — we reply within 24 hours."
      />
      <Container as="section" aria-label="Frequently asked questions" className="pb-20">
        <nav aria-label="FAQ topics" className="mb-14 flex flex-wrap gap-2">
          {groups.map((g) => (
            <a
              key={g.id}
              href={`#faq-${g.id}`}
              className="rounded-md border border-line/70 px-3.5 py-1.5 text-sm hover:border-ink"
            >
              {g.title}
            </a>
          ))}
        </nav>
        <div className="max-w-3xl">
          <FaqList groups={groups} />
        </div>
      </Container>
      <Container as="section" aria-label="Ask us" className="pb-28">
        <div className="flex flex-col items-start gap-6 border-t border-line/40 pt-14 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-xl font-display text-h2">Still wondering? Just ask.</p>
          <Button href="/contact" ctaLocation="faq">
            Start a project
          </Button>
        </div>
      </Container>
    </>
  );
}
