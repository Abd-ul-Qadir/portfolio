"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Check, Send } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { identity } from "@/content/data";
import {
  CONTACT_FIELDS,
  CONTACT_LIMITS,
  EMPTY_CONTACT_FORM,
  HONEYPOT_FIELD,
  hasErrors,
  validateContactForm,
  type ContactApiResponse,
  type ContactFieldName,
  type ContactFormErrors,
  type ContactFormValues,
} from "@/lib/contact-form";

/**
 * The terminal-skinned message form.
 *
 * **It is a real form.** A `<form>` with a real submit button, real `<label>`s bound by `id`,
 * real `<input>`/`<textarea>` controls, `type="email"` and `autoComplete` so browsers can fill
 * it, and `aria-invalid` + `aria-describedby` wiring every error to its field. The terminal
 * look is entirely borders, mono type and a `$` glyph painted around that — `CLAUDE.md` §4.
 * Nothing here is a div pretending to be a control.
 *
 * How errors are announced, which is the part worth getting right:
 * - Submitting an invalid form moves focus to the first bad field. A screen reader then reads
 *   the label *and* the error, because the error element is its `aria-describedby` target.
 * - The form-level outcome ("message sent", "couldn't send") lands in a polite live region, so
 *   it is announced without stealing focus mid-typing.
 * - Colour is never the only signal: an invalid row is pink *and* carries written text.
 *
 * Motion: the only animation is the caret and the sending pulse, both pure CSS carrying
 * `motion-reduce:animate-none`. Nothing here pins, parallaxes or scrubs, so there is no GSAP
 * and no Framer Motion to gate — the reduced-motion contract is met by the CSS itself.
 */

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const FIELD_LABELS: Record<ContactFieldName, string> = {
  name: "Name",
  email: "Email",
  message: "Message",
};

/** Placeholders are hints, never labels — every field keeps its own visible `<label>`. */
const FIELD_PLACEHOLDERS: Record<ContactFieldName, string> = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Tell me about your project, role or idea…",
};

