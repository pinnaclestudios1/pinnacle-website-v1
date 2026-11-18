import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Todo } from "@/components/ui/Todo";

export type LegalSection = { id: string; title: string; body: ReactNode };

/**
 * Layout for legal pages: title, draft warning, contents list and numbered sections.
 * All legal copy is a DRAFT until reviewed by a qualified lawyer (launch checklist).
 */
export function LegalDoc({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <Container
      as="article"
      className="grid grid-cols-1 gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24"
    >
      <header className="lg:col-span-12">
        <p className="label text-ink-soft">Legal</p>
        <h1 className="mt-5 text-h1">{title}</h1>
        <p className="mt-6 rounded-md border border-ink px-4 py-3 text-sm">
          <strong>Draft.</strong> This text was prepared from how the website actually works, but it
          must be reviewed by a qualified lawyer before launch. <Todo>legal review</Todo>
        </p>
        <p className="mt-4 text-sm text-ink-soft">
          Last updated: <Todo>date</Todo>
        </p>
        <div className="mt-8 max-w-2xl text-lead text-ink-soft">{intro}</div>
      </header>

      <nav aria-label="Contents" className="lg:col-span-4">
        <div className="lg:sticky lg:top-[calc(var(--pn-header-h)+2rem)]">
          <p className="label text-ink-soft">Contents</p>
          <ol className="mt-4 space-y-2 text-sm">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-ink-soft hover:text-ink hover:underline">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <div className="min-w-0 space-y-12 lg:col-span-8">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-28">
            <h2 id={`${s.id}-h`} className="font-display text-h3">
              {i + 1}. {s.title}
            </h2>
            <div className="legal-body mt-4 space-y-4 text-[1rem] leading-relaxed text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2">
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
