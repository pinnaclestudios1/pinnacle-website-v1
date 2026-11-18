"use client";

import { useActionState, useEffect, useId } from "react";
import { track } from "@/lib/analytics";
import { requestDeck } from "@/app/actions/forms";
import { FormGuards } from "@/components/forms/FormGuards";
import { TransitionLink } from "@/components/motion/PageTransition";
import { IDLE } from "@/lib/forms/state";
import { keepValuesOnSubmit } from "@/lib/forms/submit";

/** "Download capabilities deck" (brief §8: text-link CTA, email required). */
export function DeckRequest() {
  const id = useId();
  const [state, action, pending] = useActionState(requestDeck, IDLE);
  const errors = state.status === "error" ? (state.errors ?? {}) : {};

  useEffect(() => {
    if (state.status === "success") track("deck_requested");
  }, [state.status]);

  if (state.status === "success") {
    return (
      <p role="status" className="text-[0.9375rem]">
        On its way — check your inbox for the capabilities deck.
      </p>
    );
  }
  return (
    <form
      action={action}
      onSubmit={keepValuesOnSubmit(action)}
      noValidate
      className="relative max-w-md"
    >
      <FormGuards />
      <label htmlFor={`${id}-email`} className="text-sm">
        Your work email
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={`${id}-status`}
          className="h-11 min-w-0 flex-1 rounded-md border border-line bg-surface px-3 text-sm text-ink"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-11 shrink-0 rounded-md border border-ink px-4 text-sm font-medium disabled:opacity-60"
        >
          {pending ? "Sending…" : "Email me the deck"}
        </button>
      </div>
      <div className="mt-3 flex items-start gap-2 text-xs text-ink-soft">
        <input
          id={`${id}-consent`}
          name="consent"
          type="checkbox"
          required
          aria-invalid={!!errors.consent}
          className="mt-0.5 size-4 shrink-0 accent-[var(--pn-ink)]"
        />
        <label htmlFor={`${id}-consent`}>
          Email me the deck. See our{" "}
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
        className="mt-2 min-h-5 text-xs text-ink"
      >
        {state.status === "error"
          ? [state.message, errors.email, errors.consent].filter(Boolean).join(" ")
          : ""}
      </p>
    </form>
  );
}
