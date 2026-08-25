"use client";

import { useRef, type ReactNode } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { REEL_MEDIA, resetReel, setReel } from "@/lib/reel";

/**
 * The cinematic reel: a tall scroll area with a sticky stage, inside which every section is
 * absolutely layered and moved by one scroll-scrubbed master timeline.
 *
 * The browser scrolls vertically the whole time. Visually the sections travel through a single
 * fixed frame — one leaves to the left while the next arrives from the right, overlapping,
 * rather than one ending and the next beginning below it.
 *
 * ---
 *
 * ## Layout
 *
 * The wrappers are **always rendered** and are `display: contents` by default, so below 1024px
 * and under reduced motion the browser lays the sections out exactly as if this component were
 * not here — normal flow, normal scrolling, nothing pinned. The media query in
 * `tailwind.config.ts` promotes them to a real track + sticky stage only on desktop with motion
 * allowed. Rendering the wrappers conditionally instead would mean the server and client
 * disagree about the markup.
 *
 * Pinning is CSS `position: sticky`, not GSAP's `pin`. GSAP's pin works by inserting a spacer
 * of exactly the height this layout already has, so sticky gets the same result with no JS and
 * no spacer to keep in sync.
 *
 * ## Why tall sections pan
 *
 * A stage holds one viewport. Measured against this content, four sections are taller than that
 * on desktop — Selected Work is 2.88 viewports. Rather than clip them or cut content, a section
 * taller than the stage spends part of its hold **panning its own content vertically inside the
 * stage**, as part of the same scrubbed timeline. So the sequence per section is: enter from
 * its direction → settle → pan far enough to read everything → exit in its direction. Every
 * word survives, and the reel choreography is unaffected.
 *
 * ## Overlap is structural, not a tuning value
 *
 * Section `i + 1`'s entrance is placed at exactly the timeline position where section `i`'s
 * exit begins. The overlap is therefore guaranteed by construction rather than by hand-picked
 * offsets that drift apart when content changes.
 *
 * ## What it has to tell other components
 *
 * With every section stacked in one box, the navbar's scroll-spy and the neural field's story
 * can no longer work by measuring sections. Both read `lib/reel.ts` instead, which this
 * component writes on each update.
 */

interface Pose {
  x: number;
  y: number;
  scale: number;
  rotY: number;
}

interface Beat {
  id: string;
  /** Where the section comes from. `null` for the hero, which starts already on stage. */
  enter: Pose | null;
  /** Where it goes. Never `null` — in a reel the last section leaves too. */
  exit: Pose;
  /** Selector, relative to the section, for elements that arrive one by one. */
  stagger?: string;
}

const P = (x: number, y: number, scale = 0.92, rotY = 0): Pose => ({ x, y, scale, rotY });

/**
 * The choreography, exactly as specified.
 *
 * Values are percentages of the section's own size, so they scale with the viewport. 115 rather
 * than 100 guarantees the section is fully clear of the stage rather than resting against its
 * edge.
 */
const BEATS: readonly Beat[] = [
  // 1 — Hero starts centred and leaves completely to the left.
  { id: "hero", enter: null, exit: P(-115, 0, 0.82, 8) },
  // 2 — About arrives from the right while the hero is still leaving, then exits upward.
  { id: "about", enter: P(115, 0, 0.92, -8), exit: P(0, -115, 0.9, 0) },
  // 3 — Capabilities rises from the bottom as one composition and exits upward.
  //     No child stagger: the AI-Engineer network is meant to arrive whole.
  { id: "skills", enter: P(0, 115, 0.94), exit: P(0, -115, 0.9) },
  // 4 — Services rises from the bottom, cards staggering, and leaves to the top-right.
  {
    id: "services",
    enter: P(0, 115, 0.94),
    exit: P(95, -95, 0.88, -6),
    stagger: "[data-stagger-group] > *",
  },
  // 5 — Experience rises from the bottom and leaves to the top-left.
  { id: "experience", enter: P(0, 115, 0.94), exit: P(-95, -95, 0.88, 6) },
  // 6 — Selected Work arrives from the right, projects entering one by one, then exits fully
  //     to the left.
  {
    id: "projects",
    enter: P(115, 0, 0.94, -8),
    exit: P(-115, 0, 0.86, 8),
    stagger: "[data-project-grid] > *",
  },
  // 7 — Contact arrives from the right, its elements one by one, and leaves to the top-right.
  {
    id: "contact",
    enter: P(115, 0, 0.94, -8),
    exit: P(95, -95, 0.88, -6),
    stagger: "[data-stagger-group] > *",
  },
];

/** Scroll distance for one timeline unit, as a fraction of the viewport height. */
const UNIT_VH = 0.85;
/** Units spent arriving and leaving. */
const ENTER = 1;
const EXIT = 1;
/** Minimum units a section holds the stage, before any panning is added. */
const HOLD_MIN = 0.9;
/** Extra hold units per viewport of content overflow — the panning budget. */
const HOLD_PER_OVERFLOW = 1.5;
/** Breathing room at each end of a pan, so revealed rows are not flush to the stage edge. */
const PAN_MARGIN = 40;

