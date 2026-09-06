"use client";

import { useEffect } from "react";

const SELECTOR = "[data-scroll-reveal]";
const READY_CLASS = "scroll-reveal-ready";
const VISIBLE_CLASS = "is-scroll-revealed";

/**
 * One observer for every lightweight content entrance on the home page.
 *
 * Elements remain visible in server-rendered HTML and when JavaScript is unavailable. The
 * hiding styles only become active after this controller confirms IntersectionObserver and a
 * motion preference, preventing blank content during hydration or on unsupported browsers.
 */
export function ScrollRevealController() {
  useEffect(() => {
    const root = document.documentElement;
    const items = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || items.length === 0 || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add(VISIBLE_CLASS);
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08,
      },
    );

    items.forEach((item) => {
      const delay = Number(item.dataset.scrollDelay ?? 0);
      item.style.setProperty("--scroll-reveal-delay", `${Math.min(Math.max(delay, 0), 240)}ms`);
      observer.observe(item);
    });
    root.classList.add(READY_CLASS);

    return () => {
      observer.disconnect();
      root.classList.remove(READY_CLASS);
      items.forEach((item) => item.style.removeProperty("--scroll-reveal-delay"));
    };
  }, []);

  return null;
}
