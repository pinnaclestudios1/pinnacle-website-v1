import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/cms/ProjectCard";
import { FaqList } from "@/components/faq/FaqList";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { ServiceMoment } from "@/components/services/ServiceMoment";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DraftNotice } from "@/components/ui/DraftNotice";
import { Todo } from "@/components/ui/Todo";
import { getProjects, getService } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";
import { services } from "@/lib/site";
import * as ld from "@/lib/structured-data";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return {};
  return pageMetadata({
    title: s.name,
    description: `${s.summary} ${s.whatItIs}`.slice(0, 158),
    path: `/services/${s.slug}`,
  });
}

/** Service page (brief §6). */
export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();
  const projects = await getProjects();
  const related = (
    service.relatedProjects.length
      ? projects.filter((p) => service.relatedProjects.includes(p.slug))
      : projects.filter((p) => p.services.includes(service.slug))
  ).slice(0, 2);

  return (
    <>
      <JsonLd
        data={[
          ld.service(service),
          ld.breadcrumbs([
            { name: "Services", path: "/services" },
            { name: service.name, path: `/services/${service.slug}` },
          ]),
          ld.faqPage(service.faqs),
        ]}
      />
      <Container
        as="section"
        className="grid items-center gap-12 pt-16 pb-16 lg:grid-cols-12 lg:pt-24"
      >
        <div className="lg:col-span-7">
          <p className="label text-ink-soft">Services</p>
          <h1 className="mt-5 text-h1">{service.name}</h1>
          <p className="mt-6 max-w-xl text-lead text-ink-soft">{service.summary}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/contact" ctaLocation={`service-${service.slug}`}>
              Start a project
            </Button>
            <Button href="/work" variant="outline" ctaLocation={`service-${service.slug}`}>
              See our work
            </Button>
          </div>
          {service.draft && <DraftNotice what="service copy" />}
        </div>
        <div className="lg:col-span-5">
          <ServiceMoment slug={service.slug} />
        </div>
      </Container>

      <Container className="grid gap-16 border-t border-line/40 py-20 lg:grid-cols-2 lg:gap-8">
        <Reveal as="section" aria-labelledby="what">
          <h2 id="what" className="font-display text-h3">
            What it is
          </h2>
          <p className="mt-4 text-lead text-ink-soft">{service.whatItIs}</p>
        </Reveal>
        <Reveal as="section" aria-labelledby="who" delay={80}>
          <h2 id="who" className="font-display text-h3">
            Who it’s for
          </h2>
          <p className="mt-4 text-lead text-ink-soft">{service.whoFor}</p>
        </Reveal>
      </Container>

      <Container className="grid gap-16 py-12 lg:grid-cols-2 lg:gap-8">
        <Reveal as="section" aria-labelledby="problems">
          <h2 id="problems" className="label font-sans text-ink-soft">
            Problems it solves
          </h2>
          <ul className="mt-6 space-y-4">
            {service.problems.map((p) => (
              <li key={p} className="flex gap-4 font-display text-xl">
                <span
                  aria-hidden
                  className="mt-3 size-2 shrink-0 rounded-full border border-node-stroke"
                />
                {p}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal as="section" aria-labelledby="deliverables" delay={80}>
          <h2 id="deliverables" className="label font-sans text-ink-soft">
            What you get
          </h2>
          <ul className="mt-6 divide-y divide-line/40 border-y border-line/40">
            {service.deliverables.map((d) => (
              <li key={d} className="py-3.5">
                {d}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>

      <Container as="section" aria-labelledby="steps" className="py-20">
        <h2 id="steps" className="text-h2">
          How the climb goes
        </h2>
        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {service.process.map((step, i) => (
            <Reveal
              as="li"
              key={step.title}
              delay={i * 70}
              className="rounded-md border border-line/40 bg-surface p-6"
            >
              <span className="label text-ink-soft">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 font-display text-h3">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </Container>

      <Container className="grid gap-16 border-t border-line/40 py-20 lg:grid-cols-2 lg:gap-8">
        <section aria-labelledby="stack">
          <h2 id="stack" className="label font-sans text-ink-soft">
            Tech stack
          </h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {service.techStack.map((t) => (
              <li key={t} className="rounded-md border border-line/60 px-3 py-1.5 text-sm">
                {t.startsWith("TODO:") ? <Todo>{t.slice(5).trim()}</Todo> : t}
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="pricing">
          <h2 id="pricing" className="label font-sans text-ink-soft">
            Engagement & pricing
          </h2>
          <p className="mt-6 font-display text-h3">
            {service.engagement ?? <Todo>engagement model</Todo>}
          </p>
          <p className="mt-2 text-ink-soft">
            {service.startingPrice ?? <Todo>starting price — pricing decision</Todo>}
          </p>
        </section>
      </Container>

      <Container as="section" aria-labelledby="related" className="py-20">
        <h2 id="related" className="text-h2">
          Related work
        </h2>
        <ul className="mt-12 grid gap-12 md:grid-cols-2">
          {related.length ? (
            related.map((p, i) => (
              <li key={p.slug}>
                <ProjectCard project={p} index={i} />
              </li>
            ))
          ) : (
            <li>
              <Todo>related case studies</Todo>
            </li>
          )}
        </ul>
      </Container>

      {service.faqs.length > 0 && (
        <Container as="section" aria-labelledby="service-faq" className="pb-24">
          <h2 id="service-faq" className="text-h2">
            Questions
          </h2>
          <div className="mt-10 max-w-3xl">
            <FaqList
              groups={[{ id: service.slug, title: "Questions", items: service.faqs }]}
              headingLevel={3}
            />
          </div>
        </Container>
      )}
    </>
  );
}
