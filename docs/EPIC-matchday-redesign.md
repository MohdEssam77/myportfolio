# EPIC: MATCHDAY.exe — Portfolio UI Redesign

> **Status:** Implemented on `feat/matchday-redesign`, waiting for review on a Vercel preview before merge (11.10)
> **Owner:** Mohammed Halboup
> **Branch:** `feat/matchday-redesign`
> **Scope:** UI/UX only. All content in `src/config/index.ts` (`SITE_CONTENT`, `SITE_CONFIG`) stays the same.

---

## 1. The Idea

Mohammed lives on two pitches: a **football pitch** (SV Saar 05) and a **code pitch** (CS at Saarland University, PCC, hackathons).
The redesign turns the portfolio into a **matchday broadcast running on a terminal**:

- **Football gives the structure.** Scrolling the page is playing a 90-minute match. Each section is a phase of the game.
- **Code gives the texture.** Monospace labels, terminal prompts, `git`-style metadata and a hidden "VAR terminal" for power users.

It should feel like a stadium at night: dark pitch-green, white chalk lines, floodlight glow, an LED scoreboard. Not another "dark mode + gradient blob" portfolio.

### Section → match phase mapping

| Current section | New concept | What it becomes |
|---|---|---|
| Header / nav | **Live Scoreboard** | Sticky LED scoreboard: `HALBOUP 0 – 0 BORING PORTFOLIOS` plus a **match clock** that runs 0'→90' as you scroll. Nav items are the match phases. |
| Hero | **Kick-off + Player Card** | Floodlights switch on, the whistle blows, the name drops in. A holographic **player card** (original design) tilts with the mouse and shows stats taken from the existing content. |
| Experience | **Tactics Board** | A chalkboard pitch. Each role is a marker and dashed "passing lines" draw themselves between them on scroll (career path = build-up play). |
| Projects | **The Squad** | 8 projects = 8 players lined up in a formation on a pitch. Click a player and their card flips open (image, summary, Source/Preview). A **List view** toggle is available for recruiters in a hurry. |
| Hackathons | **Trophy Cabinet** | A lit glass shelf with 1 gold, 2 silver and 2 bronze trophies. Click one to open a **Match Report** (location, rank, summary, photo gallery, links). |
| — (new, derived) | **Half-time Stats** | A broadcast-style stat strip with counters (projects, hackathons, podiums, wins, roles). Every number is *computed* from the existing config, nothing new is invented. |
| About | **Post-match Interview** | A press-conference card with mic and sponsor-wall background (generic pattern, no real logos). The existing about text types out as the "quote", next to the polaroid photo. |
| Contact | **Transfer Desk** | The same form, styled as a transfer offer / contract. The submit button is "Send Offer ⚽" and success plays a goal-net ripple + confetti. Same `/api/contact` endpoint. |
| Footer | **Full Time** | The scoreboard freezes on `FT 90'`. Social links + copyright. Hidden **penalty shootout** mini-game (original). |
| — (new) | **VAR Terminal** | Press `/` or `Ctrl+K` to open a terminal overlay with commands: `whoami`, `ls projects`, `goto hackathons`, `cv`, `contact`, `kickoff`, `help`. |

### Design language

- **Palette (tokens in `global.css`):**
  - `--color-pitch: #0a1f17` (background, near-black green)
  - `--color-turf: #12382a` (cards / surfaces)
  - `--color-chalk: #e8efe9` (text, lines)
  - `--color-floodlight: #c8ff3d` (primary accent, electric lime)
  - `--color-led: #ffb020` (scoreboard digits, warnings)
  - `--color-muted: #8aa597` (secondary text)
  - keep `--color-primary` as an alias → `floodlight` so old classes don't break during migration
- **Type:**
  - Display: **Big Shoulders Display** (stadium-signage feel) for headings and scoreboard
  - Body: keep **Be Vietnam Pro**
  - Mono: **JetBrains Mono** for labels, terminal and metadata
- **Textures:** subtle mowed-grass stripes (CSS gradients), chalk-line SVGs, noise grain overlay, floodlight radial glows.
- **Motion:** purposeful and sporty: snaps, whistles, chalk drawing, card flips. Everything respects `prefers-reduced-motion`.
- **Sound:** optional, off by default (whistle, crowd swell). Toggle in the scoreboard. Never autoplay.

### Principles / non-goals

