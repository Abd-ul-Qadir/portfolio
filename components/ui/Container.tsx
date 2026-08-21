import type { ElementType, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ContainerProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "children"> {
  children: ReactNode;
  className?: string;
  /** Defaults to `div`; pass `section`, `header`, `footer`, ... where the semantics call for it. */
  as?: ElementType;
  /** Wider variant for full-bleed-ish grids (Projects, Services bento). */
  size?: "default" | "wide";
}

/** The one horizontal rhythm for the whole site. Every section sits inside this. */
export function Container({
  children,
  className,
  as: Tag = "div",
  size = "default",
  ...rest
}: ContainerProps) {
  return (
    <Tag
      {...rest}
      className={cn(
        "mx-auto w-full px-6 sm:px-8",
        size === "wide" ? "max-w-7xl" : "max-w-6xl",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
