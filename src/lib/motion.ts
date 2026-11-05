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
  lenis = new Lenis({
    // Lenis already honours the page scroll-padding-top (the scoreboard
    // height), so anchors and scrollTo need no extra offset.
    anchors: true,
    autoRaf: true,
    // Let overlays (VAR, game, project/match reports) and other inner scroll
    // areas scroll natively, even while the page itself is locked.
    prevent: (node) => node.tagName === "DIALOG",
    allowNestedScroll: true,
  });
  return lenis;
};

export const scrollToTarget = (target: string | HTMLElement) => {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
};

// Scrolls the page to a y position, clamped to the page.
export const scrollToY = (y: number) => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const top = Math.max(0, Math.min(y, max));
  if (lenis) lenis.scrollTo(top);
  else window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
};

// Document y of an element, ignoring transforms (reveal animations move
// elements a little before they are shown).
const pageTop = (el: HTMLElement) => {
  let top = 0;
  for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) {
    top += node.offsetTop;
  }
  return top;
};

// Bottom edge of the sticky scoreboard, plus a little breathing room.
const topbarBottom = () =>
  (document.getElementById("scoreboard")?.getBoundingClientRect().bottom ?? 0) + 16;

// "start": the element's top sits right under the scoreboard.
// "center": the element sits in the middle of the space below it.
export const scrollToElement = (el: HTMLElement, align: "start" | "center" = "start") => {
  const bar = topbarBottom();
  if (align === "start") {
    scrollToY(pageTop(el) - bar);
    return;
  }
  const rect = el.getBoundingClientRect();
  const middle = rect.top + window.scrollY + rect.height / 2;
  scrollToY(middle - bar - (window.innerHeight - bar) / 2);
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
