import type { HackathonProps, ProjectProps, SiteContent } from "../types";

// UI-only data for the matchday design. Content lives in ./index.ts;
// everything here is either presentation or derived from that content.

export const PLAYER = {
  number: 17,
  club: "SV Saar 05",
  uni: "Saarland University",
  uniShort: "UdS",
  rival: "AOP",
  rivalMeaning: [
    "AOP stands for Aspect-Oriented Programming: A programming paradigm that helps separate cross-cutting concerns (like logging, security, or transaction management) from core business logic.",
    "But here and in this portfolio, it means Any Other Portfolio",
  ],
};

// Player-card attributes, picked from the Tech Skills on the resume.
// Ratings are a self-assessment out of 100; tweak them here and the
// overall rating (the big number on the card) follows.
export const SKILLS = [
  { code: "PYT", name: "Python", rating: 92 },
  { code: "JS", name: "JavaScript", rating: 86 },
  { code: "SQL", name: "SQL", rating: 84 },
  { code: "C", name: "C", rating: 80 },
  { code: "API", name: "Flask · FastAPI", rating: 88 },
  { code: "GIT", name: "Git · GitHub", rating: 90 },
];

export const overallRating = () =>
  Math.round(SKILLS.reduce((sum, s) => sum + s.rating, 0) / SKILLS.length);

// Match minute each section "kicks off" at, used by the scoreboard clock.
export const SECTION_MINUTES: Record<string, number> = {
  hero: 0,
  experience: 12,
  projects: 30,
  stats: 45,
  hackathons: 55,
  about: 75,
  contact: 85,
};

// Short broadcast labels for section headings.
export const SECTION_LABELS: Record<string, string> = {
  experience: "Tactics Board",
  projects: "The Squad",
  stats: "Half-time Stats",
  hackathons: "Trophy Cabinet",
  about: "Post-match Interview",
  contact: "Transfer Desk",
};

export type TrophyTier = "gold" | "silver" | "bronze" | "medal";

export const trophyTier = (rank?: string): TrophyTier => {
  if (!rank) return "medal";
  if (/1st|winner/i.test(rank)) return "gold";
  if (/2nd/i.test(rank)) return "silver";
  if (/3rd/i.test(rank)) return "bronze";
  return "medal";
};

// Players per row, from attack (top) to defence (bottom).
const FORMATIONS: Record<number, number[]> = {
  4: [2, 2],
  5: [2, 3],
  6: [3, 3],
  7: [1, 3, 3],
  8: [2, 3, 3],
  9: [3, 3, 3],
  10: [2, 4, 4],
  11: [1, 3, 3, 4],
};

export interface FormationSlot {
  x: number; // % from left
  y: number; // % from top
  rowSize: number; // players in this slot's line
}

const defaultRows = (count: number) =>
  FORMATIONS[count] ??
  Array.from({ length: Math.ceil(count / 4) }, (_, i) =>
    Math.min(4, count - i * 4),
  );

// Slots for lines of players listed from the attack (top) to defence.
export const slotsForRows = (rows: number[]): FormationSlot[] => {
  const slots: FormationSlot[] = [];
  rows.forEach((size, row) => {
    const y = rows.length === 1 ? 50 : 18 + (row * 64) / (rows.length - 1);
    for (let i = 0; i < size; i++) {
      slots.push({ x: ((i + 1) * 100) / (size + 1), y, rowSize: size });
    }
  });
  return slots;
};

export const formationSlots = (count: number) =>
  slotsForRows(defaultRows(count));

// Formations visitors can switch between on the squad pitch. `rows` are
// listed from defence to attack, like a real team sheet ("3-3-2").
export interface FormationOption {
  id: string;
  label: string;
  rows: number[];
  /** Put hackathon-podium projects in the front lines. */
  podiumUpFront?: boolean;
}

export const formationOptions = (count: number): FormationOption[] => {
  const base = [...defaultRows(count)].reverse();
  const options: FormationOption[] = [
    { id: "classic", label: base.join("-"), rows: base },
    { id: "4-4", label: "4-4", rows: [4, 4] },
    { id: "2-4-2", label: "2-4-2", rows: [2, 4, 2] },
    { id: "podium", label: "Podium up front", rows: base, podiumUpFront: true },
  ];
  const seen = new Set<string>();
  return options.filter((o) => {
    const fits = o.rows.reduce((a, b) => a + b, 0) === count;
    const fresh = o.podiumUpFront || !seen.has(o.label);
    seen.add(o.label);
    return fits && fresh;
  });
};

// Squad numbers for projects. #17 is reserved for Mohammed.
const SQUAD_NUMBERS = [9, 10, 7, 11, 8, 6, 4, 5, 3, 2, 14, 21, 23];

export const squadNumber = (index: number) =>
  SQUAD_NUMBERS[index] ?? index + 24;

// A project counts as a "hackathon winner" when a hackathon links to its source.
export const isHackathonProject = (
  project: ProjectProps,
  hackathons: HackathonProps[],
) => hackathons.some((h) => h.link && h.link === project.linkSource);

export const deriveStats = (content: SiteContent) => {
  const tiers = content.hackathons.map((h) => trophyTier(h.rank));
  return {
    projects: content.projects.length,
    hackathons: content.hackathons.length,
    podiums: tiers.filter((t) => t !== "medal").length,
    wins: tiers.filter((t) => t === "gold").length,
    roles: content.experience.length,
  };
};
