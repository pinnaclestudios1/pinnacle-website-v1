import type { FieldErrors } from "./state";

/** Home summit quick enquiry: parsing + validation (shared by browser and server). */
export type QuickInput = { name: string; email: string; what: string; consent: boolean };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

export function parseQuick(fd: FormData): QuickInput {
  return {
    name: str(fd.get("name")).slice(0, 120),
    email: str(fd.get("email")).slice(0, 120).toLowerCase(),
    what: str(fd.get("what")).slice(0, 300),
    consent: fd.get("consent") === "on" || fd.get("consent") === "true",
  };
}

export function validateQuick(input: QuickInput): FieldErrors {
  const e: FieldErrors = {};
  if (input.name.length < 2) e.name = "Please tell us your name.";
  if (!EMAIL.test(input.email)) e.email = "Enter an email address like name@company.com.";
  if (input.what.length < 3) e.what = "A few words about what you’re building.";
  if (!input.consent) e.consent = "Please agree so we can reply to you.";
  return e;
}
