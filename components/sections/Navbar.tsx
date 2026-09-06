"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { ResumeButton } from "@/components/ui/ResumeButton";
import { identity, navItems } from "@/content/data";
import { useReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/** Section ids the scroll-spy watches, in document order. */
const SPY_IDS = ["hero", ...navItems.map((item) => item.id)];

/**
 * A transparent hero navigation that compacts into a bounded glass instrument panel.
 *
 * The glass lives on the max-width shell rather than the full viewport-width header. That is
 * both a stronger composition and a smaller backdrop-filter area. Framer Motion is used only
 * for the discrete active underline and mobile disclosure, never for scroll scrubbing. The
 * complete link row only appears at `xl`: six destinations plus the resume action need genuine
 * breathing room, so intermediate laptop widths get the compact disclosure instead of a row of
 * increasingly tiny labels.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("hero");
  const [menuOpen, setMenuOpen] = useState(false);
  const reducedMotion = useReducedMotion();

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

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-nav px-3 pt-3 sm:px-5">
      {/* At rest, this masked veil keeps the live neural field from crossing the labels while
          preserving the intended transparent-over-hero appearance. */}
      <div
        aria-hidden
        className={cn(
          "nav-veil pointer-events-none fixed inset-x-0 top-0 h-32 transition-opacity duration-500 ease-smooth",
          scrolled || menuOpen ? "opacity-0" : "opacity-100",
        )}
      />

      <div
        className={cn(
          "pointer-events-auto relative mx-auto max-w-6xl overflow-hidden border transition-all duration-500 ease-smooth",
          scrolled || menuOpen ? "glass-nav" : "border-transparent bg-transparent",
          menuOpen ? "rounded-panel" : "rounded-pill",
        )}
      >
        <nav
          aria-label="Primary"
          className={cn(
            "relative flex items-center justify-between px-3 transition-height duration-500 ease-smooth sm:px-5",
            scrolled ? "h-14" : "h-16",
          )}
        >
          <a
            href="#hero"
            aria-label={`${identity.fullName}, back to top`}
            className="flex min-w-0 items-center rounded-pill py-2"
          >
            <Image
              src="/brand/wordmark-transparent.png"
              alt={identity.fullName}
              width={124}
              height={23}
              priority
              className="h-auto w-wordmark shrink-0"
            />
          </a>

          <div className="hidden items-center gap-3 xl:flex">
            <ul className="flex items-center gap-0.5">
              {navItems.map((item) => {
                const isActive = activeId === item.id;

                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "relative rounded-pill px-3 py-2 font-mono text-xs uppercase tracking-label transition-colors duration-300",
                        isActive
                          ? "bg-bg-glass text-text-primary"
                          : "text-text-secondary hover:bg-bg-glass hover:text-text-primary",
                      )}
                    >
                      {item.label}
                      {isActive ? (
                        <motion.span
                          layoutId="nav-underline"
                          transition={
                            reducedMotion
                              ? { duration: 0 }
                              : { type: "spring", stiffness: 380, damping: 30 }
                          }
                          className="absolute inset-x-3 bottom-1 h-px bg-primary"
                        />
                      ) : null}
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="border-l border-border-subtle pl-3">
              <ResumeButton />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle bg-bg-glass text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary xl:hidden"
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
              className="relative overflow-hidden border-t border-border-subtle xl:hidden"
            >
              <ul className="grid grid-cols-2 gap-2 p-3 sm:p-4">
                {navItems.map((item, index) => {
                  const isActive = activeId === item.id;

                  return (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "flex items-center gap-2 rounded-card border px-3 py-3 font-mono text-xs uppercase tracking-label transition-colors",
                          isActive
                            ? "border-border-hover bg-bg-glass text-text-primary"
                            : "border-transparent text-text-secondary hover:border-border-subtle hover:bg-bg-glass hover:text-text-primary",
                        )}
                      >
                        <span
                          aria-hidden
                          className={isActive ? "text-accent-cyan" : "text-text-secondary"}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>

              <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                <ResumeButton fullWidth onNavigate={() => setMenuOpen(false)} />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
