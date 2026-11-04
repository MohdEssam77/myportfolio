import { prefersReducedMotion } from "./motion";

const SEEN_KEY = "matchday:kickoff-seen";

// Floodlight flicker timeline: [ms from start, light state].
const FLICKER: [number, "on" | "off"][] = [
  [250, "on"],
  [330, "off"],
  [480, "on"],
  [560, "off"],
  [850, "on"],
];

export const playKickoff = () => {
  const html = document.documentElement;
  if (prefersReducedMotion()) {
    html.removeAttribute("data-lights");
    html.classList.remove("intro");
    return;
  }

  html.dataset.lights = "off";
  html.classList.add("intro");
  html.classList.remove("kicked");

  FLICKER.forEach(([ms, state]) => setTimeout(() => (html.dataset.lights = state), ms));
  setTimeout(() => {
    html.classList.add("kicked");
    html.classList.remove("intro");
    document.dispatchEvent(new CustomEvent("matchday:kickoff"));
  }, 950);

  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {}
};

// Runs the intro once per session. The inline head script already dimmed the
// lights when it's going to play, so there is no flash of the lit page.
export const autoKickoff = () => {
  if (document.documentElement.classList.contains("intro")) playKickoff();
};
