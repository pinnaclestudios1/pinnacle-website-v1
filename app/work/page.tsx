import { Suspense } from "react";
import { PageIntro } from "@/components/layout/PageIntro";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { WorkGrid, WorkIndex, type FilterGroup } from "@/components/work/WorkIndex";
import { getProjects, platformLabel } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import { services } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Work",
  description: "Peaks conquered — selected websites, apps and brands by Pinnacle Studios.",
  path: "/work",
});

export default async function WorkPage() {
  const projects = await getProjects();

  const used = <T,>(values: T[]) => [...new Set(values)];
  const groups: FilterGroup[] = [
    {
      key: "service" as const,
      label: "Service",
      options: services
        .filter((s) => projects.some((p) => p.services.includes(s.slug)))
        .map((s) => ({ value: s.slug, label: s.name })),
    },
    {
      key: "industry" as const,
      label: "Industry",
      options: used(projects.map((p) => p.industry).filter((v): v is string => !!v)).map((v) => ({
        value: v,
        label: v,
      })),
    },
    {
      key: "platform" as const,
      label: "Platform",
      options: used(projects.flatMap((p) => p.platforms)).map((v) => ({
        value: v,
        label: platformLabel(v),
      })),
    },
  ].filter((g) => g.options.length > 0);

  return (
    <>
      <PageIntro
        eyebrow="Work — Peaks Conquered"
        title="Peaks conquered."
        intro="Websites, apps and brands we’ve taken to the top. Filter by what you need."
      />
      <Container as="section" aria-label="Projects" className="pb-24">
        {/* Filters read the URL; the server render shows everything (and works without JS). */}
        <Suspense fallback={<WorkGrid projects={projects} />}>
          <WorkIndex projects={projects} groups={groups} />
        </Suspense>
      </Container>
      <Container as="section" aria-labelledby="next-peak" className="pb-28">
        <div className="flex flex-col items-start gap-6 border-t border-line/40 pt-14 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="next-peak" className="text-h2">
            Your peak is next.
          </h2>
          <Button href="/contact" ctaLocation="work">
            Start a project
          </Button>
        </div>
      </Container>
    </>
  );
}
