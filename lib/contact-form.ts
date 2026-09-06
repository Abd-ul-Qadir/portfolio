/**
 * The contact form's shape and validation rules, shared by the client form
 * (`components/sections/ContactForm.tsx`) and the route handler (`app/api/contact/route.ts`).
 *
 * **Deliberately one module, imported by both.** Client-side validation exists only so the
 * user gets an instant, screen-reader-announced error instead of a network round trip — it is
 * a convenience, never a guarantee. Anything can POST to the route directly, so the server
 * runs the exact same `validateContactForm` before it sends anything. Sharing the rules is
 * what keeps the two from drifting into disagreeing about what a valid message is.
 *
 * No React, no `next/*`, no Node built-ins in here: it has to import cleanly into both a
 * client component and a server route.
 */

export interface ContactFormValues {
  readonly name: string;
  readonly email: string;
  readonly message: string;
}

export type ContactFieldName = keyof ContactFormValues;

/** Only the fields that actually failed appear as keys. An empty object means valid. */
export type ContactFormErrors = Partial<Record<ContactFieldName, string>>;

/** Field order, used for rendering and for focusing the first invalid field on submit. */
export const CONTACT_FIELDS: readonly ContactFieldName[] = ["name", "email", "message"];

/**
 * Length bounds. The maximums are the real defence: they cap what a single request can push
 * into an email body, so the route never has to reason about an unbounded string.
 */
export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  email: { min: 5, max: 160 },
  message: { min: 10, max: 2000 },
} as const;

/**
 * The honeypot field's name. Rendered as a real, empty input that is hidden from sight *and*
 * from assistive tech (`aria-hidden` + `tabIndex={-1}`), so no human ever fills it in; naive
 * bots that fill every input in a form do. A filled honeypot is discarded server-side and
 * still answered with a success response — telling a bot it was detected only teaches it to
 * try again differently.
 *
 * Named `company` rather than anything honeypot-ish for the same reason.
 */
export const HONEYPOT_FIELD = "company";

/**
 * Pragmatic email check: something, an `@`, something with a dot in it. Deliberately *not*
 * an RFC 5322 regex — those are enormous, and they still cannot tell you whether an address
 * receives mail. This rejects the typos worth catching (missing `@`, missing TLD, stray
 * spaces) and leaves real delivery to be proven by the reply.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

/**
 * Validates a submission. Returns an object keyed by field; empty means it passed.
 *
 * Values are trimmed before measurement, so a message of nothing but spaces fails the
 * minimum length rather than passing as 40 characters of whitespace.
 */
export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};

  const name = values.name.trim();
  if (name.length === 0) {
    errors.name = "Please enter your name.";
  } else if (name.length < CONTACT_LIMITS.name.min) {
    errors.name = `Your name needs at least ${CONTACT_LIMITS.name.min} characters.`;
  } else if (name.length > CONTACT_LIMITS.name.max) {
    errors.name = `Please keep your name under ${CONTACT_LIMITS.name.max} characters.`;
  }

  const email = values.email.trim();
  if (email.length === 0) {
    errors.email = "Please enter your email address.";
  } else if (email.length > CONTACT_LIMITS.email.max) {
    errors.email = `Please keep your email under ${CONTACT_LIMITS.email.max} characters.`;
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "That doesn't look like a valid email address.";
  }

  const message = values.message.trim();
  if (message.length === 0) {
    errors.message = "Please enter a message.";
  } else if (message.length < CONTACT_LIMITS.message.min) {
    errors.message = `Please write at least ${CONTACT_LIMITS.message.min} characters so I know what you need.`;
  } else if (message.length > CONTACT_LIMITS.message.max) {
    errors.message = `Please keep your message under ${CONTACT_LIMITS.message.max} characters.`;
  }

  return errors;
}

export function hasErrors(errors: ContactFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** The empty form. Exported so the client can reset to it after a successful send. */
export const EMPTY_CONTACT_FORM: ContactFormValues = {
  name: "",
  email: "",
  message: "",
};

/** What `/api/contact` answers with, in both directions. */
export type ContactApiResponse =
  | { readonly ok: true }
  | {
      readonly ok: false;
      /** Shown to the user as the form-level status message. */
      readonly error: string;
      /** Present only when the server's own validation rejected specific fields. */
      readonly fieldErrors?: ContactFormErrors;
    };
