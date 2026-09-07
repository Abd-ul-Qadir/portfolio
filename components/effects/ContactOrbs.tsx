"use client";

import { motion } from "framer-motion";
import { Fragment, useRef, type PointerEvent as ReactPointerEvent } from "react";

import { GitHubMark, LinkedInMark, XMark } from "@/components/ui/BrandMarks";
import { iconMap } from "@/components/ui/icons";
import { contactNodes, directContacts, type ContactNode } from "@/content/data";
import { usePointerEffectsEnabled, useReducedMotion } from "@/lib/hooks";

/**
 * The contact nodes: three social profiles as floating glass orbs, with email and phone shown
 * beneath them as their actual values.
 *
 * **That split is the point.** An orb hides what it points at behind an icon, which is right for
 * a profile you click through to and wrong for an address or a number — those are things a
 * visitor needs to read, copy or dial, and burying them under a glyph makes the two most direct
 * ways of reaching Abdul the two hardest to use. So GitHub / LinkedIn / X are orbs, and
 * email and phone are printed in full.
 *
 * **Every one is a real anchor**, and every value comes from `content/data.ts` — the orbs from
 * `identity.socials`, the two direct lines from `contact.methods`. Nothing is written twice.
 * Profiles open in a new tab; `mailto:` and `tel:` navigate in place.
 *
 * **The tilt is per-orb and costs nothing at rest.** Each orb writes two custom properties on
 * *itself* during `pointermove` over that orb only — so no global listener runs while the
 * pointer is elsewhere on the page, and the CSS transition handles the return. There is no rAF
 * loop and no React state, so a hover never re-renders this component.
 */

/** Peak tilt in degrees at the corner of an orb. Small: this is depth, not a toy. */
const MAX_TILT = 12;

function NodeIcon({ node }: { node: ContactNode }) {
  const className = "h-5 w-5 transition-transform duration-300 ease-smooth";

  // `lucide-react` v1 ships no brand marks, so all three come from `BrandMarks`.
  if (node.icon === "github") return <GitHubMark className={className} />;
  if (node.icon === "linkedin") return <LinkedInMark className={className} />;
  if (node.icon === "x") return <XMark className={className} />;

  const Icon = iconMap[node.icon];
  return Icon ? <Icon aria-hidden className={className} /> : null;
}

export function ContactOrbs() {
  const reduced = useReducedMotion();
  const tiltEnabled = usePointerEffectsEnabled();

  return (
    <div className="mt-12 sm:mt-14">
      <ul className="flex flex-wrap items-start justify-center gap-x-10 gap-y-8 sm:gap-x-14">
        {contactNodes.map((node, index) => (
          <Orb key={node.id} node={node} index={index} reduced={reduced} tilt={tiltEnabled} />
        ))}
      </ul>

      {/* Email and phone, in full, inside one liquid-glass bar. These continue the same
          stagger — they are the last two nodes to settle — but they are rendered as readable
          values rather than orbs, because an address and a number are things a visitor copies
          or dials, not things they click through to.

          The bar is a row on `sm` and up with a hairline between the two, and stacks into a
          rounded panel below that, where a pill would force the phone number to wrap. */}
      <div className="liquid-bar mx-auto mt-12 w-fit max-w-full rounded-3xl px-2 py-2 sm:rounded-pill sm:px-3">
        <ul className="flex flex-col items-stretch sm:flex-row sm:items-center">
          {directContacts.map((method, index) => {
            const Icon = iconMap[method.icon];
            return (
              <Fragment key={method.id}>
                {index > 0 ? (
                  <li
                    aria-hidden
                    className="liquid-bar-divider mx-3 my-1 h-px sm:mx-1 sm:my-0 sm:h-6 sm:w-px"
                  />
                ) : null}
                <motion.li
              className="group"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{
                duration: reduced ? 0.2 : 0.45,
                delay: reduced ? 0 : (contactNodes.length + index) * 0.09,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <a
                href={method.href}
                data-cursor-label="OPEN"
                className="flex items-center gap-2.5 rounded-pill px-3.5 py-2 transition-colors duration-300 ease-smooth hover:bg-bg-glass focus-visible:bg-bg-glass"
              >
                {Icon ? (
                  <Icon
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-accent-violet-text transition-colors duration-300 ease-smooth group-hover:text-text-primary group-focus-within:text-text-primary"
                  />
                ) : null}
                <span className="sr-only">{method.label}: </span>
                <span className="font-mono text-sm text-text-primary">{method.value}</span>
              </a>
                </motion.li>
              </Fragment>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Orb({
  node,
  index,
  reduced,
  tilt,
}: {
  node: ContactNode;
  index: number;
  reduced: boolean;
  tilt: boolean;
}) {
  const orb = useRef<HTMLAnchorElement>(null);

  const onPointerMove = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (!tilt) return;
    const el = orb.current;
    if (!el) return;
    // `currentTarget` is already the orb, so this is one rect read per move on one small
    // element — not a document-wide listener doing layout work while the pointer is elsewhere.
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const ny = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    el.style.setProperty("--tilt-x", `${(-ny * MAX_TILT).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(nx * MAX_TILT).toFixed(2)}deg`);
  };

  const resetTilt = () => {
    const el = orb.current;
    if (!el) return;
    // Cleared rather than set to 0: the class's own default takes over and the transition
    // eases it home, so leaving costs no more than arriving.
    el.style.removeProperty("--tilt-x");
    el.style.removeProperty("--tilt-y");
  };

  return (
    <motion.li
      className="group flex flex-col items-center"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{
        duration: reduced ? 0.2 : 0.45,
        // The stagger the brief asks for: GitHub, then LinkedIn, then Email, then Phone.
        delay: reduced ? 0 : index * 0.09,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <a
        ref={orb}
        href={node.href}
        data-cursor-label="OPEN"
        onPointerMove={onPointerMove}
        onPointerLeave={resetTilt}
        onBlur={resetTilt}
        className="contact-orb"
        target="_blank"
        rel="noreferrer noopener"
      >
        {/* The glass sphere itself. Decorative layers are separated from the icon so the
            reflection can sit above the surface but below the glyph. */}
        <span aria-hidden className="contact-orb-surface" />
        <span aria-hidden className="contact-orb-sheen" />
        <span className="relative text-accent-violet-text transition-colors duration-300 ease-smooth group-hover:text-text-primary group-focus-within:text-text-primary">
          <NodeIcon node={node} />
        </span>
        {/* The accessible name. The label and hint below are decorative duplicates, so this is
            what a screen reader announces — one clear name per link, not three fragments. */}
        <span className="sr-only">
          {node.label} — {node.hint}
        </span>
      </a>

      <p
        aria-hidden
        className="mt-3 text-center font-mono text-eyebrow uppercase text-text-secondary transition-colors duration-300 ease-smooth group-hover:text-text-primary group-focus-within:text-text-primary"
      >
        {node.label}
      </p>
      {/* The supporting line only surfaces on hover/focus, which is what keeps a row of four
          orbs quiet at rest. Tailwind cannot apply an opacity modifier to this project's
          `var()`-based colours, so the fade is on the element's own opacity. */}
      <p
        aria-hidden
        className="mt-1 text-center font-mono text-micro text-text-secondary opacity-0 transition-opacity duration-300 ease-smooth group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {node.hint}
      </p>
    </motion.li>
  );
}
