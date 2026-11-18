"use client";

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { submitBrief } from "@/app/actions/forms";
import { FormGuards } from "@/components/forms/FormGuards";
import { TransitionLink, useTransitionRouter } from "@/components/motion/PageTransition";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import {
  BUDGETS,
  IDLE,
  PROJECT_TYPES,
  SOURCES,
  STEPS,
  TIMELINES,
  labelOf,
  validateBrief,
  validateBriefFields,
  type BriefInput,
  type Currency,
  type FieldErrors,
} from "@/lib/forms/brief";
import { prefersReducedMotion } from "@/lib/motion/reduced-motion";
import { ClimbProgress } from "./ClimbProgress";

/**
 * The multi-step project brief (brief §8): one question per step, the Dot climbing
 * a progress pyramid, progress saved if the visitor leaves, honeypot + Turnstile.
 *
 * Progressive enhancement: without JavaScript every step is shown as one long form
 * that posts straight to the server action. With JavaScript, one step at a time.
 */

type Values = Omit<BriefInput, "consent">;
const EMPTY: Values = {
  projectTypes: [],
  about: "",
  currency: "INR",
  budget: "",
  timeline: "",
  name: "",
  email: "",
  company: "",
  phone: "",
  source: "",
};
const DRAFT_KEY = "pn-brief-draft";
const DRAFT_DAYS = 30;
const LAST = STEPS.length - 1;

