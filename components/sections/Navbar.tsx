"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import Image from "next/image";

import { identity, navItems } from "@/content/data";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/** Section ids the scroll-spy watches, in document order. */
const SPY_IDS = ["hero", ...navItems.map((item) => item.id)];

/**
 * Veiled over the hero, glass once scrolled — plus a scroll-spy active-section indicator and
 * an animated underline on the current item.
 *
 * Both states tint *down* toward the page background rather than washing white, because the
 * bar sits over the live neural field: see `.glass-nav` / `.nav-veil` in `tailwind.config.ts`
 * for why `.glass-surface` is the wrong treatment here.
 *
 * Framer Motion, deliberately: this is a **discrete state transition** (transparent → glass)
 * and a `layoutId` underline, not a timeline scrubbed to scroll position, so it is not
 * ScrollTrigger's job (`CLAUDE.md` §2, `PHASE_PLAN.md` Phase 4).
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("hero");
  const [menuOpen, setMenuOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  /**
   * Scroll-spy plus the transparent -> glass switch.
   *
   * An IntersectionObserver with a band across the middle of the viewport marks a section
   * active while it occupies the reading area. Deliberately *not* computed from cached
   * `offsetTop` values: Phase 11 pins the hero with ScrollTrigger, which changes section
   * offsets while scrolling, and cached offsets would silently go stale.
   */
  useEffect(() => {
    const sections = SPY_IDS.map((id) => document.getElementById(id)).filter(
      (element): element is HTMLElement => element !== null,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));

    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Close the mobile menu on Escape, and whenever a link is followed.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-nav transition-all duration-500 ease-smooth",
        scrolled || menuOpen
          ? "glass-nav border-x-0 border-t-0 shadow-elevated"
          : "border-transparent bg-transparent",
      )}
    >
      {/* At rest over the hero the bar carries no surface of its own, which left the nav
          labels sitting directly on the neural mesh — bright cyan connections crossed the
          12px mono text and made it unreadable. This veil darkens and blurs just the band
          behind the labels and fades out before it ends, so the bar still reads as
          transparent over the hero rather than as a solid strip.

          Cross-faded rather than conditionally rendered, so it hands over to `.glass-nav`
          smoothly instead of popping at the 24px scroll threshold. */}
      <div
        aria-hidden
        className={cn(
          "nav-veil pointer-events-none absolute inset-x-0 top-0 h-32 transition-opacity duration-500 ease-smooth",
          scrolled || menuOpen ? "opacity-0" : "opacity-100",
        )}
      />

      <nav
        aria-label="Primary"
        className={cn(
          // `relative` so the nav paints above the absolutely-positioned veil behind it.
          "relative mx-auto flex max-w-6xl items-center justify-between px-6 transition-height duration-500 ease-smooth sm:px-8",
          scrolled ? "h-14" : "h-20",
        )}
      >
        <a href="#hero" aria-label={`${identity.fullName}, back to top`} className="flex items-center">
          {/* Abdul's own wordmark. The source is 156x29, so it is rendered at 124px wide —
              under its native size, which keeps it from looking soft on 2x displays. It is
              light-on-dark artwork already, so no filter is needed. */}
          <Image
            src="/brand/wordmark.png"
            alt={identity.fullName}
            width={124}
            height={23}
            priority
            className="h-auto w-wordmark"
          />
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id} className="relative">
                <a
                  href={item.href}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "relative block py-2 font-mono text-xs uppercase tracking-label transition-colors duration-300",
                    isActive
                      ? "text-text-primary"
                      : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  {item.label}
                  {isActive ? (
                    <motion.span
                      layoutId="nav-underline"
                      // Under reduced motion the underline still moves to the right item, it
                      // just does not slide there.
                      transition={
                        reducedMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 30 }
                      }
                      className="absolute inset-x-0 -bottom-0.5 h-px bg-primary"
                    />
                  ) : null}
                </a>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="text-text-secondary transition-colors hover:text-text-primary md:hidden"
        >
          {menuOpen ? (
            <X aria-hidden className="h-5 w-5" />
          ) : (
            <Menu aria-hidden className="h-5 w-5" />
          )}
        </button>
      </nav>

      <AnimatePresence initial={false}>
        {menuOpen ? (
          <motion.div
            id="mobile-nav"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden md:hidden"
          >
            <ul className="flex flex-col gap-1 px-6 pb-6 sm:px-8">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={activeId === item.id ? "true" : undefined}
                    className={cn(
                      "block py-2 font-mono text-sm uppercase tracking-label transition-colors",
                      activeId === item.id
                        ? "text-accent-violet-text"
                        : "text-text-secondary hover:text-text-primary",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