- ✅ Content and data unchanged: `SITE_CONTENT` is the single source of truth, and new UI-only data (formation slots, trophy tiers) lives in `src/config/ui.ts` and is derived from existing content where possible.
- ✅ Every interactive view has an accessible, keyboard-friendly fallback (list view, focusable controls, ARIA).
- ✅ Mobile is designed first, not shrunk down: the formation becomes a swipeable lineup and the trophy shelf scrolls horizontally.
- ✅ Performance budget: Lighthouse ≥ 90 on mobile, no WebGL, JS islands kept small, images via `astro:assets`.
- ❌ No real club logos, no copied visual style from existing football video games. The player card and all graphics are original.
- ❌ No framework switch: stays Astro + Tailwind v4 + vanilla TS (plus GSAP for scroll choreography).

---

## 2. Tech additions

| Package | Why |
|---|---|
| ~~`gsap` (+ ScrollTrigger)~~ | Planned for scroll choreography, removed in the perf pass (see notes) |
| `lenis` | Smooth scrolling that stays in sync with ScrollTrigger |
| `@fontsource/big-shoulders-display` | Display font |
| `@fontsource/jetbrains-mono` | Mono font |
| `canvas-confetti` | Goal celebration on form submit (tiny) |
| `sharp` | Added in 11.5 so `astro:assets` can optimize the content images |

No other runtime deps. Everything else is hand-built.

---

## 3. Phases & Commits

Every commit is small, builds green (`pnpm build`) and leaves the site in a working state.
Format: Conventional Commits.

### Phase 0 — Groundwork

| # | Commit | Details |
|---|---|---|
| 0.1 | `chore: create feat/matchday-redesign branch and add epic doc` | This file. |
| 0.2 | `chore(deps): add gsap, lenis and canvas-confetti` | Install only, no usage yet. |
| 0.3 | `chore(deps): add Big Shoulders Display and JetBrains Mono fonts` | Import them in `Layout.astro`. |
| 0.4 | `style(tokens): introduce matchday color palette and font tokens` | New tokens in `global.css`, `primary` aliased to `floodlight`. |
| 0.5 | `feat(config): add ui.ts for UI-only derived data` | Formation slots, trophy tier mapping (`rank` → gold/silver/bronze), section→minute map. |
| 0.6 | `feat(lib): add motion helpers with reduced-motion guard` | `src/lib/motion.ts`: `prefersReducedMotion()`, GSAP/Lenis init. |
| 0.7 | `fix(hero): correct section id from "#hero" to "hero"` | Existing bug; the scroll clock depends on it. |
| 0.8 | `refactor(contact): scope form query selector to contact form` | `document.querySelector("form")` would grab the wrong form once the terminal overlay exists. |

### Phase 1 — Stadium shell (layout, background, scoreboard)

| # | Commit | Details |
|---|---|---|
| 1.1 | `feat(layout): add pitch background with mowed-grass stripes and grain` | Pure CSS, fixed layer behind `main`. |
| 1.2 | `feat(layout): add floodlight glow layers` | 4 corner radial glows that react to the active section. |
| 1.3 | `feat(layout): widen main container and add section rhythm` | `max-w-3xl` → wider grid where sections need it. |
| 1.4 | `feat(header): replace header with LED scoreboard component` | `Scoreboard.astro`: dot-matrix name, score, nav. |
| 1.5 | `feat(header): add scroll-driven match clock 0'→90'` | Minutes mapped from scroll progress, with stoppage time `90+2'` at the footer. |
| 1.6 | `feat(header): highlight current match phase in nav` | Reuses the existing active-section logic. |
| 1.7 | `feat(header): mobile scoreboard with slide-down phase menu` | Replaces the current dropdown. |
| 1.8 | `feat(motion): wire up Lenis smooth scroll with ScrollTrigger` | Turned off under reduced motion. |
| 1.9 | `feat(section): restyle Section headings as broadcast lower-thirds` | e.g. `12' — TACTICS BOARD` with a mono minute tag. |

### Phase 2 — Kick-off (Hero)

| # | Commit | Details |
|---|---|---|
| 2.1 | `feat(hero): new split layout — name block + player card slot` | Same name, specialty, summary. |
| 2.2 | `feat(hero): floodlights-on intro animation` | Lights flicker on, then the name slams in. Plays once per session. |
| 2.3 | `feat(hero): add original holographic player card` | Photo `Mo_small.jpg`, name, "CS @ UdS · SV Saar 05", stats derived from config. |
| 2.4 | `feat(hero): 3D tilt + holo shine on pointer move` | Gyroscope tilt on mobile when allowed, static fallback otherwise. |
| 2.5 | `feat(hero): card flip to reveal back side with contact info` | Email + phone from `hero` props. |
| 2.6 | `feat(hero): restyle CTAs as kick-off buttons` | Call / Contact / Resume with magnetic hover. |
| 2.7 | `feat(hero): animated scroll cue (rolling ball)` | Hidden under reduced motion. |

