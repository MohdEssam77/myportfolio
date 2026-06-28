// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  // Site stays static; only routes that set `export const prerender = false`
  // (e.g. the contact API) run as Vercel serverless functions.
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
});
