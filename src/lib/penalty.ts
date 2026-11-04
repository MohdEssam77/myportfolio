import { FACTS, type Fact } from "../config/facts";
import { lockScroll, prefersReducedMotion, scrollToTarget } from "./motion";

type Result = "goal" | "save" | "miss";

const SHOTS = 5;
const BAG_KEY = "matchday:facts-bag";
const SEEN_KEY = "matchday:facts-seen";

const $ = <T extends Element>(root: ParentNode, sel: string) =>
  root.querySelector<T>(sel);

let dialog: HTMLDialogElement | null = null;
let results: Result[] = [];
let busy = false;

const load = (key: string): number[] => {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value)
      ? value.filter((i) => Number.isInteger(i) && i >= 0 && i < FACTS.length)
      : [];
  } catch {
    return [];
  }
};

const save = (key: string, value: number[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const shuffled = (items: number[]) => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// Shuffle bag: every fact shows once, in random order, before any repeats.
// The bag survives reloads, and a fresh bag never starts with the last fact.
let lastFact = -1;
const nextFact = (): Fact => {
  let bag = load(BAG_KEY);
  if (bag.length === 0) {
    bag = shuffled(FACTS.map((_, i) => i));
    if (bag[0] === lastFact && bag.length > 1) bag.push(bag.shift()!);
  }
  const index = bag.shift()!;
  lastFact = index;
  save(BAG_KEY, bag);
  save(SEEN_KEY, [...new Set([...load(SEEN_KEY), index])]);
  return FACTS[index];
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
    unlocked: $<HTMLElement>(d, "[data-pk-unlocked]")!,
    fact: $<HTMLElement>(d, "[data-pk-fact]")!,
    dots: d.querySelectorAll<HTMLElement>(".pk-dot"),
  };
};

const reset = () => {
  const { ball, keeper, status, restart, unlocked, fact, dots, zones } = els();
  results = [];
  busy = false;
  ball.style.transform = "";
  keeper.style.transform = "";
  status.textContent = "Pick a corner.";
  restart.hidden = true;
  fact.hidden = true;
  unlocked.textContent = `${load(SEEN_KEY).length}`;
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
  save: [
    "Saved! Score to unlock a fact.",
    "What a stop! Try again.",
    "Keeper guessed right.",
  ],
  miss: ["Off the post!", "Over the bar!"],
};

const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];

const showFact = (f: Fact) => {
  const { fact, unlocked } = els();
  $<HTMLElement>(fact, "[data-pk-fact-kind]")!.textContent =
    `Did you know? · ${f.kind}`;
  $<HTMLElement>(fact, "[data-pk-fact-title]")!.textContent = f.title;
  $<HTMLElement>(fact, "[data-pk-fact-text]")!.textContent = f.text;
  $<HTMLAnchorElement>(fact, "[data-pk-fact-link]")!.dataset.section =
    f.section;
  // Re-trigger the entrance animation for consecutive goals.
  fact.hidden = true;
  void fact.offsetWidth;
  fact.hidden = false;
  unlocked.textContent = `${load(SEEN_KEY).length}`;
};

const shoot = (zone: HTMLElement) => {
  if (busy || results.length >= SHOTS) return;
  busy = true;
  const { ball, keeper, status, zones, dots, restart } = els();
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
    if (result === "goal") showFact(nextFact());
    document.dispatchEvent(
      new CustomEvent("matchday:sfx", {
        detail: result === "goal" ? "goal" : "save",
      }),
    );

    setTimeout(() => {
      if (results.length >= SHOTS) {
        const score = results.filter((r) => r === "goal").length;
        status.textContent = `Full time: ${score}/${SHOTS} · ${score === 1 ? "1 fact" : `${score} facts`}`;
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
  $(dialog, "[data-pk-fact-link]")?.addEventListener("click", (e) => {
    e.preventDefault();
    const section = (e.currentTarget as HTMLElement).dataset.section;
    dialog?.close();
    if (section) scrollToTarget(section);
  });
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