### Phase 3 — Tactics Board (Experience)

| # | Commit | Details |
|---|---|---|
| 3.1 | `feat(experience): chalkboard pitch layout with SVG field lines` | Vertical pitch, halfway line, boxes. |
| 3.2 | `feat(experience): position role markers along the pitch` | One marker per experience entry, latest at the attacking end. |
| 3.3 | `feat(experience): draw dashed passing lines on scroll` | `stroke-dashoffset` animation via ScrollTrigger. |
| 3.4 | `feat(experience): role detail panels with chalk-written bullets` | Same summaries; bullets reveal one by one. |
| 3.5 | `feat(experience): mobile — stacked timeline with mini pitch` | Vertical chalk line, markers on the left. |

### Phase 4 — The Squad (Projects)

| # | Commit | Details |
|---|---|---|
| 4.1 | `feat(projects): pitch view with 8 players in formation` | Positions from `ui.ts`, each player = project name + jersey number. |
| 4.2 | `feat(projects): player hover tooltip with project summary` | Keyboard focus shows it too. |
| 4.3 | `feat(projects): click-to-open flipping project card` | Image, summary, Source/Preview links. `Esc` closes it and focus is returned. |
| 4.4 | `feat(projects): "Tactics / List" view toggle` | List view = clean cards grid, the choice is saved in `localStorage`. |
| 4.5 | `feat(projects): mobile swipeable lineup carousel` | Scroll-snap, no library. |
| 4.6 | `feat(projects): highlight hackathon-winning projects with armband badge` | Derived by matching hackathon `link` ↔ project `linkSource`. |

### Phase 5 — Trophy Cabinet (Hackathons)

| # | Commit | Details |
|---|---|---|
| 5.1 | `feat(hackathons): glass cabinet shelf layout` | Lit shelves, reflections. |
| 5.2 | `feat(hackathons): SVG trophies with gold/silver/bronze tiers` | Tier taken from the `rank` text. |
| 5.3 | `feat(hackathons): trophy hover shine + plaque with name & location` | |
| 5.4 | `feat(hackathons): match report modal` | Rank, location, summary, links, accessible `<dialog>`. |
| 5.5 | `feat(hackathons): photo gallery inside match report` | All existing images, arrow keys + swipe. |
| 5.6 | `feat(hackathons): mobile horizontal shelf scroll` | |

### Phase 6 — Half-time Stats

| # | Commit | Details |
|---|---|---|
| 6.1 | `feat(stats): broadcast stat strip component` | Projects, hackathons, podiums, wins, roles, all computed from config. |
| 6.2 | `feat(stats): count-up animation when in view` | Static numbers under reduced motion. |
| 6.3 | `feat(stats): place half-time strip at the 45' mark` | Between Projects and Hackathons. |

### Phase 7 — Post-match Interview (About)

| # | Commit | Details |
|---|---|---|
| 7.1 | `feat(about): press-conference layout with sponsor-wall pattern` | Generic repeating pattern (initials "MH" / "UdS·05"), no real brands. |
| 7.2 | `feat(about): typewriter quote for about description` | Full text in the DOM for SEO/screen readers, the animation is visual only. |
| 7.3 | `feat(about): polaroid photo with flash effect on reveal` | Keeps `Mo_big_fr.jpeg`. |
| 7.4 | `feat(about): animated mic + "LIVE" badge` | |

### Phase 8 — Transfer Desk (Contact)

| # | Commit | Details |
|---|---|---|
| 8.1 | `feat(contact): restyle form as transfer offer contract` | Same fields, names and validation. |
| 8.2 | `feat(contact): "Send Offer" button with loading whistle state` | |
| 8.3 | `feat(contact): goal-net ripple + confetti on success` | `canvas-confetti`, reduced-motion fallback = simple check. |
| 8.4 | `feat(contact): red/yellow card styling for error states` | Yellow = validation, red = server error. |

### Phase 9 — Full Time (Footer)

| # | Commit | Details |
|---|---|---|
| 9.1 | `feat(footer): full-time scoreboard footer` | Social links, copyright, `FT 90+2'`. |
| 9.2 | `feat(game): penalty shootout mini-game (original)` | Pick a corner, keeper dives randomly, 5 shots, best score kept in `localStorage`. |
| 9.3 | `feat(game): unlock mini-game from footer ball + terminal command` | Lazy-loaded, 0 KB until opened. |

### Phase 10 — VAR Terminal (easter egg / power-user nav)

