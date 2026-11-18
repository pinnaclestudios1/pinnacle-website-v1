/**
 * The tiny shared contract between server actions and form components.
 * Kept separate from lib/forms/brief.ts so footer forms (on every page) don't
 * pull the brief's options and validation into the global bundle.
 */
export type FieldErrors = Partial<Record<string, string>>;

export type FormState =
  | { status: "idle" }
  | { status: "error"; message: string; errors?: FieldErrors }
  | { status: "success"; ref: string };

export const IDLE: FormState = { status: "idle" };
