import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let registered = false;

// Registers GSAP plugins once. Safe to call from every island.
export const getGsap = () => {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
};

let lenis: Lenis | null = null;

// Smooth scrolling synced with ScrollTrigger. Skipped for reduced motion
// and coarse pointers, where native scrolling feels better.
export const initSmoothScroll = () => {
  if (lenis || prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches) {
    return lenis;
  }
  const { gsap, ScrollTrigger } = getGsap();
  lenis = new Lenis({ anchors: { offset: -96 } });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
};

export const scrollToTarget = (target: string | HTMLElement) => {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -96 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
};

// Adds `is-in` to [data-reveal] elements once they scroll into view.
export const initReveal = () => {
  const items = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)");
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  items.forEach((el) => observer.observe(el));
};
