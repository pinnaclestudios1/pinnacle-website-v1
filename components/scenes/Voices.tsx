import { Img } from "@/components/cms/Img";
import { DotActorView } from "@/components/dot/DotActorView";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { Todo } from "@/components/ui/Todo";
import { getTestimonials } from "@/lib/cms";

/**
 * Stage 6 — Voices from the Climb (brief §5): client quotes on cream cards with
 * name, role, company and photo; video testimonials and third-party ratings if we have them.
 * Testimonials come from the CMS (published only with the client's permission).
 */
const RATINGS = ["Clutch", "Google", "GoodFirms"]; // TODO: real ratings + profile links

export async function Voices() {
  const testimonials = (await getTestimonials()).slice(0, 3);
  return (
    <section
      id="voices"
      data-stage="6"
      aria-labelledby="voices-title"
      className="py-[var(--pn-section)]"
    >
      <Container>
        <p className="label text-ink-soft">Stage 6 · Voices from the Climb</p>
        <div className="mt-4 flex items-end gap-5">
          <h2 id="voices-title" className="max-w-xl text-h2">
            What climbers say.
          </h2>
          {/* The Dot listens in (hovering a card makes it curious). */}
          <DotActorView
            size="clamp(28px, 4vw, 40px)"
            name="voices"
            priority={30}
            attach="visible"
            attachWithin="[data-stage]"
            interactive
            className="mb-1 shrink-0"
          />
        </div>

        <ul className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal
              as="li"
              key={t.id}
              delay={i * 80}
              data-dot-curious=""
              className="flex flex-col rounded-md border border-line/40 bg-surface p-7"
            >
              <figure className="flex flex-1 flex-col">
                <span aria-hidden className="font-display text-h2 leading-none text-line">
                  &ldquo;
                </span>
                <blockquote className="mt-2 flex-1 font-display text-h3">
                  {t.quote ?? <Todo>client quote (with permission)</Todo>}
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border border-node-stroke bg-node text-xs text-ink-soft">
                    {t.photo?.kind === "image" ? (
                      <Img src={t.photo.url} alt="" fill sizes="48px" />
                    ) : (
                      <span aria-hidden>photo</span>
                    )}
                  </span>
                  <span className="text-sm">
                    {t.name ?? <Todo>name</Todo>}
                    <span className="mt-1 block text-ink-soft">
                      {t.role || t.company ? (
                        [t.role, t.company].filter(Boolean).join(", ")
                      ) : (
                        <Todo>role, company</Todo>
                      )}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-line/40 pt-8 text-sm text-ink-soft">
          {RATINGS.map((r) => (
            <span key={r}>
              {r} <Todo>rating + profile link</Todo>
            </span>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
