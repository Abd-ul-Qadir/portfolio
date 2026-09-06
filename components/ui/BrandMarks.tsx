import type { SVGProps } from "react";

/**
 * Brand marks used by social links and the portfolio build signature, rendered as inline SVG.
 *
 * **`lucide-react` v1 removed every brand mark** (see the note in `components/ui/icons.ts`), and
 * `CLAUDE.md` §2 makes lucide the sole icon dependency. PROGRESS.md's decision log already
 * settled what to do when these were actually needed: add them as inline SVG rather than take on
 * a second icon package. This is that.
 *
 * They inherit `currentColor` and are `aria-hidden`: the surrounding link or label carries the
 * accessible name, so the glyph itself must not announce anything.
 */

type MarkProps = Omit<SVGProps<SVGSVGElement>, "children">;

export function GitHubMark(props: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function InstagramMark(props: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 3.68a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32Zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" />
    </svg>
  );
}

export function LinkedInMark(props: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.25h4v11.25H3V9.25Zm7 0h3.83v1.54h.05a4.2 4.2 0 0 1 3.78-2.08c4.04 0 4.79 2.66 4.79 6.12v5.67h-4v-5.03c0-1.2-.02-2.74-1.67-2.74-1.67 0-1.93 1.3-1.93 2.65v5.12h-3.99V9.25Z" />
    </svg>
  );
}

export function NextJsMark(props: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
      <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.8 16V8.1L16.35 18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.2 8.1v6.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TailwindCssMark(props: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
      <path d="M12 6.1c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.9.23 1.57.9 2.3 1.65 1.18 1.2 2.53 2.55 5.5 2.55 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.9-.23-1.57-.9-2.3-1.65C16.32 7.45 14.97 6.1 12 6.1ZM6 13.3c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.9.23 1.57.9 2.3 1.65 1.18 1.2 2.53 2.55 5.5 2.55 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.9-.23-1.57-.9-2.3-1.65C10.32 14.65 8.97 13.3 6 13.3Z" />
    </svg>
  );
}

export function GsapMark(props: MarkProps) {
  return (
    <svg viewBox="0 0 48 20" fill="none" aria-hidden focusable="false" {...props}>
      <path
        d="M10.5 4.5H7.2C4.7 4.5 3.3 6.5 3.3 10s1.4 5.5 3.9 5.5h3.3v-5H7.8M19.2 5h-4.1c-1.4 0-2.2.9-2.2 2.1 0 1.4 1 2 3 2.7 2.3.8 3.2 1.5 3.2 3.1 0 1.3-.9 2.1-2.4 2.1h-4.2M21.1 15l3.6-10h1.9l3.6 10m-7.7-3.6h6.3M32.6 15V5h4.1c2.2 0 3.4 1.2 3.4 3s-1.2 3-3.4 3h-4.1"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m41.2 12.5 3.5 2.5-3.5 2.5" stroke="currentColor" strokeWidth="1.65" />
    </svg>
  );
}

export function FramerMotionMark(props: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
      <path d="M5 3h14l-7 7h7L5 21l7-7H5l7-7H5V3Z" />
    </svg>
  );
}