export function ReelStage({ children }: { children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add(REEL_MEDIA, () => {
      const trackEl = track.current;
      const stageEl = stage.current;
      if (!trackEl || !stageEl) return;

      const sections = BEATS.map((beat) => ({
        beat,
        el: document.getElementById(beat.id),
      })).filter((entry): entry is { beat: Beat; el: HTMLElement } => entry.el !== null);
      if (sections.length === 0) return;

      const stageH = stageEl.clientHeight || window.innerHeight;

      /* -- lay the timeline out in units, and size the track to match --------- */
      let cursor = 0;
      const plan = sections.map(({ beat, el }) => {
        const inner = el.querySelector<HTMLElement>("[data-section-inner]");
        // How far the content exceeds the stage. The section centres its content, so an
        // over-tall child is clipped equally top and bottom; panning runs from +half to -half.
        //
        // **Measure the inner container, not the section.** `section.scrollHeight` counts
        // content overflowing *below* its box but not above it, and a centred flex child
        // overflows in both directions — so using the section under-reported the overflow and
        // the pan stopped short. Measured on Selected Work: the bottom of the awards grid was
        // still 399px below the stage when the hold ended, i.e. permanently unreadable.
        const contentH = inner ? inner.scrollHeight : el.scrollHeight;
        // A little breathing room at each extreme so the first and last rows are not flush
        // against the stage edge when they are finally revealed.
        const overflow = contentH > stageH ? contentH - stageH + PAN_MARGIN * 2 : 0;
        const hold = HOLD_MIN + (overflow / stageH) * HOLD_PER_OVERFLOW;
        const enterAt = cursor;
        const holdAt = enterAt + (beat.enter ? ENTER : 0);
        const exitAt = holdAt + hold;
        // The next section starts arriving exactly as this one starts leaving. This is where
        // the overlap comes from.
        cursor = exitAt;
        return { beat, el, inner, overflow, enterAt, holdAt, hold, exitAt };
      });

      const totalUnits = cursor + EXIT;
      const trackHeight = Math.round(totalUnits * UNIT_VH * stageH + stageH);
      trackEl.style.height = `${trackHeight}px`;

      /* -- where does each section settle, in page coordinates? --------------- */
      // Needed by anchor links and by the focus rescue below. The sticky stage scrolls for
      // `trackHeight - stageH`, mapped linearly onto timeline units.
      const trackTop = trackEl.getBoundingClientRect().top + window.scrollY;
      const scrollSpan = trackHeight - stageH;
      const settle: Record<string, number> = {};
      for (const p of plan) {
        const at = (p.holdAt + p.hold * 0.2) / totalUnits;
        settle[p.beat.id] = Math.round(trackTop + at * scrollSpan);
      }
      setReel({ active: true, settle });

      /* -- the master timeline ------------------------------------------------ */
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: trackEl,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const units = self.progress * totalUnits;
            // Which section holds the stage: the last one that has finished arriving.
            let index = 0;
            for (let i = 0; i < plan.length; i += 1) {
              if (units >= plan[i].holdAt - ENTER * 0.5) index = i;
            }
            const current = plan[index];
            if (current.el.style.pointerEvents !== "auto") {
              for (let i = 0; i < plan.length; i += 1) {
                const p = plan[i];
                p.el.style.pointerEvents = p === current ? "auto" : "none";
                // **Promote only the window that is actually moving.**
                //
                // Opacity on a full-viewport layer is a re-raster unless the compositor is
                // told to expect it, so `will-change` is needed — but promoting all seven
                // permanently means seven full-viewport layers alive at once when at most two
                // are ever animating, and that measured ~14 ms per frame on integrated
                // graphics. Only the active section and its immediate neighbours (the one
                // leaving and the one arriving) are promoted; the rest are ordinary content.
                const near = Math.abs(i - index) <= 1;
                p.el.style.willChange = near ? "transform, opacity" : "auto";
                // **And take the far ones out of the compositor entirely.**
                //
                // A section that has left the stage still has opacity 0, but an opacity-0
                // layer is still a layer: it is composited every frame. With seven
                // full-viewport sections that measured a whole vsync step — a steady 30fps
                // dropped to 20fps. `visibility: hidden` removes them from painting altogether.
                //
                // The accessibility cost is that a hidden section's links leave the tab order.
                // That is the same contract as any carousel, and the navbar links to every
                // section and drives the reel there (see the anchor handler below), so nothing
                // becomes unreachable — it is reached through the nav rather than by tabbing
                // blindly into an invisible panel.
                p.el.style.visibility = near ? "visible" : "hidden";
              }
            }
            setReel({
              // Story position for the neural field: the same 0..n-1 scale it already speaks.
              story: Math.max(0, Math.min(plan.length - 1, units / totalUnits * (plan.length - 1))),
              activeIndex: index,
              activeId: current.beat.id,
            });
          },
        },
      });

      for (const p of plan) {
        const { beat, el, inner, overflow, enterAt, holdAt, hold, exitAt } = p;

        // Opacity on a full-viewport layer is a re-raster unless the compositor is told to
        // expect it. Measured on the previous choreography: without this, animating opacity on
        // large subtrees cost ~50% more frame time during scroll.
        gsap.set(el, { transformPerspective: 1200 });

        /* -- arrive ---------------------------------------------------------- */
        if (beat.enter) {
          gsap.set(el, { opacity: 0 });
          timeline.fromTo(
            el,
            {
              xPercent: beat.enter.x,
              yPercent: beat.enter.y,
              scale: beat.enter.scale,
              rotationY: beat.enter.rotY,
              opacity: 0,
            },
            {
              xPercent: 0,
              yPercent: 0,
              scale: 1,
              rotationY: 0,
              opacity: 1,
              // Eased rather than linear so arrivals decelerate into place instead of
              // sliding at a constant rate. With `scrub` the ease reshapes scroll progress,
              // it does not detach from it.
              ease: "power2.out",
              duration: ENTER,
            },
            enterAt,
          );

          if (beat.stagger) {
            const kids = gsap.utils.toArray<HTMLElement>(el.querySelectorAll(beat.stagger));
            if (kids.length > 1) {
              timeline.fromTo(
                kids,
                { xPercent: beat.enter.x > 0 ? 26 : 0, yPercent: beat.enter.y > 0 ? 26 : 0, opacity: 0 },
                {
                  xPercent: 0,
                  yPercent: 0,
                  opacity: 1,
                  ease: "power2.out",
                  // Spread across most of the arrival so they land one after another rather
                  // than together. Scrubbed, so this is scroll distance, not time.
                  duration: ENTER * 0.55,
                  stagger: { each: (ENTER * 0.45) / Math.max(kids.length - 1, 1) },
                },
                enterAt,
              );
            }
          }
        } else {
          // The hero is already on stage at scroll zero.
          gsap.set(el, { xPercent: 0, yPercent: 0, scale: 1, rotationY: 0, opacity: 1 });
        }

        /* -- hold, panning if the content is taller than the stage ----------- */
        if (inner && overflow > 8) {
          timeline.fromTo(
            inner,
            { y: overflow / 2 },
            { y: -overflow / 2, ease: "none", duration: hold },
            holdAt,
          );
        }

        /* -- leave ------------------------------------------------------------ */
        timeline.to(
          el,
          {
            xPercent: beat.exit.x,
            yPercent: beat.exit.y,
            scale: beat.exit.scale,
            rotationY: beat.exit.rotY,
            ease: "power2.in",
            duration: EXIT,
          },
          exitAt,
        );
        // Opacity is deliberately a separate, later tween: the brief asks for the hero to
        // travel off to the left rather than dissolve, so the fade only catches up at the end
        // of the journey.
        timeline.to(
          el,
          { opacity: 0, ease: "none", duration: EXIT * 0.45 },
          exitAt + EXIT * 0.55,
        );
      }

      /* -- anchor links ------------------------------------------------------- */
      // `#about` would otherwise jump to the section's box, which in reel mode is the stage
      // itself — every section shares it. Route them to the scroll position that settles the
      // section instead.
      const onAnchorClick = (event: MouseEvent) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        const anchor = target.closest('a[href^="#"]');
        if (!(anchor instanceof HTMLAnchorElement)) return;
        const id = anchor.getAttribute("href")?.slice(1);
        if (!id || settle[id] === undefined) return;
        event.preventDefault();
        window.scrollTo({ top: settle[id], behavior: "smooth" });
      };
      document.addEventListener("click", onAnchorClick);

      /* -- keyboard rescue ---------------------------------------------------- */
      // Off-stage sections keep opacity 0 but are NOT `visibility: hidden`, so their links and
      // buttons stay in the tab order and in the accessibility tree. Tabbing into one would
      // otherwise move focus somewhere invisible, so the reel follows the focus to it.
      const onFocusIn = (event: FocusEvent) => {
        const node = event.target;
        if (!(node instanceof Element)) return;
        const section = node.closest("section[id]");
        if (!section) return;
        const y = settle[section.id];
        if (y === undefined) return;
        if (Math.abs(window.scrollY - y) < stageH * 0.5) return;
        window.scrollTo({ top: y, behavior: "smooth" });
      };
      stageEl.addEventListener("focusin", onFocusIn);

      ScrollTrigger.refresh();

      return () => {
        document.removeEventListener("click", onAnchorClick);
        stageEl.removeEventListener("focusin", onFocusIn);
        timeline.scrollTrigger?.kill();
        timeline.kill();
        trackEl.style.height = "";
        for (const p of plan) {
          p.el.style.pointerEvents = "";
          p.el.style.willChange = "";
          p.el.style.visibility = "";
          gsap.set(p.el, { clearProps: "all" });
          if (p.inner) gsap.set(p.inner, { clearProps: "transform" });
        }
        resetReel();
      };
    });

    return () => media.revert();
  }, []);

  return (
    <div ref={track} data-reel-track>
      <div ref={stage} data-reel-stage>
        {children}
      </div>
    </div>
  );
}
