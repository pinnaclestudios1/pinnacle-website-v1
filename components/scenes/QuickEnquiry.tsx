"use client";

import { useActionState, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { submitQuick } from "@/app/actions/forms";
import { dot } from "@/components/dot/controller";
import { FormGuards } from "@/components/forms/FormGuards";
import { TransitionLink } from "@/components/motion/PageTransition";
import { track } from "@/lib/analytics";
import { parseQuick, validateQuick } from "@/lib/forms/quick";
import { IDLE, type FieldErrors } from "@/lib/forms/state";
import { keepValuesOnSubmit } from "@/lib/forms/submit";

/**
 * Home summit quick enquiry (brief §8 "Reducing friction"): name, email, what are
 * you building? On success the Dot does a happy jump with confetti and the pyramid
 * glows (brief §5 Stage 7). The full multi-step brief lives on /contact.
 * Works without JavaScript (posts straight to the server action).
 */
export function QuickEnquiry() {
  const id = useId();
  const [state, formAction, pending] = useActionState(submitQuick, IDLE);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const wrapRef = useRef<HTMLDivElement>(null);
  const errors = { ...(state.status === "error" ? state.errors : {}), ...clientErrors };

  useEffect(() => {
    if (state.status !== "success") return;
    track("form_submitted", { form: "home-summit" });
    // The form has unmounted by now; the wrapper persists.
    const section = wrapRef.current?.closest("[data-stage]");
    section?.setAttribute("data-celebrate", "");
    if (dot.activeName === "summit") void dot.celebrate();
  }, [state]);

  // Validate in the browser first; then submit without React's post-action field reset.
  const onSubmit = keepValuesOnSubmit(formAction, (e: FormEvent<HTMLFormElement>) => {
    const errs = validateQuick(parseQuick(new FormData(e.currentTarget)));
    setClientErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return false;
    }
  });

  return <div ref={wrapRef}>{state.status === "success" ? <Success /> : renderForm()}</div>;

  function renderForm() {
    const field =
      "mt-2 h-12 w-full rounded-md border border-line bg-surface px-4 text-[0.9375rem] text-ink placeholder:text-ink-soft aria-[invalid=true]:border-ink";
    const msg = (name: string) =>
      errors[name] ? (
        <p id={`${id}-${name}-err`} className="mt-2 text-sm">
          {errors[name]}
        </p>
      ) : null;
    const a11y = (name: string) => ({
      "aria-invalid": !!errors[name],
      "aria-describedby": errors[name] ? `${id}-${name}-err` : undefined,
    });

    return (
      <form action={formAction} onSubmit={onSubmit} noValidate className="relative max-w-lg">
        <FormGuards />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-name`} className="text-sm">
              Name
            </label>
            <input
              id={`${id}-name`}
              name="name"
              required
              autoComplete="name"
              className={field}
              {...a11y("name")}
            />
            {msg("name")}
          </div>
          <div>
            <label htmlFor={`${id}-email`} className="text-sm">
              Email
            </label>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              required
              autoComplete="email"
              className={field}
              {...a11y("email")}
            />
            {msg("email")}
          </div>
        </div>
        <div className="mt-5">
          <label htmlFor={`${id}-what`} className="text-sm">
            What are you building?
          </label>
          <input
            id={`${id}-what`}
            name="what"
            required
            placeholder="A website, an app, a store…"
            className={field}
            {...a11y("what")}
          />
          {msg("what")}
        </div>
        <div className="mt-5 flex items-start gap-3 text-sm text-ink-soft">
          <input
            id={`${id}-consent`}
            name="consent"
            type="checkbox"
            required
            className="mt-0.5 size-4 shrink-0 accent-[var(--pn-ink)]"
            {...a11y("consent")}
          />
          <label htmlFor={`${id}-consent`}>
            I agree that Pinnacle Studios may contact me about my enquiry, as described in the{" "}
            <TransitionLink href="/privacy" className="underline underline-offset-2">
              privacy policy
            </TransitionLink>
            .
          </label>
        </div>
        {msg("consent")}
        <button
          type="submit"
          disabled={pending}
          data-cta="primary"
          data-cta-location="home-summit"
          className="mt-7 inline-flex h-12 items-center rounded-md bg-accent px-6 text-[0.9375rem] font-medium text-accent-ink transition-transform duration-200 ease-out-expo hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-60 motion-reduce:transition-none"
        >
          {pending ? "Sending…" : "Send"}
        </button>
        {state.status === "error" && (
          <p role="alert" className="mt-4 text-sm">
            {state.message}
          </p>
        )}
      </form>
    );
  }
}

function Success() {
  return (
    <div role="status" className="max-w-lg rounded-md border border-line/40 bg-surface p-7">
      <p className="font-display text-h3">You reached the summit. Thank you!</p>
      <p className="mt-3 text-ink-soft">
        We&rsquo;ll reply within 24 hours. Want to skip ahead? Add a few details to your{" "}
        <TransitionLink href="/contact" className="underline underline-offset-4">
          full brief
        </TransitionLink>
        .
      </p>
    </div>
  );
}
