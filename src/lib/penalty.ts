import { FACTS, type Fact } from "../config/facts";
import { lockScroll, prefersReducedMotion, scrollToElement, scrollToTarget } from "./motion";

type Result = "goal" | "save" | "miss";

const SHOTS = 5;
const BAG_KEY = "matchday:facts-bag";
const SEEN_KEY = "matchday:facts-seen";

const $ = <T extends Element>(root: ParentNode, sel: string) =>
  root.querySelector<T>(sel);

let dialog: HTMLDialogElement | null = null;
let results: Result[] = [];
let busy = false;
// Index of each fact's card in its content list (see PenaltyGame.astro).
let spots: number[] = [];

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
const nextFact = (): number => {
  let bag = load(BAG_KEY);
  if (bag.length === 0) {
    bag = shuffled(FACTS.map((_, i) => i));
    if (bag[0] === lastFact && bag.length > 1) bag.push(bag.shift()!);
  }
  const index = bag.shift()!;
  lastFact = index;
  save(BAG_KEY, bag);
  save(SEEN_KEY, [...new Set([...load(SEEN_KEY), index])]);
  return index;
};

const els = () => {
  const d = dialog!;
  return {
    stage: $<HTMLElement>(d, "[data-pk-stage]")!,
    zones: $<HTMLElement>(d, ".pk-zones")!,
    ball: $<HTMLElement>(d, "[data-pk-ball]")!,
    keeper: $<HTMLElement>(d, "[data-pk-keeper]")!,
    taker: $<HTMLElement>(d, "[data-pk-taker]")!,
    status: $<HTMLElement>(d, "[data-pk-status]")!,
    restart: $<HTMLButtonElement>(d, "[data-pk-restart]")!,
    unlocked: $<HTMLElement>(d, "[data-pk-unlocked]")!,
    fact: $<HTMLElement>(d, "[data-pk-fact]")!,
    dots: d.querySelectorAll<HTMLElement>(".pk-dot"),
  };
};

// #17 jogs back to his mark and turns to face the ball again.
let jogTimer = 0;
const backToMark = (taker: HTMLElement) => {
  if (!taker.classList.contains("is-up")) return;
  taker.classList.remove("is-up", "is-kicking");
  taker.classList.add("is-left", "is-running");
  clearTimeout(jogTimer);
  jogTimer = window.setTimeout(
    () => taker.classList.remove("is-left", "is-running"),
    prefersReducedMotion() ? 0 : 300,
  );
};

const reset = () => {
  const { ball, keeper, taker, status, restart, unlocked, fact, dots, zones } = els();
  backToMark(taker);
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

const showFact = (index: number) => {
  const f = FACTS[index];
  const { fact, unlocked } = els();
  $<HTMLElement>(fact, "[data-pk-fact-kind]")!.textContent =
    `Did you know? · ${f.kind}`;
  $<HTMLElement>(fact, "[data-pk-fact-title]")!.textContent = f.title;
  $<HTMLElement>(fact, "[data-pk-fact-text]")!.textContent = f.text;
  $<HTMLAnchorElement>(fact, "[data-pk-fact-link]")!.dataset.fact = `${index}`;
  // Re-trigger the entrance animation for consecutive goals.
  fact.hidden = true;
  void fact.offsetWidth;
  fact.hidden = false;
  unlocked.textContent = `${load(SEEN_KEY).length}`;
};

// "See it on the pitch": the card on the page that a fact talks about.
const shown = (el: Element | null | undefined): el is HTMLElement =>
  !!el && el.getClientRects().length > 0;

const findCard = (f: Fact, i: number) => {
  if (f.kind === "Experience") {
    const card = document.getElementById(`role-${i}`);
    return card && { card, mark: card, focus: card, align: "start" as const };
  }
  if (f.kind === "Project") {
    // The pitch on desktop, the vertical pitch on phones, or the list view.
    const card = [
      ...document.querySelectorAll<HTMLElement>(`[data-project="${i}"], [data-list-card="${i}"]`),
    ].find(shown);
    if (!card) return null;
    const mark = card.querySelector<HTMLElement>(".jersey") ?? card;
    return { card, mark, focus: card, align: "center" as const };
  }
  const button = document.querySelector<HTMLElement>(`[data-trophy="${i}"]`);
  const slot = button?.closest("li");
  if (!button || !slot) return null;
  // On phones the shelf scrolls sideways: bring the trophy to its middle.
  const shelf = slot.parentElement;
  if (shelf && shelf.scrollWidth > shelf.clientWidth) {
    shelf.scrollTo({
      left: slot.offsetLeft - (shelf.clientWidth - slot.offsetWidth) / 2,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }
  const mark = slot.querySelector<HTMLElement>(".plaque") ?? slot;
  return { card: slot, mark, focus: button, align: "center" as const };
};

const goToFact = (index: number) => {
  const f = FACTS[index];
  const found = f && findCard(f, spots[index] ?? -1);
  if (!found) {
    if (f) scrollToTarget(f.section);
    return;
  }
  scrollToElement(found.card, found.align);
  if (!found.focus.matches("a, button")) found.focus.tabIndex = -1;
  // Focus follows for keyboard and screen-reader users; the spotlight
  // already shows where it went, so no second focus ring.
  found.focus.focus({ preventScroll: true, focusVisible: false } as FocusOptions);
  found.mark.classList.remove("spotlit");
  void found.mark.offsetWidth;
  found.mark.classList.add("spotlit");
  setTimeout(() => found.mark.classList.remove("spotlit"), 4000);
};

const shoot = (zone: HTMLElement) => {
  if (busy || results.length >= SHOTS) return;
  busy = true;
  const { taker, zones } = els();
  zones.setAttribute("aria-disabled", "true");

  // Run-up, then the kick; the ball leaves when his boot meets it.
  const still = prefersReducedMotion();
  taker.classList.add("is-running", "is-up");
  setTimeout(() => {
    taker.classList.remove("is-running", "is-kicking");
    void taker.offsetWidth;
    taker.classList.add("is-kicking");
    setTimeout(() => strike(zone), still ? 0 : 150);
  }, still ? 0 : 300);
};

const strike = (zone: HTMLElement) => {
  const { ball, keeper, taker, status, zones, dots, restart } = els();
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
      backToMark(taker);
      zones.removeAttribute("aria-disabled");
      busy = false;
    }, settle + 500);
  }, settle);
};

const bind = () => {
  dialog = document.querySelector<HTMLDialogElement>(".penalty-dialog");
  if (!dialog) return;
  try {
    spots = JSON.parse(dialog.dataset.spots ?? "[]");
  } catch {}
  dialog
    .querySelectorAll<HTMLElement>("[data-pk-zone]")
    .forEach((zone) => zone.addEventListener("click", () => shoot(zone)));
  $(dialog, "[data-pk-restart]")?.addEventListener("click", reset);
  $(dialog, "[data-pk-fact-link]")?.addEventListener("click", (e) => {
    e.preventDefault();
    const index = Number((e.currentTarget as HTMLElement).dataset.fact);
    dialog?.close();
    // Unlock now: the dialog's close event comes later, and a locked page
    // ignores scrolling.
    lockScroll(false);
    requestAnimationFrame(() => goToFact(index));
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
};