export function ContactForm() {
  const baseId = useId();
  const [values, setValues] = useState<ContactFormValues>(EMPTY_CONTACT_FORM);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [formMessage, setFormMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  /** Kept so an invalid submit can put focus on the first field that needs fixing. */
  const fieldRefs = useRef<Partial<Record<ContactFieldName, HTMLElement | null>>>({});

  const fieldId = (field: ContactFieldName) => `${baseId}-${field}`;
  const errorId = (field: ContactFieldName) => `${baseId}-${field}-error`;

  function focusFirstInvalid(nextErrors: ContactFormErrors) {
    const first = CONTACT_FIELDS.find((field) => nextErrors[field]);
    if (first) fieldRefs.current[first]?.focus();
  }

  function updateField(field: ContactFieldName, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));

    /**
     * Re-validate only a field that is *already* showing an error, so the message clears the
     * moment it is fixed. Validating untouched fields as you type would shout at someone
     * halfway through typing their email address.
     */
    if (errors[field]) {
      const next = validateContactForm({ ...values, [field]: value });
      setErrors((previous) => ({ ...previous, [field]: next[field] }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const nextErrors = validateContactForm(values);
    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      setStatus("error");
      setFormMessage("Please fix the highlighted fields and try again.");
      focusFirstInvalid(nextErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");
    setFormMessage("Sending your message…");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, [HONEYPOT_FIELD]: honeypot }),
      });

      const result = (await response.json()) as ContactApiResponse;

      if (result.ok) {
        setStatus("success");
        setFormMessage(
          "Message sent. Thanks for reaching out — I'll reply to you by email soon.",
        );
        setValues(EMPTY_CONTACT_FORM);
        return;
      }

      setStatus("error");
      setFormMessage(result.error);
      if (result.fieldErrors) {
        setErrors(result.fieldErrors);
        focusFirstInvalid(result.fieldErrors);
      }
    } catch {
      /** Offline, DNS, a blocked request — anything that never reached the route. */
      setStatus("error");
      setFormMessage(
        `Couldn't reach the server. Please check your connection, or email ${identity.email} directly.`,
      );
    }
  }

  const isSubmitting = status === "submitting";

  if (status === "success") {
    return (
      <div>
        <p
          role="status"
          className="flex items-start gap-3 font-mono text-sm text-text-primary"
        >
          <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-accent-emerald" />
          <span>{formMessage}</span>
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-6"
          cursorLabel="WRITE"
          onClick={() => {
            setStatus("idle");
            setFormMessage("");
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      /**
       * `noValidate` hands validation to `validateContactForm` rather than the browser's own
       * bubbles. That is what lets the same rules run on both sides and lets the errors be
       * rendered as real, described, styled text instead of a transient native tooltip.
       */
      noValidate
    >
      <p aria-hidden className="font-mono text-sm text-text-secondary">
        <span className="text-accent-emerald">$</span> send --message
      </p>

      <div className="mt-6 flex flex-col gap-5">
        {CONTACT_FIELDS.map((field) => {
          const error = errors[field];
          const isMessage = field === "message";

          const controlProps = {
            id: fieldId(field),
            name: field,
            value: values[field],
            maxLength: CONTACT_LIMITS[field].max,
            placeholder: FIELD_PLACEHOLDERS[field],
            "aria-invalid": error ? (true as const) : undefined,
            "aria-describedby": error ? errorId(field) : undefined,
            disabled: isSubmitting,
            className:
              "w-full bg-transparent font-mono text-sm text-text-primary caret-accent-violet outline-none placeholder:text-text-secondary disabled:opacity-50",
          };

          return (
            <div key={field}>
              <div
                className="terminal-field rounded-card px-4 py-3"
                data-invalid={error ? "true" : "false"}
              >
                <span aria-hidden className="mt-0.5 font-mono text-sm text-accent-emerald">
                  &gt;
                </span>

                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={fieldId(field)}
                    className="block font-mono text-eyebrow uppercase text-text-secondary"
                  >
                    {FIELD_LABELS[field]}
                  </label>

                  <div className="mt-2">
                    {isMessage ? (
                      <textarea
                        {...controlProps}
                        ref={(node) => {
                          fieldRefs.current.message = node;
                        }}
                        rows={5}
                        onChange={(event) => updateField(field, event.target.value)}
                        className={`${controlProps.className} resize-y`}
                      />
                    ) : (
                      <input
                        {...controlProps}
                        ref={(node) => {
                          fieldRefs.current[field] = node;
                        }}
                        type={field === "email" ? "email" : "text"}
                        autoComplete={field === "email" ? "email" : "name"}
                        onChange={(event) => updateField(field, event.target.value)}
                      />
                    )}
                  </div>
                </div>
              </div>

              {error ? (
                <p
                  id={errorId(field)}
                  className="mt-2 pl-4 font-mono text-xs text-accent-pink"
                >
                  {error}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {/*
        Honeypot. Off-screen and `aria-hidden`, so it is invisible to sighted users and to
        screen readers alike, and `tabIndex={-1}` keeps it out of the tab order entirely —
        no keyboard user can land in it. Only a bot filling every input reaches it.
      */}
      <div aria-hidden className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${baseId}-${HONEYPOT_FIELD}`}>Company</label>
        <input
          id={`${baseId}-${HONEYPOT_FIELD}`}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Button type="submit" disabled={isSubmitting} cursorLabel="SEND">
          {isSubmitting ? (
            <>
              <span
                aria-hidden
                className="inline-block h-3 w-1.5 animate-caret-blink bg-bg-base motion-reduce:animate-none"
              />
              Transmitting
            </>
          ) : (
            <>
              <Send aria-hidden className="h-3.5 w-3.5" />
              Send message
            </>
          )}
        </Button>

        <p className="font-mono text-xs text-text-secondary">
          Or email{" "}
          <a
            href={`mailto:${identity.email}`}
            className="text-text-primary underline decoration-border-hover underline-offset-4 transition-colors duration-300 ease-smooth hover:text-accent-violet-text focus-visible:text-accent-violet-text"
          >
            {identity.email}
          </a>
        </p>
      </div>

      {/*
        The form-level outcome. Polite, not assertive: it must not interrupt someone mid-word.
        It is always in the DOM (never conditionally mounted) because a live region has to
        exist *before* its content changes for the change to be announced at all.
      */}
      <p
        role="status"
        aria-live="polite"
        className={`mt-4 font-mono text-xs ${
          status === "error" ? "text-accent-pink" : "text-text-secondary"
        }`}
      >
        {status === "idle" ? "" : formMessage}
      </p>
    </form>
  );
}
