import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

interface CommonProps {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Label the Phase 3 custom cursor expands with over this element (`VIEW` / `OPEN` /
   * `EXPLORE`). Read off the DOM as `data-cursor-label`, so each element controls its own.
   */
  cursorLabel?: string;
}

interface ButtonAsButton
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  href?: undefined;
}

interface ButtonAsLink extends CommonProps {
  /** Rendering as a link. `null`/`undefined` is not allowed here — see `disabled` below. */
  href: string;
  /** Force-opens in a new tab. Defaults to true for absolute URLs. */
  external?: boolean;
}

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-pill font-mono text-xs uppercase tracking-[0.15em] transition-all duration-300 ease-smooth disabled:pointer-events-none disabled:opacity-40";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-bg-base shadow-glow hover:shadow-glow-strong hover:brightness-110",
  secondary:
    "glass-surface text-text-primary hover:border-border-hover hover:shadow-glow",
  ghost: "text-text-secondary hover:text-text-primary",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2",
  md: "px-6 py-3",
};

function isAbsolute(href: string) {
  return /^(https?:|mailto:|tel:)/.test(href);
}

/**
 * The one call-to-action element. Renders a `<button>` or a link depending on whether `href`
 * is passed — never a `<div>` with a click handler, so keyboard operation comes for free.
 *
 * Wrap in `MagneticWrapper` (Phase 3) where the pointer-pull is wanted; the magnetism is
 * deliberately not baked in here so keyboard and touch users get a plain, working control.
 */
function isLink(props: ButtonProps): props is ButtonAsLink {
  return typeof (props as ButtonAsLink).href === "string";
}

export function Button(props: ButtonProps) {
  const classes = cn(
    base,
    variantStyles[props.variant ?? "primary"],
    sizeStyles[props.size ?? "md"],
    props.className,
  );

  if (isLink(props)) {
    const openInNewTab = props.external ?? isAbsolute(props.href);

    return (
      <Link
        href={props.href}
        className={classes}
        data-cursor-label={props.cursorLabel}
        {...(openInNewTab ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      >
        {props.children}
      </Link>
    );
  }

  // `className`/`variant`/`size` are already folded into `classes` above; the rest
  // (onClick, disabled, aria-*, ...) passes straight through to the real <button>.
  const {
    children,
    className: _className,
    variant: _variant,
    size: _size,
    cursorLabel,
    ...buttonProps
  } = props;

  return (
    <button
      type={buttonProps.type ?? "button"}
      className={classes}
      data-cursor-label={cursorLabel}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
