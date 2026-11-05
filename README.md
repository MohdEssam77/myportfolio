<div align="center">

# 🚀 Mohammed Halboup — Portfolio

**Full-Stack Developer**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-blue?style=for-the-badge)](https://myportfolio-beta-cyan.vercel.app/))
[![GitHub](https://img.shields.io/badge/GitHub-MohdEssam77-181717?style=for-the-badge&logo=github)](https://github.com/MohdEssam77)
[![Email](https://img.shields.io/badge/Email-Contact-red?style=for-the-badge&logo=gmail)](mailto:mohammedhalboub23@gmail.com)

<br />

*MATCHDAY.exe — a portfolio that plays like a night match on a terminal. Built with Astro & Tailwind CSS*

</div>

---

## ✨ Features

The site is one 90-minute match. Scrolling is the match clock, and each section is a phase of the game:

| Phase | Section | What happens |
|-------|---------|--------------|
| 0' | **Kick-off** (hero) | Floodlights flicker on, the name slams in, and a holographic player card (#17, with skill ratings and an overall rating set in `src/config/ui.ts`) tilts with the cursor and flips to a scouting report |
| 12' | **Tactics Board** (experience) | Roles are markers on a chalk pitch, joined by passing lines that draw themselves |
| 30' | **The Squad** (projects) | Projects line up in a formation. Click a player to scout them, or switch to List view |
| 45' | **Half-time Stats** | Broadcast head-to-head, with every number computed from the content |
| 55' | **Trophy Cabinet** (hackathons) | Gold/silver/bronze trophies, each opening a match report with a photo gallery |
| 75' | **Post-match Interview** (about) | The about text types out at a press conference |
| 85' | **Transfer Desk** (contact) | The contact form is a transfer offer: yellow card for invalid input, red card for errors, goal + confetti when sent |
| 90+2' | **Full Time** (footer) | Final score, plus "Know more about Halboup": score a penalty to unlock a random fact |

Also:

- 🖥️ **VAR (video assistant remote)**: a terminal-style remote control, press <kbd>/</kbd> or <kbd>Ctrl</kbd>+<kbd>K</kbd> (or tap **VAR** in the scoreboard)
- 🚩 **Custom 404**: "Offside!"
- ♿ **Accessible**: keyboard friendly, skip link, focus rings, and full `prefers-reduced-motion` support (no intro, no parallax, no autoplaying clips)
- 📱 **Mobile-first layouts**: swipeable lineup, scrolling trophy shelf, chalk-line timeline
- ⚡ **Fast**: static Astro build, WebP images via `astro:assets`, GIFs served as small looping videos

### VAR commands

| Command | Does |
|---------|------|
| `help` | List commands |
| `whoami` | Who's wearing #17 |
| `ls projects \| hackathons \| experience` | List content |
| `goto <section>` | Scroll to a section (`experience`, `projects`, `hackathons`, `about`, `contact`) |
| `cv` | Download the resume |
| `contact` | Jump to the transfer desk |
| `aop` | Who's the opponent on the scoreboard? |
| `highlights` | Auto-play the 30-second match highlights |
| `kickoff` | Replay the floodlights intro |
| `penalty` | Score a penalty to unlock a random fact about Halboup |
| `clear` / `exit` | Clear the screen / close |

<kbd>Tab</kbd> autocompletes, <kbd>↑</kbd>/<kbd>↓</kbd> walk through history. There are a few hidden commands too.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Astro](https://astro.build) | Static Site Generator |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling & Design System |
| [TypeScript](https://www.typescriptlang.org) | Type Safety |
| [GSAP](https://gsap.com) + [Lenis](https://lenis.darkroom.engineering) | Scroll choreography & smooth scrolling |
| [canvas-confetti](https://github.com/catdad/canvas-confetti) | Goal celebration |
| [sharp](https://sharp.pixelplumbing.com) | Image optimization |
| [Prettier](https://prettier.io) | Code Formatting |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/MohdEssam77/myportfolio.git

# Navigate to the project
cd myportfolio

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser to see the result.

### Build for Production

```bash
# Create production build
pnpm build

# Preview the production build locally
pnpm preview
```

---

## 📁 Project Structure

```
myportfolio/
├── docs/                # Epic / design plan for the matchday redesign
├── public/              # Static files (resume, favicon, OG image, GIFs)
│   └── media/           # WebM/MP4 versions of the GIFs
├── src/
│   ├── assets/content/  # Project & hackathon images (optimized at build)
│   ├── components/      # Astro components (one per match phase + overlays)
│   ├── config/
│   │   ├── index.ts     # Site content (single source of truth)
│   │   └── ui.ts        # UI-only data: #17, section minutes, formations, trophy tiers
│   ├── icons/           # Ball, trophy and menu SVG components
│   ├── layouts/         # Page layout (stadium background, scoreboard, footer)
│   ├── lib/             # Motion, kick-off intro, penalty game, media helpers
│   ├── pages/           # index, 404 and the contact API route
│   ├── styles/          # Global styles & design tokens
│   └── types/           # TypeScript type definitions
├── astro.config.mjs     # Astro configuration
└── tsconfig.json        # TypeScript configuration
```

---

## ⚙️ Customization

All site content is managed in a single file: **`src/config/index.ts`**. Everything the design shows (stats, formation, trophy colours, terminal output) is derived from it.

> **Images:** reference them by file name as before (e.g. `image: "/swiss.png"`), but put the file in `src/assets/content/` so it gets optimized. Files left in `public/` still work, they just aren't resized. To give a GIF a video version, add `public/media/<name>.webm` and `.mp4` and list the name in `src/lib/media.ts`.

### Personal Information

```typescript
export const SITE_CONFIG: SiteConfig = {
  title: "Mohammed Halboup — Full-Stack Developer",
  author: "Mohammed Halboup",
  description: "Full-Stack Engineer at PCC and CS student at Saarland University",
  // ... social links, navigation, etc.
};
```

### Adding Projects

```typescript
projects: [
  {
    name: "Project Name",
    summary: "Brief description of your project...",
    linkPreview: "https://your-live-demo.com",  // Optional
    linkSource: "https://github.com/your/repo", // Optional
    image: "/project-image.png",
  },
  // ... more projects
],
```

### Adding Hackathons

```typescript
hackathons: [
  {
    name: "Hackathon Name",
    location: "City, Country",
    summary: "What you built and achieved...",
    rank: "Winner (1st Place)",  // Optional: "1st"/"Winner" → gold, "2nd" → silver, "3rd" → bronze
    images: ["/image1.png", "/image2.png"],  // Shown in the match report gallery
    link: "https://github.com/your/repo",  // Optional
    preview: "https://live-demo.com",  // Optional
  },
  // ... more hackathons
],
```

### Adding Experience

```typescript
experience: [
  {
    company: "Company Name",
    position: "Your Role",
    startDate: "Jan 2024",
    endDate: "Present",
    summary: [
      "Achievement or responsibility #1",
      "Achievement or responsibility #2",
    ],
  },
],
```

## 📄 Resume

The most recent version of my resume is always available from the **Resume** button in the scoreboard, the hero's **Download Resume** button, or the `cv` command in the VAR.

---

<div align="center">

**Built with ❤️ by [Mohammed Halboup](https://github.com/MohdEssam77)**

</div>
