import { NextResponse } from "next/server";
import { Resend } from "resend";

import { identity } from "@/content/data";
import {
  HONEYPOT_FIELD,
  hasErrors,
  validateContactForm,
  type ContactApiResponse,
  type ContactFormValues,
} from "@/lib/contact-form";

/**
 * The contact form's backend: validates a submission and emails it to Abdul.
 *
 * **Why a route handler and not a client-side POST to a form service.** The Resend API key is
 * a send-anything credential; it has to stay on the server. The browser posts here, this
 * runs on the server with the key, and the key is never part of the client bundle. That also
 * means validation, rate limiting and the email's shape are all ours to control.
 *
 * Sending is deliberately the *last* thing that happens — honeypot, validation and rate limit
 * all reject before any network call, so a flood of junk costs nothing but CPU.
 */

/** `resend` is a Node SDK, not edge-compatible; say so rather than relying on the default. */
export const runtime = "nodejs";

/**
 * Nothing here is cacheable or prerenderable — it reads a request body and calls out to an
 * API. Marking it explicitly keeps `next build` from trying to evaluate it as a static route.
 */
export const dynamic = "force-dynamic";

/**
 * Sender address.
 *
 * `onboarding@resend.dev` is Resend's shared testing sender: it works with **no domain
 * verification at all**, but it will only deliver to the email address that owns the Resend
 * account. That is exactly the shape of this feature — the only recipient is Abdul — so the
 * form works the moment an API key exists, with no DNS to configure.
 *
 * When a custom domain is verified later, set `CONTACT_FROM_EMAIL` (e.g.
 * `"Portfolio <hello@abdulqadir.dev>"`) and nothing else here changes.
 */
const FROM_ADDRESS = process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";

/**
 * Recipient. Defaults to the address the site already publishes in `content/data.ts`, so the
 * form cannot start mailing somewhere the site doesn't say it will.
 */
const TO_ADDRESS = process.env.CONTACT_TO_EMAIL ?? identity.email;

/* ------------------------------------------------------------------ rate limit */

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_SENDS = 5;

/**
 * Best-effort, in-process rate limit: at most 5 messages per IP per hour.
 *
 * **Know what this is and is not.** Serverless instances don't share memory, so a request
 * routed to a cold instance starts with an empty map — this raises the cost of casual abuse,
 * it does not make flooding impossible. It is here because it is free and catches the
 * realistic case (one script hammering one endpoint). If real abuse ever shows up, the fix is
 * a shared store (Upstash/Vercel KV), not a bigger map.
 *
 * Entries are swept on write, so the map cannot grow without bound on a long-lived instance.
 */
const sendLog = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;

  for (const [ip, times] of sendLog) {
    const recent = times.filter((t) => t > cutoff);
    if (recent.length === 0) sendLog.delete(ip);
    else sendLog.set(ip, recent);
  }

  const recent = sendLog.get(key) ?? [];
  if (recent.length >= RATE_LIMIT_MAX_SENDS) return true;

  sendLog.set(key, [...recent, now]);
  return false;
}

/**
 * Best available client identifier. `x-forwarded-for` is the header Vercel sets; it is
 * client-controllable in principle, which is another reason the limit above is described as
 * best-effort rather than a security boundary.
 */
function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/* ---------------------------------------------------------------------- email */

/**
 * Escapes the five characters that can break out of HTML text content.
 *
 * **This is not optional.** Every value below is attacker-supplied text arriving from a public
 * form and being interpolated into an HTML email. Without escaping, a message containing
 * markup would render as markup in the inbox.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Newlines survive into the HTML part; the text part already has them. */
function toHtmlParagraphs(message: string): string {
  return escapeHtml(message)
    .split(/\n{2,}/)
    .map((block) => `<p style="margin:0 0 16px">${block.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function buildEmail(values: ContactFormValues) {
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  /**
   * The subject carries the sender's name so the inbox is scannable, but it is stripped of
   * CR/LF first: newlines in a header value are the classic header-injection vector.
   */
  const safeSubject = name.replace(/[\r\n]+/g, " ").slice(0, 80);

  const text = [
    `New message from your portfolio contact form.`,
    ``,
    `Name:  ${name}`,
    `Email: ${email}`,
    ``,
    `Message:`,
    message,
    ``,
    `— Reply directly to this email to answer ${name}.`,
  ].join("\n");

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6;color:#0f1115">
      <p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#6b7280">
        Portfolio contact form
      </p>
      <h2 style="margin:0 0 20px;font-size:20px">New message from ${escapeHtml(name)}</h2>
      <p style="margin:0 0 4px"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin:0 0 20px"><strong>Email:</strong>
        <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
      </p>
      <div style="padding:16px 20px;background:#f4f4f5;border-radius:12px">
        ${toHtmlParagraphs(message)}
      </div>
      <p style="margin:20px 0 0;font-size:13px;color:#6b7280">
        Reply directly to this email to answer ${escapeHtml(name)}.
      </p>
    </div>
  `;

  return { subject: `Portfolio enquiry from ${safeSubject}`, text, html };
}

/* ---------------------------------------------------------------------- route */

function json(body: ContactApiResponse, status: number) {
  return NextResponse.json(body, { status });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Malformed request." }, 400);
  }

  if (typeof payload !== "object" || payload === null) {
    return json({ ok: false, error: "Malformed request." }, 400);
  }

  const body = payload as Record<string, unknown>;

  /**
   * Honeypot. Answered with a **success** response on purpose: a bot that is told it was
   * caught learns to change tactics, whereas one that believes it succeeded keeps posting
   * into a void. Nothing is sent.
   */
  const honeypot = body[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return json({ ok: true }, 200);
  }

  const values: ContactFormValues = {
    name: typeof body.name === "string" ? body.name : "",
    email: typeof body.email === "string" ? body.email : "",
    message: typeof body.message === "string" ? body.message : "",
  };

  // The same rules the browser ran. The client's pass is a courtesy; this one is the gate.
  const fieldErrors = validateContactForm(values);
  if (hasErrors(fieldErrors)) {
    return json(
      { ok: false, error: "Please fix the highlighted fields and try again.", fieldErrors },
      400,
    );
  }

  if (isRateLimited(clientKey(request))) {
    return json(
      {
        ok: false,
        error: `That's a few messages in a short time. Please try again later, or email ${TO_ADDRESS} directly.`,
      },
      429,
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    /**
     * Misconfiguration, not user error — so it is logged loudly for whoever deployed it, and
     * the visitor is handed the direct email address rather than a dead end. The form never
     * silently swallows a message it could not deliver.
     */
    console.error(
      "[contact] RESEND_API_KEY is not set — the contact form cannot send. Add it to .env.local locally, and to the project's environment variables in Vercel.",
    );
    return json(
      {
        ok: false,
        error: `The message form isn't available right now. Please email ${TO_ADDRESS} directly.`,
      },
      503,
    );
  }

  const { subject, text, html } = buildEmail(values);

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      subject,
      text,
      html,
      /** So hitting Reply in the inbox answers the sender, not the Resend sender address. */
      replyTo: values.email.trim(),
    });

    if (error) {
      console.error("[contact] Resend rejected the send:", error);
      return json(
        {
          ok: false,
          error: `The message couldn't be sent. Please email ${TO_ADDRESS} directly.`,
        },
        502,
      );
    }
  } catch (cause) {
    console.error("[contact] Unexpected failure while sending:", cause);
    return json(
      {
        ok: false,
        error: `The message couldn't be sent. Please email ${TO_ADDRESS} directly.`,
      },
      502,
    );
  }

  return json({ ok: true }, 200);
}
