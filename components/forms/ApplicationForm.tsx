"use client";

import { useActionState, useId, type ReactNode } from "react";
import { submitApplication } from "@/app/actions/forms";
import { FormGuards } from "@/components/forms/FormGuards";
import { TransitionLink } from "@/components/motion/PageTransition";
import { IDLE } from "@/lib/forms/state";
import { keepValuesOnSubmit } from "@/lib/forms/submit";

/** General application / apply-for-a-role form (brief §6 Careers). Works without JavaScript. */
export function ApplicationForm({ role = "" }: { role?: string }) {
  const id = useId();
  const [state, action, pending] = useActionState(submitApplication, IDLE);
  const errors = state.status === "error" ? (state.errors ?? {}) : {};

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-md border border-line/40 bg-surface p-7">
        <p className="font-display text-h3">Application received — thank you.</p>
        <p className="mt-2 text-ink-soft">We read every application and will reply either way.</p>
      </div>
    );
  }

  const field =
    "mt-2 w-full rounded-md border border-line bg-surface px-4 text-[0.9375rem] text-ink aria-[invalid=true]:border-ink";
  const a = (name: string) => ({
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${id}-${name}-err` : undefined,
  });
  const err = (name: string) =>
    errors[name] ? (
      <p id={`${id}-${name}-err`} className="mt-2 text-sm">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form
      action={action}
      onSubmit={keepValuesOnSubmit(action)}
      noValidate
      className="relative grid max-w-2xl gap-5"
    >
      <FormGuards />
      <input type="hidden" name="role" value={role} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor={`${id}-name`}>
          <input
            id={`${id}-name`}
            name="name"
            required
            autoComplete="name"
            className={`${field} h-12`}
            {...a("name")}
          />
          {err("name")}
        </Field>
        <Field label="Email" htmlFor={`${id}-email`}>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            className={`${field} h-12`}
            {...a("email")}
          />
          {err("email")}
        </Field>
      </div>
      <Field label="Portfolio, GitHub, LinkedIn or CV link" htmlFor={`${id}-portfolio`}>
        <input
          id={`${id}-portfolio`}
          name="portfolio"
          type="url"
          required
          placeholder="https://"
          className={`${field} h-12`}
          {...a("portfolio")}
        />
        {err("portfolio")}
      </Field>
      <Field label="Tell us about you" htmlFor={`${id}-message`}>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={5}
          required
          className={`${field} p-4`}
          {...a("message")}
        />
        {err("message")}
      </Field>
      <div className="flex items-start gap-3 text-sm text-ink-soft">
        <input
          id={`${id}-consent`}
          name="consent"
          type="checkbox"
          required
          className="mt-0.5 size-4 shrink-0 accent-[var(--pn-ink)]"
          {...a("consent")}
        />
        <label htmlFor={`${id}-consent`}>
          I agree that Pinnacle Studios may use these details to review my application, as described
          in the{" "}
          <TransitionLink href="/privacy" className="underline underline-offset-2">
            privacy policy
          </TransitionLink>
          .
        </label>
      </div>
      {err("consent")}
      <div>
        <button
          type="submit"
          disabled={pending}
          data-cta="primary"
          data-cta-location="careers"
          className="inline-flex h-12 items-center rounded-md bg-accent px-6 text-[0.9375rem] font-medium text-accent-ink transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-60 motion-reduce:transition-none"
        >
          {pending ? "Sending…" : role ? `Apply for ${role}` : "Send application"}
        </button>
      </div>
      {state.status === "error" && (
        <p role="alert" className="text-sm">
          {state.message}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm">
        {label}
      </label>
      {children}
    </div>
  );
}
