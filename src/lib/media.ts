import type { ImageMetadata } from "astro";

// Content keeps referring to images by their original public path
// ("/swiss.png"). Photos and screenshots live in src/assets/content so Astro
// can optimize them; this maps a content path to that asset when it exists.
const assets = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/content/*.{jpg,jpeg,png,webp}",
  { eager: true },
);

const byName = new Map(
  Object.entries(assets).map(([path, mod]) => [path.split("/").pop()!, mod.default]),
);

export const resolveImage = (src: string): ImageMetadata | string =>
  byName.get(src.split("/").pop() ?? "") ?? src;

// Animated GIFs have lightweight video versions in /public/media.
const VIDEOS = new Set(["metalPulse", "dream_transport", "swisshacks3"]);

export const videoFor = (src: string) => {
  const match = src.match(/\/([^/]+)\.gif$/i);
  return match && VIDEOS.has(match[1])
    ? {
        webm: `/media/${match[1]}.webm`,
        mp4: `/media/${match[1]}.mp4`,
        poster: `/media/${match[1]}.webp`,
      }
    : null;
};
