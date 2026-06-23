'use client';

import { useEffect } from 'react';

/**
 * ScrollReveal — lightweight IntersectionObserver-based scroll animation.
 * Watches every element with class "reveal", "reveal-scale", or "reveal-left"
 * and adds "revealed" once it enters the viewport.
 * Zero dependencies, zero bundle overhead (no Framer Motion needed).
 */
export default function ScrollReveal() {
  useEffect(() => {
    const SELECTORS = '.reveal, .reveal-scale, .reveal-left';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            // Stagger delay based on sibling index for grid items
            const siblings = el.parentElement?.querySelectorAll(SELECTORS);
            if (siblings) {
              const idx = Array.from(siblings).indexOf(el);
              el.style.transitionDelay = `${Math.min(idx * 60, 400)}ms`;
            }
            el.classList.add('revealed');
            observer.unobserve(el); // fire once
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const observe = () => {
      document.querySelectorAll(SELECTORS).forEach((el) => observer.observe(el));
    };

    observe();

    // Re-observe on DOM changes (for dynamic content like tabs)
    const mutObs = new MutationObserver(observe);
    mutObs.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutObs.disconnect();
    };
  }, []);

  return null;
}
