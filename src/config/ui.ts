import type { HackathonProps, ProjectProps, SiteContent } from "../types";

// UI-only data for the matchday design. Content lives in ./index.ts;
// everything here is either presentation or derived from that content.

export const PLAYER = {
  number: 17,
  club: "SV Saar 05",
  uni: "Saarland University",
  uniShort: "UdS",
  rival: "Boring Portfolios",
};

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
}

export const formationSlots = (count: number): FormationSlot[] => {
  const rows =
    FORMATIONS[count] ??
    Array.from({ length: Math.ceil(count / 4) }, (_, i) => Math.min(4, count - i * 4));
  const slots: FormationSlot[] = [];
  rows.forEach((size, row) => {
    const y = rows.length === 1 ? 50 : 18 + (row * 64) / (rows.length - 1);
    for (let i = 0; i < size; i++) {
      slots.push({ x: ((i + 1) * 100) / (size + 1), y });
    }
  });
  return slots;
};

// Squad numbers for projects. #17 is reserved for Mohammed.
const SQUAD_NUMBERS = [9, 10, 7, 11, 8, 6, 4, 5, 3, 2, 14, 21, 23];

export const squadNumber = (index: number) => SQUAD_NUMBERS[index] ?? index + 24;

// A project counts as a "hackathon winner" when a hackathon links to its source.
export const isHackathonProject = (project: ProjectProps, hackathons: HackathonProps[]) =>
  hackathons.some((h) => h.link && h.link === project.linkSource);

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
