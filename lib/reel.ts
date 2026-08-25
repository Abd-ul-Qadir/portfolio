/**
 * A tiny store holding the state of the cinematic reel.
 *
 * **Why this exists.** In reel mode every section is absolutely layered inside one pinned
 * stage, so they all occupy the same box. Two things that previously worked by *measuring
 * sections* therefore stop working, and both need the reel to tell them where it is instead:
 *
 * - the navbar's scroll-spy (an `IntersectionObserver` over the sections — they now all
 *   intersect at once),
 * - the neural field's scroll story (one `ScrollTrigger` per section, keyed off each one's
 *   `top top` — those are now identical).
 *
 * It is a hand-rolled store rather than React context on purpose: it is written on every
 * scrubbed frame, and pushing that through React state would re-render the navbar sixty times
 * a second. Consumers that need to paint (the navbar) subscribe to the *coarse* `activeId`
 * only, which changes a handful of times per page; the neural field reads the continuous value
 * directly in its animation loop and never re-renders at all.
 */

export interface ReelState {
  /** True once the reel has taken over — i.e. desktop width and motion allowed. */
  active: boolean;
  /** Continuous story position in `[0, sectionCount - 1]`, for the neural field. */
  story: number;
  /** Index of the section currently holding the stage. */
  activeIndex: number;
  /** Id of that section, for the navbar. */
  activeId: string;
  /** Section id -> the scroll position that settles it, for anchor links and focus rescue. */
  settle: Record<string, number>;
}

const state: ReelState = {
  active: false,
  story: 0,
  activeIndex: 0,
  activeId: "hero",
  settle: {},
};

/** Subscribers that only care about `activeId` changing, not continuous progress. */
const coarseListeners = new Set<() => void>();

export function getReel(): Readonly<ReelState> {
  return state;
}

/**
 * Update the reel. Only notifies subscribers when something *coarse* changed — `story` moves
 * every frame and must never trigger a React render.
 */
export function setReel(patch: Partial<ReelState>) {
  const wasId = state.activeId;
  const wasActive = state.active;
  Object.assign(state, patch);
  if (state.activeId !== wasId || state.active !== wasActive) {
    coarseListeners.forEach((fn) => fn());
  }
}

export function subscribeReel(fn: () => void) {
  coarseListeners.add(fn);
  return () => {
    coarseListeners.delete(fn);
  };
}

/** Reset when the reel tears down (breakpoint change, unmount). */
export function resetReel() {
  setReel({ active: false, story: 0, activeIndex: 0, activeId: "hero", settle: {} });
}

/**
 * The one definition of "the reel is running", used by every consumer so they cannot disagree.
 * It must stay in step with the media query in `tailwind.config.ts` that turns the stage
 * wrappers from `display: contents` into a real pinned stage.
 */
export const REEL_MEDIA = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
