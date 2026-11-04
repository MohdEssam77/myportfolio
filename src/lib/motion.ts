import Lenis from "lenis";

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Runs `onFrame` with eased progress 0..1 over `duration` ms.
export const tween = (duration: number, onFrame: (t: number) => void) => {
  const start = performance.now();
  const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    onFrame(easeInOut(t));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

let lenis: Lenis | null = null;

// Smooth scrolling. Skipped for reduced motion and coarse pointers, where
// native scrolling feels better.
export const initSmoothScroll = () => {
  if (lenis || prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches) {
    return lenis;
  }
  lenis = new Lenis({ anchors: { offset: -96 }, autoRaf: true });
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

// Buttons marked [data-magnetic] lean towards the cursor.
export const initMagnetic = () => {
  if (prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
  document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
      el.style.setProperty("--mag-x", `${x}px`);
      el.style.setProperty("--mag-y", `${y}px`);
    });
    el.addEventListener("pointerleave", () => {
      el.style.removeProperty("--mag-x");
      el.style.removeProperty("--mag-y");
    });
  });
};

// Freeze page scrolling while an overlay (dialog, terminal, game) is open.
export const lockScroll = (locked: boolean) => {
  document.documentElement.classList.toggle("scroll-locked", locked);
  if (locked) lenis?.stop();
  else lenis?.start();
};

// Looping clips (converted GIFs) play only while visible, and never under
// reduced motion — then they just show their first frame.
export const initAutoplayVideos = () => {
  const videos = document.querySelectorAll<HTMLVideoElement>("video[data-autoplay]");
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      const video = target as HTMLVideoElement;
      if (isIntersecting) void video.play().catch(() => {});
      else video.pause();
    });
  });
  videos.forEach((v) => observer.observe(v));
};