| # | Commit | Details |
|---|---|---|
| 10.1 | `feat(terminal): overlay shell with prompt and history` | `mohammed@uds:~$`, opened with `/` or `Ctrl+K`, closed with `Esc`. |
| 10.2 | `feat(terminal): core commands — help, whoami, ls, goto, clear` | Output generated from `SITE_CONTENT`. |
| 10.3 | `feat(terminal): action commands — cv, contact, kickoff, penalty` | `kickoff` replays the intro, `penalty` opens the game. |
| 10.4 | `feat(terminal): tab-autocomplete and hint chip in scoreboard` | Small `[/] VAR` hint so people actually find it. |

### Phase 11 — Polish & Ship

| # | Commit | Details |
|---|---|---|
| 11.1 | `feat(sound): optional whistle/crowd sounds with mute toggle` | Off by default, tiny audio files. |
| 11.2 | `feat(cursor): football cursor that spins with velocity (desktop only)` | Off on touch and under reduced motion. |
| 11.3 | `a11y: focus rings, skip link, ARIA for dialogs and toggles` | |
| 11.4 | `a11y: full reduced-motion audit` | |
| 11.5 | `perf: lazy-load heavy islands and compress GIFs to video` | `metalPulse.gif`, `dream_transport.gif`, `swisshacks3.gif` → `<video>` mp4/webm. |
| 11.6 | `feat(seo): matchday OG image + set socialImage` | |
| 11.7 | `feat(pages): custom 404 — "Offside! This page doesn't exist"` | |
| 11.8 | `chore: remove unused assets and old styles (raja.png, check.svg, …)` | Only after confirming they're unused. |
| 11.9 | `docs: update README with new design + terminal commands` | |
| 11.10 | `chore: merge feat/matchday-redesign into main` | After review on a Vercel preview deploy. |

**Total: ~65 small commits across 12 phases.**

---

## 4. Acceptance Criteria (whole epic)

- [x] Every piece of text, link, image and the contact API from the current site is still present and working.
- [x] `pnpm build` (incl. `astro check`) passes on every commit. Verified by checking out and building each commit.
- [ ] Works on Chrome, Firefox, Safari (desktop + iOS) and Android Chrome. *Only Chrome (desktop + mobile emulation) tested so far.*
- [x] Usable with keyboard only. Dialogs use native `<dialog>` (focus trap + return on close).
- [x] `prefers-reduced-motion: reduce` → no scroll-jacking, no parallax, no typewriter; all content visible immediately. Audited with `document.getAnimations()`.
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95. *Not run yet; first load is ~550 KB (was ~6 MB mid-branch).*
- [x] No horizontal scroll at 360px width.

## 5. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Too gimmicky for recruiters | List view for projects, resume button always visible in the scoreboard, all content readable without any interaction. |
| Scroll animations hurt perf on low-end phones | Smooth scroll and heavy effects turned off below a breakpoint / on low `deviceMemory`, plus a reduced-motion path. |
| Formation layout breaks if project count changes | Formation slots generated from `projects.length` in `ui.ts` (4–11 supported), with a list-view fallback. |
| Trophy tier parsing from free-text `rank` | Simple regex (`1st|Winner` → gold, `2nd` → silver, `3rd` → bronze) with a neutral "medal" default. |

## 6. Implementation notes (deviations from the plan)

- **GSAP removed.** It ended up driving a single tween (the tactics-board pass), so it was swapped for a 15-line `tween()` helper and Lenis' own RAF loop. That saves about 110 KB of JS.
- **Nav collapses below `xl`.** With the sound toggle and VAR chip, the scoreboard no longer fit on laptops, so the phase nav lives in the menu below 1280px and the rival name is abbreviated below 2xl.
- **Images moved to `src/assets/content`.** Content paths are unchanged; `src/lib/media.ts` resolves them. GIFs stay in `public/` but are served as WebM/MP4 clips with poster frames.
- **Fixes found while building** (each its own commit): hero section id, contact form selector, smooth scroll under reduced motion, chronological marker numbering, 360px overflow, and a contact-form type error that was squashed into its original commit so every commit builds.
- **Extras not in the original list:** custom 404 links back to home sections, hidden terminal commands (`sudo`, `var`, `offside`).

## 7. Decisions (answered by Mohammed)

1. **Accent color:** electric lime `floodlight` as primary. The club's black/white/red is too flat as a main palette, so red only appears as a nod (red-card error states, the "LIVE" badge).
2. **Half-time Stats:** kept. Every number is derived from existing config, so no new content.
3. **Sound:** included, **off by default**, user can turn it on via the scoreboard toggle.
4. **Penalty mini-game + VAR terminal:** ship in v1 (Phases 9 & 10 stay in scope).
5. **Jersey number:** **#17**, shown on the player card, the hero and in the scoreboard. The project "players" in the Squad view use other numbers.
