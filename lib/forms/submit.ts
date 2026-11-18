"use client";

import { startTransition, type FormEvent } from "react";

/**
 * React 19 resets uncontrolled form fields after every form action — including
 * failed ones, so a single typo would wipe everything the visitor typed. With
 * JavaScript we dispatch the action ourselves (no reset); without JavaScript the
 * form still posts to the server action normally.
 *
 * Use as: <form action={formAction} onSubmit={keepValuesOnSubmit(formAction)}>
 */
export function keepValuesOnSubmit(
  formAction: (fd: FormData) => void,
  before?: (e: FormEvent<HTMLFormElement>) => boolean | void,
) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (before && before(e) === false) return;
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  };
}
