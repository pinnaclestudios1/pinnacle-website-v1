"use client";

import { useActionState, useId } from "react";
import { subscribeNewsletter } from "@/app/actions/forms";
import { FormGuards } from "@/components/forms/FormGuards";
import { TransitionLink } from "@/components/motion/PageTransition";
import { IDLE } from "@/lib/forms/state";
import { keepValuesOnSubmit } from "@/lib/forms/submit";

/**
 * Newsletter sign-up → server action → email platform (Brevo; TODO: confirm vs Mailchimp).
 * Honeypot, time trap and rate limit as on every form. Works without JavaScript.
 */
export function Newsletter() {
  const id = useId();
  const [state, formAction, pending] = useActionState(subscribeNewsletter, IDLE);
  const errors = state.status === "error" ? (state.errors ?? {}) : {};

  if (state.status === "success") {
    return (
      <div role="status" className="max-w-sm">
        <p className="label text-ink-soft">Newsletter</p>
        <p className="mt-3 text-sm">You&rsquo;re on the list. See you at the next peak.</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={keepValuesOnSubmit(formAction)}
      noValidate
      className="relative max-w-sm"
    >
      <FormGuards />
      <label htmlFor={`${id}-email`} className="label text-ink-soft">
        Newsletter
      </label>
      <p className="mt-2 text-sm text-ink-soft">Occasional notes from the studio. No spam.</p>
      <div className="mt-4 flex gap-2">
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? `${id}-status` : undefined}
          className="h-11 min-w-0 flex-1 rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-soft"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-11 shrink-0 rounded-md border border-ink px-4 text-sm font-medium text-ink disabled:opacity-60"
        >
          {pending ? "…" : "Subscribe"}
        </button>
      </div>
      <div className="mt-3 flex items-start gap-2 text-xs text-ink-soft">
        <input
          id={`${id}-consent`}
          type="checkbox"
          name="consent"
          required
          aria-invalid={!!errors.consent}
          className="mt-0.5 size-4 shrink-0 accent-[var(--pn-ink)]"
        />
        <label htmlFor={`${id}-consent`}>
          I agree to receive emails and accept the{" "}
          <TransitionLink href="/privacy" className="underline underline-offset-2">
            privacy policy
          </TransitionLink>
          .
        </label>
      </div>
      <p
        id={`${id}-status`}
        role="status"
        aria-live="polite"
        className="mt-3 min-h-5 text-xs text-ink"
      >
        {state.status === "error"
          ? [state.message, errors.email, errors.consent].filter(Boolean).join(" ")
          : ""}
      </p>
    </form>
  );
}
