import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MaybeTodo, RichText } from "@/components/cms/RichText";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { TransitionLink } from "@/components/motion/PageTransition";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Todo } from "@/components/ui/Todo";
import { getJob, getJobs } from "@/lib/cms";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getJobs()).map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return {};
  return pageMetadata({
    title: job.placeholder ? "Open role (draft)" : job.title,
    description: job.summary,
    path: `/careers/${job.slug}`,
    noIndex: job.placeholder || !job.open,
  });
}

/** Job post (brief §4 /careers/[role-slug]). */
export default async function JobPage({ params }: Props) {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) notFound();
  const title = job.placeholder ? job.title.replace(/^TODO:\s*/, "") : job.title;

  return (
    <article>
      <Container className="pt-16 pb-12 lg:pt-24">
        <TransitionLink href="/careers" className="label text-ink-soft hover:text-ink">
          ← Careers
        </TransitionLink>
        <h1 className="mt-5 text-h1">{job.placeholder ? <Todo>{title}</Todo> : title}</h1>
        <p className="mt-4 text-ink-soft">
          {[job.type, job.location].filter(Boolean).join(" · ") || <Todo>type · location</Todo>}
          {!job.open && " · This role is closed"}
        </p>
        <p className="mt-6 max-w-2xl text-lead text-ink-soft">
          <MaybeTodo text={job.summary} fallback="role summary" />
        </p>
      </Container>

      <Container className="grid gap-16 pb-20 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <h2 className="font-display text-h3">The role</h2>
          <RichText value={job.description} className="mt-4" />
          <h2 className="mt-12 font-display text-h3">What we’re looking for</h2>
          <ul className="mt-4 space-y-3">
            {job.requirements.map((r, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-ink" />
                {r.startsWith("TODO:") ? <Todo>{r.slice(5).trim()}</Todo> : r}
              </li>
            ))}
          </ul>
        </div>
      </Container>

      {job.open && (
        <Container as="section" aria-labelledby="apply" className="pb-28">
          <h2 id="apply" className="text-h2">
            Apply
          </h2>
          <div className="mt-10">
            {job.applyUrl ? (
              <Button href={job.applyUrl} target="_blank" ctaLocation="job">
                Apply on our hiring page
              </Button>
            ) : (
              <ApplicationForm role={title} />
            )}
          </div>
        </Container>
      )}
    </article>
  );
}
