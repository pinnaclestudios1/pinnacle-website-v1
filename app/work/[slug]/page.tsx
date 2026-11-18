import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { MediaFrame } from "@/components/cms/MediaFrame";
import { MaybeTodo, RichText } from "@/components/cms/RichText";
import { DotActorView } from "@/components/dot/DotActorView";
import { TransitionLink } from "@/components/motion/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Todo } from "@/components/ui/Todo";
import { getProject, getProjects } from "@/lib/cms";
import type { Project } from "@/lib/cms/types";
import { pageMetadata } from "@/lib/seo";
import { services } from "@/lib/site";
import * as ld from "@/lib/structured-data";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  return pageMetadata({
    title: p.placeholder ? "Case study (draft)" : `${p.title}${p.client ? ` for ${p.client}` : ""}`,
    description: p.summary,
    path: `/work/${p.slug}`,
    // Placeholder case studies must never be indexed.
    noIndex: p.placeholder,
  });
}

/** Case study template (brief §6). */
export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const all = await getProjects();
  const idx = all.findIndex((p) => p.slug === project.slug);
  const next = all[(idx + 1) % all.length]!;
  const serviceNames = project.services
    .map((s) => services.find((x) => x.slug === s))
    .filter(Boolean);

  return (
    <article>
      {!project.placeholder && (
        <JsonLd
          data={[
            ld.caseStudy(project),
            ld.breadcrumbs([
              { name: "Work", path: "/work" },
              { name: project.title, path: `/work/${project.slug}` },
            ]),
          ]}
        />
      )}
      {/* Hero */}
      <Container as="header" className="pt-16 pb-12 lg:pt-24">
        <p className="label text-ink-soft">Case study · {project.year ?? <Todo>year</Todo>}</p>
        <h1 className="mt-5 max-w-5xl text-h1">
          {project.placeholder ? (
            <Todo>{project.title.replace(/^TODO:\s*/, "")}</Todo>
          ) : (
            project.title
          )}
        </h1>
        <p className="mt-6 max-w-2xl text-lead text-ink-soft">
          <MaybeTodo text={project.summary} fallback="summary" />
        </p>
        <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-4 text-sm">
          <Meta label="Client">{project.client ?? <Todo>client</Todo>}</Meta>
          <Meta label="Services">
            {serviceNames.length ? (
              serviceNames.map((s, i) => (
                <span key={s!.slug}>
                  {i > 0 && ", "}
                  <TransitionLink
                    href={`/services/${s!.slug}`}
                    className="underline underline-offset-4"
                  >
                    {s!.name}
                  </TransitionLink>
                </span>
              ))
            ) : (
              <Todo>services</Todo>
            )}
          </Meta>
          <Meta label="Live">
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4"
              >
                Visit site <span className="sr-only">(opens in a new tab)</span>↗
              </a>
            ) : (
              <Todo>live link</Todo>
            )}
          </Meta>
        </dl>
      </Container>
      {/* Full-bleed: reaches into the guide Dot's gutter, so the guide steps aside. */}
      <Container bleed className="pb-20" data-dot-avoid="">
        <MediaFrame
          media={project.hero}
          ratio="21 / 9"
          priority
          sizes="100vw"
          todo="full-bleed hero visual"
        />
      </Container>

      <Container className="grid gap-16 pb-24 lg:grid-cols-12 lg:gap-8">
        {/* At a glance */}
        <aside aria-labelledby="glance" className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--pn-header-h)+2rem)]">
            <h2 id="glance" className="label font-sans text-ink-soft">
              At a glance
            </h2>
            <dl className="mt-5 divide-y divide-line/40 border-y border-line/40 text-sm">
              <GlanceRow label="Industry">{project.industry ?? <Todo>industry</Todo>}</GlanceRow>
              <GlanceRow label="Timeline">
                {project.glance.timeline ?? <Todo>timeline</Todo>}
              </GlanceRow>
              <GlanceRow label="Team">
                {project.glance.teamSize ?? <Todo>team size</Todo>}
              </GlanceRow>
              <GlanceRow label="Platform">
                {project.platforms.join(", ") || <Todo>platform</Todo>}
              </GlanceRow>
              <GlanceRow label="Tech">
                {project.glance.techStack.join(", ") || <Todo>tech stack</Todo>}
              </GlanceRow>
            </dl>
          </div>
        </aside>

        <div className="space-y-20 lg:col-span-8">
          <Section title="The challenge">
            <RichText value={project.challenge} />
          </Section>
          <Section title="The approach">
            <RichText value={project.approach} />
          </Section>
          <Section title="Design">
            <RichText value={project.design.text} />
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {(project.design.media.length ? project.design.media : [null, null]).map((m, i) => (
                <MediaFrame
                  key={i}
                  media={m}
                  ratio="4 / 3"
                  variant={i + 1}
                  todo="moodboard / wireframe / final screen"
                  sizes="(min-width: 1024px) 30vw, 100vw"
                />
              ))}
            </div>
          </Section>
          <Section title="Build">
            <RichText value={project.build.text} />
            {project.build.highlights.length > 0 && (
              <ul className="mt-6 space-y-2">
                {project.build.highlights.map((h) => (
                  <li key={h} className="flex gap-3">
                    <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-ink" />
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </Section>
          <Section title="Motion and details">
            <div className="grid gap-6">
              {(project.motion.length ? project.motion : [null]).map((m, i) => (
                <MediaFrame
                  key={i}
                  media={m}
                  ratio="16 / 9"
                  variant={i + 2}
                  todo="interaction videos or GIFs"
                />
              ))}
            </div>
          </Section>
        </div>
      </Container>

      {/* Results */}
      <section aria-labelledby="results" className="border-y border-line/40 bg-surface/60 py-20">
        <Container>
          <h2 id="results" className="label font-sans text-ink-soft">
            Results
          </h2>
          <dl className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {(project.results.length ? project.results : [null, null, null]).map((r, i) => (
              // dt must precede dd in HTML; flex-col-reverse shows the number first.
              <Reveal key={i} delay={i * 80} className="flex flex-col-reverse">
                <dt className="mt-2 text-ink-soft">
                  {r ? r.label : <Todo>what it measures</Todo>}
                </dt>
                <dd className="font-display text-h1">{r ? r.value : <Todo>number</Todo>}</dd>
              </Reveal>
            ))}
          </dl>
          <figure className="mt-16 max-w-3xl">
            <blockquote className="font-display text-h3">
              {project.testimonial?.quote ? (
                `“${project.testimonial.quote}”`
              ) : (
                <Todo>client quote (with permission)</Todo>
              )}
            </blockquote>
            <figcaption className="mt-4 text-sm text-ink-soft">
              {project.testimonial?.name ?? <Todo>name</Todo>}
              {project.testimonial?.role ? `, ${project.testimonial.role}` : ""}
              {project.testimonial?.company ? ` — ${project.testimonial.company}` : ""}
            </figcaption>
          </figure>
        </Container>
      </section>

      {/* Next project — the Dot points the way */}
      <NextProject next={next} current={project} />
    </article>
  );
}

function NextProject({ next, current }: { next: Project; current: Project }) {
  if (next.slug === current.slug) return null;
  return (
    <Container as="nav" aria-label="Next case study" className="py-24">
      <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-end gap-5">
          <DotActorView
            size="44px"
            priority={30}
            attach="visible"
            gaze={{ x: 6, y: 0 }}
            interactive
          />
          <div>
            <p className="label text-ink-soft">Next peak</p>
            <TransitionLink
              href={`/work/${next.slug}`}
              dive
              data-dot-curious=""
              className="mt-3 inline-block font-display text-h2 underline decoration-line underline-offset-8 hover:decoration-ink"
            >
              {next.placeholder ? next.title.replace(/^TODO:\s*/, "") : next.title} →
            </TransitionLink>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href="/contact" ctaLocation="case-study">
            Start a project
          </Button>
          <Button href="/contact/book" variant="outline" ctaLocation="case-study">
            Book a 20-min call
          </Button>
        </div>
      </div>
    </Container>
  );
}

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="label text-ink-soft">{label}</dt>
      <dd className="mt-1.5">{children}</dd>
    </div>
  );
}

function GlanceRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 py-3">
      <dt className="w-20 shrink-0 text-ink-soft">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Reveal as="section">
      <h2 className="text-h2">{title}</h2>
      <div className="mt-6">{children}</div>
    </Reveal>
  );
}
