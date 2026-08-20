import { Code2, Mail, Phone, Rocket, Share2, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { IconName } from "@/content/data";

/**
 * Maps the string `IconName`s used in `content/data.ts` to real components, so content stays
 * free of React imports.
 *
 * **`lucide-react` v1 no longer ships brand marks** (GitHub / LinkedIn / Instagram were
 * removed), which is why those three names are absent here rather than mapped to some
 * unrelated glyph. Socials render as text labels today; if brand marks are wanted, Phase 10
 * adds them as inline SVG — not as a new icon dependency. See `PROGRESS.md`'s decision log.
 */
export const iconMap: Partial<Record<IconName, LucideIcon>> = {
  "code-2": Code2,
  smartphone: Smartphone,
  rocket: Rocket,
  "share-2": Share2,
  mail: Mail,
  phone: Phone,
};
