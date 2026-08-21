import { ImageIcon } from "lucide-react";
import Image from "next/image";

import type { ContentImage } from "@/content/data";
import { cn } from "@/lib/utils";

interface MediaFrameProps {
  image: ContentImage | null;
  /** Shown in place of the image while `image` is null. Describes what is missing. */
  pendingLabel: string;
  className?: string;
  /** Passed straight to `next/image`. Required — a wrong one costs real bytes. */
  sizes: string;
  /** Only the LCP image (a detail page hero) should set this. */
  priority?: boolean;
  imageClassName?: string;
  /**
   * Extra classes for the placeholder only. Used where the frame has an overlay (a project
   * card's title sits at the bottom), so the "pending" label does not collide with it while
   * the real asset is still missing.
   */
  pendingClassName?: string;
}

/**
 * One image slot, with one placeholder treatment.
 *
 * Several `[TODO]` assets in `CONTENT_BRIEF.md` are still missing, so every image on the site
 * goes through here: when `image` is `null` it renders a labelled placeholder that occupies
 * **exactly** the space the real asset will, which means dropping the file in later cannot
 * shift the layout or change any of the animation geometry built on top of it.
 *
 * The frame itself owns no aspect ratio — the caller sets it, so a 4:5 portrait and a 16:10
 * project card can share this component.
 */
export function MediaFrame({
  image,
  pendingLabel,
  className,
  sizes,
  priority = false,
  imageClassName,
  pendingClassName,
}: MediaFrameProps) {
  return (
    <div className={cn("relative overflow-hidden bg-bg-surface", className)}>
      {image ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          // Everything below the fold stays lazy; `priority` opts a hero out.
          loading={priority ? undefined : "lazy"}
          className={cn("object-cover", imageClassName)}
        />
      ) : (
        <div
          data-media-pending
          className={cn(
            "flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center",
            pendingClassName,
          )}
        >
          <ImageIcon aria-hidden className="h-8 w-8 text-text-secondary" />
          <p className="font-mono text-eyebrow uppercase text-text-secondary">
            {pendingLabel}
          </p>
        </div>
      )}
    </div>
  );
}
