import { lockScroll, prefersReducedMotion } from "./motion";

type Result = "goal" | "save" | "miss";

const SHOTS = 5;
const BEST_KEY = "matchday:pk-best";

const $ = <T extends Element>(root: ParentNode, sel: string) =>
  root.querySelector<T>(sel);

let dialog: HTMLDialogElement | null = null;
let results: Result[] = [];
let busy = false;

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY) ?? 0);
  } catch {
    return 0;
  }
};

const writeBest = (score: number) => {
  try {
    localStorage.setItem(BEST_KEY, `${score}`);
  } catch {}
};

const els = () => {
  const d = dialog!;
  return {
    stage: $<HTMLElement>(d, "[data-pk-stage]")!,
    zones: $<HTMLElement>(d, ".pk-zones")!,
    ball: $<HTMLElement>(d, "[data-pk-ball]")!,
    keeper: $<HTMLElement>(d, "[data-pk-keeper]")!,
    status: $<HTMLElement>(d, "[data-pk-status]")!,
    restart: $<HTMLButtonElement>(d, "[data-pk-restart]")!,
    best: $<HTMLElement>(d, "[data-pk-best]")!,
    dots: d.querySelectorAll<HTMLElement>(".pk-dot"),
  };
};

const reset = () => {
  const { ball, keeper, status, restart, best, dots, zones } = els();
  results = [];
  busy = false;
  ball.style.transform = "";
  keeper.style.transform = "";
  status.textContent = "Pick a corner.";
  restart.hidden = true;
  best.textContent = `${readBest()}`;
  zones.removeAttribute("aria-disabled");
  dots.forEach((dot) => dot.removeAttribute("data-result"));
};

// Offset of a zone's centre from an element's resting centre, in px.
const offsetTo = (zone: HTMLElement, el: HTMLElement) => {
  const z = zone.getBoundingClientRect();
  const e = el.getBoundingClientRect();
  return {
    x: z.left + z.width / 2 - (e.left + e.width / 2),
    y: z.top + z.height / 2 - (e.top + e.height / 2),
  };
};

const decide = (shot: number, dive: number): Result => {
  const shotCol = shot % 3;
  const shotTop = shot < 3;
  // Top corners are hard to save but easy to put over the bar.
  if (shotTop && shotCol !== 1 && Math.random() < 0.12) return "miss";
  if (shotCol !== dive % 3) return "goal";
  return shot === dive || Math.random() < 0.35 ? "save" : "goal";
};

const MESSAGES: Record<Result, string[]> = {
  goal: [
    "GOAL!",
    "Top bins!",
    "Back of the net!",
    "Keeper sent the wrong way!",
  ],
  save: ["Saved!", "What a stop!", "Keeper guessed right."],
  miss: ["Off the post!", "Over the bar!"],
};

const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];

const shoot = (zone: HTMLElement) => {
  if (busy || results.length >= SHOTS) return;
  busy = true;
  const { ball, keeper, status, zones, dots, restart, best } = els();
  zones.setAttribute("aria-disabled", "true");

  const shot = Number(zone.dataset.pkZone);
  const dive = Math.floor(Math.random() * 6);
  const diveZone = $<HTMLElement>(zones, `[data-pk-zone="${dive}"]`)!;
  const result = decide(shot, dive);

  const b = offsetTo(zone, ball);
  const overshoot = result === "miss" ? -40 : 0;
  ball.style.transform = `translate(${b.x}px, ${b.y + overshoot}px) scale(0.55) rotate(540deg)`;

  const k = offsetTo(diveZone, keeper);
  const tilt = dive % 3 === 0 ? -70 : dive % 3 === 2 ? 70 : 0;
  keeper.style.transform = `translate(${k.x * 0.8}px, ${Math.min(0, k.y * 0.6)}px) rotate(${tilt}deg)`;

  const settle = prefersReducedMotion() ? 0 : 550;
  setTimeout(() => {
    results.push(result);
    dots[results.length - 1]?.setAttribute("data-result", result);
    status.textContent = pick(MESSAGES[result]);
    document.dispatchEvent(
      new CustomEvent("matchday:sfx", {
        detail: result === "goal" ? "goal" : "save",
      }),
    );

    setTimeout(() => {
      if (results.length >= SHOTS) {
        const score = results.filter((r) => r === "goal").length;
        const record = score > readBest();
        if (record) writeBest(score);
        best.textContent = `${readBest()}`;
        status.textContent = `Full time: ${score}/${SHOTS}${record ? " · new record!" : ""}`;
        restart.hidden = false;
        restart.focus();
        return;
      }
      ball.style.transform = "";
      keeper.style.transform = "";
      zones.removeAttribute("aria-disabled");
      busy = false;
    }, settle + 500);
  }, settle);
};

const bind = () => {
  dialog = document.querySelector<HTMLDialogElement>(".penalty-dialog");
  if (!dialog) return;
  dialog
    .querySelectorAll<HTMLElement>("[data-pk-zone]")
    .forEach((zone) => zone.addEventListener("click", () => shoot(zone)));
  $(dialog, "[data-pk-restart]")?.addEventListener("click", reset);
  $(dialog, "[data-pk-close]")?.addEventListener("click", () =>
    dialog?.close(),
  );
  dialog.addEventListener(
    "click",
    (e) => e.target === dialog && dialog?.close(),
  );
  dialog.addEventListener("close", () => lockScroll(false));
};

export const openPenalty = () => {
  if (!dialog) bind();
  if (!dialog || dialog.open) return;
  reset();
  dialog.showModal();
  lockScroll(true);
  document.dispatchEvent(
    new CustomEvent("matchday:sfx", { detail: "whistle" }),
  );
};