export function BriefForm() {
  const id = useId();
  const [state, formAction, pending] = useActionState(submitBrief, IDLE);
  const [values, setValues] = useState<Values>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [restored, setRestored] = useState(false);
  const [done, setDone] = useState(false);
  const headings = useRef<(HTMLHeadingElement | null)[]>([]);
  const { navigate } = useTransitionRouter();

  const goTo = (next: number) => {
    setStep(next);
    track("form_step_reached", { form: "brief", step: STEPS[next]!.id });
    // Move focus to the new question for keyboard and screen-reader users.
    requestAnimationFrame(() => headings.current[next]?.focus());
  };

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Restore a saved draft (brief §8: save progress if the visitor leaves mid-form).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as { values: Values; step: number; savedAt: number };
      if (Date.now() - draft.savedAt > DRAFT_DAYS * 864e5)
        return localStorage.removeItem(DRAFT_KEY);
      // Syncing from browser storage after mount (unavailable during server render).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValues({ ...EMPTY, ...draft.values });
      setStep(Math.min(Math.max(0, draft.step), LAST));
      setRestored(true);
    } catch {
      /* ignore */
    }
  }, []);

  // Save the draft as they go (consent is never saved).
  useEffect(() => {
    if (done) return;
    const dirty = JSON.stringify(values) !== JSON.stringify(EMPTY);
    const t = window.setTimeout(() => {
      try {
        if (dirty)
          localStorage.setItem(DRAFT_KEY, JSON.stringify({ values, step, savedAt: Date.now() }));
      } catch {
        /* storage blocked */
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, [values, step, done]);

  // React to the server's answer.
  useEffect(() => {
    if (state.status === "error" && state.errors) {
      const firstBad = STEPS.findIndex((s) => s.fields.some((f) => state.errors?.[f]));
      // Mirroring the server action's result into the step UI.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrors(state.errors);
      if (firstBad >= 0) goTo(firstBad);
    }
    if (state.status === "success") {
      setDone(true);
      track("form_submitted", { form: "brief" });
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      // Let the Dot reach the summit and celebrate, then show what happens next.
      const t = window.setTimeout(
        () => navigate(`/contact/thank-you?ref=${encodeURIComponent(state.ref)}`),
        prefersReducedMotion() ? 600 : 2200,
      );
      return () => window.clearTimeout(t);
    }
    // goTo is stable enough for this purpose; re-running on it would replay results.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const input = (): BriefInput => ({ ...values, consent });

  const next = () => {
    const stepErrors = validateBriefFields(input(), STEPS[step]!.fields);
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      return;
    }
    goTo(Math.min(step + 1, LAST));
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (step < LAST) {
      e.preventDefault();
      next();
      return;
    }
    const all = validateBrief(input());
    if (Object.keys(all).length) {
      e.preventDefault();
      setErrors(all);
      const firstBad = STEPS.findIndex((s) => s.fields.some((f) => all[f]));
      if (firstBad >= 0 && firstBad !== step) goTo(firstBad);
    }
    // Otherwise the server action runs.
  };

  // Enter in a single-line field moves to the next step instead of submitting.
  const onKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    const t = e.target as HTMLElement;
    if (
      e.key === "Enter" &&
      t.tagName === "INPUT" &&
      (t as HTMLInputElement).type !== "checkbox" &&
      step < LAST
    ) {
      e.preventDefault();
      next();
    }
  };

  const startOver = () => {
    setValues(EMPTY);
    setConsent(false);
    setErrors({});
    setRestored(false);
    goTo(0);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  };

  const err = (field: string) => errors[field];
  const errId = (field: string) => `${id}-err-${field}`;
  const describedBy = (field: string) => (err(field) ? errId(field) : undefined);

  if (state.status === "success" && !done) {
    // No-JavaScript success (the page re-rendered with the action result).
    return (
      <div role="status" className="rounded-md border border-line/40 bg-surface p-8">
        <h2 className="font-display text-h3">Thank you — your brief is with us.</h2>
        <p className="mt-3 text-ink-soft">We reply within 24 hours. Reference: {state.ref}</p>
        <TransitionLink
          href="/contact/thank-you"
          className="mt-6 inline-block underline underline-offset-4"
        >
          What happens next →
        </TransitionLink>
      </div>
    );
  }

  return (
    <div>
      <ClimbProgress step={step} total={STEPS.length} done={done} />

      <p aria-live="polite" className="label mt-6 text-center text-ink-soft">
        {done
          ? "Sent — you reached the summit!"
          : `Step ${step + 1} of ${STEPS.length} · ${STEPS[step]!.title}`}
      </p>

      {restored && !done && (
        <p className="mt-4 rounded-md border border-dashed border-line px-4 py-3 text-sm text-ink-soft">
          We kept your answers from last time.{" "}
          <button
            type="button"
            onClick={startOver}
            className="underline underline-offset-4 hover:text-ink"
          >
            Start over
          </button>
        </p>
      )}

      {state.status === "error" && (
        <p role="alert" className="mt-4 rounded-md border border-ink px-4 py-3 text-sm">
          {state.message}
        </p>
      )}

      <form
        action={formAction}
        onSubmit={onSubmit}
        onKeyDown={onKeyDown}
        noValidate
        aria-label="Project brief"
        className="relative mt-8"
      >
        <FormGuards />

        {/* 1 — What are you building? */}
        <Step
          index={0}
          current={step}
          headingRef={(el) => (headings.current[0] = el)}
          title={STEPS[0].title}
          hint="Choose all that apply."
        >
          <div
            role="group"
            aria-describedby={describedBy("projectTypes")}
            className="flex flex-wrap gap-2.5"
          >
            {PROJECT_TYPES.map((t) => (
              <Chip
                key={t.id}
                type="checkbox"
                name="projectTypes"
                value={t.id}
                checked={values.projectTypes.includes(t.id)}
                onChange={(on) =>
                  set(
                    "projectTypes",
                    on
                      ? [...values.projectTypes, t.id]
                      : values.projectTypes.filter((x) => x !== t.id),
                  )
                }
              >
                {t.label}
              </Chip>
            ))}
          </div>
          <FieldError id={errId("projectTypes")} message={err("projectTypes")} />
        </Step>

        {/* 2 — Tell us a bit about it */}
        <Step
          index={1}
          current={step}
          headingRef={(el) => (headings.current[1] = el)}
          title={STEPS[1].title}
          hint="Goals, audience, anything you already have — a few sentences is plenty."
        >
          <label htmlFor={`${id}-about`} className="sr-only">
            About your project
          </label>
          <textarea
            id={`${id}-about`}
            name="about"
            rows={6}
            maxLength={4000}
            value={values.about}
            onChange={(e) => set("about", e.target.value)}
            aria-invalid={!!err("about")}
            aria-describedby={describedBy("about")}
            className="w-full rounded-md border border-line bg-surface p-4 text-[0.9375rem] text-ink placeholder:text-ink-soft"
            placeholder="We’re a… We want to… By… "
          />
          <FieldError id={errId("about")} message={err("about")} />
        </Step>

        {/* 3 — Budget, with INR / USD toggle */}
        <Step
          index={2}
          current={step}
          headingRef={(el) => (headings.current[2] = el)}
          title={STEPS[2].title}
          hint="A rough range helps us suggest the right scope."
        >
          <fieldset className="mb-5 inline-flex rounded-md border border-line p-1">
            <legend className="sr-only">Currency</legend>
            {(["INR", "USD"] as Currency[]).map((c) => (
              <label key={c} className="relative">
                <input
                  type="radio"
                  name="currency"
                  value={c}
                  checked={values.currency === c}
                  onChange={() => {
                    set("currency", c);
                    set("budget", "");
                  }}
                  className="peer sr-only"
                />
                <span className="block cursor-pointer rounded-[5px] px-4 py-1.5 text-sm text-ink-soft peer-checked:bg-ink peer-checked:text-bg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus">
                  {c}
                </span>
              </label>
            ))}
          </fieldset>
          <div
            role="radiogroup"
            aria-label="Budget range"
            aria-describedby={describedBy("budget")}
            className="flex flex-wrap gap-2.5"
          >
            {BUDGETS[values.currency].map((b) => (
              <Chip
                key={b.id}
                type="radio"
                name="budget"
                value={b.id}
                checked={values.budget === b.id}
                onChange={() => set("budget", b.id)}
              >
                {b.label}
              </Chip>
            ))}
          </div>
          <FieldError id={errId("budget")} message={err("budget")} />
        </Step>

        {/* 4 — Timeline */}
        <Step
          index={3}
          current={step}
          headingRef={(el) => (headings.current[3] = el)}
          title={STEPS[3].title}
        >
          <div
            role="radiogroup"
            aria-label="Timeline"
            aria-describedby={describedBy("timeline")}
            className="flex flex-wrap gap-2.5"
          >
            {TIMELINES.map((t) => (
              <Chip
                key={t.id}
                type="radio"
                name="timeline"
                value={t.id}
                checked={values.timeline === t.id}
                onChange={() => set("timeline", t.id)}
              >
                {t.label}
              </Chip>
            ))}
          </div>
          <FieldError id={errId("timeline")} message={err("timeline")} />
        </Step>

        {/* 5 — Your details */}
        <Step
          index={4}
          current={step}
          headingRef={(el) => (headings.current[4] = el)}
          title={STEPS[4].title}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id={`${id}-name`}
              label="Name"
              name="name"
              autoComplete="name"
              required
              value={values.name}
              onChange={(v) => set("name", v)}
              error={err("name")}
              errorId={errId("name")}
            />
            <TextField
              id={`${id}-email`}
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={(v) => set("email", v)}
              error={err("email")}
              errorId={errId("email")}
            />
            <TextField
              id={`${id}-company`}
              label="Company"
              name="company"
              autoComplete="organization"
              value={values.company}
              onChange={(v) => set("company", v)}
              hint="Optional"
            />
            <TextField
              id={`${id}-phone`}
              label="Phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(v) => set("phone", v)}
              error={err("phone")}
              errorId={errId("phone")}
              hint="Optional — WhatsApp works too"
            />
            <div className="sm:col-span-2">
              <label htmlFor={`${id}-source`} className="text-sm">
                How did you hear about us? <span className="text-ink-soft">Optional</span>
              </label>
              <select
                id={`${id}-source`}
                name="source"
                value={values.source}
                onChange={(e) => set("source", e.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-line bg-surface px-3 text-[0.9375rem] text-ink"
              >
                <option value="">Choose one</option>
                {SOURCES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Step>

        {/* 6 — Review, consent, send */}
        <Step
          index={5}
          current={step}
          headingRef={(el) => (headings.current[5] = el)}
          title={STEPS[5].title}
        >
          <dl className="hidden divide-y divide-line/30 rounded-md border border-line/40 bg-surface px-5 text-sm [.js_&]:block">
            {[
              ["Building", values.projectTypes.map(labelOf.projectType).join(", "), 0],
              ["About", values.about, 1],
              ["Budget", values.budget ? labelOf.budget(values.currency, values.budget) : "", 2],
              ["Timeline", values.timeline ? labelOf.timeline(values.timeline) : "", 3],
              ["You", [values.name, values.email, values.company].filter(Boolean).join(" · "), 4],
            ].map(([label, value, target]) => (
              <div key={label as string} className="flex gap-4 py-3">
                <dt className="w-20 shrink-0 text-ink-soft">{label}</dt>
                <dd className="min-w-0 flex-1 truncate">{(value as string) || "—"}</dd>
                <button
                  type="button"
                  onClick={() => goTo(target as number)}
                  className="shrink-0 text-ink-soft underline underline-offset-4 hover:text-ink"
                >
                  Edit<span className="sr-only"> {label as string}</span>
                </button>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex items-start gap-3 text-sm">
            <input
              id={`${id}-consent`}
              name="consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                setErrors((x) => ({ ...x, consent: undefined }));
              }}
              aria-invalid={!!err("consent")}
              aria-describedby={describedBy("consent")}
              className="mt-0.5 size-4 shrink-0 accent-[var(--pn-ink)]"
            />
            <label htmlFor={`${id}-consent`} className="text-ink-soft">
              I agree that Pinnacle Studios may use these details to reply to my enquiry, as
              described in the{" "}
              <TransitionLink href="/privacy" className="underline underline-offset-2">
                privacy policy
              </TransitionLink>
              . We never share them.
            </label>
          </div>
          <FieldError id={errId("consent")} message={err("consent")} />
          <button
            type="submit"
            disabled={pending || done}
            data-cta="primary"
            data-cta-location="contact-brief"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-md bg-accent px-7 text-[0.9375rem] font-medium text-accent-ink transition-transform duration-200 ease-out-expo hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-60 motion-reduce:transition-none"
          >
            {pending ? "Sending…" : done ? "Sent" : "Send brief"}
          </button>
        </Step>

        {/* Step navigation (JavaScript only; without JS every step is visible). */}
        {!done && (
          <div className="mt-10 hidden items-center justify-between gap-4 [.js_&]:flex">
            <button
              type="button"
              onClick={() => goTo(Math.max(0, step - 1))}
              className={cn(
                "h-11 rounded-md px-2 text-[0.9375rem] text-ink-soft underline underline-offset-4 hover:text-ink",
                step === 0 && "invisible",
              )}
            >
              ← Back
            </button>
            {step < LAST && (
              <button
                type="button"
                onClick={next}
                className="h-12 rounded-md border border-ink px-6 text-[0.9375rem] font-medium text-ink transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97] motion-reduce:transition-none"
              >
                Next →
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

function Step({
  index,
  current,
  title,
  hint,
  headingRef,
  children,
}: {
  index: number;
  current: number;
  title: string;
  hint?: string;
  headingRef: (el: HTMLHeadingElement | null) => void;
  children: ReactNode;
}) {
  const hid = `brief-step-${index}`;
  return (
    <fieldset
      data-step=""
      data-current={index === current ? "" : undefined}
      aria-labelledby={hid}
      // min-w-0: fieldsets otherwise grow to their widest content (long answers overflowed the card).
      className="mb-12 min-w-0 border-0 p-0 [.js_&]:mb-0 [.js_&:not([data-current])]:hidden"
    >
      <h2 id={hid} ref={headingRef} tabIndex={-1} className="font-display text-h3">
        <span className="label mb-2 block font-sans text-ink-soft">
          {String(index + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
        </span>
        {title}
      </h2>
      {hint && <p className="mt-2 text-sm text-ink-soft">{hint}</p>}
      <div className="mt-6">{children}</div>
    </fieldset>
  );
}

function Chip({
  type,
  name,
  value,
  checked,
  onChange,
  children,
}: {
  type: "checkbox" | "radio";
  name: string;
  value: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="relative">
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className={cn(
          "block cursor-pointer rounded-md border px-4 py-2.5 text-[0.9375rem] transition-transform duration-150 select-none active:scale-[0.97] motion-reduce:transition-none",
          "border-line bg-surface text-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bg",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus",
        )}
      >
        {children}
      </span>
    </label>
  );
}

function TextField(props: {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  errorId?: string;
}) {
  return (
    <div>
      <label htmlFor={props.id} className="text-sm">
        {props.label} {props.hint && <span className="text-ink-soft">{props.hint}</span>}
      </label>
      <input
        id={props.id}
        name={props.name}
        type={props.type ?? "text"}
        autoComplete={props.autoComplete}
        required={props.required}
        aria-required={props.required}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        aria-invalid={!!props.error}
        aria-describedby={props.error ? props.errorId : undefined}
        className="mt-2 h-12 w-full rounded-md border border-line bg-surface px-4 text-[0.9375rem] text-ink aria-[invalid=true]:border-ink"
      />
      <FieldError id={props.errorId} message={props.error} />
    </div>
  );
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-sm text-ink">
      <span
        aria-hidden
        className="mr-1.5 inline-block size-1.5 -translate-y-0.5 rounded-full bg-ink"
      />
      {message}
    </p>
  );
}
