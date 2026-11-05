import { prefersReducedMotion, scrollToTarget } from "./motion";

interface Step {
  id: string;
  title: string;
  line: string;
  minute: number;
}

const STOP_MS = 4000;
const FINAL_MS = 3500;

let running: AbortController | null = null;

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve();
    });
  });

export const stopHighlights = () => running?.abort();

export const playHighlights = async () => {
  const root = document.querySelector<HTMLElement>("[data-highlights]");
  if (!root || running) return;

  const { steps, final } = JSON.parse(root.dataset.highlights ?? "{}") as {
    steps: Step[];
    final: string;
  };
  const minute = root.querySelector<HTMLElement>("[data-hl-minute]")!;
  const title = root.querySelector<HTMLElement>("[data-hl-title]")!;
  const line = root.querySelector<HTMLElement>("[data-hl-line]")!;
  const progress = root.querySelector<HTMLElement>("[data-hl-progress]")!;
  const stop = root.querySelector<HTMLButtonElement>("[data-hl-stop]")!;

  running = new AbortController();
  const { signal } = running;

  // Any attempt to scroll or navigate hands control back to the visitor.
  const takeOver = (e: Event) => {
    if (e.target instanceof Node && root.contains(e.target)) return;
    running?.abort();
  };
  const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
  events.forEach((type) =>
    window.addEventListener(type, takeOver, { passive: true }),
  );
  stop.addEventListener("click", () => running?.abort(), { signal });

  root.hidden = false;
  progress.style.width = "0";

  for (const [i, step] of steps.entries()) {
    if (signal.aborted) break;
    minute.textContent = `${step.minute}'`;
    title.textContent = step.title;
    line.textContent = step.line;
    progress.style.width = `${((i + 1) / (steps.length + 1)) * 100}%`;
    scrollToTarget(`#${step.id}`);
    await wait(prefersReducedMotion() ? STOP_MS - 1000 : STOP_MS, signal);
  }

  if (!signal.aborted) {
    minute.textContent = "FT";
    title.textContent = "Full time";
    line.textContent = final;
    progress.style.width = "100%";
    await wait(FINAL_MS, signal);
  }

  events.forEach((type) => window.removeEventListener(type, takeOver));
  root.hidden = true;
  running = null;
};
